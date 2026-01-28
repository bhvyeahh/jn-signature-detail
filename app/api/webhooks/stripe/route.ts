import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import connectToDatabase from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';
import BookingEmail from "@/components/emails/BookingEmail";
import OwnerNotificationEmail from "@/components/emails/OwnerNotificationEmail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any, 
});

const resend = new Resend(process.env.RESEND_API_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const headerPayload = await headers();
  const signature = headerPayload.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) {
      return new NextResponse("Webhook Error: Missing signature", { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await connectToDatabase();

    const metadata = session.metadata;
    if (!metadata) return new NextResponse("Missing Metadata", { status: 400 });

    const { customerName, customerEmail, customerPhone, appointmentDate, timeSlot } = metadata;
    const manageToken = uuidv4();

    try {
      await Booking.create({
        customerName,
        customerEmail,
        customerPhone,
        appointmentDate: new Date(appointmentDate),
        timeSlot,
        stripeSessionId: session.id,
        amountPaid: session.amount_total,
        paymentStatus: "paid",
        managementToken: manageToken,
      });

      const manageUrl = `${process.env.NEXT_PUBLIC_URL}/manage/${manageToken}`;
      const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
      });

      if (process.env.RESEND_API_KEY) {
        
        // FIX: Add 'as any' to the react property
        await resend.emails.send({
          from: 'Car Detail App <onboarding@resend.dev>',
          to: customerEmail, 
          subject: 'Booking Confirmed! 🚗',
          react: BookingEmail({
            customerName,
            date: formattedDate,
            time: timeSlot,
            bookingUrl: manageUrl,
          }) as any, 
        });

        if (process.env.OWNER_EMAIL) {
          // FIX: Add 'as any' here too
          await resend.emails.send({
            from: 'Car Detail App <onboarding@resend.dev>',
            to: process.env.OWNER_EMAIL,
            subject: `💰 New Booking: ${customerName}`,
            react: OwnerNotificationEmail({
              type: 'new',
              customerName,
              customerEmail,
              customerPhone: customerPhone || "No phone provided",
              date: formattedDate,
              time: timeSlot,
              price: "$10.00",
            }) as any,
          });
        }
        console.log(`✅ Booking Saved & Emails Sent`);
      }

    } catch (error) {
      console.error("Error saving booking:", error);
      return new NextResponse("Server Error", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}