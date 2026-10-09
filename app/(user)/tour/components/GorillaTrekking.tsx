"use client";
import Image from "next/image";
import React from "react";
import {
  MapPin,
  Calendar,
  Users,
  Mountain,
  Mail,
  ArrowRight,
  Check,
  X,
  Plane,
} from "lucide-react";

const itinerary = [
  {
    day: 1,
    title: "Kigali Arrival & Luxury Stay",
    desc: "Arrive in Kigali, meet your guide and enjoy a luxury lodge stay with city views.",
    image: "https://images.unsplash.com/photo-1578895210405-907db486c111?w=200&auto=format&fit=crop&q=80",
  },
  {
    day: 2,
    title: "Kigali → Volcanoes NP",
    desc: "Travel to Volcanoes National Park and settle in for your gorilla trek briefing.",
    image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=200&auto=format&fit=crop&q=80",
  },
  {
    day: 3,
    title: "Gorilla Trekking Experience",
    desc: "Track mountain gorillas in the misty forests with expert guides.",
    image: "https://images.unsplash.com/photo-1576487248805-acf45f536b43?w=200&auto=format&fit=crop&q=80",
  },
  {
    day: 4,
    title: "Golden Monkey & Cultural Tour",
    desc: "Visit golden monkeys and experience local culture in the community.",
    image: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=200&auto=format&fit=crop&q=80",
  },
  {
    day: 5,
    title: "Fly to Akagera National Park",
    desc: "Fly to Akagera and enjoy an afternoon game drive in Rwanda's wildlife haven.",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=200&auto=format&fit=crop&q=80",
  },
  {
    day: 6,
    title: "Big Five Safari & Lake Boat Cruise",
    desc: "Spot the Big Five and enjoy a scenic boat cruise on Lake Ihema.",
    image: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=200&auto=format&fit=crop&q=80",
  },
  {
    day: 7,
    title: "Return to Kigali & Departure",
    desc: "Drive back to Kigali for your international flight.",
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=200&auto=format&fit=crop&q=80",
  },
];

