"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  MapPin,
  Clock,
  ArrowRight,
  Star,
  Heart,
  Mountain,
  Target,
  Users,
  Camera,
  ChevronLeft,
  ChevronRight,

} from "lucide-react";
import { Great_Vibes } from "next/font/google";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
});


const categories = [
  { name: "Wildlife Safaris", icon: <Target size={20} strokeWidth={1.5} />, count: 12 },
  { name: "Cultural Immersions", icon: <Users size={20} strokeWidth={1.5} />, count: 8 },
  { name: "Mountain Expeditions", icon: <Mountain size={20} strokeWidth={1.5} />, count: 5 },
  { name: "Photography Tours", icon: <Camera size={20} strokeWidth={1.5} />, count: 6 },
];


const tours = [
  {
    id: 1,
    title: "The Ultimate Gorilla Trek",
    location: "Volcanoes National Park",
    duration: "4 Days",
    price: "$2,500",
    rating: 5.0,
    reviews: 124,
    type: "Wildlife Safaris",
    image: "https://i.pinimg.com/736x/68/01/19/6801199e33bc9eaa9f4777a21ee25a45.jpg",
  },
  {
    id: 2,
    title: "Akagera Big Five Safari",
    location: "Akagera National Park",
    duration: "3 Days",
    price: "$1,200",
    rating: 4.8,
    reviews: 86,
    type: "Wildlife Safaris",
    image: "https://i.pinimg.com/1200x/1d/3a/0e/1d3a0e7dbc04ee5e445faed00f48c164.jpg",
  },
  {
    id: 3,
    title: "Secrets of Lake Kivu",
    location: "Lake Kivu",
    duration: "2 Days",
    price: "$850",
    rating: 4.9,
    reviews: 42,
    type: "Photography Tours",
    image: "https://i.pinimg.com/736x/51/a9/a8/51a9a84199c37fc7ade67a32a8b6df39.jpg",
  },
  {
    id: 4,
    title: "Nyungwe Canopy & Chimps",
    location: "Nyungwe Forest",
    duration: "5 Days",
    price: "$1,800",
    rating: 5.0,
    reviews: 112,
    type: "Cultural Immersions",
    image: "https://i.pinimg.com/736x/29/c6/d9/29c6d9f0c66cbefe2dfd664176627428.jpg",
  },
];


const destinations = [
  "https://i.pinimg.com/1200x/1d/3a/0e/1d3a0e7dbc04ee5e445faed00f48c164.jpg",
  "https://i.pinimg.com/736x/80/8d/91/808d91821c1f5c2342c222215223cbc6.jpg",
  "https://i.pinimg.com/736x/4f/fc/84/4ffc84cb985a075626662bea126f5ec7.jpg",
  "https://i.pinimg.com/736x/0f/84/de/0f84dec8e96fc7763eb982ef71295fe8.jpg"
];


const reasons = [
  { title: "Expert Guides", desc: "Local visionaries leading the way." },
  { title: "Refined Luxury", desc: "Only the finest camps and lodges." },
  { title: "Seamless Travel", desc: "Every detail handled, perfectly." },
  { title: "Conscious Impact", desc: "Sustainable and ethical tourism." },
];


const steps = [
  { title: "Choose Your Tour", desc: "Select from curated experiences across Rwanda." },
  { title: "Plan With Experts", desc: "Our travel experts customize your itinerary." },
  { title: "Experience Rwanda", desc: "Enjoy unforgettable adventures with expert guides." },
];

