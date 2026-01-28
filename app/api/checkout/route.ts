import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with your Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover", // Use the latest API version or typescript will complain
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, date, time } = body;

    // Validation
    if (!name || !email || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Car Detailing - ${time}`,
              description: `Booking for ${new Date(date).toLocaleDateString()} at ${time}`,
            },
            unit_amount: 1000, // $10.00 (in cents)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // These URLs are where the user goes after payment
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/booking`,
      
      // CRITICAL: We pass the user's info in metadata so the Webhook can read it later
      metadata: {
        customerName: name,
        customerEmail: email,
        customerPhone: phone || "",
        appointmentDate: date,
        timeSlot: time,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}