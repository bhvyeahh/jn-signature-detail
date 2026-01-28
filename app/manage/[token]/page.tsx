"use client";

import { use, useState, useEffect } from "react"; // Next 15: use() is needed for params
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ManagePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params); // Next 15 Unwrap
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
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

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-950 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
        {/* Top Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />

        <div className="mb-8">
          <div className="text-xs font-mono text-cyan-500 uppercase tracking-widest mb-2">Booking Management</div>
          <h1 className="text-3xl font-black font-orbitron">DASHBOARD</h1>
        </div>

        {message ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-2xl mb-6 border ${message.includes("refunded") ? "bg-green-900/20 border-green-500/30 text-green-400" : "bg-red-900/20 border-red-500/30 text-red-400"}`}
          >
            {message}
          </motion.div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-cyan-500">
                   <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Date</div>
                  <div className="font-bold">Check Email for Date</div>
                </div>
              </div>
              
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="text-xs text-red-200">
                  <span className="font-bold text-red-400">Cancellation Policy:</span><br/>
                  • &gt;24 Hours: Refund ($9.00)<br/>
                  • &lt;24 Hours: No Refund
                </div>
              </div>
            </div>

            <button 
              onClick={handleCancel} disabled={loading}
              className="w-full py-4 rounded-xl border border-red-500/30 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Cancel Booking"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}