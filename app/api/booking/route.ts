import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Booking from "@/lib/models/Booking";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    await connectToDatabase();

    // Find booking securely via the Management Token
    const booking = await Booking.findOne({ managementToken: token });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Return only necessary data (exclude sensitive internal IDs if preferred)
    return NextResponse.json({
      booking: {
        customerName: booking.customerName,
        appointmentDate: booking.appointmentDate,
        timeSlot: booking.timeSlot,
        serviceType: booking.serviceType,
        isMobile: booking.isMobile,
        status: booking.status,
      }
    });

  } catch (error: any) {
    console.error("Fetch Booking Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}