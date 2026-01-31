"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, ArrowLeft, Check, Calendar, Clock, 
  Shield, Zap, ChevronRight, Droplets, Loader2,
  Car, MapPin, Wrench, Star, Sparkles, Layers,
  X
} from "lucide-react";
import { format, addDays, startOfToday } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- DATA CONFIGURATION ---
const PACKAGES = [
  {
    id: "basic_ext",
    title: "Basic Exterior",
    price: 80,
    duration: "1-2h",
    features: ["Hand wash", "Wheel & tyre clean", "Tyre shine", "Exterior windows"],
    icon: Droplets,
  },
  {
    id: "basic_int",
    title: "Basic Interior",
    price: 90,
    duration: "1-2h",
    features: ["Full vacuum", "Interior wipe down", "Door jambs", "Windows clean"],
    icon: Car,
  },
  {
    id: "premium",
    title: "Premium Full Detail",
    price: 160,
    duration: "3-4h",
    features: ["Basic exterior detail", "Basic interior detail", "Plastic Restorer", "Deep Clean"],
    icon: Sparkles,
    popular: true,
    tag: "Most Popular 🔥"
  },
  {
    id: "gold",
    title: "Gold Correction",
    price: 500,
    duration: "1 Day",
    features: ["Full Premium Package", "Paint Decontamination", "Paint Correction (1-Step)", "Showroom Finish"],
    icon: Layers,
  },
];

const ADD_ONS = [
  { id: "engine", title: "Engine Bay", price: 40 },
  { id: "pet", title: "Pet Hair Removal", price: 40 },
  { id: "headlight", title: "Headlight Restoration", price: 80 },
  { id: "clay", title: "Clay Bar Decon", price: 35 },
  { id: "wax", title: "Hand-Applied Wax", price: 40 },
  { id: "ceramic_spray", title: "Ceramic Spray Coating", price: 40 },
  { id: "ceramic_coating", title: "Ceramic Coating (Pro)", price: 350, highlight: true, desc: "Ultimate Protection" },
  { id: "correction_2step", title: "2-Step Paint Correction", price: 150, desc: "Upgrade for Gold Pkg" },
  { id: "correction_3step", title: "3-Step Paint Correction", price: 250, desc: "Upgrade for Gold Pkg" },
];

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", 
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
];

