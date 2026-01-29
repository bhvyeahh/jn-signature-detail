import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String },
  appointmentDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  serviceType: { type: String, required: true },
  isMobile: { type: Boolean, default: false },
  totalPrice: { type: Number, required: true },
  depositPaid: { type: Number, required: true },
  stripeSessionId: { type: String, unique: true },
  
  // NEW FIELD
  managementToken: { type: String, unique: true, required: true },
  
  status: { type: String, default: "confirmed" }, 
  paymentStatus: { type: String, default: "deposit_paid" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);