import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import connectToDatabase from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid'; // Make sure to npm install uuid @types/uuid
import BookingEmail from "@/components/emails/BookingEmail";
import OwnerNotificationEmail from "@/components/emails/OwnerNotificationEmail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover", // Use standard API version
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
    console.error(`Webhook Error: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await connectToDatabase();

    const metadata = session.metadata;
    if (!metadata) return new NextResponse("Missing Metadata", { status: 400 });

    const { 
      customerName, customerEmail, customerPhone, appointmentDate, timeSlot,
      serviceType, isMobile, totalVal 
    } = metadata;

    const depositAmount = 30;
    const totalServicePrice = parseFloat(totalVal || "0");
    const remainingDue = totalServicePrice - depositAmount;
    
    // Generate Unique Token for Management Page
    const manageToken = uuidv4();

    try {
      await Booking.create({
        customerName,
        customerEmail,
        customerPhone,
        appointmentDate: new Date(appointmentDate),
        timeSlot,
        serviceType,
        isMobile: isMobile === "true",
        totalPrice: totalServicePrice,
        depositPaid: depositAmount,
        stripeSessionId: session.id,
        managementToken: manageToken, // Save token
        status: "confirmed",
      });

      const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
      });

      // Construct the Management URL
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
      const manageUrl = `${baseUrl}/manage/${manageToken}`;

      if (process.env.RESEND_API_KEY) {
        
        // 1. Customer Email with MANAGE BUTTON
        await resend.emails.send({
          from: 'JN Signature <bookings@resend.dev>',
          to: customerEmail, 
          subject: 'Booking Confirmed - JN Signature Detailing',
          react: BookingEmail({
            customerName,
            date: formattedDate,
            time: timeSlot,
            serviceName: serviceType.toUpperCase(),
            totalPrice: `$${totalServicePrice}`,
            depositPaid: `$${depositAmount}`,
            remainingDue: `$${remainingDue}`,
            location: isMobile === "true" ? "Mobile Service" : "Shop Drop-off",
            bookingUrl: manageUrl, // Pass the URL here
          }) as any, 
        });

        // 2. Owner Notification
        if (process.env.OWNER_EMAIL) {
          await resend.emails.send({
            from: 'JN System <bookings@resend.dev>',
            to: process.env.OWNER_EMAIL,
            subject: `💰 New Booking: ${customerName}`,
            react: OwnerNotificationEmail({
              type: 'new',
              customerName,
              customerEmail,
              customerPhone: customerPhone || "N/A",
              date: formattedDate,
              time: timeSlot,
              serviceName: serviceType,
              isMobile: isMobile === "true",
              totalPrice: `$${totalServicePrice}`,
              remainingDue: `$${remainingDue}`
            }) as any,
          });
        }
      }
    } catch (error) {
      console.error("Error saving booking:", error);
      return new NextResponse("Server Error", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}