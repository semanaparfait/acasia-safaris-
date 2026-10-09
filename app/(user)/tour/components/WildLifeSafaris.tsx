"use client";
import Image from "next/image";
import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  Users,
  Mountain,
  Mail,
  ArrowRight,
  Check,
  X,
  Compass,
  Binoculars,
  CheckCircle2,
} from "lucide-react";

const itinerary = [
  {
    day: 1,
    title: "Arrival & Fly to Serengeti National Park",
    desc: "Board a scenic bush flight directly to Serengeti. Settle into your luxury tented camp with savannah views.",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=200&auto=format&fit=crop&q=80",
  },
  {
    day: 2,
    title: "Full-Day Great Migration & Big Cat Game Drive",
    desc: "Sunrise game drive tracking lion prides, cheetahs, leopards, and large herds of wildebeest across central Serengeti.",
    image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=200&auto=format&fit=crop&q=80",
  },
  {
    day: 3,
    title: "Mara River Crossing & Sunrise Hot Air Balloon Safari",
    desc: "Float over the plains at dawn in a hot air balloon, followed by a champagne bush breakfast and river crossing watch.",
    image: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=200&auto=format&fit=crop&q=80",
  },
  {
    day: 4,
    title: "Journey to Ngorongoro Conservation Area",
    desc: "Game drive through Olduvai Gorge en route to the rim of Ngorongoro Crater. Stay at a crater-rim lodge.",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200&auto=format&fit=crop&q=80",
  },
  {
    day: 5,
    title: "Ngorongoro Crater Floor Big Five Expedition",
    desc: "Descend 600m into the crater floor for an intensive game drive. Spot endangered black rhinos and flamingo lakes.",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=200&auto=format&fit=crop&q=80",
  },
  {
    day: 6,
    title: "Tarangire National Park Elephant Kingdom",
    desc: "Traverse Tarangire National Park, world-famous for massive baobab trees and herds of over 300 elephants.",
    image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=200&auto=format&fit=crop&q=80",
  },
  {
    day: 7,
    title: "Farewell Bush Breakfast & Return Transfer",
    desc: "Final morning game drive, gourmet bush breakfast under an acacia tree, and return transfer for departure.",
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=200&auto=format&fit=crop&q=80",
  },
];

export default function WildlifeSafaris() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dates: "",
    guests: "2 Guests",
    style: "Classic Big Five Safari",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-neutral-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Featured Image Banner */}
        <div className="lg:col-span-4 relative rounded-2xl overflow-hidden shadow-lg h-[460px] lg:h-[750px] w-full">
          <Image
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&auto=format&fit=crop&q=85"
            alt="Elephant in Serengeti Savanna"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-[#122B1E]/90 text-white text-[11px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded flex items-center gap-1.5">
              <Binoculars className="w-3.5 h-3.5 text-amber-400" />
              7-Day Classic Safari
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* MIDDLE COLUMN: 7-Day Itinerary Details */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            {/* Header info */}
            <div className="flex items-start justify-between border-b pb-4 mb-5 border-neutral-200">
              <div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-neutral-500 mb-1 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-emerald-700" />
                  7 Days • Serengeti & Ngorongoro
                </p>
                <h1 className="text-2xl lg:text-3xl font-serif font-bold text-neutral-900 leading-tight">
                  7-Day Classic Wildlife & Big Five Safari
                </h1>
              </div>
              <div className="text-right pl-4">
                <span className="text-xs text-neutral-500 block">From</span>
                <span className="text-2xl font-bold text-[#143d2b]">$4,850</span>
                <span className="text-[11px] text-neutral-500 block">per person</span>
              </div>
            </div>

            <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
              Witness the legendary Big Five, the Great Migration, and dramatic lion hunts across the endless savannah plains of Serengeti, Ngorongoro Crater, and Tarangire.
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
                Inquire About Wildlife Safari
              </h2>
            </div>
            <p className="text-[11px] text-neutral-500 mb-4">
              Get a personalized quote and detailed itinerary.
            </p>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center text-xs text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                Inquiry received! Our safari team will reply within 24h.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 outline-none focus:border-[#1b3d2f]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 outline-none focus:border-[#1b3d2f]"
                  />
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
                        value={formData.dates}
                        onChange={(e) => setFormData({ ...formData, dates: e.target.value })}
                        className="w-full text-xs bg-white border border-neutral-300 rounded-lg pl-8 pr-2 py-2 outline-none focus:border-[#1b3d2f]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Guests *
                    </label>
                    <div className="relative">
                      <Users className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                      <select
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                        className="w-full text-xs bg-white border border-neutral-300 rounded-lg pl-8 pr-2 py-2 outline-none focus:border-[#1b3d2f] appearance-none"
                      >
                        <option>2 Guests</option>
                        <option>1 Guest</option>
                        <option>3-4 Guests</option>
                        <option>5+ Guests (Group)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Safari Focus *
                  </label>
                  <div className="relative">
                    <Mountain className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                    <select
                      value={formData.style}
                      onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                      className="w-full text-xs bg-white border border-neutral-300 rounded-lg pl-8 pr-2 py-2 outline-none focus:border-[#1b3d2f] appearance-none"
                    >
                      <option>Classic Big Five Safari</option>
                      <option>Great Migration & Balloon</option>
                      <option>Serengeti & Crater Combo</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-[#C29342] hover:bg-[#b08336] text-white font-semibold text-xs tracking-wider uppercase py-2.5 rounded-lg flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
                >
                  Request Safari Itinerary
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Tour Route Graphic */}
          <div className="bg-[#FAF8F5] border border-neutral-200/80 rounded-2xl p-4">
            <h3 className="text-[11px] font-bold tracking-wider uppercase text-neutral-700 mb-2">
              Safari Route
            </h3>
            <div className="w-full h-32 rounded-lg bg-[#e2ede2] relative overflow-hidden border border-neutral-200 flex flex-col justify-between p-3 text-[11px]">
              <div className="flex justify-between items-start text-neutral-600 font-semibold">
                <span>Serengeti NP</span>
                <span className="text-[10px] text-neutral-400">Ngorongoro Rim •</span>
              </div>
              <div className="flex justify-between items-end text-neutral-600 font-semibold">
                <span>Tarangire •</span>
                <span>• Arusha / Departure</span>
              </div>
            </div>
          </div>

          {/* Inclusions / Exclusions */}
          <div className="bg-[#122B1E] text-neutral-200 rounded-2xl p-4 text-[11px] space-y-3">
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-amber-400 mb-2">
                <Check className="w-3.5 h-3.5" />
                <span>Safari Inclusions</span>
              </div>
              <ul className="space-y-1.5 pl-1 text-neutral-300">
                <li className="flex items-center gap-1.5">✓ Private 4x4 Land Cruiser with pop-up roof</li>
                <li className="flex items-center gap-1.5">✓ All national park & crater entry fees</li>
                <li className="flex items-center gap-1.5">✓ Full-board luxury tented camp stay</li>
                <li className="flex items-center gap-1.5">✓ Expert certified naturalist guide</li>
              </ul>
            </div>

            <div className="border-t border-neutral-700/60 pt-3">
              <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-amber-400 mb-2">
                <X className="w-3.5 h-3.5" />
                <span>Exclusions</span>
              </div>
              <ul className="space-y-1.5 pl-1 text-neutral-300">
                <li className="flex items-center gap-1.5">✕ International flights</li>
                <li className="flex items-center gap-1.5">✕ Visa fees</li>
                <li className="flex items-center gap-1.5">✕ Optional balloon safari ($550)</li>
                <li className="flex items-center gap-1.5">✕ Driver guide tips</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}