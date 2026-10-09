"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin, Star, User, Bath, Maximize, Target,
  CheckCircle2, Info, ArrowRight, ShieldCheck,
  Calendar, Users, Clock, Mountain, Camera,
  Wifi, Coffee, Car, Utensils
} from "lucide-react";

const TRIPS_DATA: Record<string, any> = {
  "1": {
    title: "The Ultimate Gorilla Trek",
    tag: "Wildlife Tours",
    price: "2,500",
    duration: "4 Days",
    location: "Volcanoes National Park, Rwanda",
    difficulty: "Moderate",
    rating: 5.0,
    reviews: 124,
    images: [
      "https://i.pinimg.com/736x/68/01/19/6801199e33bc9eaa9f4777a21ee25a45.jpg",
      "https://i.pinimg.com/736x/51/a9/a8/51a9a84199c37fc7ade67a32a8b6df39.jpg",
      "https://i.pinimg.com/1200x/1d/3a/0e/1d3a0e7dbc04ee5e445faed00f48c164.jpg",
      "https://i.pinimg.com/736x/4f/fc/84/4ffc84cb985a075626662bea126f5ec7.jpg"
    ],
    description: "Embark on an unforgettable expedition into the heart of Rwanda's Volcanoes National Park. This exclusive 4-day journey offers an intimate encounter with the majestic mountain gorillas in their natural habitat. Guided by expert trackers, you'll traverse ancient rainforests and lush bamboo slopes, experiencing the profound connection of standing mere steps away from these gentle giants.",
    amenities: [
      { name: "Luxury Lodging", icon: <Star size={18} /> },
      { name: "Private Transfers", icon: <Car size={18} /> },
      { name: "All Meals Included", icon: <Utensils size={18} /> },
      { name: "High-Speed Wi-Fi", icon: <Wifi size={18} /> },
      { name: "Expert Guides", icon: <Target size={18} /> },
      { name: "Trekking Permits", icon: <CheckCircle2 size={18} /> },
    ],
    rules: {
      included: [
        "Gorilla trekking permits",
        "Luxury eco-lodge accommodation",
        "Private 4x4 transportation",
        "Expert English-speaking guide",
      ],
      excluded: [
        "International flights",
        "Personal expenses & tipping",
        "Travel insurance",
        "Premium alcoholic beverages",
      ]
    },
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31911.39345229064!2d29.47963381666874!3d-1.4646700812957134!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dda0e755555555%3A0x6bba553c617eb04a!2sVolcanoes%20National%20Park!5e0!3m2!1sen!2srw!4v1710000000000!5m2!1sen!2srw",
  },
  "2": {
    title: "Akagera Big Five Safari",
    tag: "Safari Tours",
    price: "1,200",
    duration: "3 Days",
    location: "Akagera National Park, Rwanda",
    difficulty: "Easy",
    rating: 4.8,
    reviews: 86,
    images: [
      "https://i.pinimg.com/1200x/1d/3a/0e/1d3a0e7dbc04ee5e445faed00f48c164.jpg",
      "https://i.pinimg.com/736x/29/c6/d9/29c6d9f0c66cbefe2dfd664176627428.jpg",
      "https://i.pinimg.com/736x/68/01/19/6801199e33bc9eaa9f4777a21ee25a45.jpg",
      "https://i.pinimg.com/736x/4f/fc/84/4ffc84cb985a075626662bea126f5ec7.jpg"
    ],
    description: "Discover the breathtaking landscapes of Akagera National Park, Central Africa's largest protected wetland. Experience thrilling game drives traversing savannahs, woodlands, and lakes, seeking out the iconic Big Five. Drift on Lake Ihema for extraordinary aquatic wildlife viewings and unwind in opulent tented camps under the starlit sky.",
    amenities: [
      { name: "Tented Camps", icon: <Mountain size={18} /> },
      { name: "Safari Vehicles", icon: <Car size={18} /> },
      { name: "Full Board", icon: <Utensils size={18} /> },
      { name: "Lake Boating", icon: <Star size={18} /> },
      { name: "Park Fees Included", icon: <CheckCircle2 size={18} /> },
      { name: "Hot Coffee/Tea", icon: <Coffee size={18} /> },
    ],
    rules: {
      included: [
        "All park entrance fees",
        "Guided game drives",
        "Boat safari on Lake Ihema",
        "Accommodation & meals",
      ],
      excluded: [
        "International flights",
        "Personal expenses & tipping",
        "Travel insurance",
        "Optional night drives",
      ]
    },
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127503.7460268579!2d30.551804!3d-1.8596001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19c368686d65fdd9%3A0xc3f60893aa4e6e22!2sAkagera%20National%20Park!5e0!3m2!1sen!2srw!4v1710000000000!5m2!1sen!2srw",
  },
  "3": {
    title: "Secrets of Lake Kivu",
    tag: "Relaxation",
    price: "850",
    duration: "2 Days",
    location: "Lake Kivu, Rwanda",
    difficulty: "Relaxing",
    rating: 4.9,
    reviews: 42,
    images: [
      "https://i.pinimg.com/736x/51/a9/a8/51a9a84199c37fc7ade67a32a8b6df39.jpg",
      "https://i.pinimg.com/1200x/1d/3a/0e/1d3a0e7dbc04ee5e445faed00f48c164.jpg",
      "https://i.pinimg.com/736x/68/01/19/6801199e33bc9eaa9f4777a21ee25a45.jpg",
      "https://i.pinimg.com/736x/4f/fc/84/4ffc84cb985a075626662bea126f5ec7.jpg"
    ],
    description: "Rejuvenate alongside the emerald-green waters of Lake Kivu, one of Africa's Great Lakes. This retreat interweaves absolute relaxation with gentle aquatic adventures. Enjoy sweeping mountain vistas, sunset cruises, and the serene beauty of the Rwandan coastline from your luxury resort.",
    amenities: [
      { name: "Lakeside Resort", icon: <Star size={18} /> },
      { name: "Sunset Cruises", icon: <CheckCircle2 size={18} /> },
      { name: "Gourmet Dining", icon: <Utensils size={18} /> },
      { name: "High-Speed Wi-Fi", icon: <Wifi size={18} /> },
      { name: "Spa Access", icon: <Bath size={18} /> },
      { name: "Coffee Tour", icon: <Coffee size={18} /> },
    ],
    rules: {
      included: [
        "Luxury lakefront accommodation",
        "Sunset boat cruise",
        "Coffee plantation tour",
        "Breakfast and dinner",
      ],
      excluded: [
        "Lunch and premium drinks",
        "Additional spa treatments",
        "Travel insurance",
        "Transportation to Kivu",
      ]
    },
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2042784.8694002777!2d28.243260021676643!3d-2.0592966144565706!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dd147250e7f727%3A0x63cdac0eab8fdce5!2sLake%20Kivu!5e0!3m2!1sen!2srw!4v1710000000000!5m2!1sen!2srw",
  },
  "4": {
    title: "Nyungwe Canopy & Chimps",
    tag: "Adventure",
    price: "1,800",
    duration: "5 Days",
    location: "Nyungwe Forest, Rwanda",
    difficulty: "Challenging",
    rating: 5.0,
    reviews: 112,
    images: [
      "https://i.pinimg.com/736x/29/c6/d9/29c6d9f0c66cbefe2dfd664176627428.jpg",
      "https://i.pinimg.com/1200x/1d/3a/0e/1d3a0e7dbc04ee5e445faed00f48c164.jpg",
      "https://i.pinimg.com/736x/51/a9/a8/51a9a84199c37fc7ade67a32a8b6df39.jpg",
      "https://i.pinimg.com/736x/68/01/19/6801199e33bc9eaa9f4777a21ee25a45.jpg"
    ],
    description: "Immerse yourself in the primal magic of Nyungwe Forest, one of the oldest rainforests in Africa. This journey combines the adrenaline of tracking wild chimpanzees with the breathtaking perspective of the high canopy walkway. Discover hidden waterfalls, unparalleled biodiversity, and luxurious forest lodges.",
    amenities: [
      { name: "Forest Lodge", icon: <Mountain size={18} /> },
      { name: "Canopy Access", icon: <CheckCircle2 size={18} /> },
      { name: "Chimp Permits", icon: <Target size={18} /> },
      { name: "All Meals", icon: <Utensils size={18} /> },
      { name: "Guided Hikes", icon: <User size={18} /> },
      { name: "Private Transport", icon: <Car size={18} /> },
    ],
    rules: {
      included: [
        "Chimpanzee tracking permits",
        "Canopy walkway entry",
        "Accommodation & meals",
        "Private 4x4 transport",
      ],
      excluded: [
        "International flights",
        "Personal expenses",
        "Gratuities for guides",
        "Travel insurance",
      ]
    },
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31871.32630248466!2d29.2307527!3d-2.479482!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dcd68a5c1979b1%3A0x6d36e78b7a950672!2sNyungwe%20National%20Park!5e0!3m2!1sen!2srw!4v1710000000000!5m2!1sen!2srw",
  }
};

