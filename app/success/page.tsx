"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Download } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black" />

      <div className="max-w-md w-full relative z-10 text-center">
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} 
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(6,182,212,0.5)]"
        >
          <Check className="w-12 h-12 text-black stroke-[3]" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-4xl md:text-5xl font-black font-orbitron mb-4">CONFIRMED</h1>
          <p className="text-gray-400 text-lg mb-8">
            Your appointment is secured. A confirmation email has been sent to your inbox.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
            <div className="text-xs text-cyan-500 uppercase tracking-widest mb-2">Next Steps</div>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 font-bold">01.</span> Check your email for the management link.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 font-bold">02.</span> We will text you when en route.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 font-bold">03.</span> Prepare water/power access (if applicable).
              </li>
            </ul>
          </div>

          <Link href="/">
             <button className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-colors">
               Return Home <ArrowRight className="w-5 h-5" />
             </button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}