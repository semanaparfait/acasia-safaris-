"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  CalendarDays,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { destinationGroups, groupIcon } from "@/lib/helpers";
import { useDestinationsStore } from "@/store/destinationsStore";


const groups = ["All", ...destinationGroups];

export default function DestinationPage() {
  const [slide, setSlide] = useState(0);
  const [activeGroup, setActiveGroup] = useState("All");

  // Destinations come from the API (see store/destinationsStore.ts)
  const destinations = useDestinationsStore((s) => s.destinations);
  const loading = useDestinationsStore((s) => s.loading);
  const error = useDestinationsStore((s) => s.error);
  const load = useDestinationsStore((s) => s.load);

  useEffect(() => {
    load();
  }, [load]);

  const filtered =
    activeGroup === "All" ? destinations : destinations.filter((d) => d.group === activeGroup);

  // Hero slideshow: the destinations marked "Featured" in Admin > Destinations
  // (the first 4 destinations when none are featured)
  const featured = destinations.filter((d) => d.featured);
  const heroSlides = (featured.length > 0 ? featured : destinations).slice(0, 4).map((d) => ({
    name: d.title,
    location: d.location,
    image: d.image,
  }));
  const current = heroSlides[slide % (heroSlides.length || 1)];

  // Auto-advance hero slides
  useEffect(() => {
    if (heroSlides.length < 2) return;
    const t = setTimeout(() => setSlide((s) => (s + 1) % heroSlides.length), 6000);
    return () => clearTimeout(t);
  }, [slide, heroSlides.length]);

  return (
    <div className="bg-white text-[#0a120b] font-sans overflow-hidden selection:bg-[#c5a86d] selection:text-black">
      {/* Hero: rotating destinations */}
      <section className="relative h-[90vh] min-h-[600px] w-full bg-[#0a1811] text-white">
        <AnimatePresence mode="sync">
          {current?.image && (
          <motion.img
            key={current.image}
            src={current.image}
            alt={current.name}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1811] via-transparent to-black/50" />

        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col">
          {/* Title */}
          <div className="flex-1 flex flex-col items-center justify-center text-center pt-20">
            <nav className="flex items-center gap-1.5 text-xs text-zinc-300 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={12} />
              <span className="text-[#c5a86d]">Destinations</span>
            </nav>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-serif uppercase tracking-[0.08em] leading-none"
            >
              Destinations
            </motion.h1>
            <AnimatePresence mode="wait">
              {current && (
              <motion.p
                key={slide}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="mt-6 inline-flex items-center gap-2 text-sm md:text-base text-zinc-200"
              >
                <MapPin size={16} className="text-[#c5a86d]" />
                Now showing: <span className="text-white font-medium">{current.name}</span>
              </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Slide tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 pb-10">
            {heroSlides.map((s, i) => {
              const active = s === current;
              return (
                <button key={s.name} onClick={() => setSlide(i)} className="text-left group">
                  <div className="h-0.5 w-full bg-white/20 mb-3 overflow-hidden">
                    {active && (
                      <motion.div
                        key={slide}
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 6, ease: "linear" }}
                        className="h-full bg-[#c5a86d]"
                      />
                    )}
                  </div>
                  <p className={`text-xs mb-1 transition-colors ${active ? "text-[#c5a86d]" : "text-zinc-500"}`}>
                    0{i + 1}
                  </p>
                  <p className={`font-serif uppercase tracking-wide text-base md:text-lg transition-colors ${active ? "text-white" : "text-zinc-400 group-hover:text-white"}`}>
                    {s.name}
                  </p>
                  <p className="text-[11px] text-zinc-500 hidden sm:block">{s.location}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Destinations grid */}
      <section id="experiences" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-wide">
              Where to <span className="text-[#c5a86d]">go</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {groups.map((g) => {
                const active = activeGroup === g;
                return (
                  <button
                    key={g}
                    onClick={() => setActiveGroup(g)}
                    aria-pressed={active}
                    className={`text-sm px-4 py-2 rounded-full border transition-all duration-300 ${
                      active
                        ? "bg-[#12231a] border-[#12231a] text-[#c5a86d]"
                        : "border-[#0a120b]/10 text-[#0a120b]/60 hover:border-[#c5a86d] hover:text-[#0a120b]"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              Could not load destinations: {error}
            </p>
          )}
          {loading && destinations.length === 0 && (
            <p className="py-12 text-center text-sm text-[#0a120b]/50">Loading destinations…</p>
          )}

          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((d) => (
                <motion.article
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#0a120b]/5 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={d.image}
                      alt={d.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-widest text-[#12231a]">
                      {React.createElement(groupIcon(d.group), { size: 12, className: "text-[#1F5A42]" })}
                      {d.group}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-serif uppercase tracking-wide leading-tight">{d.title}</h3>
                    <p className="flex items-center gap-1.5 text-xs text-[#0a120b]/50 mt-1.5 mb-3">
                      <MapPin size={12} className="text-[#c5a86d] shrink-0" />
                      {d.location}
                    </p>

                    <p className="text-sm text-[#0a120b]/60 leading-relaxed mb-4 line-clamp-2">{d.description}</p>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {d.highlights.map((h) => (
                        <span key={h} className="text-[11px] px-2.5 py-1 rounded-full bg-[#f7f5f0] text-[#0a120b]/70">
                          {h}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
                      <div>
                        <p className="flex items-center gap-1.5 text-[#0a120b]/45 mb-0.5">
                          <CalendarDays size={13} /> Best time
                        </p>
                        <p className="font-medium text-[#0a120b]/80">{d.bestTime}</p>
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 text-[#0a120b]/45 mb-0.5">
                          <Clock size={13} /> From Kigali
                        </p>
                        <p className="font-medium text-[#0a120b]/80">{d.fromKigali}</p>
                      </div>
                    </div>

                    <div className="mt-auto pt-5 border-t border-[#0a120b]/5 flex gap-3">
                      <Link
                        href={`/booking?destination=${d.id}`}
                        className="group/btn flex-1 inline-flex items-center justify-center gap-2 bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-5 py-2.5 rounded-sm transition-all"
                      >
                        Book Now
                        <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                      <Link
                        href="/contact"
                        className="inline-flex items-center justify-center border border-[#0a120b]/15 hover:border-[#0a120b] text-sm px-5 py-2.5 rounded-sm transition-all"
                      >
                        Enquire
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto rounded-2xl bg-[#12231a] text-white px-8 py-10 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-wide">
            Can&apos;t decide? <span className="text-[#c5a86d]">We&apos;ll help.</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tour"
              className="group inline-flex items-center gap-2 bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-7 py-3 rounded-sm transition-all"
            >
              Tour Packages
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="border border-white/40 hover:border-white text-white text-sm px-7 py-3 rounded-sm transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
