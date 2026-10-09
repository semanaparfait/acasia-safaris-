"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  ArrowRight,
  Star,
  CloudSun,
  Camera,
  Mountain,
  Target,
  Info,
  Car,
  ShieldCheck,
} from "lucide-react";
import { Great_Vibes } from "next/font/google";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
});

// 2. Quick Facts
const quickFacts = [
  { icon: <MapPin size={24} strokeWidth={1} />, label: "Location", value: "Northern Rwanda" },
  { icon: <Clock size={24} strokeWidth={1} />, label: "Best Time", value: "June - September" },
  { icon: <CloudSun size={24} strokeWidth={1} />, label: "Climate", value: "Mild to Cool (10-25°C)" },
  { icon: <Star size={24} strokeWidth={1} />, label: "Top Activity", value: "Gorilla Trekking" },
];

// 3. Gallery Images
const galleryImages = [
  "https://i.pinimg.com/736x/f9/9e/2f/f99e2fdce5cee014a440d0ee3eedce76.jpg",
  "https://i.pinimg.com/736x/c7/c9/26/c7c926aaf0f161086dd07ecab6636f23.jpg",
  "https://i.pinimg.com/736x/68/01/19/6801199e33bc9eaa9f4777a21ee25a45.jpg",
  "https://i.pinimg.com/736x/80/8d/91/808d91821c1f5c2342c222215223cbc6.jpg"
];

// 4. Available Tours
const destinationTours = [
  {
    id: 1,
    title: "The Ultimate Gorilla Trek",
    location: "Volcanoes National Park",
    duration: "4 Days",
    price: "$2,500",
    rating: 5.0,
    image: "https://i.pinimg.com/736x/68/01/19/6801199e33bc9eaa9f4777a21ee25a45.jpg",
  },
  {
    id: 2,
    title: "Golden Monkey Expedition",
    location: "Volcanoes National Park",
    duration: "2 Days",
    price: "$950",
    rating: 4.8,
    image: "https://i.pinimg.com/736x/29/c6/d9/29c6d9f0c66cbefe2dfd664176627428.jpg",
  }
];

// 6. Practical Info
const travelTips = [
  { icon: <Info size={20} strokeWidth={1} />, title: "Visa Requirements", desc: "Visas on arrival available for most countries." },
  { icon: <Car size={20} strokeWidth={1} />, title: "Getting There", desc: "2.5-hour private transfer from Kigali Airport." },
  { icon: <ShieldCheck size={20} strokeWidth={1} />, title: "Health & Safety", desc: "Malaria precautions recommended. Very safe region." },
  { icon: <Mountain size={20} strokeWidth={1} />, title: "What to Pack", desc: "Sturdy hiking boots, rain jacket, and layers." },
];

// 7. Key Experiences
const keyExperiences = [
  { icon: <Target size={28} strokeWidth={1} />, title: "Gorilla Trekking", desc: "Face-to-face encounters with wild silverbacks." },
  { icon: <Camera size={28} strokeWidth={1} />, title: "Scenic Photography", desc: "Capture misty volcanic panoramas." },
  { icon: <Mountain size={28} strokeWidth={1} />, title: "Hiking Adventures", desc: "Scale the dormant Mount Bisoke crater." },
];

