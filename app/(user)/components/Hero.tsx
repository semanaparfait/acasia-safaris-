"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Bookmark, Play, Facebook, Youtube, Twitter, Instagram, ArrowRight } from 'lucide-react';

const destinations = [
  {
    id: 1,
    name: "SERENGETI",
    location: "Tanzania",
    description: "Witness the Great Migration across vast golden plains. An unrivaled stage where nature's raw drama unfolds daily under the endless African sky.",
    image: "https://i.pinimg.com/736x/48/42/4b/48424b75b7f6fa0114c5664b86296ab8.jpg",
  },
  {
    id: 2,
    name: "VOLCANOES ",
    location: "Rwanda",
    description: "An intimate encounter with the majestic Mountain Gorillas. Journey through ancient rainforests shrouded in mist for a life-changing wildlife experience.",
    image: "https://i.pinimg.com/736x/68/01/19/6801199e33bc9eaa9f4777a21ee25a45.jpg",
  },
  {
    id: 3,
    name: "MURCHISON",
    location: "Uganda",
    description: "Feel the power of the Nile as it forces its way through a narrow gorge. A sanctuary for diverse wildlife and breathtaking river expeditions.",
    image: "https://i.pinimg.com/1200x/1d/3a/0e/1d3a0e7dbc04ee5e445faed00f48c164.jpg",
  },
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % destinations.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen w-full bg-[#0a120b] overflow-hidden text-white font-sans">


      <AnimatePresence mode="wait">
        <motion.div
          key={destinations[index].id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a120b] via-transparent to-[#0a120b]/100 z-10" />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-[#0a120b]/60 z-10 pointer-events-none" />
          <img
            src={destinations[index].image}
            className="w-full h-full object-cover"
            alt="Safari Destination"
          />
        </motion.div>
      </AnimatePresence>


      <div className="absolute left-10 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-4 relative">

          <div className="absolute w-px h-full bg-white/20 left-1/2 -translate-x-1/2" />

          {destinations.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="relative w-8 h-8 flex items-center justify-center group"
            >

              {i === index ? (
                <motion.div
                  layoutId="indicator"
                  className="absolute w-8 h-8 bg-white/20 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center text-[10px] font-bold"
                >
                  {i + 1}
                </motion.div>
              ) : (
                <div className="w-2 h-2 bg-white/40 rounded-full transition-all group-hover:scale-150 group-hover:bg-white" />
              )}
            </button>
          ))}
        </div>
        <div className='flex flex-col gap-2'>
          <Facebook size={20} className="text-white/80 hover:text-emerald-400 transition-colors" />
          <Instagram size={20} className="text-white/80 hover:text-emerald-400 transition-colors" />
          <Twitter size={20} className="text-white/80 hover:text-emerald-400 transition-colors" />
          <Youtube size={20} className="text-white/80 hover:text-emerald-400 transition-colors" />
        </div>
      </div>

      <div className="relative z-20 h-full max-w-7xl mx-auto md:px-10 px-5 md:pl-28 flex items-center">
        <div className="max-w-2xl">
          <motion.div
            key={`content-${index}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <span className="text-emerald-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">
              Experience the Unseen
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6">
              {destinations[index].name}
            </h1>
            <p className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
              {destinations[index].description.slice(0, 100)}...
            </p>
            <div className="flex items-center gap-6">
              <button className="bg-[var(--primary-dark)] flex hover:bg-[var(--primary-dark)] text-white px-6 py-4 rounded-lg font-bold uppercase tracking-widest text-xs transition-all hover:shadow-[0_20px_40px_rgba(16,185,129,0.3)]">
                Explore Destination <ArrowRight size={14} className="ml-2" />
              </button>

            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-20 right-10 z-30 hidden lg:flex gap-6 items-end">
        {destinations.map((item, i) => (
          <motion.div
            key={item.id}
            animate={{
              scale: i === index ? 1.1 : 1,
              opacity: i === index ? 1 : 0.5,
              y: i === index ? -10 : 0
            }}
            onClick={() => setIndex(i)}
            className={`w-44 h-60 rounded-2xl overflow-hidden cursor-pointer border-2 shadow-2xl transition-all duration-500 ${i === index ? 'border-emerald-500' : 'border-transparent'
              }`}
          >
            <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
            <div className="absolute inset-0 p-4 flex flex-col justify-between ">
              <div className="flex justify-between">
                <div className="flex gap-0.5"><Star size={8} className="fill-emerald-400 text-emerald-400" /></div>
                <Bookmark size={14} />
              </div>
              <p className="text-[10px] font-bold uppercase">{item.location}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}