export default function GorillaTrekking() {
  return (
    <div className="w-full max-w-7xl mx-auto px-8 py-8 font-sans text-neutral-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: Featured Image Banner */}
        <div className="lg:col-span-4 relative rounded-2xl overflow-hidden shadow-lg h-[460px] lg:h-[750px] w-full">
          <Image
            src="https://i.pinimg.com/1200x/e9/c3/52/e9c352c52a8ce750ec2aa30acecabb3c.jpg"
            alt="Gorilla in Volcanoes National Park"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-[#122B1E]/90 text-white text-[11px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded">
              Featured Package
            </span>
          </div>
          {/* Subtle bottom gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* MIDDLE COLUMN: Itinerary Details */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            {/* Header info */}
            <div className="flex items-start justify-between border-b pb-4 mb-5 border-neutral-200">
              <div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-neutral-500 mb-1">
                  7 Days • Rwanda & Uganda
                </p>
                <h1 className="text-2xl lg:text-3xl font-serif font-bold text-neutral-900 leading-tight">
                  Rwanda & Uganda Gorilla Safari
                </h1>
              </div>
              <div className="text-right pl-4">
                <span className="text-xs text-neutral-500 block">From</span>
                <span className="text-2xl font-bold text-[#143d2b]">$5,250</span>
                <span className="text-[11px] text-neutral-500 block">per person</span>
              </div>
            </div>

            <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
              Meet mountain gorillas, explore vibrant national parks, experience local
              culture and enjoy unforgettable wildlife encounters on this 7-day
              cross-border adventure.
            </p>

            {/* Daily Timeline */}
            <div className="space-y-4">
              {itinerary.map((item) => (
                <div
                  key={item.day}
                  className="flex items-center gap-3.5 group hover:bg-neutral-50 p-1.5 rounded-lg transition"
                >
                  {/* Day Badge */}
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#1b3d2f] text-white flex flex-col items-center justify-center text-center">
                    <span className="text-[8px] uppercase tracking-wider leading-none">Day</span>
                    <span className="text-xs font-bold leading-none">{item.day}</span>
                  </div>

                  {/* Day Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-[13px] font-semibold text-neutral-900">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </div>
                    <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                      {item.desc}
                    </p>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-14 h-11 rounded-md overflow-hidden flex-shrink-0 border border-neutral-200">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Inquiry Form & Route/Inclusions */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* Inquiry Form Card */}
          <div className="bg-[#FAF8F5] border border-neutral-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4 text-[#b28236]" />
              <h2 className="text-xs font-bold tracking-wider uppercase text-neutral-800">
                Inquire About This Itinerary
              </h2>
            </div>
            <p className="text-[11px] text-neutral-500 mb-4">
              Get a personalized quote and detailed itinerary.
            </p>

            <form className="space-y-3" >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 outline-none focus:border-[#1b3d2f]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 outline-none focus:border-[#1b3d2f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Travel Dates *
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Select dates"
                      className="w-full text-xs bg-white border border-neutral-300 rounded-lg pl-8 pr-2 py-2 outline-none focus:border-[#1b3d2f]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Number of Guests *
                  </label>
                  <div className="relative">
                    <Users className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                    <select className="w-full text-xs bg-white border border-neutral-300 rounded-lg pl-8 pr-2 py-2 outline-none focus:border-[#1b3d2f] appearance-none">
                      <option>2 Guests</option>
                      <option>1 Guest</option>
                      <option>3-4 Guests</option>
                      <option>5+ Guests</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Preferred Trip Style *
                </label>
                <div className="relative">
                  <Mountain className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                  <select className="w-full text-xs bg-white border border-neutral-300 rounded-lg pl-8 pr-2 py-2 outline-none focus:border-[#1b3d2f] appearance-none">
                    <option>Luxury Safari</option>
                    <option>Mid-range Comfort</option>
                    <option>Classic Adventure</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-[#C29342] hover:bg-[#b08336] text-white font-semibold text-xs tracking-wider uppercase py-2.5 rounded-lg flex items-center justify-center gap-2 transition shadow-sm"
              >
                Request an Itinerary
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Tour Route Graphic Placeholder */}
          <div className="bg-[#FAF8F5] border border-neutral-200/80 rounded-2xl p-4">
            <h3 className="text-[11px] font-bold tracking-wider uppercase text-neutral-700 mb-2">
              Tour Route
            </h3>
            <div className="w-full h-32 rounded-lg bg-[#e2ede2] relative overflow-hidden border border-neutral-200 flex flex-col justify-between p-3 text-[11px]">
              <div className="flex justify-between items-start text-neutral-600 font-semibold">
                <span>Uganda</span>
                <span className="text-[10px] text-neutral-400">Kampala •</span>
              </div>
              <div className="flex justify-between items-end text-neutral-600 font-semibold">
                <span>Volcanoes NP •</span>
                <span>• Kigali (Rwanda)</span>
              </div>
            </div>
          </div>

          {/* Inclusions / Exclusions */}
          <div className="bg-[#122B1E] text-neutral-200 rounded-2xl p-4 text-[11px] space-y-3">
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-amber-400 mb-2">
                <Check className="w-3.5 h-3.5" />
                <span>Inclusions</span>
              </div>
              <ul className="space-y-1.5 pl-1 text-neutral-300">
                <li className="flex items-center gap-1.5">✓ Private helicopter transfers</li>
                <li className="flex items-center gap-1.5">✓ 3-5 star lodges & camps</li>
                <li className="flex items-center gap-1.5">✓ All meals</li>
                <li className="flex items-center gap-1.5">✓ Expert safari guides</li>
              </ul>
            </div>

            <div className="border-t border-neutral-700/60 pt-3">
              <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-amber-400 mb-2">
                <X className="w-3.5 h-3.5" />
                <span>Exclusions</span>
              </div>
              <ul className="space-y-1.5 pl-1 text-neutral-300">
                <li className="flex items-center gap-1.5">✕ International flights</li>
                <li className="flex items-center gap-1.5">✕ Visas</li>
                <li className="flex items-center gap-1.5">✕ Personal travel insurance</li>
                <li className="flex items-center gap-1.5">✕ Tips & gratuities</li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}