"use client";
import React, { useState } from "react";
import { GiGorilla, GiElephant, GiMountainRoad } from "react-icons/gi";
import { FaUsers, FaGem } from "react-icons/fa";
import { PiPawPrintFill } from "react-icons/pi";
import Image from "next/image";
import GorillaTrekking from "@/app/(user)/tour/components/GorillaTrekking";
import WildlifeSafaris from "@/app/(user)/tour/components/WildLifeSafaris";
import CulturalTours from "@/app/(user)/tour/components/CulturalTours";
import LuxuryEscapes from "@/app/(user)/tour/components/LuxuryEscapes";
import GroupVsTailorMade from "@/app/(user)/tour/components/GroupVsTailorMade";
import AllPackages from "@/app/(user)/tour/components/AllPackages";

export default function page() {
  const [activePackage, setActivePackage] = useState("All Packages");

  const heroContent: Record<
    string,
    { tag: string; title: string; subtitle: string; description: string; image: string }
  > = {
    "All Packages": {
      tag: "EXTRAORDINARY JOURNEYS",
      title: "Safari Packages",
      subtitle: "Wildlife, Culture, Adventure & Luxury",
      description:
        "From the vast savannas to the hidden gems of East Africa, our safari packages are designed to give you unforgettable experiences in the heart of nature.",
      image:
        "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=2200&auto=format&fit=crop&q=85",
    },
    "Gorilla Trekking": {
      tag: "PRIMATE ENCOUNTERS",
      title: "Gorilla Trekking Safaris",
      subtitle: "Face-to-Face with Mountain Gorillas in the Mist",
      description:
        "Embark on an unforgettable trek into the ancient bamboo forests of Volcanoes and Bwindi. Stand feet away from endangered mountain gorillas in their wild sanctuary.",
      image:
        "https://i.pinimg.com/1200x/e9/c3/52/e9c352c52a8ce750ec2aa30acecabb3c.jpg",
    },
    "Wildlife Safari": {
      tag: "SAVANNA & BIG FIVE",
      title: "Classic Wildlife Safaris",
      subtitle: "Witness the Great Migration & Iconic Predators",
      description:
        "Traverse the iconic Serengeti, Maasai Mara, and Ngorongoro Crater. Experience private game drives, river crossings, and pristine wilderness.",
      image:
        "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=2200&auto=format&fit=crop&q=85",
    },
    "Luxury Escapes": {
      tag: "EXCLUSIVE SANCTUARIES",
      title: "Luxury Safari Escapes",
      subtitle: "World-Class Lodges & Bespoke Wilderness Luxury",
      description:
        "Indulge in private heated plunge pools, dedicated butler service, helicopter transfers, and fine dining under stars at East Africa's finest luxury lodges.",
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=2200&auto=format&fit=crop&q=85",
    },
    "Cultural Tours": {
      tag: "HERITAGE & COMMUNITY",
      title: "Cultural Experiences",
      subtitle: "Connect with Vibrant Traditions & Local Communities",
      description:
        "Immerse in royal Intore warrior drum dances, craft workshops, coffee masterclasses, and meaningful cultural exchanges with East African communities.",
      image:
        "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=2200&auto=format&fit=crop&q=85",
    },
    "Group vs Tailor made": {
      tag: "BESPOKE & GROUP EXPEDITIONS",
      title: "Small Group vs Tailor-Made",
      subtitle: "Your Journey, Designed Exactly Your Way",
      description:
        "Choose between friendly small group departures with pre-scheduled dates or a 100% custom-crafted private safari with your own vehicle and guide.",
      image:
        "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=2200&auto=format&fit=crop&q=85",
    },
  };

  const currentHero = heroContent[activePackage] || heroContent["All Packages"];

  const TourPackages = [
    {
      id: 1,
      icon: PiPawPrintFill,
      name: "All Packages",
    },
    {
      id: 2,
      icon: GiGorilla,
      name: "Gorilla Trekking",
    },
    {
      id: 3,
      icon: GiElephant,
      name: "Wildlife Safari",
    },
    {
      id: 4,
      icon: FaGem,
      name: "Luxury Escapes",
    },
    {
      id: 5,
      icon: GiMountainRoad,
      name: "Cultural Tours",
    },
    {
      id: 6,
      icon: FaUsers,
      name: "Group vs Tailor made",
    },
  ];

  return (
    <section>
      {/* Hero Section */}
      <section className="relative h-[480px] w-full flex items-center overflow-hidden">
        {/* Dynamic Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            key={currentHero.image}
            src={currentHero.image}
            alt={currentHero.title}
            fill
            priority
            className="object-cover object-center filter brightness-[0.70] transition-all duration-700 ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 w-full text-white">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D4AF37] block mb-2 transition-all duration-300">
            {currentHero.tag}
          </span>
          <h1 className="text-3xl  md:text-5xl font-serif font-bold tracking-tight leading-tight mb-2 transition-all duration-300">
            {currentHero.title}
          </h1>
          <p className="text-lg sm:text-2xl font-serif text-amber-100 font-light mb-4 transition-all duration-300">
            {currentHero.subtitle}
          </p>
          <p className="text-xs sm:text-base text-zinc-200 font-light max-w-xl leading-relaxed mb-6 transition-all duration-300">
            {currentHero.description}
          </p>
          <a
            href="#package-section"
            className="inline-flex items-center gap-2 bg-[#B28236] hover:bg-[#966B2A] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-lg transition-colors shadow-md"
          >
            <span>EXPLORE PACKAGES</span>
            <span>→</span>
          </a>
        </div>
      </section>

      {/* Category Filter Pills */}
      <div id="package-section" className="bg-neutral-50/80 border-b border-neutral-200/80 py-5 px-4">
        <div className="flex gap-2.5 items-center justify-center flex-wrap max-w-7xl mx-auto">
          {TourPackages.map((pkg) => {
            const isActive = activePackage === pkg.name;
            return (
              <button
                key={pkg.id}
                onClick={() => setActivePackage(pkg.name)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 cursor-pointer transition-all duration-200 text-xs font-medium ${
                  isActive
                    ? "bg-[#0B1E14] text-white border-[#0B1E14] shadow-sm"
                    : "bg-white text-neutral-700 border-neutral-300 hover:border-[#0B1E14] hover:text-[#0B1E14]"
                }`}
              >
                <div className={isActive ? "text-emerald-400" : "text-emerald-800"}>
                  {pkg.icon && <pkg.icon className="text-sm" />}
                </div>
                <span>{pkg.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activePackage === "All Packages" && (
        <AllPackages onSelectCategory={setActivePackage} />
      )}
      {activePackage === "Gorilla Trekking" && <GorillaTrekking />}
      {activePackage === "Wildlife Safari" && <WildlifeSafaris />}
      {activePackage === "Luxury Escapes" && <LuxuryEscapes />}
      {activePackage === "Cultural Tours" && <CulturalTours />}
      {activePackage === "Group vs Tailor made" && <GroupVsTailorMade />}
    </section>
  );
}
