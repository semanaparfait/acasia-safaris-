"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const reviews = [
  {
    text: "An extraordinary journey. The attention to detail and the deep knowledge of our guide made our gorilla trek in Rwanda an experience we will cherish forever.",
    author: "James Harrington",
    origin: "London, UK",
    rating: 5
  },
  {
    text: "Acasia Safaris redefined luxury for us. From the private savannah dinners to the seamless logistics, every moment felt curated just for our family.",
    author: "Elena Rodriguez",
    origin: "Madrid, Spain",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-[#f9f9fb] text-[#0a120b] px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Editorial Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-emerald-700 font-bold text-[10px] uppercase tracking-[0.4em] block mb-4"
          >
            Guest Perspectives
          </motion.span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight uppercase">
            Stories from the <br />
            <span className="italic font-serif font-light text-emerald-800/70 normal-case">heart of the wild.</span>
          </h2>
        </div>

        {/* Testimonial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {reviews.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between"
            >
              <div className="mb-8 text-emerald-800/20">
                <Quote size={40} fill="currentColor" />
              </div>

              <p className="text-lg md:text-xl font-medium leading-relaxed text-[#0a120b] mb-10 italic font-serif">
                "{review.text}"
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-1">{review.author}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{review.origin}</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={10} className="fill-emerald-700 text-emerald-700" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Logos */}
        <div className="mt-20 flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
          <span className="text-xs font-black uppercase tracking-[0.3em]">TripAdvisor</span>
          <span className="text-xs font-black uppercase tracking-[0.3em]">SafariBookings</span>
          <span className="text-xs font-black uppercase tracking-[0.3em]">National Geographic</span>
        </div>
      </div>
    </section>
  );
}