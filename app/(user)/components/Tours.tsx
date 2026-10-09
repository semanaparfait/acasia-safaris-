"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Great_Vibes } from 'next/font/google';

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
});

const safariHighlights = [
  {
    title: "The Gorilla Trek",
    location: "Volcanoes NP, Rwanda",
    duration: "4 Days",
    price: "$1,500",
    tag: "Most Popular",
    image: "https://i.pinimg.com/736x/68/01/19/6801199e33bc9eaa9f4777a21ee25a45.jpg"
  },
  {
    title: "Serengeti Migration",
    location: "Serengeti, Tanzania",
    duration: "7 Days",
    price: "$2,800",
    tag: "Seasonal",
    image: "https://i.pinimg.com/736x/48/42/4b/48424b75b7f6fa0114c5664b86296ab8.jpg"
  },
  {
    title: "Murchison Falls",
    location: "Murchison, Uganda",
    duration: "5 Days",
    price: "$1,200",
    tag: "Classic",
    image: "https://i.pinimg.com/1200x/1d/3a/0e/1d3a0e7dbc04ee5e445faed00f48c164.jpg"
  },
];

export default function Tours() {
  return (
    <section className="py-24 bg-white px-4 md:px-8 font-serif">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 border-b border-[#0a120b]/10 pb-12">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-(--primary-dark) text-4xl md:text-5xl tracking-wide mb-2 block ${greatVibes.className}`}
            >
              Plan your trip
            </motion.span>
            <h2 className="text-5xl  text-[#0a120b] ">
              Let us plan you a <br /> perfect Holiday
            </h2>
          </div>
          <button className="group flex items-center gap-3 text-[#0a120b] hover:text-[#0a120b]/60 transition-colors font-sans tracking-[0.2em] text-[10px] font-bold uppercase pb-2">
            Explore All <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-300" />
          </button>
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {safariHighlights.map((safari, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="group cursor-pointer flex flex-col"
            >
              {/* Image Container */}
              <div className="relative aspect-[6/6] w-full overflow-hidden mb-8 bg-gray-100">
                <img
                  src={safari.image}
                  alt={safari.title}
                  className="w-full h-full rounded-lg object-cover transition-transform duration-1000 group-hover:scale-105 grayscale-15 group-hover:grayscale-0"
                />

                {/* Minimalist Badge */}
                <div className="absolute top-5 left-5 z-20">
                  <span className="bg-white/95 backdrop-blur-sm text-[#0a120b] text-[9px] font-sans font-bold uppercase tracking-[0.2em] px-4 py-2">
                    {safari.tag}
                  </span>
                </div>
              </div>

              {/* Content Container */}
              <div className="flex flex-col flex-grow px-2 md:px-0">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-3xl text-[#0a120b] group-hover:text-[#0a120b]/70 transition-colors">
                    {safari.title}
                  </h3>
                  <span className="text-xl text-[#0a120b] italic">{safari.price}</span>
                </div>

                <div className="flex items-center gap-3 text-[#0a120b]/50 font-sans text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
                  <span>{safari.location}</span>
                  <span className="w-1 h-1 rounded-full bg-[#0a120b]/20" />
                  <span>{safari.duration}</span>
                </div>

                <div className="mt-auto">
                  <div className="w-full h-[1px] bg-[#0a120b]/10 group-hover:bg-[#0a120b]/30 transition-colors mb-6" />
                  <div className="flex items-center justify-between text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#0a120b]">
                    <span>Discover Details</span>
                    <ArrowRight size={14} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}