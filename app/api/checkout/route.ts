import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover", 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const { 
      serviceId, 
      addons, 
      date, 
      time, 
      customer, 
      isMobile, 
      totalPrice 
    } = body;

    // 1. Validation
    if (!customer?.name || !customer?.email || !date || !time || !serviceId) {
      return NextResponse.json({ error: "Missing required booking details" }, { status: 400 });
    }

    // 2. URL Fallback (Fixes the specific error you are seeing)
    // If the env variable is missing, it defaults to localhost
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    // 3. Descriptions
    const policyDesc = "Refundable minus $2 fee if cancelled >24hrs in advance. Non-refundable within 24hrs.";
    const appointmentDesc = `Booking: ${new Date(date).toLocaleDateString()} @ ${time}. Total Value: $${totalPrice}.`;

    // 4. Create Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Booking Deposit - ${serviceId.toUpperCase()}`,
              description: `${appointmentDesc} | POLICY: ${policyDesc}`,
            },
            unit_amount: 3000, // Fixed $30.00 Deposit
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // Uses the safe 'baseUrl' variable
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/booking`,
      
      metadata: {
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || "",
        appointmentDate: date,
        timeSlot: time,
        serviceType: serviceId,
        isMobile: String(isMobile),
        totalVal: String(totalPrice),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}