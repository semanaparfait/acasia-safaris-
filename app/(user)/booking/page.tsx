"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, ArrowRight, Star, Heart,
  ChevronDown, CheckSquare, Square,
  CheckCircle2, ShieldCheck,
  CalendarDays, Settings, Users, Compass,
  Info, MessageSquare, ChevronUp, ArrowUpRight
} from "lucide-react";
import { Great_Vibes } from "next/font/google";
import { DateRangePicker } from "@/components/ui/date-picker";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
});

// Mock Data

const suggestedTours = [
  {
    id: 1,
    title: "Gorilla Trekking Experience",
    location: "Volcanoes National Park",
    duration: "4 Days",
    price: "$2,500",
    rating: 5.0,
    type: "Wildlife",
    image: "https://i.pinimg.com/736x/68/01/19/6801199e33bc9eaa9f4777a21ee25a45.jpg",
  },
  {
    id: 2,
    title: "Akagera Big Five Safari",
    location: "Akagera National Park",
    duration: "3 Days",
    price: "$1,200",
    rating: 4.8,
    type: "Wildlife",
    image: "https://i.pinimg.com/1200x/1d/3a/0e/1d3a0e7dbc04ee5e445faed00f48c164.jpg",
  },
  {
    id: 3,
    title: "Lake Kivu Retreat",
    location: "Lake Kivu",
    duration: "3 Days",
    price: "$900",
    rating: 4.9,
    type: "Relaxation",
    image: "https://i.pinimg.com/736x/51/a9/a8/51a9a84199c37fc7ade67a32a8b6df39.jpg",
  },
  {
    id: 4,
    title: "Nyungwe Forest Adventure",
    location: "Nyungwe Forest",
    duration: "4 Days",
    price: "$1,600",
    rating: 4.9,
    type: "Adventure",
    image: "https://i.pinimg.com/736x/4f/fc/84/4ffc84cb985a075626662bea126f5ec7.jpg",
  }
];

const faqs = [
  {
    q: "Do I need a visa for Rwanda?",
    a: "Yes, but citizens of many countries can get a visa on arrival or apply for an e-Visa online prior to travel."
  },
  {
    q: "What is the best time to visit Rwanda?",
    a: "The long dry season (June to September) is generally considered the best time for gorilla trekking and wildlife viewing as trails are drier."
  },
  {
    q: "Is gorilla trekking safe?",
    a: "Absolutely. Trekking is led by highly trained, armed rangers and guides who know the mountains and habituated gorilla families intimately."
  },
  {
    q: "Can trips be customized?",
    a: "Yes, every aspect of your journey can be tailored. From accommodation styles to specific activities and dietary needs, our luxury experts design it for you."
  }
];

const processSteps = [
  { step: "01", title: "Submit Request", desc: "Share your vision, preferred destinations, and travel style through our planning form." },
  { step: "02", title: "Expert Consultation", desc: "Our travel designers review your preferences and contact you to refine the intimate details." },
  { step: "03", title: "Custom Itinerary", desc: "Receive a deeply personalized journey proposal, complete with curated lodges and activities." },
  { step: "04", title: "Confirm & Journey", desc: "Finalize your booking securely, and prepare for an unforgettable adventure across Rwanda." }
];

const destinationsList = [
  "Gorilla Trekking – Volcanoes",
  "Big Five Safari – Akagera",
  "Canopy Walk – Nyungwe",
  "Lake Kivu Relaxation",
  "Kigali Cultural Tour",
  "Other"
];

const travelStyles = ["Luxury Safari", "Adventure Expedition", "Cultural Experience", "Photography Tour", "Honeymoon Package", "Family Trip"];
const accommodations = ["Luxury Lodges", "Boutique Hotels", "Mid-range Hotels", "Eco Lodges", "Camping"];
const budgets = ["$1000 - $2000", "$2000 - $5000", "$5000 - $10000", "$10000+"];

