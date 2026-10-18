"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Camera } from "lucide-react";

const photos = [
  { src: "https://i.pinimg.com/1200x/1d/3a/0e/1d3a0e7dbc04ee5e445faed00f48c164.jpg", alt: "Gorillas in the misty Virunga forest", span: "md:col-span-2 md:row-span-2" },
  { src: "https://i.pinimg.com/736x/29/c6/d9/29c6d9f0c66cbefe2dfd664176627428.jpg", alt: "Golden monkey", span: "" },
  { src: "https://i.pinimg.com/1200x/2b/aa/0f/2baa0f0b1c59deec862d2a8a6b300ae8.jpg", alt: "Elephant in Akagera", span: "" },
  { src: "https://i.pinimg.com/1200x/0f/84/de/0f84dec8e96fc7763eb982ef71295fe8.jpg", alt: "Nyungwe canopy walkway", span: "" },
  { src: "https://i.pinimg.com/1200x/6d/cd/14/6dcd140b80b210ac445a0eddfc40784a.jpg", alt: "Fishermen at sunset on Lake Kivu", span: "" },
];

export default function GalleryStrip() {
  return (
    <section className="py-24 px-6 bg-white font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-px bg-[#c5a86d]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1F5A42]">Gallery</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-wide leading-[1.1] text-[#12231a]">
              Moments from <span className="text-[#c5a86d]">the wild</span>
            </h2>
          </div>
          <Link
            href="/gallery"
            className="group self-start md:self-auto inline-flex items-center gap-2 border border-[#12231a]/20 hover:border-[#12231a] text-[#12231a] text-sm px-6 py-3 rounded-full transition-all"
          >
            <Camera size={16} /> View full gallery
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[170px] md:auto-rows-[220px] gap-4">
          {photos.map((p, i) => (
            <motion.div
              key={p.src}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`group relative overflow-hidden rounded-2xl ${p.span} ${i === 0 ? "col-span-2 row-span-2" : ""}`}
            >
              <Link href="/gallery" aria-label={`${p.alt}, open the gallery`} className="block w-full h-full">
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="absolute bottom-3 left-4 right-4 text-white text-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  {p.alt}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
