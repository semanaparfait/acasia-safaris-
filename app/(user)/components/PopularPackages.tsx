"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, MapPin, BedDouble } from "lucide-react";
import { packageList } from "../data/packages";

// Packages shown on the home page, in order
const featuredIds = ["7-day-gorilla", "8-day-rwanda", "7-day-zanzibar"];
const featured = featuredIds
  .map((id) => packageList.find((p) => p.id === id))
  .filter((p): p is NonNullable<typeof p> => Boolean(p));

export default function PopularPackages() {
  return (
    <section className="hidden py-24 px-6 bg-white text-[#0a120b] font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-px bg-[#c5a86d]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1F5A42]">Popular Packages</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-wide leading-[1.1] text-[#12231a]">
              Ready-made <span className="text-[#c5a86d]">adventures</span>
            </h2>
          </div>
          <Link
            href="/tour"
            className="group self-start md:self-auto inline-flex items-center gap-2 border border-[#12231a]/20 hover:border-[#12231a] text-[#12231a] text-sm px-6 py-3 rounded-full transition-all"
          >
            View all packages
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((pkg, i) => (
            <motion.article
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group bg-white rounded-2xl overflow-hidden border border-[#0a120b]/5 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col"
            >
              <div className="relative h-60 overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {pkg.badge && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#c5a86d] text-[#0e1d16] text-[10px] font-bold uppercase tracking-widest">
                    {pkg.badge}
                  </span>
                )}
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-[#12231a]">
                  <Calendar size={12} className="text-[#1F5A42]" /> {pkg.days}
                </span>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <p className="flex items-center gap-1.5 text-xs text-[#0a120b]/50 mb-2">
                  <MapPin size={12} className="text-[#c5a86d]" /> {pkg.location}
                </p>
                <h3 className="text-xl font-serif uppercase tracking-wide leading-tight text-[#12231a] mb-3">{pkg.title}</h3>
                <p className="text-sm text-[#0a120b]/60 leading-relaxed line-clamp-2 mb-4">{pkg.description}</p>
                <p className="flex items-center gap-1.5 text-xs text-[#0a120b]/55 mb-6">
                  <BedDouble size={13} className="text-[#1F5A42]" /> {pkg.lodging}
                </p>

                <div className="mt-auto pt-5 border-t border-[#0a120b]/5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#0a120b]/45">From</p>
                    <p className="text-2xl font-serif text-[#12231a]">
                      {pkg.price} <span className="text-xs font-sans text-[#0a120b]/45">/ person</span>
                    </p>
                  </div>
                  <Link
                    href="/booking"
                    className="group/btn inline-flex items-center gap-2 bg-[#12231a] hover:bg-[#c5a86d] hover:text-[#0e1d16] text-white text-sm px-5 py-2.5 rounded-full transition-all"
                  >
                    Book
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
