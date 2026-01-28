"use client";

import React, { useState, useEffect, useRef, MouseEvent } from "react";
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useMotionValue, 
  useMotionTemplate, 
  useMotionValueEvent,
  AnimatePresence 
} from "framer-motion";
import { 
  ArrowRight, 
  ArrowUpRight, 
  CheckCircle2, 
  ChevronDown, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Star, 
  Zap, 
  Menu, 
  X,
  Droplets
} from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILITIES ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- HOOKS ---
const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const updateMousePosition = (e: globalThis.MouseEvent) => 
      setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);
  return mousePosition;
};

// --- MICRO COMPONENTS ---

// 1. Magnetic Button (Sticks to cursor)
const MagneticButton = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const ySpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.2); // Magnetic strength
    y.set(middleY * 0.2);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      style={{ x: xSpring, y: ySpring }}
      className={cn("relative z-10", className)}
    >
      {children}
    </motion.button>
  );
};

// 2. Spotlight Card (Apple-style glow)
const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        "group relative border border-white/10 bg-zinc-900/40 overflow-hidden",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(6, 182, 212, 0.10),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

// 3. Grain Overlay (Cinematic Texture)
const Grain = () => (
  <div className="pointer-events-none fixed inset-0 z-[1] opacity-20 mix-blend-overlay">
    <div className="absolute inset-0 w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/Noise.png')] animate-grain" />
  </div>
);

// --- SECTIONS ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 transition-all duration-500",
        isScrolled ? "bg-black/50 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent"
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
        <span className="text-xl font-black font-orbitron text-white tracking-tighter">
          JT'S<span className="text-cyan-500">.</span>
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {["Expertise", "Services", "Gallery", "Contact"].map((item) => (
          <a 
            key={item} 
            href={`#${item.toLowerCase()}`}
            className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors relative group"
          >
            {item}
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-cyan-500 transition-all duration-300 group-hover:w-full" />
          </a>
        ))}
      </div>

      <Link href="/booking">
        <MagneticButton className="hidden md:block">
          <div className="relative px-6 py-2 overflow-hidden bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-cyan-400 transition-colors skew-x-[-12deg]">
            <span className="block skew-x-[12deg]">Book Now</span>
          </div>
        </MagneticButton>
      </Link>
      
      <button className="md:hidden text-white">
        <Menu className="w-6 h-6" />
      </button>
    </motion.nav>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const textY = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-zinc-950 flex items-center justify-center">
      {/* Background Image (Parallax) */}
      <motion.div 
        style={{ y, opacity }} 
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-zinc-950 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-zinc-950/80 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=2670&auto=format&fit=crop" 
          alt="Luxury Car Detail" 
          className="w-full h-full object-cover opacity-60 scale-110"
        />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-20 w-full max-w-[1400px] px-6 md:px-12 flex flex-col justify-end h-full pb-20 md:pb-32">
        <motion.div 
          style={{ y: textY }}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="px-3 py-1 border border-cyan-500/30 rounded-full bg-cyan-950/10 backdrop-blur-md">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                ● Available in Los Angeles
              </span>
            </div>
            <div className="h-[1px] w-20 bg-white/20" />
          </div>

          <h1 className="text-6xl md:text-[8vw] leading-[0.85] font-black font-orbitron text-white tracking-tighter uppercase mb-8">
            Precision <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-gray-600">
              Protocol
            </span>
          </h1>

          <div className="flex flex-col md:flex-row items-end justify-between gap-8 border-t border-white/10 pt-8">
            <p className="max-w-md text-gray-400 text-lg leading-relaxed">
              We don't just wash cars. We perform automotive surgery. 
              The most advanced mobile detailing unit in California.
            </p>
            
            <div className="flex gap-4">
               <Link href="/booking">
                 <MagneticButton>
                    <div className="group flex items-center gap-3 bg-cyan-500 px-8 py-4 rounded-full text-black font-bold transition-all hover:bg-white">
                      <span>Start Your Build</span>
                      <ArrowRight className="w-5 h-5 group-hover:-rotate-45 transition-transform duration-300" />
                    </div>
                 </MagneticButton>
               </Link>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30"
      >
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </section>
  );
};