export default function BookingPage() {
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [customDestination, setCustomDestination] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedAccommodation, setSelectedAccommodation] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [travelDates, setTravelDates] = useState<{ from: Date | undefined, to: Date | undefined }>({ from: undefined, to: undefined });

  const toggleDestination = (dest: string) => {
    setSelectedDestinations(prev =>
      prev.includes(dest) ? prev.filter(d => d !== dest) : [...prev, dest]
    );
  };

  return (
    <div className="bg-[#fcfcfc] text-[#0a120b] font-serif overflow-hidden">
      {/* Back Home Button */}
      <div className="p-6 mb-7">
        <a href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a120b] text-white rounded hover:bg-[#1a2a1b] transition-colors text-xs font-bold uppercase tracking-widest">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back Home
        </a>
      </div>


      <section className="relative h-[80vh] flex items-center justify-center hidden">
        <div className="absolute inset-0 bg-[#0a120b]">
          <img
            src="https://i.pinimg.com/736x/8f/c9/2c/8fc92cd9d9ac6218d6e3c0ea0fe1f4c7.jpg"
            alt="Safari Jeep"
            className="w-full h-full object-cover opacity-40 grayscale-[20%]"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 mt-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-(--primary-dark) text-5xl md:text-6xl tracking-wide mb-6 block ${greatVibes.className}`}
          >
            Design Your Journey
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-light tracking-tight text-white max-w-4xl leading-[1.2] mb-6"
          >
            Plan Your Perfect <span className="italic text-white/70">Rwanda Adventure.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg md:text-xl font-serif italic max-w-2xl mb-10"
          >
            Tell us your travel preferences and our experts will design a deeply personalized itinerary just for you.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 flex-wrap justify-center"
          >
            <button
              onClick={() => document.getElementById('trip-planner')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-[#0a120b] px-10 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.3em] hover:bg-white/90 transition-colors"
            >
              Start Planning
            </button>
            <button
              onClick={() => document.getElementById('suggested-tours')?.scrollIntoView({ behavior: 'smooth' })}
              className="border border-white/20 text-white px-10 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.3em] hover:bg-white/10 transition-colors"
            >
              View Tours
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. Trip Planning Form */}
      <section id="trip-planner" className="py-24 bg-white border-b border-[#0a120b]/5 relative -mt-8 z-20 rounded-t-[3rem] px-6">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-16">
            <span className="text-[#0a120b]/40 font-sans font-bold text-[10px] uppercase tracking-[0.4em] block mb-4">
              Plan Your Journey
            </span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight">
              Design your <span className="italic text-gray-400">Adventure</span>
            </h2>
          </div>

          <form className="space-y-16">

            {/* Basic Info */}
            <div>
              <h3 className="text-xl md:text-2xl mb-8 flex items-center gap-3">
                <span className="text-(--primary-dark)"><Users size={20} /></span>
                Traveler Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60">Full Name</label>
                  <input type="text" placeholder="John Doe" className="border-b border-[#0a120b]/20 py-3 bg-transparent font-serif italic text-lg outline-none focus:border-(--primary-dark) transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60">Email Address</label>
                  <input type="email" placeholder="john@example.com" className="border-b border-[#0a120b]/20 py-3 bg-transparent font-serif italic text-lg outline-none focus:border-(--primary-dark) transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60">Phone Number</label>
                  <input type="tel" placeholder="+1 234 567 890" className="border-b border-[#0a120b]/20 py-3 bg-transparent font-serif italic text-lg outline-none focus:border-(--primary-dark) transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60">Country of Residence</label>
                  <input type="text" placeholder="e.g. United States" className="border-b border-[#0a120b]/20 py-3 bg-transparent font-serif italic text-lg outline-none focus:border-(--primary-dark) transition-colors" />
                </div>
              </div>
            </div>

            {/* Travel Details */}
            <div>
              <h3 className="text-xl md:text-2xl mb-8 flex items-center gap-3">
                <span className="text-(--primary-dark)"><CalendarDays size={20} /></span>
                Travel Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60">Estimated Travel Dates</label>
                  <DateRangePicker
                    date={travelDates}
                    onSelect={(range) => setTravelDates({ from: range?.from, to: range?.to })}
                    className="w-full"
                    placeholder="Select your travel dates"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60">Adults</label>
                  <input type="number" min="1" placeholder="2" className="border-b border-[#0a120b]/20 py-3 bg-transparent font-serif text-lg outline-none focus:border-(--primary-dark) transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60">Children</label>
                  <input type="number" min="0" placeholder="0" className="border-b border-[#0a120b]/20 py-3 bg-transparent font-serif text-lg outline-none focus:border-(--primary-dark) transition-colors" />
                </div>
              </div>
            </div>

            {/* Destinations */}
            <div>
              <h3 className="text-xl md:text-2xl mb-8 flex items-center gap-3">
                <span className="text-(--primary-dark)"><MapPin size={20} /></span>
                Destinations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinationsList.map((dest, i) => (
                  <div
                    key={i}
                    onClick={() => toggleDestination(dest)}
                    className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${selectedDestinations.includes(dest) ? 'border-(--primary-dark) bg-(--primary-dark)/5' : 'border-[#0a120b]/10 hover:border-[#0a120b]/30'
                      }`}
                  >
                    {selectedDestinations.includes(dest) ? (
                      <CheckSquare className="text-(--primary-dark)" size={20} />
                    ) : (
                      <Square className="text-[#0a120b]/20" size={20} />
                    )}
                    <span className={`${selectedDestinations.includes(dest) ? 'text-[#0a120b]' : 'text-[#0a120b]/70'} transition-colors`}>{dest}</span>
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {selectedDestinations.includes("Other") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-2">
                      <label className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60">Please Specify Destination(s)</label>
                      <input
                        type="text"
                        value={customDestination}
                        onChange={(e) => setCustomDestination(e.target.value)}
                        placeholder="e.g. Twin Lakes, Muhazi, etc."
                        className="border-b border-[#0a120b]/20 py-3 bg-transparent font-serif italic text-lg outline-none focus:border-(--primary-dark) transition-colors w-full md:w-1/2"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Preferences */}
            <div>
              <h3 className="text-xl md:text-2xl mb-8 flex items-center gap-3">
                <span className="text-(--primary-dark)"><Settings size={20} /></span>
                Travel Preferences
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="flex flex-col gap-2 relative">
                  <label className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60">Tour Type</label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="border-b border-[#0a120b]/20 py-3 bg-transparent font-serif italic text-lg outline-none focus:border-(--primary-dark) appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select style...</option>
                    {travelStyles.map((style, i) => <option key={i} value={style} className="font-sans not-italic text-sm">{style}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-0 bottom-4 text-[#0a120b]/40 pointer-events-none" />
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60">Accommodation</label>
                  <select
                    value={selectedAccommodation}
                    onChange={(e) => setSelectedAccommodation(e.target.value)}
                    className="border-b border-[#0a120b]/20 py-3 bg-transparent font-serif italic text-lg outline-none focus:border-(--primary-dark) appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select level...</option>
                    {accommodations.map((acc, i) => <option key={i} value={acc} className="font-sans not-italic text-sm">{acc}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-0 bottom-4 text-[#0a120b]/40 pointer-events-none" />
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60">Budget Range (Per Person)</label>
                  <select
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    className="border-b border-[#0a120b]/20 py-3 bg-transparent font-serif italic text-lg outline-none focus:border-(--primary-dark) appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select budget...</option>
                    {budgets.map((bud, i) => <option key={i} value={bud} className="font-sans not-italic text-sm">{bud}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-0 bottom-4 text-[#0a120b]/40 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60">Special Requests</label>
                <textarea
                  rows={4}
                  placeholder="Dietary needs, photography equipment, accessibility, celebrating an anniversary..."
                  className="border-b border-[#0a120b]/20 py-3 bg-transparent font-serif italic text-lg outline-none focus:border-(--primary-dark) transition-colors resize-none"
                />
              </div>
            </div>

            <div className="pt-8 border-t border-[#0a120b]/10 flex justify-end">
              <button type="button" className="bg-[#0a120b] text-white px-12 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.3em] hover:bg-(--primary-dark) transition-colors">
                Submit Request
              </button>
            </div>

          </form>
        </div>
      </section>

      {/* 3. Suggested Tours */}
      <section id="suggested-tours" className="py-32 bg-[#fcfcfc] hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">

          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-xl">
              <span className="text-[#0a120b]/40 font-sans font-bold text-[10px] uppercase tracking-[0.4em] block mb-4">
                Inspiration
              </span>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                Suggested <span className="italic text-gray-400">Itineraries</span>
              </h2>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-[0.2em] hover:text-[#0a120b]/50 transition-colors">
              View All Tours <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {suggestedTours.map((tour) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group bg-white flex flex-col sm:flex-row border border-[#0a120b]/5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto relative overflow-hidden bg-gray-100">
                  <img src={tour.image} alt={tour.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 flex items-center gap-1 text-[#0a120b]">
                    <Star size={10} className="fill-current" />
                    <span className="font-sans text-[10px] font-bold tracking-widest">{tour.rating}</span>
                  </div>
                </div>

                <div className="p-8 sm:w-3/5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[#0a120b]/40 font-sans font-bold text-[9px] uppercase tracking-[0.2em]">{tour.type}</span>
                    </div>
                    <h3 className="text-2xl mb-4 group-hover:text-[#0a120b]/70 transition-colors">{tour.title}</h3>
                    <div className="flex flex-col gap-2 font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[#0a120b]/50 mb-6">
                      <div className="flex items-center gap-2"><Clock size={12} /> {tour.duration}</div>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-[#0a120b]/10 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-sans text-[8px] uppercase tracking-widest text-[#0a120b]/40">From</span>
                      <span className="text-xl italic">{tour.price}</span>
                    </div>
                    <button className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-[0.2em] hover:text-[#0a120b]/50 transition-colors">
                      View Details <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. Trip Process Section & 5. Why Book With Us */}
      <section className="py-32 bg-white border-y border-[#0a120b]/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32">

          {/* Booking Process */}
          <div>
            <span className="text-[#0a120b]/40 font-sans font-bold text-[10px] uppercase tracking-[0.4em] block mb-4">The Process</span>
            <h2 className="text-4xl font-light tracking-tight mb-16">How it <span className="italic text-gray-400">Works</span></h2>

            <div className="flex flex-col gap-10">
              {processSteps.map((step, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="font-sans text-[10px] font-bold uppercase tracking-widest text-(--primary-dark) pt-2">
                    {step.step}.
                  </div>
                  <div className="border-l border-[#0a120b]/10 pl-6 group-hover:border-(--primary-dark) transition-colors">
                    <h4 className="text-xl mb-3 text-[#0a120b]">{step.title}</h4>
                    <p className="font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-[#0a120b]/50 leading-relaxed max-w-sm">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why Book With Us */}
          <div className="bg-[#f9f9fb] p-12 lg:p-16 flex flex-col justify-center">
            <Compass size={32} className="text-(--primary-dark) mb-8" strokeWidth={1} />
            <h3 className="text-3xl font-light tracking-tight mb-10">Why travel with <span className="italic text-gray-400">Acasia Safaris?</span></h3>

            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <CheckCircle2 size={18} className="text-(--primary-dark) shrink-0 mt-0.5" />
                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.1em] text-[#0a120b]/70 leading-relaxed">
                  Local Rwanda travel experts and guides
                </span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 size={18} className="text-(--primary-dark) shrink-0 mt-0.5" />
                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.1em] text-[#0a120b]/70 leading-relaxed">
                  Deeply personalized trip planning
                </span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 size={18} className="text-(--primary-dark) shrink-0 mt-0.5" />
                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.1em] text-[#0a120b]/70 leading-relaxed">
                  Exclusive luxury accommodation partners
                </span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 size={18} className="text-(--primary-dark) shrink-0 mt-0.5" />
                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.1em] text-[#0a120b]/70 leading-relaxed">
                  24/7 on-the-ground travel support
                </span>
              </li>
            </ul>
          </div>

        </div>
      </section>



      {/* 7. FAQ */}
      <section className="py-32 bg-white border-y border-[#0a120b]/5">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="text-[#0a120b]/40 font-sans font-bold text-[10px] uppercase tracking-[0.4em] block mb-4">Information</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight">Frequently Asked <span className="italic text-gray-400">Questions</span></h2>
          </div>

          <div className="flex flex-col border-t border-[#0a120b]/10">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-[#0a120b]/10">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full py-8 flex items-center justify-between text-left hover:text-[var(--primary-dark)] transition-colors group"
                >
                  <h4 className="text-xl md:text-2xl font-light">{faq.q}</h4>
                  {openFaq === i
                    ? <ChevronUp size={20} className="text-[#0a120b]/40" />
                    : <ChevronDown size={20} className="text-[#0a120b]/40 group-hover:text-[var(--primary-dark)]" />
                  }
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-8 text-lg font-serif italic text-[#0a120b]/60 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>



    </div>
  );
}