"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import founders from '@/public/aboutus/founders.png';
import teamLake from '@/public/aboutus/shema.jpeg';
import teamLodge from '@/public/aboutus/yassel.jpeg';

const features = [
  "Expert-Led Private Expeditions",
  "Luxury Wilderness Lodging",
  "Authentic Cultural Encounters",
  "Tailored Conservation Journeys",
];

// TODO: confirm these figures before going live
const stats = [
  { value: "10,000+", label: "Yearly visitors" },
  { value: "94%", label: "Satisfaction rate" },
  { value: "12+", label: "Industry awards" },
];

export default function AboutUs() {
  return (
    <section className="py-24 px-10 bg-[#F8F6F1] text-[#0a120b] overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left: text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-px bg-[#c5a86d]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1F5A42]">About Acasia</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-wide leading-[1.1] text-[#12231a] mb-6">
            A Premier <br />
            <span className="text-[#c5a86d]">Safari Legacy</span>
          </h2>
          <p className="text-[#0a120b]/60 text-base leading-relaxed max-w-md mb-8">
            Acasia Safaris Ltd is dedicated to crafting immersive journeys that connect you to the
            raw, untouched beauty of the African wild.
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-10 max-w-lg">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-[#0a120b]/75">
                <span className="w-6 h-6 rounded-full bg-[#12231a] text-[#c5a86d] flex items-center justify-center shrink-0">
                  <Check size={13} />
                </span>
                {f}
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-3 gap-4 max-w-lg mb-10 py-6 border-y border-[#0a120b]/10">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl md:text-4xl font-serif text-[#1F5A42]">{s.value}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#0a120b]/50 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <Link
            href="/aboutus"
            className="group inline-flex items-center gap-2 bg-[#12231a] hover:bg-[#1F5A42] text-white font-medium text-sm px-8 py-4 rounded-full shadow-lg transition-all"
          >
            Learn More About Us
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Right: image collage */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative h-[480px] sm:h-[580px]"
        >
          {/* Main: the founders */}
          <div className="absolute right-0 top-0 w-[92%] h-[66%] rounded-[2rem] overflow-hidden shadow-2xl">
            <Image
              src={founders}
              alt="The Acasia Safaris founders beside their safari vehicle"
              fill
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover object-[center_25%] hover:scale-105 transition-transform duration-700"
            />
            <span className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-[0.2em] text-[#12231a]">
              Meet our founders
            </span>
          </div>
          <div className="absolute left-0 bottom-0 w-[50%] h-[42%] rounded-[1.5rem] overflow-hidden shadow-xl border-8 border-[#F8F6F1]">
            <Image
              src={teamLake}
              alt="Acasia guide on safari by the lake"
              fill
              sizes="(max-width: 1024px) 45vw, 22vw"
              className="object-cover object-[center_30%]"
            />
          </div>
          <div className="absolute right-6 bottom-4 w-[38%] h-[30%] rounded-[1.5rem] overflow-hidden shadow-xl border-8 border-[#F8F6F1]">
            <Image
              src={teamLodge}
              alt="Acasia guide at a safari lodge"
              fill
              sizes="(max-width: 1024px) 40vw, 18vw"
              className="object-cover object-top"
            />
          </div>


        </motion.div>
      </div>
    </section>
  );
}
