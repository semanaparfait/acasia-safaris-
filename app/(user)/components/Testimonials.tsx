"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

// TODO: replace with real guest reviews
const reviews = [
  {
    text: "The attention to detail and the deep knowledge of our guide made our gorilla trek in Rwanda an experience we will cherish forever.",
    author: "James Harrington",
    origin: "London, UK",
    trip: "Gorilla Trekking",
    rating: 5,
  },
  {
    text: "From the private savannah dinners to the seamless logistics, every moment felt curated just for our family.",
    author: "Elena Rodriguez",
    origin: "Madrid, Spain",
    trip: "Family Safari",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-[#F8F6F1] text-[#0a120b] px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-[#c5a86d] font-semibold text-[10px] uppercase tracking-[0.35em] block mb-3">
            Guest Stories
          </span>
          <h2 className="text-2xl md:text-4xl font-serif uppercase tracking-wide text-[#12231a]">
            What our <span className="text-[#c5a86d]">guests say</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((r, i) => (
            <motion.figure
              key={r.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative bg-white rounded-2xl p-6 border border-[#0a120b]/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <Quote size={32} className="absolute top-5 right-5 text-[#c5a86d]/20" fill="currentColor" />

              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: r.rating }).map((_, s) => (
                    <Star key={s} size={14} className="fill-[#c5a86d] text-[#c5a86d]" />
                  ))}
                </div>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#F8F6F1] text-[#1F5A42]">
                  {r.trip}
                </span>
              </div>

              <blockquote className="text-[15px] leading-relaxed text-[#0a120b]/75 mb-5">
                &ldquo;{r.text}&rdquo;
              </blockquote>

              <figcaption className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[#12231a] text-[#c5a86d] flex items-center justify-center font-serif">
                  {r.author.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-[#12231a]">{r.author}</span>
                  <span className="block text-xs text-[#0a120b]/50">{r.origin}</span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
