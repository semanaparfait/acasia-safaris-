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
  ArrowLeft,
  Check,
  X,
  Crown,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { daysLabel, type TourPackage } from "../../data/packages";

const guestOptions = ["2 Guests", "1 Guest", "3-4 Guests", "5+ Guests"];
const tripStyles = ["Luxury Safari", "Mid-range Comfort", "Classic Adventure"];

type TourDetailProps = {
  tour: TourPackage;
  onBack?: () => void;
};

export default function TourDetail({ tour, onBack }: TourDetailProps) {
  const isLuxury = tour.category === "Luxury Escapes";
  const dayLabel = daysLabel(tour);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dates: "",
    guests: guestOptions[0],
    style: tripStyles[0],
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-neutral-800">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#11241A] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to packages
        </button>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Featured Image Banner */}
        <div className="lg:col-span-4 relative rounded-2xl overflow-hidden shadow-lg h-[460px] lg:h-[750px] w-full">
          {tour.image && (
            <Image
              src={tour.image}
              alt={tour.title}
              fill
              unoptimized
              className="object-cover object-center"
              priority
            />
          )}
          <div className="absolute top-4 left-4 z-10">
            <span
              className={`bg-[#122B1E]/90 text-[11px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded flex items-center gap-1.5 ${
                isLuxury ? "text-amber-300" : "text-white"
              }`}
            >
              {isLuxury && <Crown className="w-3.5 h-3.5" />}
              {tour.badge || tour.category}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* MIDDLE COLUMN: Itinerary Details */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            {/* Header info */}
            <div className="flex items-start justify-between border-b pb-4 mb-5 border-neutral-200">
              <div>
                <p
                  className={`text-[11px] font-bold tracking-widest uppercase mb-1 flex items-center gap-1 ${
                    isLuxury ? "text-amber-700" : "text-neutral-500"
                  }`}
                >
                  {isLuxury && <Sparkles className="w-3.5 h-3.5 text-amber-600" />}
                  {dayLabel} • {tour.location}
                </p>
                <h1 className="text-2xl lg:text-3xl font-serif font-bold text-neutral-900 leading-tight">
                  {tour.title}
                </h1>
              </div>
            </div>

            <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
              {tour.description}
            </p>

            {/* Daily Timeline */}
            <div className="space-y-4">
              {tour.itinerary.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3.5 group hover:bg-neutral-50 p-1.5 rounded-lg transition"
                >
                  {/* Day Badge */}
                  <div
                    className={`flex-shrink-0 w-9 h-9 rounded-full bg-[#1b3d2f] flex flex-col items-center justify-center text-center ${
                      isLuxury ? "text-amber-300" : "text-white"
                    }`}
                  >
                    <span className="text-[8px] uppercase tracking-wider leading-none">Day</span>
                    <span className="text-xs font-bold leading-none">{i + 1}</span>
                  </div>

                  {/* Day Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-[13px] font-semibold text-neutral-900">
                      <MapPin
                        className={`w-3.5 h-3.5 flex-shrink-0 ${
                          isLuxury ? "text-[#b28236]" : "text-neutral-400"
                        }`}
                      />
                      <span className="truncate">{item.title}</span>
                    </div>
                    <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>

                  {/* Thumbnail */}
                  {item.image && (
                    <div className="relative w-14 h-11 rounded-md overflow-hidden flex-shrink-0 border border-neutral-200">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}
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

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center text-xs text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                Inquiry received! We will reply within 24h.
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
                        {guestOptions.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
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
                    <select
                      value={formData.style}
                      onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                      className="w-full text-xs bg-white border border-neutral-300 rounded-lg pl-8 pr-2 py-2 outline-none focus:border-[#1b3d2f] appearance-none"
                    >
                      {tripStyles.map((style) => (
                        <option key={style}>{style}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-[#C29342] hover:bg-[#b08336] text-white font-semibold text-xs tracking-wider uppercase py-2.5 rounded-lg flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
                >
                  Request an Itinerary
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Perks Card (optional) */}
          {tour.perks && tour.perks.length > 0 && (
            <div className="bg-[#FAF8F5] border border-neutral-200/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#11241A]">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>Bespoke Perks Included</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-neutral-600">
                {tour.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-1.5">✓ {perk}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tour Route: any number of stops */}
          {tour.route.length > 0 && (
            <div className="bg-[#FAF8F5] border border-neutral-200/80 rounded-2xl p-4">
              <h3 className="text-[11px] font-bold tracking-wider uppercase text-neutral-700 mb-2">
                Tour Route
              </h3>
              <ol className="w-full rounded-lg bg-[#e2ede2] border border-neutral-200 p-3 text-[11px] font-semibold text-neutral-600">
                {tour.route.map((stop, i) => (
                  <li key={`${stop}-${i}`} className="relative flex items-center gap-2 pb-2 last:pb-0">
                    {i < tour.route.length - 1 && (
                      <span className="absolute left-[3px] top-3 bottom-0 border-l border-dashed border-neutral-400" />
                    )}
                    <span className="relative w-[7px] h-[7px] rounded-full bg-[#1b3d2f] flex-shrink-0" />
                    <span>{stop}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Inclusions / Exclusions */}
          <div className="bg-[#122B1E] text-neutral-200 rounded-2xl p-4 text-[11px] space-y-3">
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-amber-400 mb-2">
                <Check className="w-3.5 h-3.5" />
                <span>Inclusions</span>
              </div>
              <ul className="space-y-1.5 pl-1 text-neutral-300">
                {tour.inclusions.map((item) => (
                  <li key={item} className="flex items-center gap-1.5">✓ {item}</li>
                ))}
              </ul>
            </div>

            <div className="border-t border-neutral-700/60 pt-3">
              <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-amber-400 mb-2">
                <X className="w-3.5 h-3.5" />
                <span>Exclusions</span>
              </div>
              <ul className="space-y-1.5 pl-1 text-neutral-300">
                {tour.exclusions.map((item) => (
                  <li key={item} className="flex items-center gap-1.5">✕ {item}</li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
