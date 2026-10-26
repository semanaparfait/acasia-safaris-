"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Compass, Leaf, Sparkles, ArrowRight } from "lucide-react";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Secure & Certified",
    desc: "Fully licensed by the RDB with traveler insurance for total peace of mind.",
  },
  {
    icon: Compass,
    title: "Expert Local Guides",
    desc: "Professionals who know every trail, park and story across Rwanda.",
  },
  {
    icon: Sparkles,
    title: "Tailor-Made Trips",
    desc: "Every journey built around your dates, travel style and budget.",
  },
  {
    icon: Leaf,
    title: "Eco-Conscious Travel",
    desc: "Every booking supports conservation and empowers local communities.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-white text-[#0a120b] px-10 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: images */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative h-[460px] sm:h-[560px]"
        >
          <div className="absolute left-0 top-0 w-[78%] h-[88%] rounded-[2rem] overflow-hidden shadow-2xl">
            <img
              src="https://i.pinimg.com/1200x/48/42/4b/48424b75b7f6fa0114c5664b86296ab8.jpg"
              className="w-full h-full object-cover object-bottom hover:scale-105 transition-transform duration-700"
              alt="Travelers on a guided walk across green rolling hills"
            />
          </div>
          <div className="absolute right-0 bottom-0 w-[45%] h-[45%] rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white">
            <img
              src="https://i.pinimg.com/1200x/1d/3a/0e/1d3a0e7dbc04ee5e445faed00f48c164.jpg"
              className="w-full h-full object-cover"
              alt="Mountain gorillas in the misty Virunga forest"
            />
          </div>

          {/* Floating badge */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-5 bottom-10 sm:bottom-16 bg-[#12231a] text-white rounded-2xl px-5 py-4 shadow-xl flex items-center gap-4"
          >
            <span className="w-11 h-11 rounded-full bg-[#c5a86d] text-[#0e1d16] flex items-center justify-center">
              <ShieldCheck size={20} />
            </span>
            <span>
              <span className="block text-[10px] uppercase tracking-[0.25em] text-[#c5a86d]">
                Licensed by RDB
              </span>
              <span className="block text-sm font-semibold">
                Trusted local operator
              </span>
            </span>
          </motion.div>
        </motion.div>

        {/* Right: text & pillars */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-px bg-[#c5a86d]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1F5A42]">
                The acacia Standard
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-wide leading-[1.1] text-[#12231a] mb-6">
              Why our guests <br />
              <span className="text-[#c5a86d]">choose acacia</span>
            </h2>
            <p className="text-[#0a120b]/60 text-base leading-relaxed max-w-md mb-10">
              We believe in safaris that are as refined as they are raw. Our
              commitment to quality ensures your journey is safe, authentic, and
              perfectly tailored.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {pillars.map((p, idx) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group rounded-2xl bg-[#F8F6F1] p-6 border border-transparent hover:border-[#c5a86d]/40 hover:bg-white hover:shadow-xl transition-all duration-500"
              >
                <span className="w-12 h-12 rounded-xl bg-[#12231a] text-[#c5a86d] flex items-center justify-center mb-5 group-hover:bg-[#c5a86d] group-hover:text-[#0e1d16] transition-colors duration-300">
                  <p.icon size={22} />
                </span>
                <h3 className="font-serif text-lg uppercase tracking-wide text-[#12231a] mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-[#0a120b]/55 leading-relaxed">
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <Link
            href="/booking"
            className="group inline-flex items-center gap-2 bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-8 py-4 rounded-full shadow-lg transition-all"
          >
            Plan Your Trip
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
