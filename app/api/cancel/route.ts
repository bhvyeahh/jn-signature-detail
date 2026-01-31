import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectToDatabase from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { differenceInHours } from "date-fns";
import { Resend } from 'resend';
import CustomerCancelEmail from "@/components/emails/CustomerCancelEmail";
import OwnerNotificationEmail from "@/components/emails/OwnerNotificationEmail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover", // Use standard API version
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    await connectToDatabase();

    // 1. Find Booking
    const booking = await Booking.findOne({ managementToken: token });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
    }

    // 2. Calculate Time Difference
    const appointmentTime = new Date(booking.appointmentDate);
    const now = new Date();
    const hoursDifference = differenceInHours(appointmentTime, now);
    
    const formattedDate = new Date(booking.appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long', month: 'short', day: 'numeric'
    });

    let refundMessage = "";
    let refundAmountString = "";

    // 3. Logic Branch
    if (hoursDifference >= 24) {
      // ✅ MORE THAN 24 HOURS: REFUND $28.00
      try {
        const session = await stripe.checkout.sessions.retrieve(booking.stripeSessionId);
        const paymentIntentId = session.payment_intent as string;

        // Create Partial Refund of $28.00 (2800 cents)
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
          amount: 2800, 
        });

        booking.paymentStatus = "refunded_partial";
        refundMessage = "Booking cancelled. $28.00 has been refunded to your card ($2 fee retained).";
        refundAmountString = "$28.00";
      } catch (err: any) {
        console.error("Stripe Refund Failed:", err);
        return NextResponse.json({ error: "Refund failed. Please contact support." }, { status: 500 });
      }
    
    } else {
      // ❌ LESS THAN 24 HOURS: NO REFUND
      booking.paymentStatus = "forfeited";
      refundMessage = "Booking cancelled. Deposit is non-refundable due to late notice (<24h).";
      refundAmountString = "$0.00 (Late Cancellation)";
    }

    // 4. Update Status & Save
    booking.status = "cancelled";
    await booking.save();

    // 5. Send Emails
    if (process.env.RESEND_API_KEY) {
        
      // Email to Customer
      await resend.emails.send({
        from: 'JN Signature <bookings@resend.dev>',
        to: booking.customerEmail,
        subject: 'Booking Cancelled',
        react: CustomerCancelEmail({
          customerName: booking.customerName,
          date: formattedDate,
          refundAmount: refundAmountString,
        }) as any,
      });

      // Email to Owner
      if (process.env.OWNER_EMAIL) {
        await resend.emails.send({
          from: 'JN System <bookings@resend.dev>',
          to: process.env.OWNER_EMAIL,
          subject: `CANCELLED: ${booking.customerName} ❌`,
          react: OwnerNotificationEmail({
            type: 'cancelled', // You need to handle this type in your Owner Email Component
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            customerPhone: booking.customerPhone,
            date: formattedDate,
            time: booking.timeSlot,
            serviceName: booking.serviceType,
            isMobile: booking.isMobile,
            totalPrice: refundAmountString === "$28.00" ? "Refunded $28" : "Kept Full Deposit",
            remainingDue: "$0.00"
          }) as any,
        });
      }
    }

    return NextResponse.json({ message: refundMessage });

  } catch (error: any) {
    console.error("Cancel Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}