"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, ArrowUpRight, CheckCircle2, MapPin, 
  Phone, ShieldCheck, Star, Zap, Menu, X,
  Car, Wrench, Droplets, Layers, Sparkles, Camera, Quote
} from "lucide-react";
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useMotionValue, 
  useMotionTemplate ,
  AnimatePresence
} from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- SETUP ---
gsap.registerPlugin(ScrollTrigger);
function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const update = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", update);
    return () => window.removeEventListener("mousemove", update);
  }, []);

  return position;
}

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- MICRO COMPONENTS ---

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
    x.set(middleX * 0.2);
    y.set(middleY * 0.2);
  };

  const reset = () => { x.set(0); y.set(0); };

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

const Grain = () => (
  <div className="pointer-events-none fixed inset-0 z-[1] opacity-[0.12] mix-blend-overlay">
    <div className="absolute inset-0 w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/Noise.png')] animate-grain" />
  </div>
);

// --- MAIN SECTIONS ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(navRef.current, {
      y: -20,
      opacity: 0,
      duration: 1.2,
      delay: 1,
      ease: "expo.out"
    });
  });

  const menuLinks = [
    { name: "Services", href: "#services" },
    { name: "Policies", href: "#policies" },
    { name: "Gallery", href: "#gallery" },
  ];

  return (
    <>
      <nav ref={navRef} className="fixed top-6 left-0 right-0 z-[100] px-6 flex justify-center pointer-events-none">
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full flex items-center gap-8 pointer-events-auto shadow-2xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
              <span className="font-black text-white italic text-sm">JN</span>
            </div>
            <span className="font-bold text-[10px] tracking-[0.2em] uppercase text-white hidden sm:block">Signature</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {menuLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                {link.name}
              </a>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-white/10 hidden md:block" />

          {/* Action */}
          <div className="flex items-center gap-4">
            <Link href="/booking" className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">
              Book Now
            </Link>
            <button onClick={() => setIsOpen(true)} className="md:hidden text-white">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu (Same Logic, Darker Theme) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center"
          >
            <button onClick={() => setIsOpen(false)} className="absolute top-10 right-10 text-white"><X className="w-8 h-8"/></button>
            {menuLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-4xl font-black font-orbitron text-white mb-6 uppercase italic hover:text-red-600 transition-colors">{link.name}</a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const leftTextRef = useRef<HTMLDivElement>(null);
  const rightTextRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    // 1. Remove Curtain (Black reveal)
    tl.to(curtainRef.current, {
      yPercent: -100,
      duration: 1.4,
      ease: "expo.inOut"
    })
    // 2. Text Split Reveal
    .from([leftTextRef.current, rightTextRef.current], {
      y: 50,
      opacity: 0,
      duration: 1.2,
      stagger: 0.1,
      ease: "power4.out"
    }, "-=0.6")
    // 3. Ken Burns Zoom Effect
    .fromTo(imageRef.current, 
      { scale: 1.2, filter: "blur(10px) brightness(0.4)" }, 
      { scale: 1, filter: "blur(0px) brightness(0.6)", duration: 2.5, ease: "power2.out" }, 
      "0"
    );

    // Parallax on Scroll
    gsap.to(imageRef.current, {
      y: 150,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-black">
      {/* Cinematic Curtain (Prevents White Flash) */}
      <div ref={curtainRef} className="absolute inset-0 z-[60] bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="font-orbitron font-black text-white italic tracking-tighter text-4xl animate-pulse">JN</span>
          <div className="w-12 h-[2px] bg-red-600 animate-width" />
        </div>
      </div>

      {/* Visual Layer - Background Image */}
      <div className="absolute inset-0 z-0">
        {/* Overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10 opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10" />
        
        <img 
          ref={imageRef}
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2670&auto=format&fit=crop" 
          alt="Luxury Sports Car Detail"
          className="w-full h-full object-cover" 
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-20 h-full flex flex-col justify-center px-6 md:px-20">
        <div className="max-w-[1400px] mx-auto w-full grid md:grid-cols-2 items-center gap-12">
          
          {/* Left Side: Bold Typography */}
          <div ref={leftTextRef} className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[1px] w-8 bg-red-600"></span>
              <span className="text-red-600 font-mono text-xs uppercase tracking-[0.4em]">The Standard of Shine</span>
            </div>
            <h1 className="text-6xl md:text-[8vw] font-black font-orbitron leading-[0.85] text-white italic uppercase tracking-tighter">
              BEYOND <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-600">CLEAN.</span>
            </h1>
          </div>

          {/* Right Side: Description & CTA */}
          <div ref={rightTextRef} className="md:pt-32">
            <div className="bg-black/20 backdrop-blur-md border-l-2 border-red-600 p-8 rounded-r-xl">
              <p className="text-gray-200 text-lg md:text-xl max-w-md leading-relaxed mb-8">
                Premium automotive preservation for those who value every detail. From daily drivers to exotic collections.
              </p>
              
              <div className="flex items-center gap-6">
                <Link href="/booking">
                  <button className="px-10 py-5 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all duration-500 transform hover:scale-105 active:scale-95">
                    Book Service
                  </button>
                </Link>
                
                <div className="hidden sm:flex flex-col border-l border-white/10 pl-6">
                  <span className="text-white font-bold text-sm">Melbourne, AU</span>
                  <span className="text-gray-500 text-[10px] uppercase tracking-widest">Available 7 Days</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Animated Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
         <span className="text-[8px] uppercase tracking-[0.3em] text-white/40 mb-2">Discovery</span>
         <div className="w-[1px] h-16 bg-gradient-to-b from-red-600 to-transparent relative overflow-hidden">
            <motion.div 
              animate={{ y: [0, 64] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-1/2 bg-white"
            />
         </div>
      </div>
    </section>
  );
};

const Marquee = () => {
  return (
    <div className="relative z-30 bg-red-600 py-3 overflow-hidden border-y-4 border-black">
      <div className="flex gap-8 animate-marquee whitespace-nowrap">
        {Array(10).fill("JN SIGNATURE • MOBILE DETAILING • CERAMIC COATING • PAINT CORRECTION •").map((text, i) => (
          <span key={i} className="text-2xl font-black italic text-black font-orbitron tracking-tighter">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};



// --- SERVICES SECTION (Updated per Image) ---
const Services = () => {
  const serviceList = [
    {
      title: "Basic",
      price: "From $80",
      description: "Essential maintenance. Choose specific care or combine.",
      icon: Droplets,
      details: [
        { label: "Exterior ($80)", items: ["Hand wash", "Wheel and tyre clean", "Tyre shine", "Exterior windows"] },
        { label: "Interior ($90)", items: ["Full vacuum", "Interior wipe down", "Door jambs", "Windows"] }
      ]
    },
    {
      title: "Premium",
      price: "From $160",
      isPopular: true,
      description: "Full detail package. Our most requested service.",
      icon: Sparkles,
      details: [
        { label: "Includes", items: ["Basic exterior detail", "Basic interior detail", "Plastic Restorer", "Deep Clean"] }
      ]
    },
    {
      title: "Gold",
      price: "From $500",
      description: "Paint perfection and restoration.",
      icon: Layers,
      details: [
        { label: "Includes", items: ["Full Premium Package", "Paint Decontamination", "Paint Correction"] },
        { label: "Correction Options", items: ["1-Step (Included)", "2-Step (+$150)", "3-Step (+$250)"] }
      ]
    }
  ];

  return (
    <section id="services" className="py-32 bg-zinc-950 relative z-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20">
          <div>
            <h2 className="text-4xl md:text-7xl font-black font-orbitron text-white uppercase mb-4">
              Service <span className="text-red-600">Menu</span>
            </h2>
            <p className="text-gray-400 max-w-sm">
              From maintenance washes to concours-level paint correction.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {serviceList.map((s, i) => (
            <div key={i} className={cn(
              "group relative flex flex-col justify-between p-8 rounded-2xl border transition-all duration-500 overflow-hidden",
              s.isPopular 
                ? "bg-zinc-900 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.15)]" 
                : "bg-zinc-900/50 border-white/10 hover:border-red-600/50"
            )}>
              {/* Popular Tag */}
              {s.isPopular && (
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                  Most Popular 🔥
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors",
                    s.isPopular ? "bg-red-600 text-white" : "bg-white/5 text-gray-400 group-hover:text-red-500"
                  )}>
                    <s.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold font-orbitron text-white">{s.price}</h3>
                </div>
                
                <h4 className="text-2xl font-bold font-orbitron text-white uppercase mb-2">{s.title}</h4>
                <p className="text-gray-400 text-sm mb-8 border-b border-white/10 pb-4">{s.description}</p>

                <div className="space-y-6">
                  {s.details.map((section, idx) => (
                    <div key={idx}>
                      <span className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2 block">{section.label}</span>
                      <ul className="space-y-2">
                        {section.items.map((item, k) => (
                          <li key={k} className="flex items-start gap-2 text-sm text-gray-300">
                            <CheckCircle2 className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                 <Link href="/booking">
                   <button className="w-full py-4 rounded-lg bg-white/5 hover:bg-red-600 hover:text-white border border-white/10 hover:border-red-600 transition-all font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 group-hover:bg-white group-hover:text-black">
                     Book {s.title}
                     <ArrowUpRight className="w-4 h-4" />
                   </button>
                 </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


// --- REVIEWS SECTION (Refined) ---
const Reviews = () => {
  const reviews = [
    { name: "Alex V.", car: "Porsche 911 GT3", text: "I didn't think my paint could look this wet. The 2-step correction completely removed the swirls.", rating: 5 },
    { name: "Sarah M.", car: "Range Rover", text: "He showed up on time, fully equipped. My interior looks brand new despite the kids.", rating: 5 },
    { name: "David K.", car: "McLaren 720s", text: "Trusted him with my supercar. The ceramic coating application is flawless.", rating: 5 }
  ];

  return (
    <section id="reviews" className="py-32 bg-black border-t border-white/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(220,38,38,0.05),_transparent_40%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold font-orbitron text-white mb-4">
            Client <span className="text-red-600">Feedback</span>
          </h2>
          <div className="flex justify-center gap-1 text-red-600">
            {[1,2,3,4,5].map(i => <Star key={i} className="fill-current w-5 h-5" />)}
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div key={i} className="group p-8 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/5 hover:border-red-600/30 transition-all duration-300 relative">
              <Quote className="absolute top-8 right-8 text-white/5 w-10 h-10" />
              <div className="flex gap-1 text-red-600 mb-6">
                {[...Array(r.rating)].map((_, i) => <Star key={i} className="fill-current w-3 h-3" />)}
              </div>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed italic">"{r.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-tr from-red-600 to-red-800 rounded-full flex items-center justify-center font-bold text-white text-sm">
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



 // --- GALLERY SECTION (New Premium Grid) ---
const Gallery = () => {
  const images = [
    "https://images.unsplash.com/photo-1603584173870-7b231416e800?q=80&w=2070&auto=format&fit=crop", // Detail shot
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000&auto=format&fit=crop", // Car front
    "https://images.unsplash.com/photo-1600712242805-5f78671b24da?q=80&w=2000&auto=format&fit=crop", // Interior
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2000&auto=format&fit=crop", // Mustang/Muscle
  ];

  return (
    <section id="gallery" className="py-20 bg-zinc-950">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex justify-between items-end mb-12">
           <h2 className="text-3xl md:text-5xl font-black font-orbitron text-white uppercase">
             Recent <span className="text-red-600">Work</span>
           </h2>
           <div className="hidden md:flex items-center gap-2 text-sm font-bold text-white">
             <Camera className="text-red-600 w-4 h-4" />
             <span>Follow on Instagram</span>
           </div>
        </div>

        {/* Bento Grid Style Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[600px]">
          {/* Large Hero Image */}
          <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-2xl border border-white/10">
             <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
             <img 
               src={images[0]} 
               alt="Showcase 1" 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
             />
             <div className="absolute bottom-6 left-6 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <span className="text-white font-bold font-orbitron text-xl">Paint Correction</span>
             </div>
          </div>

          {/* Top Right */}
          <div className="md:col-span-2 relative group overflow-hidden rounded-2xl border border-white/10">
            <img 
               src={images[1]} 
               alt="Showcase 2" 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
             />
          </div>

          {/* Bottom Right 1 */}
          <div className="md:col-span-1 relative group overflow-hidden rounded-2xl border border-white/10">
             <img 
               src={images[2]} 
               alt="Showcase 3" 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
             />
          </div>

          {/* Bottom Right 2 */}
          <div className="md:col-span-1 relative group overflow-hidden rounded-2xl border border-white/10">
             <img 
               src={images[3]} 
               alt="Showcase 4" 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
             />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-red-500 font-bold uppercase tracking-widest text-xs border border-red-500 px-4 py-2 rounded-full">View All</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};


// --- ABOUT SECTION (Ferrari/Lambo "Heritage" Style) ---
const About = () => {
  return (
    <section id="about" className="py-32 bg-zinc-950 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-red-600 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1964&auto=format&fit=crop" 
            alt="The Detailer" 
            className="rounded-2xl grayscale hover:grayscale-0 transition-all duration-700 border border-white/10"
          />
        </div>
        <div>
          <h2 className="text-4xl md:text-6xl font-black font-orbitron text-white uppercase mb-8 italic">
            JN <span className="text-red-600">Heritage</span>
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            At JN-Signature Detailing, we treat every vehicle like a masterpiece. Born from an obsession with automotive lines and showroom depth, we've brought elite-level detailing directly to your driveway.
          </p>
          <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
            <div>
              <div className="text-3xl font-bold text-red-600 font-orbitron">100%</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Mobile Studio</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 font-orbitron">5-Star</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Client Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- POLICIES SECTION (Updated from your Image) ---
const Policies = () => {
  const policies = [
    { number: "1", title: "Booking", text: "DM to call or book." },
    { number: "2", title: "Pricing", text: "Starting prices; final cost depends on vehicle size and condition." },
    { number: "3", title: "Payment", text: "10% Deposit upon arrival. Cash • Pay ID • Bank Transfer." },
    { number: "4", title: "Vehicle Prep", text: "Remove personal belongings; not responsible for pre-existing damage." },
    { number: "5", title: "Access", text: "Access to water and power needed; certain packages require garage access." },
    { number: "6", title: "Updates", text: "Customers will be notified if there are any delays." },
  ];

  return (
    <section id="policies" className="py-24 bg-black border-y border-white/5">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-orbitron text-white uppercase">Client <span className="text-red-600">Protocols</span></h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {policies.map((p, i) => (
             <div key={i} className="group p-6 rounded-xl border border-white/5 bg-zinc-900/20 hover:border-red-600/50 transition-all">
                <div className="w-10 h-10 rounded-full border border-red-600 flex items-center justify-center text-red-600 font-bold mb-4 group-hover:bg-red-600 group-hover:text-white transition-all">
                  {p.number}
                </div>
                <h4 className="text-white font-bold uppercase mb-2">{p.title}</h4>
                <p className="text-sm text-gray-400">{p.text}</p>
             </div>
          ))}
        </div>
      </div>
    </section>
  );
};


// --- FOOTER ---
const Footer = () => {
  return (
    <footer className="bg-zinc-950 pt-40 pb-12 px-6 md:px-12 border-t border-white/10 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start mb-24">
          <div>
            <h2 className="text-[10vw] leading-[0.8] font-black font-orbitron text-white tracking-tighter mb-8 italic">
              JN-SIG<span className="text-red-600">.</span>
            </h2>
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer">
                 <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-red-600 hover:border-red-600 hover:text-white transition-all">
                   <MapPin className="w-4 h-4" />
                 </div>
                 <span>Melbourne & Mobile Service</span>
               </div>
               <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer">
                 <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-red-600 hover:border-red-600 hover:text-white transition-all">
                   <Phone className="w-4 h-4" />
                 </div>
                 <span>(555) 987-6543 (DEMO)</span>
               </div>
            </div>
          </div>
          
          <div className="mt-12 md:mt-0 text-right">
              <Link href="#configurator">
                 <div className="group inline-flex items-center gap-4 cursor-pointer">
                   <span className="text-4xl md:text-6xl font-black text-white uppercase font-orbitron group-hover:text-red-600 transition-colors">
                     Book Now
                   </span>
                   <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                     <ArrowRight className="w-8 h-8 text-black group-hover:-rotate-45 transition-transform duration-500" />
                   </div>
                 </div>
              </Link>
              <p className="text-gray-500 mt-6 max-w-md ml-auto text-sm">
                JN-Signature Detailing. Premium automotive care. 
                <br />Licensed and Insured.
              </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-xs text-gray-600 font-mono uppercase">
           <span>© 2026 JN-Signature Detailing</span>
           <div className="flex gap-8 mt-4 md:mt-0">
             <a href="#" className="hover:text-red-500 transition-colors">Instagram</a>
             <a href="#" className="hover:text-red-500 transition-colors">Facebook</a>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default function Home() {
  const { x, y } = useMousePosition();
  
  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white overflow-x-hidden">
      

      <Grain />
      
      {/* Custom Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 rounded-full bg-red-600 pointer-events-none z-[100] hidden md:block mix-blend-difference"
        animate={{ x: x - 8, y: y - 8 }}
        transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
      />
      
      <Navbar />
      <Hero />
      <Marquee />
      <Reviews />
      <Services />
      <Policies />
      <Gallery />
      <About />
      <Footer />
    </main>
  );
}