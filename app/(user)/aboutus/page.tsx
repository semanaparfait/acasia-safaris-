"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Map,
  Leaf,
  ShieldCheck,
  Users,
  Binoculars,
} from "lucide-react";
import founders from "@/public/aboutus/founders.png";
import shema from "@/public/aboutus/shema.jpeg";
import yassel from "@/public/aboutus/yassel.jpeg";
import semana from "@/public/aboutus/semana.jpeg";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#222a24] px-5 font-sans antialiased selection:bg-[#c5a86d] selection:text-white">
      {/* 2. HERO SECTION */}

      <section className="relative h-[400px]  w-full flex items-center justify-center overflow-hidden">
        {/* Background Landscape with Virunga Volcanic Mist */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=2200&q=85"
            alt="East Africa volcanic landscape with mist"
            fill
            priority
            className="object-cover object-center filter brightness-[0.78]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-white text-center md:text-left">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#d4b47c] block mb-3">
            ABOUT US
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif uppercase tracking-tight leading-[1.1] mb-5 max-w-4xl">
            ROOTED IN EAST AFRICA, <br />
            DRIVEN BY CONSERVATION.
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-zinc-200 font-light max-w-2xl leading-relaxed mb-6">
            Creating extraordinary, luxury safaris while protecting the wild
            spaces we call home.
          </p>
          <div className="w-20 h-0.5 bg-[#d4b47c]" />
        </div>
      </section>

      {/* 3. OUR STORY & LOCAL EXPERTISE */}

      <section className="py-20 md:py-28 px-6 bg-[#faf8f5] relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Founders Image Composition */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] bg-zinc-900">
              <Image
                src={founders}
                alt="SHEMA Alain and ISHIMWE Yassel by Acacia Safari Cruiser"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Floating badges on image */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                <div className="bg-[#faf8f5]/95 backdrop-blur-md px-4 py-2 rounded-md shadow-md">
                  <p className="text-xs font-serif font-bold text-[#1c2e22]">
                    SHEMA Alain
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                    CEO & Founder
                  </p>
                </div>
                <div className="bg-[#faf8f5]/95 backdrop-blur-md px-4 py-2 rounded-md shadow-md">
                  <p className="text-xs font-serif font-bold text-[#1c2e22]">
                    ISHIMWE Yassel
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                    MD & Founder
                  </p>
                </div>
              </div>
            </div>

            {/* Botanical Accent Icons on the side */}
            <div className="hidden sm:flex flex-col gap-2 absolute -right-6 top-1/2 -translate-y-1/2">
              <div className="w-10 h-10 rounded-lg bg-[#273a2c] flex items-center justify-center text-[#d4b47c] shadow-md">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#273a2c] flex items-center justify-center text-[#d4b47c] shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#273a2c] flex items-center justify-center text-[#d4b47c] shadow-md">
                <Binoculars className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Right: Narrative Story */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8e7345]">
              OUR STORY
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1c2e22] leading-tight">
              Our Story &amp;{" "}
              <span className="italic font-normal">Local Expertise</span>
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-[#4f5951] leading-relaxed font-light">
              <p>
                Founded by <strong>SHEMA Alain</strong> and{" "}
                <strong>ISHIMWE Yassel</strong>, ACACIA SAFARIS began with a
                shared vision to connect travelers with the raw, untouched
                beauty of East Africa.
              </p>
              <p>
                As native Rwandans, we built our company on intimate, firsthand
                knowledge, ensuring every journey is lived, not just toured.
              </p>
              <p>
                Our office in Kigali and on-the-ground team manage every
                logistical detail in-house, offering unparalleled local
                expertise and access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR FOUNDERS: TWO VISIONARIES. ONE MISSION. */}

      <section className="py-20 px-12 bg-[#f4efe6] border-y border-[#e5ded0]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Header & Intro */}
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8e7345]">
                OUR FOUNDERS
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#1c2e22] leading-tight">
                Two Visionaries. <br />
                One Mission.
              </h2>
              <p className="text-sm text-[#4f5951] leading-relaxed font-light">
                With a deep love for East Africa and a strong background in
                tourism, conservation, and community development, SHEMA Alain
                and ISHIMWE Yassel lead ACACIA SAFARIS with passion, integrity,
                and a long-term vision for a sustainable future.
              </p>
            </div>

            {/* Right: Two Founders Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* SHEMA Alain */}
              <div className="bg-[#faf8f5] p-6 rounded-xl border border-[#e5ded0] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4 bg-zinc-200">
                    <Image
                      src={shema}
                      alt="SHEMA Alain"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#1c2e22]">
                    SHEMA Alain
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-[#8e7345] font-medium mb-3">
                    CEO &amp; Founder
                  </p>
                  <p className="text-xs italic text-[#586259] leading-relaxed">
                    &ldquo;Tourism is more than travel — it&apos;s a powerful
                    force for conservation, community, and lasting
                    change.&rdquo;
                  </p>
                </div>
              </div>

              {/* ISHIMWE Yassel */}
              <div className="bg-[#faf8f5] p-6 rounded-xl border border-[#e5ded0] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4 bg-zinc-200">
                    <Image
                      src={yassel}
                      alt="ISHIMWE Yassel"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#1c2e22]">
                    ISHIMWE Yassel
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-[#8e7345] font-medium mb-3">
                    MD &amp; Founder
                  </p>
                  <p className="text-xs italic text-[#586259] leading-relaxed">
                    &ldquo;Our goal is to create meaningful experiences that
                    benefit people, wildlife, and future generations.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHY TRAVEL WITH US ("More Than a Trip — It's a Deeper Connection.") */}

      <section className="py-20 md:py-24 px-6 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8e7345]">
              WHY TRAVEL WITH US
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#1c2e22]">
              More Than a Trip — It&apos;s a Deeper Connection.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              {
                icon: Compass,
                title: "Local Expertise",
                desc: "Authentic knowledge and insider access across East Africa.",
              },
              {
                icon: Map,
                title: "Tailored Journeys",
                desc: "Custom itineraries for your unique interests and style.",
              },
              {
                icon: Leaf,
                title: "Responsible Travel",
                desc: "Supporting conservation, communities, and local economies.",
              },
              {
                icon: ShieldCheck,
                title: "Seamless Service",
                desc: "From planning to return, we handle every detail with care.",
              },
              {
                icon: Users,
                title: "Small-Group Experiences",
                desc: "More personal, more meaningful.",
              },
              {
                icon: Binoculars,
                title: "Authentic Encounters",
                desc: "Real people, real culture, real East Africa.",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-xl border border-[#ece4d6] text-center flex flex-col items-center justify-start hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-[#f4efe6] flex items-center justify-center text-[#1c2e22] mb-3">
                    <Icon className="w-5 h-5 text-[#8e7345]" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1c2e22] mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-[11px] text-[#5e6960] font-light leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. MEET THE TEAM BEHIND ACACIA SAFARIS */}

      <section className="py-20 px-6 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-baseline justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8e7345] block mb-1">
                OUR TEAM
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#1c2e22]">
                Meet the People Behind ACACIA SAFARIS
              </h2>
            </div>
            <Link
              href="/team"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#1c2e22] hover:text-[#8e7345] transition-colors"
            >
              Our Full Team <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {[
              {
                name: "SHEMA Alain",
                role: "CEO & Founder",
                img: shema,
              },
              {
                name: "ISHIMWE Yassel",
                role: "MD & Founder",
                img: yassel,
              },
              {
                name: " SEMANA Shema Parfait",
                role: "IT & Technology Lead",
                img: semana,
              },
              {
                name: "Operations Manager",
                role: "Trip Coordination",
                img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
              },
              {
                name: "Community Liaison",
                role: "Local Partnerships",
                img: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
              },
              {
                name: "Head Chef",
                role: "Culinary Excellence",
                img: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80",
              },
            ].map((member, idx) => (
              <div key={idx} className="space-y-2 text-center">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-zinc-200 border border-[#e5ded0]">
                  <Image
                    src={member.img}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xs font-serif font-bold text-[#1c2e22]">
                    {member.name}
                  </h3>
                  <p className="text-[10px] text-[#8e7345] uppercase tracking-wider font-medium">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. OUR JOURNEY (TIMELINE) */}

<section className="py-20 px-6 bg-[#f4efe6] border-y border-[#e5ded0]">
  <div className="max-w-7xl mx-auto">
    <div className="mb-14 space-y-1">
      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8e7345]">
        OUR JOURNEY
      </span>

      <h2 className="text-2xl sm:text-3xl font-serif text-[#1c2e22]">
        Growing Across East Africa.
      </h2>

      <p className="text-sm text-[#5e6960] max-w-2xl leading-relaxed mt-3">
        From expanding our Rwanda operations to developing seamless
        multi-destination experiences, our journey continues to be shaped by
        responsible tourism and meaningful travel.
      </p>
    </div>

    {/* Timeline */}
    <div className="relative">
      {/* Horizontal line */}
      <div className="hidden lg:block absolute top-[9px] left-0 right-0 h-0.5 bg-[#d6ccb8] z-0" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
        {[
          {
            year: "2024",
            title: "Strategic Expansion",
            text: "Acacia Safaris strengthened its East African footprint by expanding specialized travel experiences in Rwanda, with a strong focus on eco-tourism and primate tracking.",
          },
          {
            year: "2024",
            title: "Cross-Border Experiences",
            text: "New multi-day packages connected Uganda and Rwanda, creating seamless travel corridors for visitors combining gorilla trekking with regional wildlife experiences.",
          },
          {
            year: "2025",
            title: "Rwanda Portfolio Diversification",
            text: "Our Rwanda itineraries expanded across Volcanoes, Nyungwe and Akagera National Parks, offering gorilla and golden monkey trekking, chimpanzee experiences, canopy walks and Big Five safaris.",
          },
          {
            year: "2026",
            title: "Continued Growth & Impact",
            text: "Today, Acacia Safaris continues delivering tailored journeys across Rwanda and East Africa, with a growing focus on sustainable tourism, family holidays, birding and multi-destination adventures.",
          },
        ].map((step, idx) => (
          <div key={idx} className="space-y-4">
            {/* Timeline node */}
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full bg-[#8e7345] ring-4 ring-[#f4efe6] shrink-0" />

              <span className="text-sm font-bold font-serif text-[#1c2e22]">
                {step.year}
              </span>
            </div>

            {/* Content */}
            <div className="pl-0">
              <h3 className="text-sm font-bold text-[#1c2e22] mb-2">
                {step.title}
              </h3>

              <p className="text-xs text-[#5e6960] font-light leading-relaxed">
                {step.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Current focus */}
    <div className="mt-16 pt-8 border-t border-[#d6ccb8] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8e7345]">
          TODAY
        </span>

        <h3 className="mt-1 text-xl font-serif text-[#1c2e22]">
          Travel further. Travel responsibly.
        </h3>
      </div>

      <p className="text-sm text-[#5e6960] max-w-xl leading-relaxed">
        We continue to build authentic experiences that connect travelers with
        East Africa's wildlife, landscapes, communities and cultures while
        supporting a more sustainable future for the destinations we call home.
      </p>
    </div>
  </div>
</section>

      {/* 12. FINAL CTA BANNER ("Your East African Story Starts Here") */}

      <section className="relative py-10 px-6 text-white text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2000&q=80"
            alt="East Africa Elephants"
            fill
            className="object-cover filter brightness-[0.4]"
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-4xl font-serif">
            Your East African Story Starts Here
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 font-light">
            Let us design a custom safari that&apos;s personal, meaningful, and
            unforgettable.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#d4b47c] hover:bg-[#c2a167] text-[#1c2e22] text-xs font-semibold uppercase tracking-wider px-7 py-3 rounded-full transition-all shadow-lg"
            >
              <span>Request a Custom Safari</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
