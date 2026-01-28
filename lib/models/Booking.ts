import mongoose, { Schema, models } from "mongoose";

const BookingSchema = new Schema(
  {
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    // We store the phone to send SMS reminders later
    customerPhone: { type: String, required: false },
    
    // The core booking details
    appointmentDate: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g., "14:00"

    // Stripe Payment Details
    stripeSessionId: { type: String, unique: true, sparse: true },
    amountPaid: { type: Number, required: true }, // Store in cents (e.g., 1000 for $10)
    currency: { type: String, default: "usd" },
    paymentStatus: { 
      type: String, 
      enum: ["pending", "paid", "refunded", "failed"], 
      default: "pending" 
    },

    // The "Magic Link" Token (UUID)
    managementToken: { type: String, required: true, unique: true },
    
    status: { 
      type: String, 
      enum: ["confirmed", "cancelled", "completed"], 
      default: "confirmed" 
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// This check is CRITICAL for Next.js to avoid "Model already compiled" errors
const Booking = models.Booking || mongoose.model("Booking", BookingSchema);

export default Booking;