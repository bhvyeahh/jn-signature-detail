"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Download, Shield, Calendar } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);

  // In a real app, you might fetch session details from your API here
  // For now, we simulate a loading state for effect
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-red-900/20 to-transparent pointer-events-none" />
      
      <div className="max-w-md w-full relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-zinc-950 border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Success Icon Animation */}
          <div className="mb-8 relative flex justify-center">
            <div className="absolute inset-0 bg-red-600 blur-3xl opacity-20 rounded-full" />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(220,38,38,0.6)]"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>
          </div>

          <h1 className="text-3xl font-black font-orbitron italic uppercase mb-2">
            Payment <span className="text-red-600">Successful</span>
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            Your deposit has been secured. A confirmation email has been sent to your inbox.
          </p>

          <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-8 text-left">
            <div className="flex items-start gap-3 mb-3">
              <Shield className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</div>
                <div className="font-bold text-white">Deposit Paid ($30.00)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Next Step</div>
                <div className="font-bold text-white">Check your email for details</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/">
              <button className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                Return Home <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          
          <div className="mt-8 text-[10px] text-gray-600 uppercase tracking-widest font-mono">
            Transaction ID: {sessionId ? `${sessionId.slice(0, 8)}...` : "Loading..."}
          </div>
        </motion.div>
      </div>
    </main>
  );
}