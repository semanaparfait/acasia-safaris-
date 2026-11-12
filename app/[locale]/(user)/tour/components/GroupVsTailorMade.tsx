"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMessagesStore } from "@/store/messagesStore";
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
  const t = useTranslations("Compare");
  const sendMessage = useMessagesStore((s) => s.sendMessage);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
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

  // Saved as a message the team sees in Admin > Messages (in English for the team)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendError("");
    try {
      await sendMessage({
        name: formData.name,
        email: formData.email,
        subject: `Safari request: ${formData.travelType}`,
        body: [`Travel option: ${formData.travelType}`, `Guests: ${formData.guests}`, formData.notes].filter(Boolean).join("\n"),
        source: "Booking request",
      });
      setSubmitted(true);
    } catch (error) {
      setSendError((error as Error).message);
    } finally {
      setSending(false);
    }
  };

  // "Ask for the next dates": the request form below, with a small group chosen
  const askGroupDates = () => {
    setFormData((f) => ({ ...f, travelType: "Small Group Departure" }));
    document.getElementById("safari-request")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const sample7DayItinerary = [
    { day: 1 },
    { day: 2 },
    { day: 3 },
    { day: 4 },
    { day: 5 },
    { day: 6 },
    { day: 7 },
  ];

  return (
    <section className="bg-[#FAF8F5] text-neutral-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Main Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">

          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-[#11241A] tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            {t("intro")}
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
                  {t("group")}
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
                    alt={t("vehicleAlt")}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-full w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&auto=format&fit=crop&q=80"
                    alt={t("groupAlt")}
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
                      {t("highlights")}
                    </h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-neutral-700 font-medium">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                        <span>{t("groupPoints.cost")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                        <span>{t("groupPoints.social")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                        <span>{t("groupPoints.fixed")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                        <span>{t("groupPoints.singles")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                        <span>{t("groupPoints.small")}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Group departures: planned with travelers (no made-up dates or seats) */}
                  <div className="bg-[#FAF8F5] border border-neutral-200/80 rounded-2xl p-4 text-xs space-y-3">
                    <span className="font-bold text-[#11241A] uppercase tracking-wider text-[11px] block border-b border-neutral-200 pb-2">
                      {t("upcoming")}
                    </span>
                    <p className="text-[11px] leading-relaxed text-neutral-600">{t("onRequest")}</p>
                    <button
                      type="button"
                      onClick={askGroupDates}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#11241A]/20 px-3 py-2 text-[11px] font-semibold text-[#11241A] hover:border-[#11241A] transition-colors cursor-pointer"
                    >
                      {t("askDates")} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
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
                <span>{t("exploreGroup")}</span>
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
                  {t("tailor")}
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
                    alt={t("coupleAlt")}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-full w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&auto=format&fit=crop&q=80"
                    alt={t("guideAlt")}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    {t("privileges")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-neutral-200 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{t("tailorPoints.custom")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{t("tailorPoints.flexible")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{t("tailorPoints.private")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{t("tailorPoints.lodges")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{t("tailorPoints.families")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{t("tailorPoints.pace")}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0B1E14] border border-emerald-900 rounded-2xl p-4 text-xs text-neutral-300 space-y-1">
                  <span className="font-bold text-amber-300 block uppercase tracking-wider text-[11px]">
                    {t("concierge")}
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    {t("conciergeText")}
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
                <span>{t("startPlanning")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: Side-by-Side Comparison Matrix Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-serif font-bold text-[#11241A]">
              {t("matrix")}
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              {t("matrixText")}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-neutral-700">
              <thead className="bg-[#0B1E14] text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 rounded-tl-xl">{t("table.feature")}</th>
                  <th className="p-4">{t("table.groupCol")}</th>
                  <th className="p-4 rounded-tr-xl">{t("table.tailorCol")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80">
                <tr className="hover:bg-neutral-50">
                  <td className="p-4 font-bold text-[#11241A]">{t("table.vehicle.label")}</td>
                  <td className="p-4">{t("table.vehicle.group")}</td>
                  <td className="p-4 font-semibold text-emerald-800">{t("table.vehicle.tailor")}</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="p-4 font-bold text-[#11241A]">{t("table.dates.label")}</td>
                  <td className="p-4">{t("table.dates.group")}</td>
                  <td className="p-4 font-semibold text-emerald-800">{t("table.dates.tailor")}</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="p-4 font-bold text-[#11241A]">{t("table.lodging.label")}</td>
                  <td className="p-4">{t("table.lodging.group")}</td>
                  <td className="p-4 font-semibold text-emerald-800">{t("table.lodging.tailor")}</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="p-4 font-bold text-[#11241A]">{t("table.pace.label")}</td>
                  <td className="p-4">{t("table.pace.group")}</td>
                  <td className="p-4 font-semibold text-emerald-800">{t("table.pace.tailor")}</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="p-4 font-bold text-[#11241A]">{t("table.price.label")}</td>
                  <td className="p-4 font-semibold text-emerald-800">{t("table.price.group")}</td>
                  <td className="p-4">{t("table.price.tailor")}</td>
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
                {t("previewTag")}
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#11241A]">
                {t("previewTitle")}
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
                {t("groupFormat")}
              </button>
              <button
                onClick={() => setActiveTab("tailor")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  activeTab === "tailor"
                    ? "bg-[#B28236] text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {t("tailorFormat")}
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
                    {t(`days.${item.day}.title` as "days.1.title")}
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-1 line-clamp-3 leading-relaxed">
                    {t(`days.${item.day}.desc` as "days.1.desc")}
                  </p>
                </div>
                <div className="pt-2 border-t border-neutral-200/60 text-[9px] font-semibold text-emerald-800 uppercase">
                  {activeTab === "group" ? t("setDeparture") : t("privateGuide")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: Interactive Custom Safari Enquiry Form */}
        <div className="bg-[#0B1E14] text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-emerald-950 space-y-6">
          <div className="max-w-2xl text-left space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 block">
              {t("quoteTag")}
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              {t("quoteTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {t("quoteText")}
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-900/60 border border-emerald-500/40 rounded-2xl p-6 text-center text-sm text-emerald-200 space-y-2 max-w-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-white text-base">{t("submitted")}</p>
              <p className="text-xs text-neutral-300">
                {t("submittedText")}
              </p>
            </div>
          ) : (
            <form id="safari-request" onSubmit={handleSubmit} className="scroll-mt-28 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-200 mb-1">
                  {t("name")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("namePlaceholder")}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white text-neutral-900 placeholder:text-neutral-400 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#B28236]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-200 mb-1">
                  {t("email")}
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
                  {t("option")}
                </label>
                <select
                  value={formData.travelType}
                  onChange={(e) => setFormData({ ...formData, travelType: e.target.value })}
                  className="w-full bg-white text-neutral-900 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#B28236]"
                >
                  <option value="Tailor-Made Custom">{t("options.custom")}</option>
                  <option value="Small Group Departure">{t("options.group")}</option>
                  <option value="Not Sure Yet">{t("options.unsure")}</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full disabled:opacity-60 bg-gradient-to-r from-[#C29B47] to-[#A0782A] hover:from-[#A0782A] hover:to-[#835E1C] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{sending ? t("sending") : t("send")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {sendError && <p className="sm:col-span-2 lg:col-span-4 text-xs text-red-300">{sendError}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}