const Marquee = () => {
  return (
    <div className="relative z-30 bg-cyan-500 py-3 overflow-hidden -rotate-1 origin-left scale-110 border-y-4 border-black">
      <div className="flex gap-8 animate-marquee whitespace-nowrap">
        {Array(10).fill("LUXURY • PROTECTION • CONCOURS • MOBILE •").map((text, i) => (
          <span key={i} className="text-2xl font-black italic text-black font-orbitron tracking-tighter">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

// --- SERVICES SECTION (Spotlight Cards) ---
const Services = () => {
  const services = [
    {
      id: "01",
      title: "Paint Correction",
      desc: "Removal of swirls, scratches, and oxidation to restore showroom depth.",
      price: "$450+",
      icon: ShieldCheck
    },
    {
      id: "02",
      title: "Ceramic Coating",
      desc: "5-Year molecular bond protection against environmental fallout.",
      price: "$890+",
      icon: Zap
    },
    {
      id: "03",
      title: "Interior Restoration",
      desc: "Steam cleaning, leather matte-finish conditioning, and odor removal.",
      price: "$250+",
      icon: Star
    }
  ];

  return (
    <section id="services" className="py-32 bg-zinc-950 relative z-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20">
          <div>
            <h2 className="text-4xl md:text-7xl font-black font-orbitron text-white uppercase mb-4">
              The <span className="text-cyan-500">Menu</span>
            </h2>
            <p className="text-gray-500 max-w-sm">
              Tailored packages for the discerning enthusiast.
            </p>
          </div>
          <Link href="/booking" className="hidden md:block text-white border-b border-cyan-500 pb-1 hover:text-cyan-500 transition-colors">
            View Full Price List
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <SpotlightCard key={i} className="h-[500px] flex flex-col justify-between p-10 bg-zinc-900/50">
              <div>
                <div className="flex justify-between items-start mb-8">
                  <span className="text-5xl font-black text-white/5 font-orbitron">{s.id}</span>
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500 group-hover:text-black transition-all duration-500">
                    <s.icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold font-orbitron text-white mb-4 uppercase">{s.title}</h3>
                <div className="w-12 h-1 bg-cyan-500 mb-6" />
                <p className="text-gray-400 text-lg leading-relaxed">{s.desc}</p>
              </div>
              <div className="flex items-end justify-between border-t border-white/10 pt-6">
                <div>
                   <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Starting At</span>
                   <span className="text-2xl font-mono text-white">{s.price}</span>
                </div>
                <ArrowUpRight className="text-white/30 group-hover:text-cyan-500 group-hover:rotate-45 transition-all duration-500" />
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- PROCESS SECTION (Parallax Text) ---
const Process = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <section ref={containerRef} className="relative py-40 bg-black overflow-hidden flex items-center justify-center min-h-screen">
      {/* Background Huge Text */}
      <motion.div 
        style={{ y: textY }} 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-0 pointer-events-none opacity-20"
      >
        <h2 className="text-[25vw] leading-none font-black font-orbitron text-zinc-800 tracking-tighter whitespace-nowrap">
          OBSESSION
        </h2>
      </motion.div>

      {/* Floating Image Card */}
      <motion.div 
        style={{ y }}
        className="relative z-10 max-w-4xl w-full px-6"
      >
        <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
          <img 
            src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop" 
            alt="Detailing Process"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 bg-gradient-to-t from-black via-black/80 to-transparent">
             <div className="flex items-end justify-between">
                <div>
                  <div className="text-cyan-500 font-mono text-xs uppercase tracking-widest mb-2">The Difference</div>
                  <h3 className="text-3xl md:text-5xl font-bold font-orbitron text-white">Zero Swirls.</h3>
                </div>
                <div className="hidden md:block max-w-xs text-right text-gray-300">
                  We use forced-air drying and single-use microfiber towels to ensure your paint is never scratched during the wash process.
                </div>
             </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

// --- TESTIMONIALS (Masonry) ---
const Reviews = () => {
  const reviews = [
    { name: "Alex V.", car: "Porsche 911 GT3", text: "I didn't think my paint could look this wet. JT is a wizard." },
    { name: "Sarah M.", car: "Range Rover", text: "He showed up on time, fully equipped. My car looks brand new." },
    { name: "David K.", car: "McLaren 720s", text: "Trusted him with my supercar. The ceramic coating is flawless." }
  ];

  return (
    <section id="reviews" className="py-32 bg-zinc-950 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <h2 className="text-4xl md:text-6xl font-bold font-orbitron text-white text-center mb-20">
          Client <span className="text-cyan-500">Stories</span>
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div key={i} className="group p-8 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors duration-300">
              <div className="flex gap-1 text-cyan-500 mb-6">
                {[1,2,3,4,5].map(star => <Star key={star} className="fill-current w-4 h-4" />)}
              </div>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">"{r.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-white">{r.name}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest">{r.car}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- FOOTER (Massive) ---
const Footer = () => {
  return (
    <footer className="bg-black pt-40 pb-12 px-6 md:px-12 border-t border-white/10 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start mb-24">
          <div>
            <h2 className="text-[12vw] leading-[0.8] font-black font-orbitron text-white tracking-tighter mb-8">
              JT'S<span className="text-cyan-500">.</span>
            </h2>
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer">
                 <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                   <MapPin className="w-4 h-4" />
                 </div>
                 <span>Los Angeles, CA</span>
               </div>
               <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer">
                 <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                   <Phone className="w-4 h-4" />
                 </div>
                 <span>(555) 987-6543</span>
               </div>
            </div>
          </div>
          
          <div className="mt-12 md:mt-0 text-right">
             <Link href="/booking">
                <div className="group inline-flex items-center gap-4 cursor-pointer">
                  <span className="text-4xl md:text-6xl font-black text-white uppercase font-orbitron group-hover:text-cyan-500 transition-colors">
                    Book Now
                  </span>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <ArrowRight className="w-8 h-8 text-black group-hover:-rotate-45 transition-transform duration-500" />
                  </div>
                </div>
             </Link>
             <p className="text-gray-500 mt-6 max-w-md ml-auto">
               Premium mobile detailing service for Los Angeles and surrounding counties. Fully insured and certified.
             </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-xs text-gray-600 font-mono uppercase">
           <span>© 2026 JT's Mobile Auto Detailing</span>
           <div className="flex gap-8 mt-4 md:mt-0">
             <a href="#" className="hover:text-white transition-colors">Instagram</a>
             <a href="#" className="hover:text-white transition-colors">Facebook</a>
             <a href="#" className="hover:text-white transition-colors">Privacy</a>
           </div>
        </div>
      </div>
    </footer>
  );
};

// --- MAIN PAGE COMPONENT ---

export default function Home() {
  const { x, y } = useMousePosition();
  
  return (
    <main className="min-h-screen bg-black text-white selection:bg-cyan-500/30 selection:text-cyan-100 overflow-x-hidden">
      {/* Styles for Grain Animation */}
      <style jsx global>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -10%); }
          20% { transform: translate(-15%, 5%); }
          30% { transform: translate(7%, -25%); }
          40% { transform: translate(-5%, 25%); }
          50% { transform: translate(-15%, 10%); }
          60% { transform: translate(15%, 0%); }
          70% { transform: translate(0%, 15%); }
          80% { transform: translate(3%, 35%); }
          90% { transform: translate(-10%, 10%); }
        }
        .animate-grain {
          animation: grain 8s steps(10) infinite;
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <Grain />
      
      {/* Custom Cursor (Desktop Only) */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white/50 pointer-events-none z-[100] hidden md:block mix-blend-difference"
        animate={{ x: x - 16, y: y - 16 }}
        transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
      />
      
      <Navbar />
      <Hero />
      <Marquee />
      <Services />
      <Process />
      <Reviews />
      <Footer />
    </main>
  );
}