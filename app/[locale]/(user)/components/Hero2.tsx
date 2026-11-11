"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Compass, MapPin, PawPrint, Waves, Trees, CheckCircle2 } from "lucide-react";

const collage = {
  main: {
    src: "https://i.pinimg.com/1200x/68/01/19/6801199e33bc9eaa9f4777a21ee25a45.jpg",
    alt: "Mountain gorilla in Volcanoes National Park",
  },
  top: {
    src: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=900&q=80",
    alt: "Lion and cub resting in the grass",
  },
  bottom: {
    src: "https://i.pinimg.com/1200x/51/a9/a8/51a9a84199c37fc7ade67a32a8b6df39.jpg",
    alt: "Boats on the shore of Lake Kivu",
  },
};

const highlights = [
  { icon: PawPrint, label: "Gorillas" },
  { icon: Compass, label: "Safaris" },
  { icon: Trees, label: "Rainforests" },
  { icon: Waves, label: "Lakes" },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay },
});

export default function Hero2() {
  return (
    <section className="relative overflow-hidden bg-[#F8F6F1] text-[#0a120b] font-sans selection:bg-[#c5a86d] selection:text-black">
      {/* Soft decorative shapes */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-[#EDE6DA]" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#c5a86d]/10 -translate-x-1/2 translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-6 pt-36 pb-20 lg:pb-24 min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-10 items-center">
        {/* Left: text */}
        <div>
          <motion.div {...fadeUp(0)} className="flex items-center gap-3 mb-6">
            <span className="w-10 h-px bg-[#c5a86d]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1F5A42]">
              Rwanda Safaris & Tours
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.1)}
            className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-serif uppercase tracking-wide leading-[1.05] text-[#12231a] mb-6"
          >
            Discover the <br />
            Land of a <br />
            <span className="text-[#c5a86d]">Thousand Hills</span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-base text-[#0a120b]/60 leading-relaxed max-w-md mb-9">
            Meet mountain gorillas, track the Big Five and unwind by peaceful lakes, on a
            journey crafted just for you by local experts.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-wrap items-center gap-4 mb-12">
            <Link
              href="/booking"
              className="group inline-flex items-center gap-2 bg-[#12231a] hover:bg-[#1F5A42] text-white font-medium text-sm px-7 py-4 rounded-full shadow-lg shadow-[#12231a]/20 transition-all duration-300"
            >
              Book Your Trip
              <span className="w-6 h-6 rounded-full bg-[#c5a86d] text-[#0e1d16] flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight size={14} />
              </span>
            </Link>
            <Link
              href="/destination"
              className="inline-flex items-center gap-2 border border-[#12231a]/20 hover:border-[#12231a] text-[#12231a] font-medium text-sm px-7 py-4 rounded-full transition-all duration-300"
            >
              <Compass size={16} /> Explore Destinations
            </Link>
          </motion.div>

          <motion.ul {...fadeUp(0.4)} className="flex flex-wrap gap-x-6 gap-y-3">
            {highlights.map((h) => (
              <li key={h.label} className="flex items-center gap-2 text-sm text-[#0a120b]/70">
                <span className="w-9 h-9 rounded-full bg-white shadow-sm border border-[#0a120b]/5 flex items-center justify-center text-[#1F5A42]">
                  <h.icon size={16} />
                </span>
                {h.label}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Right: photo collage */}
        <div className="relative">
          <div className="grid grid-cols-5 grid-rows-2 gap-4 h-[460px] sm:h-[540px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="col-span-3 row-span-2 rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <img src={collage.main.src} alt={collage.main.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="col-span-2 rounded-[2rem] overflow-hidden shadow-xl"
            >
              <img src={collage.top.src} alt={collage.top.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="col-span-2 rounded-[2rem] overflow-hidden shadow-xl"
            >
              <img src={collage.bottom.src} alt={collage.bottom.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </motion.div>
          </div>

          {/* Floating badge: location */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
            transition={{ opacity: { delay: 0.7 }, x: { delay: 0.7 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
            className="absolute top-8 -left-4 sm:-left-8 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3"
          >
            <span className="w-10 h-10 rounded-full bg-[#12231a] text-[#c5a86d] flex items-center justify-center">
              <MapPin size={18} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-[#12231a]">Volcanoes NP</span>
              <span className="block text-xs text-[#0a120b]/50">Gorilla trekking</span>
            </span>
          </motion.div>

          {/* Floating badge: promise */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, 6, 0] }}
            transition={{ opacity: { delay: 0.9 }, y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.9 } }}
            className="absolute -bottom-6 left-6 sm:left-1/4 bg-[#12231a] text-white rounded-2xl shadow-2xl px-5 py-4"
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#c5a86d] mb-2">Plan with us</p>
            <p className="flex items-center gap-2 text-sm"><CheckCircle2 size={15} className="text-[#c5a86d]" /> Free tailor-made itinerary</p>
            <p className="flex items-center gap-2 text-sm mt-1"><CheckCircle2 size={15} className="text-[#c5a86d]" /> Local expert guides</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
