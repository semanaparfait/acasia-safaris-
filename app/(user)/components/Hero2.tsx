"use client";
import React, { useState } from "react";
import { ChevronDown, MapPin, Calendar, Compass } from "lucide-react";

export default function Hero2() {
  const [destination, setDestination] = useState("");
  const [when, setWhen] = useState("");
  const [travelStyle, setTravelStyle] = useState("");

  return (
    <div className="relative px-6 min-h-screen w-full bg-[#0a1811] text-white flex flex-col justify-between selection:bg-[#c5a86d] selection:text-black font-sans">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2000&q=80"
          alt="African Safari Landscape with 4x4 Vehicle"
          className="w-full h-full object-cover object-center filter brightness-[0.82]"
        />
        {/* Soft vignette & gradient darkening for readibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1d16] via-transparent to-black/60" />
      </div>



      {/* Hero Content Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-10 pb-28 md:py-20 flex-grow flex flex-col justify-center">
        <div className="max-w-2xl">
          {/* Subtitle Pill  inline-flex*/}
          <div className="hidden  items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-zinc-200 tracking-wider mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
            East Africa's Premiere Luxury Safari Specialist
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.1rem] font-serif font-normal uppercase tracking-wide leading-[1.08] text-white mb-6">
            CRAFT YOUR <br />
            EXTRA ORDINARY <br />
            AFRICAN JOURNEY
          </h1>

          {/* Body Paragraph */}
          <p className="text-sm md:text-base text-zinc-300 font-light leading-relaxed mb-8 max-w-xl">
            Unrivaled custom-made safaris across Rwanda, Uganda, Kenya, and
            Tanzania. Immersive wildlife encounters, ultra-luxury lodges, and
            private aviation, curated just for you.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button className="bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-7 py-3 rounded-sm shadow-md transition-all duration-300 hover:shadow-lg">
              Start Planning
            </button>
            <button className="border border-white/40 hover:border-white bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white font-normal text-sm px-7 py-3 rounded-sm transition-all duration-300">
              Explore Itineraries
            </button>
          </div>
        </div>
      </main>

      {/* Floating Safari Search Card */}
      <section className="relative z-20 w-full max-w-5xl mx-auto px-6 -mb-10 sm:-mb-12">
        <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-4 sm:p-5 shadow-2xl">
          {/* Title tag above bar */}
          <div className="text-center text-[12px] uppercase tracking-widest text-zinc-300 font-medium mb-3">
            Quick Safari Search
          </div>

          {/* Search Inputs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
            {/* Destination Select */}
            <div className="relative">
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full appearance-none bg-white/10 hover:bg-white/15 border border-white/25 rounded-md px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-[#c5a86d] cursor-pointer transition-all"
              >
                <option value="" className="bg-[#18231c] text-white">
                  Where to go?
                </option>
                <option value="rwanda" className="bg-[#18231c] text-white">
                  Rwanda
                </option>
                <option value="uganda" className="bg-[#18231c] text-white">
                  Uganda
                </option>
                <option value="kenya" className="bg-[#18231c] text-white">
                  Kenya
                </option>
                <option value="tanzania" className="bg-[#18231c] text-white">
                  Tanzania
                </option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>

            {/* When / Duration Select */}
            <div className="relative">
              <select
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className="w-full appearance-none bg-white/10 hover:bg-white/15 border border-white/25 rounded-md px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-[#c5a86d] cursor-pointer transition-all"
              >
                <option value="" className="bg-[#18231c] text-white">
                  When?
                </option>
                <option value="jun-oct" className="bg-[#18231c] text-white">
                  Jun - Oct (Dry Season)
                </option>
                <option value="nov-dec" className="bg-[#18231c] text-white">
                  Nov - Dec (Short Rains)
                </option>
                <option value="jan-feb" className="bg-[#18231c] text-white">
                  Jan - Feb (Calving Season)
                </option>
                <option value="flexible" className="bg-[#18231c] text-white">
                  I'm Flexible
                </option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>

            {/* Travel Style Select */}
            <div className="relative">
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full appearance-none bg-white/10 hover:bg-white/15 border border-white/25 rounded-md px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-[#c5a86d] cursor-pointer transition-all"
              >
                <option value="" className="bg-[#18231c] text-white">
                  Travel Style
                </option>
                <option value="gorilla" className="bg-[#18231c] text-white">
                  Primate & Gorilla Trekking
                </option>
                <option value="luxury-safari" className="bg-[#18231c] text-white">
                  Ultra-Luxury Savannah Safari
                </option>
                <option value="fly-in" className="bg-[#18231c] text-white">
                  Private Aviation & Fly-in
                </option>
                <option value="family" className="bg-[#18231c] text-white">
                  Family & Honeymoon
                </option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>

            {/* Submit Button */}
            <button
              type="button"
              className="w-full bg-white hover:bg-zinc-200 text-[#0e1d16] font-medium text-xs py-2.5 px-4 rounded-md tracking-wider transition-colors duration-200 shadow-md"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Spacer to give room for overlapping card */}
      <div className="h-14 sm:h-16 bg-transparent" />
    </div>
  );
}