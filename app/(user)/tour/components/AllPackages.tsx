"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  PawPrint,
  Building2,
  ArrowRight,
  CalendarCheck,
  UserCheck,
  ShieldCheck,
  Tag,
  Headphones,
  Star,
  CheckCircle2,
} from "lucide-react";
import { daysLabel, type TourPackage } from "../../data/packages";

interface AllPackagesProps {
  title?: string;
  packages: TourPackage[];
  onSelectPackage: (id: string) => void;
}

export default function AllPackages({ title = "Our Safari Packages", packages, onSelectPackage }: AllPackagesProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    preferredDate: "",
    guests: "2 Guests",
    tripStyle: "",
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };


  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-neutral-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Package List (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Title & Subtitle */}
          <div className="space-y-1 mb-6">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#11241A]">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              {packages.length} {packages.length === 1 ? "package" : "packages"} · Choose from our handpicked tours or get a custom itinerary tailored to your dreams.
            </p>
          </div>

          {/* Horizontal Package Cards List */}
          <div className="space-y-5">
            {packages.length === 0 && (
              <p className="text-sm text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-2xl p-6 text-center">
                No packages in this category yet.
              </p>
            )}
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-stretch"
              >
                {/* Left: Image Container */}
                <div className="relative w-full sm:w-64 lg:w-72 h-52 sm:h-auto flex-shrink-0 overflow-hidden bg-neutral-100">
                  {pkg.image && (
                    <Image
                      src={pkg.image}
                      alt={pkg.title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Badge */}
                  {pkg.badge && (
                    <div className="absolute top-3 left-3 z-10 bg-[#0B1E14] text-emerald-400 text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded">
                      {pkg.badge}
                    </div>
                  )}
                </div>

                {/* Middle: Information details */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-[#11241A] group-hover:text-[#B28236] transition-colors mb-1.5">
                      {pkg.title}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium mb-2.5">
                      <MapPin className="w-3.5 h-3.5 text-[#B28236]" />
                      <span>{pkg.location}</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-2">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Bottom Specs Row */}
                  <div className="flex items-center gap-4 pt-3 border-t border-neutral-100 text-[11px] sm:text-xs text-neutral-500 font-medium flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#B28236]" />
                      <span>{daysLabel(pkg)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <PawPrint className="w-3.5 h-3.5 text-[#B28236]" />
                      <span>{pkg.tripType}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#B28236]" />
                      <span>{pkg.lodging}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Price & CTA */}
                <div className="w-full sm:w-44 p-5 sm:p-6 flex flex-col justify-center items-start sm:items-end border-t sm:border-t-0 sm:border-l border-neutral-100 bg-neutral-50/50 flex-shrink-0">
                 
                  <button
                    onClick={() => onSelectPackage(pkg.id)}
                    className="w-full sm:w-auto bg-[#B28236] hover:bg-[#966B2A] text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Form Card: Plan Your Safari */}
          <div className="bg-[#0B1E14] text-white rounded-2xl p-6 shadow-xl border border-emerald-950 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B28236]/20 text-[#B28236] flex items-center justify-center flex-shrink-0 mt-0.5">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-white">
                  Plan Your Safari
                </h3>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Get a personalized quote and start your journey today.
                </p>
              </div>
            </div>

            {formSubmitted ? (
              <div className="bg-emerald-900/60 border border-emerald-500/40 rounded-xl p-4 text-center text-xs text-emerald-200 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="font-semibold text-white">Enquiry Received!</p>
                <p>Our safari experts will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-200 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full bg-white text-neutral-900 placeholder:text-neutral-400 border border-neutral-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#B28236]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-200 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-white text-neutral-900 placeholder:text-neutral-400 border border-neutral-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#B28236]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-200 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) =>
                      setFormData({ ...formData, preferredDate: e.target.value })
                    }
                    className="w-full bg-white text-neutral-900 border border-neutral-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#B28236]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-200 mb-1">
                    Number of Guests *
                  </label>
                  <select
                    value={formData.guests}
                    onChange={(e) =>
                      setFormData({ ...formData, guests: e.target.value })
                    }
                    className="w-full bg-white text-neutral-900 border border-neutral-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#B28236]"
                  >
                    <option value="1 Guest">1 Guest</option>
                    <option value="2 Guests">2 Guests</option>
                    <option value="3-5 Guests">3 - 5 Guests</option>
                    <option value="6+ Guests">6+ Guests (Group)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-200 mb-1">
                    Preferred Trip Style *
                  </label>
                  <select
                    value={formData.tripStyle}
                    onChange={(e) =>
                      setFormData({ ...formData, tripStyle: e.target.value })
                    }
                    className="w-full bg-white text-neutral-900 border border-neutral-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#B28236]"
                  >
                    <option value="">Select trip style</option>
                    <option value="Gorilla Trekking">Gorilla Trekking</option>
                    <option value="Wildlife Safari">Wildlife Safari</option>
                    <option value="Luxury Escape">Luxury Escape</option>
                    <option value="Cultural Tour">Cultural Tour</option>
                    <option value="Tailor-Made Custom">Tailor-Made Custom</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#C29B47] to-[#A0782A] hover:from-[#A0782A] hover:to-[#835E1C] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>SEND ENQUIRY</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Card 2: Trust Features 2x2 Grid */}
          <div className="bg-[#0B1E14] text-white rounded-2xl overflow-hidden border border-emerald-950 p-4">
            <div className="grid grid-cols-2 divide-x divide-y divide-emerald-900/60 text-center">
              <div className="p-4 flex flex-col items-center justify-center space-y-1.5">
                <UserCheck className="w-5 h-5 text-[#B28236]" />
                <span className="text-[11px] font-semibold leading-tight text-neutral-200">
                  Professional Safari Guides
                </span>
              </div>
              <div className="p-4 flex flex-col items-center justify-center space-y-1.5">
                <ShieldCheck className="w-5 h-5 text-[#B28236]" />
                <span className="text-[11px] font-semibold leading-tight text-neutral-200">
                  Safe & Reliable Travel
                </span>
              </div>
              <div className="p-4 flex flex-col items-center justify-center space-y-1.5">
                <Tag className="w-5 h-5 text-[#B28236]" />
                <span className="text-[11px] font-semibold leading-tight text-neutral-200">
                  Best Price Guarantee
                </span>
              </div>
              <div className="p-4 flex flex-col items-center justify-center space-y-1.5">
                <Headphones className="w-5 h-5 text-[#B28236]" />
                <span className="text-[11px] font-semibold leading-tight text-neutral-200">
                  24/7 Support
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Dream Safari Banner */}
          <div className="relative rounded-2xl overflow-hidden h-56 shadow-md flex items-end p-6 text-white bg-neutral-900">
            <Image
              src="https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&auto=format&fit=crop&q=80"
              alt="Male Lion"
              fill
              className="object-cover filter brightness-[0.7]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] font-bold tracking-widest uppercase text-amber-300 block">
                NATURE | WILDLIFE | CULTURE
              </span>
              <h4 className="text-xl font-serif font-bold text-white leading-tight">
                Your Dream Safari Awaits
              </h4>
              <Link
                href="/destination"
                className="w-fit bg-[#B28236] hover:bg-[#966B2A] text-white text-[11px] font-bold tracking-wider uppercase px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>EXPLORE DESTINATIONS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 4: Testimonial Card */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/90 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
                alt="Sarah M."
                className="w-12 h-12 rounded-full object-cover border-2 border-[#B28236]"
              />
              <div>
                <p className="text-xs font-serif italic text-neutral-700 leading-snug">
                  &ldquo;Acacia Safaris made our trip unforgettable! From the gorillas to the beaches, everything was perfectly planned. Highly recommended!&rdquo;
                </p>
                <p className="text-xs font-bold text-[#11241A] mt-1.5">— Sarah M.</p>
              </div>
            </div>
            <div className="flex items-center gap-1 pt-1 border-t border-neutral-100">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