export default function DestinationPage() {
  return (
    <div className="bg-[#fcfcfc] text-[#0a120b] font-serif overflow-hidden">

      {/* 1. Hero / Banner Section */}
      <section className="relative h-screen flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden bg-[#0a120b]">
        <iframe
          className="w-full h-full pointer-events-none opacity-60"
          src="https://www.youtube.com/embed/Ov8JhHzPUKo?autoplay=1&mute=1&loop=1&playlist=Ov8JhHzPUKo&controls=0&showinfo=0&modestbranding=1"
          title="Visit Rwanda"
          allow="autoplay; fullscreen"
        ></iframe>
      </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 mt-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-(--primary-dark) text-5xl md:text-7xl tracking-wide mb-6 block ${greatVibes.className}`}
          >
            Volcanoes National Park
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-light tracking-tight text-white max-w-4xl leading-[1.2] mb-12"
          >
            Experience Rwanda’s majestic <span className="italic text-white/70">gorillas up close.</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button className="bg-white text-[#0a120b] px-12 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.3em] hover:bg-white/90 transition-colors">
              Explore Tours
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. Quick Facts / Highlights Section */}
      <section className="py-24 bg-white border-b border-[#0a120b]/5 relative -mt-10 z-20 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {quickFacts.map((fact, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="text-(--primary-dark) mb-4">{fact.icon}</div>
              <h4 className="text-[#0a120b]/50 font-sans text-[9px] font-bold uppercase tracking-[0.2em] mb-2">{fact.label}</h4>
              <p className="text-xl text-[#0a120b]">{fact.value}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Destination Details / Story */}
      <section className="py-32 bg-[#fcfcfc]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <span className="text-emerald-700/50 font-bold text-[10px] uppercase tracking-[0.5em] block mb-8">
            The Story
          </span>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-12 leading-snug">
            A realm of ancient peaks and <span className="italic font-serif text-gray-500">dense bamboo forests.</span>
          </h2>
          <p className="text-lg md:text-xl leading-relaxed text-[#0a120b]/70 font-serif mb-8">
            Nestled in the breathtaking Virunga Massif, Volcanoes National Park is the crown jewel of Rwandan tourism. Known globally for its population of endangered mountain gorillas, this park offers one of the most profound wildlife encounters on Earth.
          </p>
          <p className="text-lg md:text-xl leading-relaxed text-[#0a120b]/70 font-serif">
            Beyond the gorillas, the park is a tapestry of dormant volcanoes, vibrant flora, and the spirited golden monkeys. It is a place where mist dances through the canopy, and every step connects you to the raw, untamed heartbeat of Africa.
          </p>
        </div>
      </section>

      {/* 3. Photo Gallery */}
      <section className="pb-32 bg-[#fcfcfc] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight">Visual <span className="italic text-gray-400">Journey</span></h2>
        </div>
        <div className="flex gap-4 px-6 md:px-12 overflow-x-auto scrollbar-hide snap-x">
          {galleryImages.map((img, idx) => (
            <div key={idx} className="relative min-w-[300px] md:min-w-[400px] aspect-[4/5] bg-gray-100 snap-center overflow-hidden group cursor-pointer">
              <img
                src={img}
                alt="Gallery Visual"
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            </div>
          ))}
        </div>
      </section>

      {/* 7. Why Visit (Key Experiences) */}
      <section className="py-32 bg-white border-y border-[#0a120b]/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-24">
            <span className="text-[#0a120b]/40 font-sans font-bold text-[10px] uppercase tracking-[0.4em] block mb-4">Highlights</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight">Essential <span className="italic text-gray-400">Experiences</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {keyExperiences.map((exp, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 border border-[#0a120b]/10 rounded-full flex items-center justify-center text-(--primary-dark) mb-8 group-hover:bg-[#0a120b] group-hover:text-white transition-all duration-500">
                  {exp.icon}
                </div>
                <h3 className="text-2xl mb-4 text-[#0a120b]">{exp.title}</h3>
                <p className="text-sm font-sans text-[#0a120b]/60 leading-relaxed max-w-xs">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Tours Available Here */}
      <section className="py-32 bg-[#f9f9fb]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                Recommended <span className="italic text-gray-400">Itineraries</span>
              </h2>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-[0.2em] hover:text-[#0a120b]/50 transition-colors">
              View All Tours <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {destinationTours.map((tour) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group bg-white flex flex-col sm:flex-row border border-[#0a120b]/5 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto relative overflow-hidden bg-gray-100">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 flex items-center gap-1 text-[#0a120b]">
                    <Star size={10} className="fill-current" />
                    <span className="font-sans text-[10px] font-bold tracking-widest">{tour.rating}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-8 sm:w-3/5 flex flex-col justify-between">
                  <div>
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
                      Book Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Practical Info / Travel Tips */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight">Practical <span className="italic text-gray-400">Information</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {travelTips.map((tip, idx) => (
              <div key={idx} className="flex flex-col items-center md:items-start text-center md:text-left border-t border-[#0a120b]/10 pt-8">
                <div className="text-[var(--primary-dark)] mb-6">{tip.icon}</div>
                <h4 className="text-lg mb-3">{tip.title}</h4>
                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[#0a120b]/50 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Testimonials / Visitor Story */}
      <section className="py-32 bg-[#fcfcfc] border-y border-[#0a120b]/5 hidden">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Star size={24} className="mx-auto mb-10 text-[var(--primary-dark)] opacity-40" />
          <p className="text-3xl md:text-4xl font-light leading-snug italic text-[#0a120b] mb-12">
            "Looking a silverback in the eye is a moment that fundamentally changes you. The team made reaching the Volcanoes feel utterly effortless and luxurious."
          </p>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-4 bg-gray-200">
              <img src="https://i.pinimg.com/236x/87/1c/b4/871cb4bf9165d4bb3a0d5c0cedfe56db.jpg" alt="Visitor" className="w-full h-full object-cover" />
            </div>
            <h4 className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a120b] mb-1">Eleanor Hughes</h4>
            <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/40">Visited July 2026</span>
          </div>
        </div>
      </section>

      {/* 9. CTA / Book Now */}
      <section className="py-32 px-6 flex flex-col items-center text-center bg-[#0a120b] text-white hidden">
        <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-4">
          Ready to experience <span className="italic text-white/60">Volcanoes?</span>
        </h2>
        <p className="text-lg text-white/50 font-serif italic mb-12">Limited permits available for the high season.</p>
        <div className="flex gap-6 flex-wrap justify-center">
          <button className="bg-[var(--primary-dark)] text-white px-10 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.3em] hover:bg-emerald-800 transition-colors">
            Book Your Trip
          </button>
          <button className="border border-white/20 text-white px-10 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.3em] hover:bg-white/10 transition-colors">
            Contact Guide
          </button>
        </div>
      </section>

    </div>
  );
}