// --- COMPONENTS ---
const StepIndicator = ({ step }: { step: number }) => (
  <div className="flex items-center gap-2 mb-8 justify-center md:justify-start">
    {[1, 2, 3, 4].map((num) => (
      <div key={num} className="flex items-center">
        <div 
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-500 border",
            step === num 
              ? "bg-blue-600 border-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)]" 
              : step > num 
                ? "bg-blue-900/30 border-blue-600/50 text-blue-500"
                : "bg-zinc-900 border-white/10 text-gray-600"
          )}
        >
          {step > num ? <Check className="w-4 h-4" /> : `0${num}`}
        </div>
        {num < 4 && (
          <div className={cn("w-8 md:w-16 h-[1px] mx-2 transition-colors duration-500", step > num ? "bg-blue-600/50" : "bg-white/10")} />
        )}
      </div>
    ))}
  </div>
);

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [isMobile, setIsMobile] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [date, setDate] = useState(startOfToday());
  const [time, setTime] = useState("");
  const [details, setDetails] = useState({ name: "", email: "", phone: "" });

  // Calculate Totals
  const basePrice = PACKAGES.find(p => p.id === selectedPackage)?.price || 0;
  const addonsPrice = selectedAddons.reduce((sum, id) => {
    const addon = ADD_ONS.find(a => a.id === id);
    return sum + (addon ? addon.price : 0);
  }, 0);
  const mobileFee = isMobile ? 30 : 0;
  const total = basePrice + addonsPrice + mobileFee;
  
  // FIXED DEPOSIT: $30
  const deposit = 30; 
  const remaining = total - deposit;

  const dates = Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));

  const toggleAddon = (id: string) => {
    if (selectedAddons.includes(id)) {
      setSelectedAddons(prev => prev.filter(item => item !== id));
    } else {
      setSelectedAddons(prev => [...prev, id]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Sending data to your backend API endpoint
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedPackage,
          addons: selectedAddons,
          date: date,
          time: time,
          customer: details,
          isMobile: isMobile,
          totalPrice: total,
          depositAmount: deposit
        }),
      });

      const data = await res.json();
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert("Something went wrong with payment initialization.");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Error connecting to payment server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-blue-600 selection:text-white flex flex-col md:flex-row">
      
      {/* LEFT SIDEBAR (Sticky on Desktop, Static on Mobile) */}
      <div className="w-full md:w-[400px] bg-zinc-950 border-b md:border-b-0 md:border-r border-white/10 p-6 md:p-8 flex flex-col md:h-screen md:sticky md:top-0 z-30">
        
        {/* Header */}
        <div className="flex items-center justify-between md:block mb-6 md:mb-8">
           <div>
             <Link href="/" className="flex items-center gap-2 mb-2 cursor-pointer hover:opacity-80 transition-opacity">
               <ArrowLeft className="w-4 h-4 text-blue-500" />
               <span className="text-blue-500 font-mono text-[10px] uppercase tracking-widest">Back Home</span>
             </Link>
             <h1 className="text-2xl md:text-3xl font-black font-orbitron tracking-tighter italic">
               BUILD YOUR <br /><span className="text-blue-600">PACKAGE</span>
             </h1>
           </div>
           
           {/* Mobile Total Badge */}
           <div className="md:hidden text-right">
             <div className="text-[10px] text-gray-500 uppercase">Est. Total</div>
             <div className="text-xl font-bold font-mono text-blue-500">${total}</div>
           </div>
        </div>

        {/* Live Receipt */}
        <div className="hidden md:flex flex-col gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-4">
          
          {/* Service Mode */}
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-gray-500 text-sm">Service Mode</span>
            <span className={cn("text-sm font-bold", isMobile ? "text-blue-400" : "text-white")}>
              {isMobile ? "Mobile Service" : "Shop Drop-off"}
            </span>
          </div>

          {/* Selected Package */}
          <div className="py-3 border-b border-white/5">
             <div className="flex justify-between items-center mb-1">
               <span className="text-gray-500 text-sm">Package</span>
               <span className="text-white font-bold font-mono">${basePrice}</span>
             </div>
             <div className="text-lg font-bold font-orbitron text-white">
               {PACKAGES.find(p => p.id === selectedPackage)?.title || "Select Package..."}
             </div>
          </div>

          {/* Mobile Fee Line Item */}
          {isMobile && (
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-gray-400 text-sm">Travel Fee</span>
              <span className="text-white font-mono">$30</span>
            </div>
          )}

          {/* Addons List */}
          {selectedAddons.length > 0 && (
            <div className="py-3 border-b border-white/5 space-y-3">
              <span className="text-gray-500 text-sm block">Add-Ons</span>
              {selectedAddons.map(id => {
                const addon = ADD_ONS.find(a => a.id === id);
                return (
                  <div key={id} className="flex justify-between items-start text-sm">
                    <span className="text-gray-300 max-w-[180px] leading-tight">+ {addon?.title}</span>
                    <span className="font-mono text-gray-500">${addon?.price}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Date Time */}
          {time && (
             <div className="py-3 border-b border-white/5">
               <span className="text-gray-500 text-sm block mb-1">Appointment</span>
               <div className="text-white font-bold flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-blue-500" />
                 {format(date, "MMM dd")} 
                 <span className="text-gray-600">|</span> 
                 {time}
               </div>
             </div>
          )}
        </div>

        {/* Desktop Total Footer */}
        <div className="hidden md:block mt-auto pt-6 border-t border-white/10 bg-zinc-950">
           <div className="flex justify-between items-end mb-2">
             <span className="text-gray-500 text-sm uppercase tracking-widest">Total Value</span>
             <div className="text-4xl font-black font-orbitron text-white tracking-tighter">${total}</div>
           </div>
           <div className="flex justify-between items-center text-sm">
             <span className="text-blue-500 font-bold uppercase">Due Now</span>
             <span className="font-mono text-blue-500 font-bold">${deposit}</span>
           </div>
        </div>
      </div>

      {/* RIGHT CONTENT AREA (Scrollable) */}
      <div className="flex-1 bg-black relative z-10">
        <div className="max-w-4xl mx-auto p-6 md:p-12 pb-32">
          
          <StepIndicator step={step} />

          <AnimatePresence mode="wait">
            
            {/* --- STEP 1: CONFIGURATION --- */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                
                {/* Location Toggle */}
                <section>
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">01. Service Location</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setIsMobile(false)}
                      className={cn(
                        "p-6 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-32 group",
                        !isMobile ? "bg-white border-white" : "bg-zinc-900 border-white/10 hover:bg-zinc-800"
                      )}
                    >
                      <MapPin className={cn("w-6 h-6", !isMobile ? "text-black" : "text-white")} />
                      <div>
                        <div className={cn("font-bold text-lg", !isMobile ? "text-black" : "text-white")}>Shop Drop-off</div>
                        <div className={cn("text-xs mt-1", !isMobile ? "text-gray-600" : "text-gray-500")}>Bring car to us</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => setIsMobile(true)}
                      className={cn(
                        "p-6 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-32 relative overflow-hidden",
                        isMobile ? "bg-blue-600 border-blue-600" : "bg-zinc-900 border-white/10 hover:bg-zinc-800"
                      )}
                    >
                      <Car className="w-6 h-6 text-white" />
                      <div>
                        <div className="font-bold text-lg text-white">Mobile Service</div>
                        <div className="text-xs mt-1 text-white/70">We come to you</div>
                      </div>
                      {isMobile && <div className="absolute top-4 right-4 text-xs font-bold bg-black/20 px-2 py-1 rounded text-white">+$30</div>}
                    </button>
                  </div>
                </section>

                {/* Packages */}
                <section>
                   <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">02. Select Package</h2>
                   <div className="grid gap-4">
                     {PACKAGES.map((pkg) => (
                       <div 
                         key={pkg.id} 
                         onClick={() => setSelectedPackage(pkg.id)}
                         className={cn(
                           "cursor-pointer p-6 md:p-8 rounded-2xl border transition-all duration-300 relative group",
                           selectedPackage === pkg.id 
                             ? "bg-zinc-900 border-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.1)]" 
                             : "bg-zinc-900/40 border-white/5 hover:border-white/20"
                         )}
                       >
                         {pkg.tag && (
                           <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-blue-500 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest shadow-lg">
                             {pkg.tag}
                           </div>
                         )}
                         
                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                            <div className="flex items-center gap-5">
                               <div className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-colors shrink-0", selectedPackage === pkg.id ? "bg-blue-600 text-white" : "bg-zinc-950 border border-white/10 text-gray-500")}>
                                 <pkg.icon className="w-7 h-7" />
                               </div>
                               <div>
                                  <h3 className="text-xl md:text-2xl font-bold font-orbitron text-white">{pkg.title}</h3>
                                  <div className="text-sm text-gray-500 font-mono mt-1 flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> {pkg.duration}
                                  </div>
                               </div>
                            </div>
                            <div className="text-3xl font-bold font-mono text-white">${pkg.price}</div>
                         </div>
                         
                         <div className="grid md:grid-cols-2 gap-y-2 gap-x-8 border-t border-white/5 pt-4">
                            {pkg.features.map((f, i) => (
                              <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                                <Check className={cn("w-4 h-4", selectedPackage === pkg.id ? "text-blue-500" : "text-gray-600")} /> 
                                {f}
                              </div>
                            ))}
                         </div>
                       </div>
                     ))}
                   </div>
                </section>

                <div className="sticky bottom-6 z-20">
                  <button 
                    onClick={() => setStep(2)} 
                    disabled={!selectedPackage} 
                    className="w-full bg-white disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-2xl"
                  >
                    Next: Add-Ons <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- STEP 2: ADD-ONS --- */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                 <button onClick={() => setStep(1)} className="text-gray-500 flex items-center gap-2 text-sm hover:text-white transition-colors mb-4"><ArrowLeft className="w-4 h-4" /> Back to Packages</button>
                 
                 <div className="text-center md:text-left mb-8">
                   <h2 className="text-3xl font-bold font-orbitron mb-2">Enhance Your Detail</h2>
                   <p className="text-gray-400">Select premium add-ons to customize your service.</p>
                 </div>

                 <div className="grid md:grid-cols-2 gap-4">
                    {ADD_ONS.map((addon) => (
                      <div 
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={cn(
                          "cursor-pointer p-5 rounded-xl border transition-all flex items-center justify-between group",
                          selectedAddons.includes(addon.id) 
                            ? "bg-zinc-900 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.15)]" 
                            : "bg-zinc-900/30 border-white/10 hover:border-white/30",
                          addon.highlight && !selectedAddons.includes(addon.id) ? "border-blue-600/40" : ""
                        )}
                      >
                          <div className="flex items-center gap-4">
                            <div className={cn("w-6 h-6 rounded border flex items-center justify-center transition-colors", selectedAddons.includes(addon.id) ? "bg-blue-600 border-blue-600" : "border-gray-600 bg-black")}>
                               {selectedAddons.includes(addon.id) && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <div>
                               <div className="font-bold text-white flex items-center gap-2">
                                 {addon.title}
                                 {addon.highlight && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                               </div>
                               {addon.desc && <div className="text-xs text-gray-500 mt-0.5">{addon.desc}</div>}
                            </div>
                          </div>
                          <div className="font-mono font-bold text-gray-300 group-hover:text-white transition-colors">+${addon.price}</div>
                      </div>
                    ))}
                 </div>

                 <div className="sticky bottom-6 z-20 pt-4">
                   <button onClick={() => setStep(3)} className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-2xl">
                     Next: Schedule <ArrowRight className="w-5 h-5" />
                   </button>
                 </div>
              </motion.div>
            )}

            {/* --- STEP 3: SCHEDULE --- */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <button onClick={() => setStep(2)} className="text-gray-500 flex items-center gap-2 text-sm hover:text-white transition-colors mb-4"><ArrowLeft className="w-4 h-4" /> Back to Add-Ons</button>
                
                {/* Date Selection */}
                <div>
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Select Date</h2>
                  <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide snap-x -mx-6 px-6 md:mx-0 md:px-0">
                    {dates.map((d, i) => {
                      const isSelected = format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
                      return (
                        <button key={i} onClick={() => setDate(d)}
                          className={cn("flex-shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center border transition-all snap-start group", isSelected ? "bg-blue-600 text-white border-blue-600 font-bold shadow-lg scale-105" : "bg-zinc-900 border-white/10 text-gray-400 hover:border-blue-600/50 hover:bg-zinc-800")}
                        >
                          <span className="text-xs uppercase mb-1 opacity-70">{format(d, "EEE")}</span>
                          <span className="text-2xl font-mono group-hover:text-white transition-colors">{format(d, "dd")}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Select Time</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {TIME_SLOTS.map((t) => (
                      <button key={t} onClick={() => setTime(t)}
                        className={cn("py-4 rounded-xl text-sm font-mono border transition-all", time === t ? "bg-white text-black border-white font-bold shadow-lg" : "bg-zinc-900 border-white/10 text-gray-300 hover:border-white/40")}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sticky bottom-6 z-20 pt-4">
                  <button onClick={() => setStep(4)} disabled={!time} className="w-full bg-white disabled:opacity-50 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-2xl">
                    Final Step: Details <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- STEP 4: FINAL DETAILS --- */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                 <button onClick={() => setStep(3)} className="text-gray-500 flex items-center gap-2 text-sm hover:text-white transition-colors mb-4"><ArrowLeft className="w-4 h-4" /> Back to Schedule</button>
                
                <div>
                  <h2 className="text-3xl font-bold font-orbitron mb-2">Almost Done.</h2>
                  <p className="text-gray-400">Enter your details to secure your appointment.</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                      <label className="text-xs text-gray-500 uppercase font-bold ml-1 mb-1 block">Full Name</label>
                      <input type="text" placeholder="John Doe" className="w-full bg-zinc-900/50 border border-white/10 p-4 rounded-xl text-white placeholder:text-gray-700 focus:border-blue-600 outline-none transition-colors" value={details.name} onChange={(e) => setDetails({...details, name: e.target.value})} />
                  </div>
                  <div>
                      <label className="text-xs text-gray-500 uppercase font-bold ml-1 mb-1 block">Email Address</label>
                      <input type="email" placeholder="john@example.com" className="w-full bg-zinc-900/50 border border-white/10 p-4 rounded-xl text-white placeholder:text-gray-700 focus:border-blue-600 outline-none transition-colors" value={details.email} onChange={(e) => setDetails({...details, email: e.target.value})} />
                  </div>
                  <div>
                      <label className="text-xs text-gray-500 uppercase font-bold ml-1 mb-1 block">Phone Number</label>
                      <input type="tel" placeholder="(555) 000-0000" className="w-full bg-zinc-900/50 border border-white/10 p-4 rounded-xl text-white placeholder:text-gray-700 focus:border-blue-600 outline-none transition-colors" value={details.phone} onChange={(e) => setDetails({...details, phone: e.target.value})} />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-center shadow-2xl">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-bold text-white mb-1">Secure Your Spot ($30 Deposit)</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Cancellations made <strong>more than 24 hours</strong> in advance are refunded minus a $2 fee ($28 refund). 
                      Cancellations <strong>within 24 hours</strong> are non-refundable.
                    </p>
                  </div>
                </div>

                <button onClick={handleSubmit} disabled={loading || !details.name || !details.email || !details.phone} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all transform active:scale-[0.98]">
                  {loading ? <Loader2 className="animate-spin" /> : `Pay $${deposit} Deposit & Book`}
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}