export default function TripDetails() {
  const params = useParams();

  // Extract the ID dynamically
  const slug = Array.isArray(params?.id) ? params.id[0] : (params?.id || "1");
  const tripData = TRIPS_DATA[slug] || TRIPS_DATA["1"];

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    adults: "1",
    children: "0",
    rooms: "1"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Booking Request Sent Successfully!");
    }, 1500);
  };

  return (
    <div className="bg-[#FAFAF9] text-[#2C332F] font-sans antialiased pb-24">

      {/* 1. Header Hero Panel (Small) */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden flex items-center justify-center">
        <img
          src={tripData.images[0]}
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover filter brightness-50"
        />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl text-white font-serif tracking-wide mb-2">Trip Details</h1>
          <p className="text-white/80 text-sm font-medium">Home | Trip Details</p>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-6 md:px-8 -mt-8 relative z-20 mt-10">

        {/* 2. Photo Gallery Layout */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 h-auto md:h-[500px]">

          {/* Left Side: 4 smaller images */}
          <div className="hidden md:grid grid-rows-4 grid-cols-1 gap-4 w-1/4 h-full">
            {tripData.images.slice(0, 4).map((img: string, i: number) => (
              <div key={i} className={`relative w-full h-full rounded-2xl overflow-hidden shadow-sm ${i === 3 ? "group cursor-pointer" : ""}`}>
                <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                {/* Visual overlay for "View All" on last image */}
                {i === 3 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-[#2B5353] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg group-hover:bg-[#1f3d3d] transition-colors">View All Photos</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Side: Main Large Image */}
          <div className="w-full md:w-4/4 h-[300px] md:h-full rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer">
            <img src={tripData.images[0]} alt="Main gallery view" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-xl group-hover:scale-110 transition-transform">
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Main Two-Column Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Left Column (Information) */}
          <div className="w-full lg:w-[65%] flex flex-col gap-10">

            {/* Header / Meta Card */}
            <div className="bg-white p-8 rounded-3xl border border-[#ececea] shadow-sm flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-serif text-[#2C332F]">{tripData.title}</h2>
                  <span className="bg-[#2B5353] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">{tripData.tag}</span>
                </div>
                <div className="flex items-center gap-2 text-[#2C332F] font-medium text-sm">
                  <Star size={18} className="text-[#D4AF37] fill-[#D4AF37]" />
                  <span>{tripData.rating}</span>
                  <span className="text-[#8e9591]">({tripData.reviews} Review)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[#8e9591] text-sm">
                <MapPin size={16} />
                <span>{tripData.location}</span>
              </div>

              <div>
                <span className="text-2xl font-serif text-[#2C332F]">${tripData.price}</span>
                <span className="text-sm font-medium text-[#8e9591] ml-2">/ person</span>
              </div>

              {/* Stats Divider Line */}
              <div className="border-t border-[#ececea] pt-6 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-semibold text-[#666B68]">
                <div className="flex items-center gap-2"><Clock size={16} className="text-[#a8adaa]" /> {tripData.duration}</div>
                <div className="flex items-center gap-2"><Maximize size={16} className="text-[#a8adaa]" /> {tripData.difficulty}</div>
                <div className="flex items-center gap-2"><Users size={16} className="text-[#a8adaa]" /> Small Group</div>
                {/* Share button pushed right */}
                <div className="ml-auto flex items-center gap-2 cursor-pointer hover:text-[#2B5353] transition-colors"><ArrowRight size={16} /> Share</div>
              </div>
            </div>

            {/* Overview */}
            <div>
              <h3 className="text-2xl font-serif text-[#2C332F] mb-4">Overview</h3>
              <p className="text-[#666B68] leading-relaxed text-[15px]">
                {tripData.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div>
              <h3 className="text-2xl font-serif text-[#2C332F] mb-4">Trip Amenities</h3>
              <p className="text-[#666B68] text-[15px] mb-6">Experience premium comfort and safety on every step of your journey with these included amenities.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {tripData.amenities.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-[14px] font-semibold text-[#444A46]">
                    <div className="w-10 h-10 rounded-xl border border-[#ececea] flex items-center justify-center text-[#8e9591] shrink-0">
                      {item.icon}
                    </div>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Rules / Included & Excluded */}
            <div>
              <h3 className="text-2xl font-serif text-[#2C332F] mb-6">Booking Rules</h3>
              <div className="flex flex-col md:flex-row gap-8">
                {/* Included */}
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-[#2C332F] mb-4">Included</h4>
                  <ul className="space-y-3">
                    {tripData.rules.included.map((rule: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-[#666B68] text-[15px]">
                        <CheckCircle2 size={18} className="text-[#cDAE74] shrink-0 mt-0.5" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Excluded */}
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-[#2C332F] mb-4">Excluded</h4>
                  <ul className="space-y-3">
                    {tripData.rules.excluded.map((rule: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-[#666B68] text-[15px]">
                        <CheckCircle2 size={18} className="text-[#cDAE74] shrink-0 mt-0.5" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Location Map */}
            <div>
              <h3 className="text-2xl font-serif text-[#2C332F] mb-6">Location</h3>
              <div className="w-full h-[400px] rounded-3xl overflow-hidden border border-[#ececea]">
                <iframe
                  src={tripData.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale-[30%]"
                ></iframe>
              </div>
            </div>

          </div>


          <div className="w-full lg:w-[35%] relative">
            <div className="sticky top-10 bg-white border border-[#ececea] rounded-3xl p-8 shadow-md">
              <h3 className="text-2xl font-serif text-[#2C332F] mb-8">Book Tour</h3>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-sm font-semibold text-[#444A46]">

                <div className="flex flex-col gap-2">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Ex. John Doe"
                    onChange={handleChange}
                    className="w-full border border-[#ececea] rounded-lg px-4 py-3 outline-none focus:border-[#2B5353] font-normal text-[15px] placeholder-[#a8adaa]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="Enter Phone Number"
                    onChange={handleChange}
                    className="w-full border border-[#ececea] rounded-lg px-4 py-3 outline-none focus:border-[#2B5353] font-normal text-[15px] placeholder-[#a8adaa]"
                  />
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label>Start Date *</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="checkIn"
                      required
                      onChange={handleChange}
                      className="w-full border border-[#ececea] rounded-lg px-4 py-3 outline-none focus:border-[#2B5353] font-normal text-[15px] text-[#2C332F] uppercase tracking-wider"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label>End Date *</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="checkOut"
                      required
                      onChange={handleChange}
                      className="w-full border border-[#ececea] rounded-lg px-4 py-3 outline-none focus:border-[#2B5353] font-normal text-[15px] text-[#2C332F] uppercase tracking-wider"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label>Adults *</label>
                  <select
                    name="adults"
                    onChange={handleChange}
                    className="w-full border border-[#ececea] rounded-lg px-4 py-3 outline-none focus:border-[#2B5353] font-normal text-[15px] bg-white appearance-none cursor-pointer"
                  >
                    <option>1 Adult</option>
                    <option>2 Adults</option>
                    <option>3+ Adults</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label>Children *</label>
                  <select
                    name="children"
                    onChange={handleChange}
                    className="w-full border border-[#ececea] rounded-lg px-4 py-3 outline-none focus:border-[#2B5353] font-normal text-[15px] bg-white appearance-none cursor-pointer"
                  >
                    <option>Select</option>
                    <option>0 Children</option>
                    <option>1 Child</option>
                    <option>2+ Children</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#2B5353] hover:bg-[#1f3d3d] text-white rounded-xl py-4 mt-4 font-bold tracking-wide transition-colors"
                >
                  {isSubmitting ? "Processing..." : "Book Now"}
                </button>

              </form>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}