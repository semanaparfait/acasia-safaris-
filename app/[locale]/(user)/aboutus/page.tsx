"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
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
import TeamSection from "../components/TeamSection";
import { useTranslations } from "next-intl";
import shema from "@/public/aboutus/shema.jpeg";
import yassel from "@/public/aboutus/yassel.jpeg";

export default function AboutPage() {
  const t = useTranslations("About");
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#222a24] px-5 font-sans antialiased selection:bg-[#c5a86d] selection:text-white">
      {/* 2. HERO SECTION */}

      <section className="relative h-[400px]  w-full flex items-center justify-center overflow-hidden">
        {/* Background Landscape with Virunga Volcanic Mist */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=2200&q=85"
            alt={t("heroAlt")}
            fill
            priority
            className="object-cover object-center filter brightness-[0.78]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-white text-center md:text-left">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#d4b47c] block mb-3">
            {t("eyebrow")}
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif uppercase tracking-tight leading-[1.1] mb-5 max-w-4xl">
            {t("title1")} <br />
            {t("title2")}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-zinc-200 font-light max-w-2xl leading-relaxed mb-6">
            {t("subtitle")}
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
                alt={t("foundersAlt")}
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
                    {t("ceo")}
                  </p>
                </div>
                <div className="bg-[#faf8f5]/95 backdrop-blur-md px-4 py-2 rounded-md shadow-md">
                  <p className="text-xs font-serif font-bold text-[#1c2e22]">
                    ISHIMWE Yassel
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                    {t("md")}
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
              {t("storyTag")}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1c2e22] leading-tight">
              {t("storyTitle1")}{" "}
              <span className="italic font-normal">{t("storyTitle2")}</span>
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-[#4f5951] leading-relaxed font-light">
              <p>
                {t.rich("story1", { b: (chunks) => <strong>{chunks}</strong> })}
              </p>
              <p>
                {t("story2")}
              </p>
              <p>
                {t("story3")}
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
                {t("foundersTag")}
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#1c2e22] leading-tight">
                {t("foundersTitle1")} <br />
                {t("foundersTitle2")}
              </h2>
              <p className="text-sm text-[#4f5951] leading-relaxed font-light">
                {t("foundersText")}
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
                    {t("ceo")}
                  </p>
                  <p className="text-xs italic text-[#586259] leading-relaxed">
                    {`“${t("quoteShema")}”`}
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
                    {t("md")}
                  </p>
                  <p className="text-xs italic text-[#586259] leading-relaxed">
                    {`“${t("quoteYassel")}”`}
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
              {t("whyTag")}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#1c2e22]">
              {t("whyTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              {
                icon: Compass,
                title: t("why.local.title"),
                desc: t("why.local.desc"),
              },
              {
                icon: Map,
                title: t("why.tailored.title"),
                desc: t("why.tailored.desc"),
              },
              {
                icon: Leaf,
                title: t("why.responsible.title"),
                desc: t("why.responsible.desc"),
              },
              {
                icon: ShieldCheck,
                title: t("why.seamless.title"),
                desc: t("why.seamless.desc"),
              },
              {
                icon: Users,
                title: t("why.small.title"),
                desc: t("why.small.desc"),
              },
              {
                icon: Binoculars,
                title: t("why.authentic.title"),
                desc: t("why.authentic.desc"),
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

      {/* 8. MEET THE TEAM BEHIND ACACIA SAFARIS (workers marked "Show on website" in Admin > Workers) */}

      <TeamSection />

      {/* 9. OUR JOURNEY (TIMELINE) */}

<section className="py-20 px-6 bg-[#f4efe6] border-y border-[#e5ded0]">
  <div className="max-w-7xl mx-auto">
    <div className="mb-14 space-y-1">
      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8e7345]">
        {t("journeyTag")}
      </span>

      <h2 className="text-2xl sm:text-3xl font-serif text-[#1c2e22]">
        {t("journeyTitle")}
      </h2>

      <p className="text-sm text-[#5e6960] max-w-2xl leading-relaxed mt-3">
        {t("journeyText")}
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
            title: t("timeline.expansion.title"),
            text: t("timeline.expansion.text"),
          },
          {
            year: "2024",
            title: t("timeline.crossBorder.title"),
            text: t("timeline.crossBorder.text"),
          },
          {
            year: "2025",
            title: t("timeline.portfolio.title"),
            text: t("timeline.portfolio.text"),
          },
          {
            year: "2026",
            title: t("timeline.growth.title"),
            text: t("timeline.growth.text"),
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
          {t("todayTag")}
        </span>

        <h3 className="mt-1 text-xl font-serif text-[#1c2e22]">
          {t("todayTitle")}
        </h3>
      </div>

      <p className="text-sm text-[#5e6960] max-w-xl leading-relaxed">
        {t("todayText")}
      </p>
    </div>
  </div>
</section>

      {/* 12. FINAL CTA BANNER ("Your East African Story Starts Here") */}

      <section className="relative py-10 px-6 text-white text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2000&q=80"
            alt={t("ctaAlt")}
            fill
            className="object-cover filter brightness-[0.4]"
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-4xl font-serif">
            {t("ctaTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 font-light">
            {t("ctaText")}
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#d4b47c] hover:bg-[#c2a167] text-[#1c2e22] text-xs font-semibold uppercase tracking-wider px-7 py-3 rounded-full transition-all shadow-lg"
            >
              <span>{t("ctaButton")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