export default function TourPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-[#fcfcfc] text-[#0a120b] font-serif overflow-hidden">


      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0a120b]">
          <img
            src="https://i.pinimg.com/736x/b6/36/54/b63654e4296b783f1c16dae7ffb24b80.jpg"
            alt="Rwanda Vista"
            className="w-full h-full object-cover opacity-50 grayscale-[10%]"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 mt-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-(--primary-dark) text-5xl md:text-6xl tracking-wide mb-6 block ${greatVibes.className}`}
          >
            Explore Rwanda
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-light tracking-tight text-white max-w-4xl leading-[1.1] "
          >
            Unforgettable <span className="italic text-white/70">adventures</span> await.
          </motion.h1>

          {/* Hero Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-10 text-white/80 text-sm font-sans mt-8"
          >
            <div>
              <p className="text-2xl font-light">25+</p>
              <span>Luxury Tours</span>
            </div>
            <div>
              <p className="text-2xl font-light">10K+</p>
              <span>Happy Travelers</span>
            </div>
            <div>
              <p className="text-2xl font-light">5★</p>
              <span>Average Rating</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 mt-10"
          >
            <button className="bg-white text-[#0a120b] px-10 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.3em] hover:bg-white/90 transition-colors">
              Browse Expeditions
            </button>
          </motion.div>
        </div>
      </section>


      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <h2 className="text-4xl md:text-5xl font-light text-center mb-16">
          Discover Rwanda's <span className="italic text-gray-400">Destinations</span>
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          {destinations.map((img, i) => (
            <div key={i} className="relative group overflow-hidden h-60 md:h-72">
              <img
                src={img}
                alt="Destination"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[20%] group-hover:grayscale-0"
              />
              <div className="absolute bottom-4 left-4 text-white text-lg font-semibold">
                {i === 0 ? "Volcanoes Park" : i === 1 ? "Lake Kivu" : "Nyungwe Forest"}
              </div>
            </div>
          ))}
        </div>
      </section>


      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12 border-b border-[#0a120b]/5">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
          <div className="max-w-xl">
            <span className="text-[#0a120b]/40 font-sans font-bold text-[10px] uppercase tracking-[0.4em] block mb-4">
              Collections
            </span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight">
              Curated <span className="italic text-gray-400">Journeys</span>
            </h2>
          </div>

          <div className="relative w-[calc(100vw-3rem)] md:w-[60vw] lg:w-auto flex items-center overflow-hidden">
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 z-10 w-12 h-full flex items-center justify-start bg-gradient-to-r from-[#fcfcfc] via-[#fcfcfc] to-transparent text-[#0a120b]/40 hover:text-[#0a120b] transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <div
              ref={scrollRef}
              className="flex overflow-x-auto gap-8 pb-4 scrollbar-hide px-10 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
            >
              <button
                onClick={() => setActiveCategory("All")}
                className={`flex items-center gap-3 shrink-0 font-sans text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-colors pb-2 border-b ${activeCategory === "All"
                  ? "border-[#0a120b] text-[#0a120b]"
                  : "border-transparent text-[#0a120b]/40 hover:text-[#0a120b]/70"
                  }`}
              >
                All Journeys
              </button>
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`flex shrink-0 items-center gap-3 font-sans text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-colors pb-2 border-b ${activeCategory === cat.name
                    ? "border-[#0a120b] text-[#0a120b]"
                    : "border-transparent text-[#0a120b]/40 hover:text-[#0a120b]/70"
                    }`}
                >
                  {cat.icon}
                  <span>
                    {cat.name}{" "}
                    <span className="text-gray-400 font-serif normal-case italic ml-1">
                      ({cat.count})
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => scroll("right")}
              className="absolute right-0 z-10 w-12 h-full flex items-center justify-end bg-gradient-to-l from-[#fcfcfc] via-[#fcfcfc] to-transparent text-[#0a120b]/40 hover:text-[#0a120b] transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>


      <section className="py-20 bg-[#f9f9fb]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <AnimatePresence>
              {tours
                .filter((t) => activeCategory === "All" || t.type === activeCategory)
                .map((tour) => (
                  <motion.div
                    key={tour.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className="group bg-white flex flex-col sm:flex-row border border-[#0a120b]/5 shadow-sm hover:shadow-md transition-shadow"
                  >

                    <Link href={`/tour/${tour.id}`}
                      className="w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto relative overflow-hidden bg-gray-100">
                      <img
                        src={tour.image}
                        alt={tour.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 flex items-center gap-1 text-[#0a120b]">
                        <Star size={10} className="fill-current" />
                        <span className="font-sans text-[10px] font-bold tracking-widest">
                          {tour.rating}
                        </span>
                      </div>
                    </Link>


                    <div className="p-8 sm:w-3/5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[#0a120b]/40 font-sans font-bold text-[9px] uppercase tracking-[0.2em]">
                            {tour.type}
                          </span>
                          <Heart className="text-[#0a120b]/20 hover:text-red-500 hover:fill-red-500 cursor-pointer transition-colors" size={16} />
                        </div>
                        <h3 className="text-2xl mb-4 group-hover:text-[#0a120b]/70 transition-colors">{tour.title}</h3>

                        <div className="flex flex-col gap-2 font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[#0a120b]/50 mb-6">
                          <div className="flex items-center gap-2"><MapPin size={12} /> {tour.location}</div>
                          <div className="flex items-center gap-2"><Clock size={12} /> {tour.duration}</div>
                        </div>
                      </div>

                      <div className="mt-auto pt-6 border-t border-[#0a120b]/10 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-sans text-[8px] uppercase tracking-widest text-[#0a120b]/40">From</span>
                          <span className="text-xl italic">{tour.price}</span>
                        </div>
                        <button className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-[0.2em] hover:text-[#0a120b]/50 transition-colors">
                          Discover <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="py-32 bg-white border-y border-[#0a120b]/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <span className="text-[#0a120b]/40 font-sans font-bold text-[10px] uppercase tracking-[0.4em] block mb-4">The Standard</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight">Why travel <span className="italic text-gray-400">with Acasia</span></h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {reasons.map((r, i) => (
              <div key={i} className="flex flex-col border-l border-[var(--primary-dark)]/20 pl-6">
                <h4 className="text-lg mb-2 text-[#0a120b]">{r.title}</h4>
                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-[#0a120b]/50 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-32 bg-white flex flex-col items-center justify-center px-6 text-center border-y border-[#0a120b]/5">
        <div className="max-w-3xl">
          <Star size={24} className="mx-auto mb-10 text-[var(--primary-dark)] opacity-40" />
          <p className="text-3xl md:text-4xl font-light leading-snug italic text-[#0a120b] mb-12">
            "We trusted them with our honeymoon, and they delivered an absolute masterpiece. From the remote luxury lodges to the intimate gorilla trek, it was flawless."
          </p>
          <div className="flex flex-col items-center">
            <h4 className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a120b] mb-1">Amelia & Thomas</h4>
            <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/40">London, UK</span>
          </div>
        </div>
      </section>


    </div>
  );
}