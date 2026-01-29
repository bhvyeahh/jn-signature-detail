"use client";

import { use, useState, useEffect } from "react"; 
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, AlertTriangle, Loader2, ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";

export default function ManagePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [message, setMessage] = useState("");

  // Fetch Booking Details on Load
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/booking?token=${token}`);
        const data = await res.json();
        if (data.booking) {
          setBooking(data.booking);
        } else {
          setMessage("Booking not found or link expired.");
        }
      } catch (error) {
        setMessage("Error loading booking details.");
      } finally {
        setFetching(false);
      }
    };
    fetchBooking();
  }, [token]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel? This action cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
    } catch (err) {
      setMessage("Error processing cancellation");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-zinc-950 border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        
        {/* Top Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900" />

        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-3 h-3" /> Back to Home
          </Link>
          <div className="text-xs font-mono text-red-600 uppercase tracking-widest mb-2">Booking Management</div>
          <h1 className="text-3xl font-black font-orbitron italic">DASHBOARD</h1>
        </div>

        {message ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-2xl mb-6 border ${message.includes("refunded") || message.includes("success") ? "bg-green-900/20 border-green-500/30 text-green-400" : "bg-red-900/20 border-red-500/30 text-red-400"}`}
          >
            <div className="font-bold mb-2 text-lg">Status Update</div>
            {message}
          </motion.div>
        ) : booking ? (
          <>
            <div className="space-y-4 mb-8">
              
              {/* Service Info */}
              <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-xl">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Service Package</div>
                <div className="text-lg font-bold text-white font-orbitron">{booking.serviceType.toUpperCase()}</div>
                <div className="text-sm text-red-500 font-mono mt-1">
                  {booking.isMobile ? "Mobile Service" : "Shop Drop-off"}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-zinc-900/30 rounded-xl border border-white/5">
                  <Calendar className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase">Date</div>
                    <div className="font-bold text-sm">
                      {new Date(booking.appointmentDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-zinc-900/30 rounded-xl border border-white/5">
                  <Clock className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase">Time</div>
                    <div className="font-bold text-sm">{booking.timeSlot}</div>
                  </div>
                </div>
              </div>
              
              {/* Policy Warning */}
              <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-xl flex gap-3">
                <Shield className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-red-200/80 leading-relaxed">
                  <span className="font-bold text-red-400 block mb-1">Cancellation Policy</span>
                  • More than 24h: Refund issued ($28.00)<br/>
                  • Less than 24h: Deposit non-refundable<br/>
                  <span className="opacity-50 mt-1 block text-[10px]">*A $2.00 processing fee applies to all refunds.</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCancel} disabled={loading}
              className="w-full py-4 rounded-xl border border-red-600/30 text-red-500 font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Cancel Booking & Refund"}
            </button>
          </>
        ) : null}
      </div>
    </main>
  );
}