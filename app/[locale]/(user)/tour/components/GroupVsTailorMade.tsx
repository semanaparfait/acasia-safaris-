"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Users,
  Compass,
  Check,
  X,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  DollarSign,
  Car,
  HeartHandshake,
  CheckCircle2,
  Mail,
  Sliders,
  UserCheck,
} from "lucide-react";

export default function GroupVsTailorMade() {
  const [activeTab, setActiveTab] = useState<"group" | "tailor">("group");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    travelType: "Tailor-Made Custom",
    guests: "2 Guests",
    dates: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const sampleGroupSchedule = [
    { tour: "7-Day Gorilla & Wildlife", date: "Oct 15 - Oct 21", price: "$2,450", seats: "2 Seats Left" },
    { tour: "5-Day Classic Big Five", date: "Nov 02 - Nov 06", price: "$1,850", seats: "4 Seats Left" },
    { tour: "7-Day Zanzibar & Safari", date: "Nov 18 - Nov 24", price: "$2,980", seats: "Available" },
    { tour: "8-Day Rwanda Adventure", date: "Dec 05 - Dec 12", price: "$2,750", seats: "3 Seats Left" },
  ];

  const sample7DayItinerary = [
    { day: 1, title: "Arrival & Safari Briefing", desc: "VIP welcome, vehicle assignment, and welcome dinner." },
    { day: 2, title: "Game Drive to National Reserve", desc: "Morning & afternoon game drive in custom 4x4 Land Cruiser." },
    { day: 3, title: "Full Day Big Cat Tracking", desc: "Sunrise tracking of lions, cheetahs, and leopards with expert guide." },
    { day: 4, title: "Crater Rim & Cultural Village", desc: "Scenic rim views followed by authentic local cultural dance performance." },
    { day: 5, title: "Primate Trekking / Lake Cruise", desc: "Guided forest trek or scenic boat cruise on Lake Ihema." },
    { day: 6, title: "Sunset Savannah Bush Dinner", desc: "Late afternoon game drive ending with a gourmet bush dinner." },
    { day: 7, title: "Souvenir Market & Airport Transfer", desc: "Final morning coffee, craft market shopping, and airport drop-off." },
  ];

  return (
    <section className="bg-[#FAF8F5] text-neutral-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Main Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">

          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-[#11241A] tracking-tight">
            Group Safaris vs. Tailor-Made Safaris
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            Whether you thrive on shared adventures with fellow travelers or prefer a completely bespoke private itinerary built around your pace and preferences, find the perfect fit below.
          </p>
        </div>

        {/* Primary Side-by-Side Cards matching User Reference Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* CARD 1: GROUP SAFARIS */}
          <div className="bg-white rounded-3xl overflow-hidden border border-neutral-200/90 shadow-md flex flex-col justify-between hover:shadow-xl transition duration-300">
            <div>
              {/* Header Banner */}
              <div className="bg-[#0B1E14] text-white p-5 text-center border-b border-emerald-950">
                <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-wide uppercase">
                  GROUP SAFARIS
                </h2>
                <p className="text-xs text-amber-300 font-medium tracking-wider uppercase mt-0.5">
                  (Fixed Departures)
                </p>
              </div>

              {/* Split Image Banner */}
              <div className="grid grid-cols-2 h-44 sm:h-52 w-full overflow-hidden relative">
                <div className="relative h-full w-full border-r border-white/20">
                  <Image
                    src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop&q=80"
                    alt="4x4 Safari Land Cruiser"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-full w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&auto=format&fit=crop&q=80"
                    alt="Group of Travelers on Safari"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                  {/* Left Bullet List */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Key Highlights:
                    </h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-neutral-700 font-medium">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                        <span>Cost-effective shared rates</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                        <span>Social & friendly atmosphere</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                        <span>Pre-planned fixed itineraries</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                        <span>Ideal for singles & couples</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                        <span>Small groups (Max 6 per vehicle)</span>
                      </li>
                    </ul>
                  </div>

                  {/* Right Schedule Table Box */}
                  <div className="bg-[#FAF8F5] border border-neutral-200/80 rounded-2xl p-4 text-xs space-y-2.5">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                      <span className="font-bold text-[#11241A] uppercase tracking-wider text-[11px]">
                        Upcoming Departures
                      </span>
                      <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                        2026/2027
                      </span>
                    </div>

                    <div className="space-y-2">
                      {sampleGroupSchedule.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] py-1 border-b border-neutral-100 last:border-0">
                          <div>
                            <span className="font-bold text-[#11241A] block">{s.tour}</span>
                            <span className="text-[10px] text-neutral-500">{s.date}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-800 block">{s.price}</span>
                            <span className="text-[9px] text-neutral-400">{s.seats}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer Button */}
            <div className="p-6 sm:p-8 pt-0">
              <button
                onClick={() => setActiveTab("group")}
                className="w-full bg-[#11241A] hover:bg-[#1b3d2f] text-white py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>EXPLORE GROUP DEPARTURES</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CARD 2: TAILOR-MADE SAFARIS */}
          <div className="bg-[#11241A] text-white rounded-3xl overflow-hidden border border-emerald-950 shadow-xl flex flex-col justify-between hover:shadow-2xl transition duration-300">
            <div>
              {/* Header Banner */}
              <div className="bg-[#07150D] text-white p-5 text-center border-b border-emerald-900">
                <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-wide uppercase">
                  TAILOR-MADE SAFARIS
                </h2>
                <p className="text-xs text-amber-300 font-medium tracking-wider uppercase mt-0.5">
                  (Private & Bespoke)
                </p>
              </div>

              {/* Split Image Banner */}
              <div className="grid grid-cols-2 h-44 sm:h-52 w-full overflow-hidden relative">
                <div className="relative h-full w-full border-r border-white/20">
                  <Image
                    src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80"
                    alt="Private Couple on Safari"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-full w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&auto=format&fit=crop&q=80"
                    alt="Private Guide with Guests"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Bespoke Privileges:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-neutral-200 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>100% customizable itinerary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>Flexible travel dates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>Private guide & 4x4 vehicle</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>Exclusive lodge selection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>Perfect for families & honeymoons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>Custom pace & dietary preferences</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0B1E14] border border-emerald-900 rounded-2xl p-4 text-xs text-neutral-300 space-y-1">
                  <span className="font-bold text-amber-300 block uppercase tracking-wider text-[11px]">
                    Private Concierge Assurance
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Enjoy complete control over your daily wake-up times, meal schedules, lodge choices, and specialized activities like helicopter flights or private photography drives.
                  </p>
                </div>
              </div>
            </div>

            {/* Card Footer Button */}
            <div className="p-6 sm:p-8 pt-0">
              <button
                onClick={() => setActiveTab("tailor")}
                className="w-full bg-gradient-to-r from-[#C29B47] to-[#A0782A] hover:from-[#A0782A] hover:to-[#835E1C] text-white py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>START PLANNING YOUR CUSTOM ITINERARY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: Side-by-Side Comparison Matrix Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-serif font-bold text-[#11241A]">
              Feature Comparison Matrix
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Detailed side-by-side comparison to help you choose your ideal travel style.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-neutral-700">
              <thead className="bg-[#0B1E14] text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 rounded-tl-xl">Feature / Attribute</th>
                  <th className="p-4">Group Safaris (Shared)</th>
                  <th className="p-4 rounded-tr-xl">Tailor-Made Safaris (Private)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80">
                <tr className="hover:bg-neutral-50">
                  <td className="p-4 font-bold text-[#11241A]">Safari Vehicle & Guide</td>
                  <td className="p-4">Shared 4x4 Land Cruiser (Max 6 guests)</td>
                  <td className="p-4 font-semibold text-emerald-800">100% Private vehicle & dedicated guide</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="p-4 font-bold text-[#11241A]">Departure Dates</td>
                  <td className="p-4">Pre-scheduled set departure dates</td>
                  <td className="p-4 font-semibold text-emerald-800">100% Flexible — start any day of the year</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="p-4 font-bold text-[#11241A]">Accommodation Choice</td>
                  <td className="p-4">Pre-selected boutique lodges & eco-camps</td>
                  <td className="p-4 font-semibold text-emerald-800">Choose from Luxury, Mid-Range, or Private Villas</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="p-4 font-bold text-[#11241A]">Daily Pace & Schedule</td>
                  <td className="p-4">Structured itinerary shared with group</td>
                  <td className="p-4 font-semibold text-emerald-800">100% Custom — wake up & explore at your pace</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="p-4 font-bold text-[#11241A]">Pricing & Value</td>
                  <td className="p-4 font-semibold text-emerald-800">Maximum value (shared vehicle & guide costs)</td>
                  <td className="p-4">Bespoke pricing based on lodge choices</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: 7-Day Sample Itinerary Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B28236] block">
                7-Day Itinerary Preview
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#11241A]">
                What a 7-Day Expedition Looks Like
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("group")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  activeTab === "group"
                    ? "bg-[#11241A] text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                Group Safari Format
              </button>
              <button
                onClick={() => setActiveTab("tailor")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  activeTab === "tailor"
                    ? "bg-[#B28236] text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                Tailor-Made Format
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {sample7DayItinerary.map((item) => (
              <div
                key={item.day}
                className="bg-[#FAF8F5] p-4 rounded-2xl border border-neutral-200/70 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <span className="w-7 h-7 rounded-full bg-[#11241A] text-white font-bold text-xs flex items-center justify-center mb-2">
                    {item.day}
                  </span>
                  <h3 className="font-serif font-bold text-xs text-[#11241A] leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-1 line-clamp-3 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-neutral-200/60 text-[9px] font-semibold text-emerald-800 uppercase">
                  {activeTab === "group" ? "Set Group Departure" : "Private Dedicated Guide"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: Interactive Custom Safari Enquiry Form */}
        <div className="bg-[#0B1E14] text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-emerald-950 space-y-6">
          <div className="max-w-2xl text-left space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 block">
              GET A CUSTOM SAFARI QUOTE
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              Ready to Plan Your East African Expedition?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Tell us whether you'd like to join an upcoming small group departure or design a 100% tailor-made private safari. Our team will send your custom itinerary within 24 hours.
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-900/60 border border-emerald-500/40 rounded-2xl p-6 text-center text-sm text-emerald-200 space-y-2 max-w-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-white text-base">Inquiry Submitted Successfully!</p>
              <p className="text-xs text-neutral-300">
                Our safari travel specialists will contact you with your custom proposal.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-200 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white text-neutral-900 placeholder:text-neutral-400 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#B28236]"
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white text-neutral-900 placeholder:text-neutral-400 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#B28236]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-200 mb-1">
                  Travel Option *
                </label>
                <select
                  value={formData.travelType}
                  onChange={(e) => setFormData({ ...formData, travelType: e.target.value })}
                  className="w-full bg-white text-neutral-900 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#B28236]"
                >
                  <option value="Tailor-Made Custom">Tailor-Made Custom Safari</option>
                  <option value="Small Group Departure">Small Group Departure</option>
                  <option value="Not Sure Yet">Not Sure — Need Advice</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#C29B47] to-[#A0782A] hover:from-[#A0782A] hover:to-[#835E1C] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>SEND SAFARI REQUEST</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}