"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, ArrowLeft, Check, Calendar, Clock, 
  Shield, Zap, ChevronRight, Droplets, Loader2
} from "lucide-react";
import { format, addDays, startOfToday } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- DATA ---
const SERVICES = [
  {
    id: "maintenance",
    title: "Maintenance",
    price: 100,
    duration: "1.5h",
    desc: "Wash & Sealant",
    icon: Droplets,
  },
  {
    id: "correction",
    title: "Correction",
    price: 450,
    duration: "6h",
    desc: "Polish & Shine",
    icon: Shield,
  },
  {
    id: "ceramic",
    title: "Ceramic Pro",
    price: 890,
    duration: "1 Day",
    desc: "5-Year Coating",
    icon: Zap,
  },
];

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", 
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
];

// --- COMPONENTS ---
const StepIndicator = ({ step }: { step: number }) => (
  <div className="flex items-center gap-2 mb-8 justify-center md:justify-start">
    {[1, 2, 3].map((num) => (
      <div key={num} className="flex items-center">
        <div 
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-500 border",
            step === num 
              ? "bg-cyan-500 border-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)]" 
              : step > num 
                ? "bg-cyan-900/30 border-cyan-500/50 text-cyan-500"
                : "bg-zinc-900 border-white/10 text-gray-600"
          )}
        >
          {step > num ? <Check className="w-4 h-4" /> : `0${num}`}
        </div>
        {num < 3 && (
          <div className={cn("w-8 h-[1px] mx-2", step > num ? "bg-cyan-500/50" : "bg-white/10")} />
        )}
      </div>
    ))}
  </div>
);

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: "",
    serviceName: "",
    price: 0,
    date: startOfToday(),
    time: "",
    name: "",
    email: "",
    phone: "",
  });

  const dates = Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));

  const handleServiceSelect = (service: any) => {
    setFormData({ ...formData, serviceId: service.id, serviceName: service.title, price: service.price });
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          date: formData.date,
          time: formData.time,
        }),
      });

      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Something went wrong");
    } catch (err) {
      alert("Error initiating checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 flex flex-col md:flex-row">
      
      {/* MOBILE HEADER / DESKTOP SIDEBAR */}
      <div className="w-full md:w-1/3 bg-zinc-950 border-b md:border-b-0 md:border-r border-white/10 p-6 md:p-12 flex flex-col relative z-20">
        <div className="flex items-center justify-between md:block mb-4 md:mb-12">
           <div>
             <div className="flex items-center gap-2 mb-1">
               <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
               <span className="text-cyan-500 font-mono text-[10px] md:text-xs uppercase tracking-widest">Configurator</span>
             </div>
             <h1 className="text-2xl md:text-4xl font-black font-orbitron tracking-tighter">
               YOUR BUILD
             </h1>
           </div>
           
           {/* Mobile Price Badge */}
           <div className="md:hidden text-right">
             <div className="text-[10px] text-gray-500 uppercase">Total</div>
             <div className="text-xl font-bold font-mono text-cyan-400">${formData.price}</div>
           </div>
        </div>

        {/* Desktop Details (Hidden on Mobile to save space) */}
        <div className="hidden md:flex flex-col gap-6 flex-1">
          <div className={cn("p-6 rounded-2xl border transition-all", formData.serviceId ? "bg-cyan-950/20 border-cyan-500/30" : "bg-zinc-900/50 border-white/5")}>
             <span className="text-xs text-gray-500 uppercase tracking-widest mb-1 block">Package</span>
             <div className="text-xl font-bold text-white font-orbitron">{formData.serviceName || "Select..."}</div>
          </div>
          <div className={cn("p-6 rounded-2xl border transition-all", formData.time ? "bg-zinc-900 border-white/20" : "bg-zinc-900/30 border-white/5")}>
             <span className="text-xs text-gray-500 uppercase tracking-widest mb-1 block">Timing</span>
             <div className="text-lg font-bold text-white">{format(formData.date, "MMM dd")} • {formData.time || "--:--"}</div>
          </div>
        </div>

        {/* Desktop Total */}
        <div className="hidden md:block mt-auto pt-8 border-t border-white/10">
           <span className="text-gray-500 text-sm uppercase tracking-widest">Total Due</span>
           <div className="text-4xl font-black font-orbitron text-white mt-2">${formData.price}</div>
        </div>
      </div>

      {/* RIGHT PANEL - WIZARD */}
      <div className="flex-1 relative z-10 bg-black">
        <div className="max-w-3xl mx-auto p-6 md:p-12 h-full flex flex-col">
          <StepIndicator step={step} />

          <AnimatePresence mode="wait">
            {/* STEP 1: SERVICES */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold font-orbitron mb-4">Select Protocol</h2>
                <div className="grid gap-3">
                  {SERVICES.map((s) => (
                    <div key={s.id} onClick={() => handleServiceSelect(s)}
                      className="group cursor-pointer p-4 md:p-6 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-cyan-500/50 flex items-center justify-between active:scale-[0.98] transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black border border-white/10 flex items-center justify-center text-cyan-500">
                          <s.icon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg md:text-xl font-bold font-orbitron text-white">{s.title}</h3>
                          <div className="text-xs md:text-sm text-gray-500 font-mono">{s.duration} • {s.desc}</div>
                        </div>
                      </div>
                      <div className="text-right">
                         <span className="text-lg md:text-2xl font-bold font-mono text-white">${s.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: DATE & TIME */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <button onClick={() => setStep(1)} className="text-gray-500 flex items-center gap-2 text-sm"><ArrowLeft className="w-4 h-4" /> Back</button>
                
                <div>
                  <h2 className="text-2xl font-bold font-orbitron mb-4">Select Date</h2>
                  <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide snap-x -mx-6 px-6 md:mx-0 md:px-0">
                    {dates.map((date, i) => {
                      const isSelected = format(date, "yyyy-MM-dd") === format(formData.date, "yyyy-MM-dd");
                      return (
                        <button key={i} onClick={() => setFormData({...formData, date})}
                          className={cn("flex-shrink-0 w-16 h-20 md:w-20 md:h-24 rounded-xl flex flex-col items-center justify-center border transition-all snap-start", isSelected ? "bg-cyan-500 text-black border-cyan-500 font-bold" : "bg-zinc-900 border-white/10 text-gray-400")}
                        >
                          <span className="text-[10px] uppercase mb-1">{format(date, "EEE")}</span>
                          <span className="text-xl md:text-2xl font-mono">{format(date, "dd")}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-gray-400 text-sm uppercase tracking-widest mb-3">Time Slot</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {TIME_SLOTS.map((t) => (
                      <button key={t} onClick={() => setFormData({...formData, time: t})}
                        className={cn("py-3 rounded-lg text-xs md:text-sm font-mono border transition-all", formData.time === t ? "bg-white text-black border-white" : "bg-zinc-900 border-white/10 text-gray-300")}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => setStep(3)} disabled={!formData.time} className="w-full bg-cyan-500 disabled:opacity-50 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-4">
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* STEP 3: DETAILS */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                 <button onClick={() => setStep(2)} className="text-gray-500 flex items-center gap-2 text-sm"><ArrowLeft className="w-4 h-4" /> Back</button>
                <h2 className="text-2xl font-bold font-orbitron">Finalize</h2>
                
                <div className="space-y-4">
                  <input type="text" placeholder="Full Name" className="w-full bg-zinc-900/50 border border-white/10 p-4 rounded-xl text-white placeholder:text-gray-600 focus:border-cyan-500 outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  <input type="email" placeholder="Email" className="w-full bg-zinc-900/50 border border-white/10 p-4 rounded-xl text-white placeholder:text-gray-600 focus:border-cyan-500 outline-none" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  <input type="tel" placeholder="Phone" className="w-full bg-zinc-900/50 border border-white/10 p-4 rounded-xl text-white placeholder:text-gray-600 focus:border-cyan-500 outline-none" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>

                <div className="bg-cyan-900/10 border border-cyan-500/20 p-4 rounded-xl flex gap-3 text-sm">
                  <Shield className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                  <div className="text-cyan-200">Deposit of $10.00 required. Balance paid upon completion.</div>
                </div>

                <button onClick={handleSubmit} disabled={loading || !formData.name || !formData.email} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                  {loading ? <Loader2 className="animate-spin" /> : "Pay $10 & Book"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}