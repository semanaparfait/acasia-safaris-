"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';

const galleryPages = [
  {
    page: 1,
    photos: [
      { id: 1, src: "https://i.pinimg.com/736x/68/01/19/6801199e33bc9eaa9f4777a21ee25a45.jpg", price: "$16", author: "Acasia Studio", size: "tall" },
      { id: 2, src: "https://i.pinimg.com/736x/48/42/4b/48424b75b7f6fa0114c5664b86296ab8.jpg", price: "$49", author: "Nature Shot", size: "wide" },
      { id: 3, src: "https://i.pinimg.com/1200x/1d/3a/0e/1d3a0e7dbc04ee5e445faed00f48c164.jpg", price: "$18", author: "Wild Focus", size: "square" },
      { id: 4, src: "https://i.pinimg.com/1200x/f2/b1/21/f2b12108d34848c7fbae51a37b58806a.jpg", price: "$45", author: "Safari View", size: "small-square" },
      { id: 5, src: "https://i.pinimg.com/1200x/04/33/ff/0433ffefe920234d1c0fc261065468e4.jpg", price: "$32", author: "Luxury Detail", size: "small-square" },
      { id: 6, src: "https://i.pinimg.com/1200x/15/d9/bd/15d9bdd92790068e0cec9a1d7b179196.jpg", price: "$22", author: "Golden Hour", size: "mid-tall" },
    ]
  }
];

export default function PerfectGridGallery() {
  const [page, setPage] = useState(0);

  // Stagger variants for the "Perfect Grid" entrance
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="py-24 bg-white min-h-screen flex items-center justify-center font-serif">
      <div className="bg-white p-12   w-full relative ">

        {/* Gallery Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-4xl text-[#0a120b] font-medium tracking-tight">Photographs</h2>
            <p className="text-gray-400 italic text-lg mt-1">on sale</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
            <span>Market</span>
            <ShoppingCart size={14} />
          </div>
        </div>

        {/* The Animated Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-4 grid-rows-3 gap-4 h-[600px]"
        >
          {/* 1. Vertical Hero (Left) */}
          <motion.div variants={item} className="col-span-1 row-span-2 relative group overflow-hidden">
            <img src={galleryPages[0].photos[0].src} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" alt="" />
            <div className="absolute bottom-4 left-4 text-white z-10">
              <p className="text-xl font-medium">{galleryPages[0].photos[0].price}</p>
              <p className="text-[10px] uppercase font-bold text-white/60 italic">{galleryPages[0].photos[0].author}</p>
            </div>
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>

          {/* 2. Horizontal Featured (Top Right) */}
          <motion.div variants={item} className="col-span-3 row-span-1 relative group overflow-hidden">
            <img src={galleryPages[0].photos[1].src} className="w-full h-full object-cover" alt="" />
            <div className="absolute bottom-4 left-4 text-white z-10">
              <p className="text-xl font-medium">{galleryPages[0].photos[1].price}</p>
              <p className="text-[10px] uppercase font-bold text-white/60 italic">{galleryPages[0].photos[1].author}</p>
            </div>
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>

          {/* 3. Center Detail */}
          <motion.div variants={item} className="col-span-2 row-span-1 relative group overflow-hidden">
            <img src={galleryPages[0].photos[2].src} className="w-full h-full object-cover" alt="" />
            <div className="absolute bottom-4 left-4 text-white z-10">
              <p className="text-xl font-medium">{galleryPages[0].photos[2].price}</p>
              <p className="text-[10px] uppercase font-bold text-white/60 italic">{galleryPages[0].photos[2].author}</p>
            </div>
            <div className="absolute inset-0 bg-black/10" />
          </motion.div>

          {/* 4. Bottom Detail (Small Left) */}
          <motion.div variants={item} className="col-span-1 row-span-1 relative group overflow-hidden">
            <img src={galleryPages[0].photos[3].src} className="w-full h-full object-cover" alt="" />
            <div className="absolute bottom-4 left-4 text-white z-10">
              <p className="text-xl font-medium">{galleryPages[0].photos[3].price}</p>
              <p className="text-[10px] uppercase font-bold text-white/60 italic">{galleryPages[0].photos[3].author}</p>
            </div>
            <div className="absolute inset-0 bg-black/10" />
          </motion.div>

          {/* 5. Bottom Detail (Small Center) */}
          <motion.div variants={item} className="col-span-1 row-span-1 relative group overflow-hidden">
            <img src={galleryPages[0].photos[4].src} className="w-full h-full object-cover" alt="" />
            <div className="absolute bottom-4 left-4 text-white z-10">
              <p className="text-xl font-medium">{galleryPages[0].photos[4].price}</p>
              <p className="text-[10px] uppercase font-bold text-white/60 italic">{galleryPages[0].photos[4].author}</p>
            </div>
            <div className="absolute inset-0 bg-black/10" />
          </motion.div>

          {/* 6. Vertical Secondary (Right) */}
          <motion.div variants={item} className="col-span-2 row-span-2 relative group overflow-hidden">
            <img src={galleryPages[0].photos[5].src} className="w-full h-full object-cover" alt="" />
            <div className="absolute bottom-4 left-4 text-white z-10">
              <p className="text-xl font-medium">{galleryPages[0].photos[5].price}</p>
              <p className="text-[10px] uppercase font-bold text-white/60 italic">{galleryPages[0].photos[5].author}</p>
            </div>
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>
        </motion.div>

        {/* Gallery Controls */}
        <div className="mt-12 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-light">1 <span className="text-gray-200 text-xl italic">/ 3</span></span>
            <div className="flex gap-2">
              <button className="text-emerald-800 p-2 hover:bg-emerald-50 rounded-full transition-all"><ChevronLeft size={20} /></button>
              <button className="text-emerald-800 p-2 hover:bg-emerald-50 rounded-full transition-all"><ChevronRight size={20} /></button>
            </div>
          </div>
          <div className="text-4xl text-gray-100 font-serif italic">"</div>
        </div>
      </div>
    </section>
  );
}