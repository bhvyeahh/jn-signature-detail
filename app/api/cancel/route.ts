import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectToDatabase from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { differenceInHours } from "date-fns";
import { Resend } from 'resend';
import CustomerCancelEmail from "@/components/emails/CustomerCancelEmail";
import OwnerNotificationEmail from "@/components/emails/OwnerNotificationEmail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover" as any,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    await connectToDatabase();

    const booking = await Booking.findOne({ managementToken: token });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "Already cancelled" }, { status: 400 });
    }

    const appointmentTime = new Date(booking.appointmentDate);
    const now = new Date();
    const hoursDifference = differenceInHours(appointmentTime, now);
    
    const formattedDate = new Date(booking.appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long', month: 'short', day: 'numeric'
    });

    let refundMessage = "";
    let refundAmountString = "";

    // LOGIC BRANCH
    if (hoursDifference >= 24) {
      // ✅ REFUND $9.00
      const session = await stripe.checkout.sessions.retrieve(booking.stripeSessionId);
      const paymentIntentId = session.payment_intent as string;

      await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: 900, // $9.00
      });

      booking.status = "cancelled";
      booking.paymentStatus = "refunded";
      refundMessage = "Booking cancelled. $9.00 refunded ($1 processing fee).";
      refundAmountString = "$9.00";
    
    } else {
      // ❌ NO REFUND
      booking.status = "cancelled";
      refundMessage = "Booking cancelled. No refund (less than 24h notice).";
      refundAmountString = "$0.00 (Late Cancellation)";
    }

    // Save DB changes
    await booking.save();

    // 📧 SEND EMAILS
    if (process.env.RESEND_API_KEY) {
        
      // 1. Email to Customer
      await resend.emails.send({
        from: 'Car Detail App <onboarding@resend.dev>',
        to: booking.customerEmail,
        subject: 'Booking Cancelled',
        react: CustomerCancelEmail({
          customerName: booking.customerName,
          date: formattedDate,
          refundAmount: refundAmountString,
        })as any,
      });

      // 2. Email to Owner (Alert!)
      if (process.env.OWNER_EMAIL) {
        await resend.emails.send({
          from: 'Car Detail App <onboarding@resend.dev>',
          to: process.env.OWNER_EMAIL,
          subject: `CANCELLED: ${booking.customerName} ❌`,
          react: OwnerNotificationEmail({
            type: 'cancelled',
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            customerPhone: booking.customerPhone,
            date: formattedDate,
            time: booking.timeSlot,
            price: refundAmountString === "$9.00" ? "Refunded $9" : "Kept $10 (Late)",
          })as any,
        });
      }
    }

    return NextResponse.json({ message: refundMessage });

  } catch (error: any) {
    console.error("Cancel Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}