"use client";

import React, { use, useEffect, useState } from "react";
import SmartImage from "@/components/ui/smart-image";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  MapPin,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  CalendarDays,
  Users,
  Minus,
  Plus,
  ShieldCheck,
  Clock,
  Sparkles,
  Headphones,
  MessageCircle,
  ChevronRight,
  X,
} from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-picker";
import { PhoneField, isValidPhoneNumber } from "@/components/ui/phone-field";
import { defaultTripOptions, tripOptions, type TripOptions } from "@/lib/helpers";
import type { Destination } from "@/lib/types";
import { useBookingsStore } from "@/store/bookingsStore";
import { useDestinationsStore } from "@/store/destinationsStore";
import { whatsappLink } from "@/lib/whatsapp";

const OTHER = "Other";

// What the visitor picks for one destination. The "other" fields hold the text
// typed after choosing "Other".
type TripChoice = {
  style: string;
  otherStyle: string;
  accommodation: string;
  otherAccommodation: string;
  budget: string;
};
const emptyChoice: TripChoice = {
  style: "",
  otherStyle: "",
  accommodation: "",
  otherAccommodation: "",
  budget: "",
};

// The chosen option, or the typed text when it is "Other"
const finalValue = (picked: string, typed: string) =>
  picked === OTHER ? typed.trim() : picked;

// A destination of the trip with its own choices
type Stop = { key: string; title: string; titleEn?: string; options: TripOptions };

// Texts of these lists: messages Planner.steps / perks / process / faqs
const steps = ["1", "2", "3"] as const;

const perks = [
  { icon: Clock, key: "reply" },
  { icon: ShieldCheck, key: "noPay" },
] as const;

const process = ["1", "2", "3", "4"] as const;

const faqs = ["1", "2", "3", "4"] as const;

const inputClass =
  "w-full bg-[#f7f5f0] border border-[#0a120b]/10 rounded-md px-4 py-3 text-sm text-[#0a120b] placeholder:text-[#0a120b]/35 outline-none focus:border-[#c5a86d] focus:bg-white focus:ring-4 focus:ring-[#c5a86d]/15 transition-all";
const labelClass =
  "block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0a120b]/55 mb-2";

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-sm px-4 py-2 rounded-full border transition-all duration-200 ${
        active
          ? "bg-[#12231a] border-[#12231a] text-[#c5a86d]"
          : "bg-white border-[#0a120b]/15 text-[#0a120b]/70 hover:border-[#c5a86d]"
      }`}
    >
      {label}
    </button>
  );
}

// A row of chips. With "other", an "Other" chip is added that opens a text box.
function ChoiceGroup({
  label,
  options,
  value,
  onChange,
  other,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  other?: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
  };
}) {
  const t = useTranslations("Planner");
  const choiceText = useChoiceText();
  const choices = other ? [...new Set([...options, OTHER])] : options;
  return (
    <div>
      <p className={labelClass}>{label} *</p>
      <div className="flex flex-wrap gap-2">
        {choices.map((c) => (
          <Chip
            key={c}
            label={choiceText(c)}
            active={value === c}
            onClick={() => onChange(value === c ? "" : c)}
          />
        ))}
      </div>
      {other && value === OTHER && (
        <input
          aria-label={t("otherAria", { label })}
          value={other.value}
          onChange={(e) => other.onChange(e.target.value)}
          placeholder={other.placeholder}
          className={`${inputClass} mt-3`}
        />
      )}
    </div>
  );
}

// Standard choices are translated; ones set for a destination in the admin stay as typed.
// The value sent to the team stays in English.
function useChoiceText() {
  const t = useTranslations("Planner");
  return (c: string) => (t.has(`choices.${c}` as never) ? t(`choices.${c}` as "choices.Other") : c);
}

function Counter({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (v: number) => void;
}) {
  const t = useTranslations("Planner");
  return (
    <div className="flex items-center justify-between rounded-md bg-[#f7f5f0] border border-[#0a120b]/10 px-4 py-2.5">
      <span className="text-sm text-[#0a120b]/70">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={t("fewer", { label })}
          className="w-8 h-8 rounded-full border border-[#0a120b]/15 flex items-center justify-center hover:border-[#0a120b] disabled:opacity-30 transition-all"
        >
          <Minus size={14} />
        </button>
        <span className="w-5 text-center font-medium">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          aria-label={t("more", { label })}
          className="w-8 h-8 rounded-full border border-[#0a120b]/15 flex items-center justify-center hover:border-[#0a120b] transition-all"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string }>;
}) {
  // Destinations come from the API (see store/destinationsStore.ts)
  const destinations = useDestinationsStore((s) => s.destinations);
  const loadDestinations = useDestinationsStore((s) => s.load);
  const createBooking = useBookingsStore((s) => s.createBooking);
  const locale = useLocale();
  const t = useTranslations("Planner");
  const choiceText = useChoiceText();

  useEffect(() => {
    loadDestinations(locale); // names and texts in the visitor's language
  }, [loadDestinations, locale]);

  // Pre-select a destination when arriving from a "Book Now" link:
  //   /booking?destination=<destination id>   or   /booking?destination=Gorilla Trekking
  const preselectedId = use(searchParams).destination;

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>(
    preselectedId ? [preselectedId] : [],
  );
  const [otherDestination, setOtherDestination] = useState("");
  const [heroDestination, setHeroDestination] = useState(preselectedId ?? "");
  const [dates, setDates] = useState<{
    from: Date | undefined;
    to?: Date | undefined;
  }>({ from: undefined });
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [choices, setChoices] = useState<Record<string, TripChoice>>({});
  const [details, setDetails] = useState({
    name: "",
    email: "",
    phone: "",
    fromRwanda: "", // "Yes" or "No"
    country: "", // only asked when not from Rwanda
    notes: "",
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [bookingLink, setBookingLink] = useState(""); // the visitor's booking page
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (preselectedId) {
      document
        .getElementById("planner")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, [preselectedId]);

  // A selection is a destination id, or a destination name (from a link)
  const matches = (d: Destination, key: string) =>
    key === d.id ||
    key.toLowerCase() === d.title.toLowerCase() ||
    key.toLowerCase() === d.titleEn?.toLowerCase();
  const isPicked = (d: Destination) => selected.some((key) => matches(d, key));

  const toggle = (d: Destination) =>
    setSelected((prev) =>
      prev.some((key) => matches(d, key))
        ? prev.filter((key) => !matches(d, key))
        : [...prev, d.id],
    );

  const chosen = destinations.filter(isPicked);
  const heroValue =
    destinations.find((d) => matches(d, heroDestination))?.id ?? "";
  const hasDestination = chosen.length > 0 || otherDestination.trim() !== "";

  // Every destination has its own choices; a typed place uses the default ones
  const stops: Stop[] = chosen.map((d) => ({
    key: d.id,
    title: d.title,
    titleEn: d.titleEn ?? d.title, // the booking keeps the English name, for the team
    options: tripOptions(d),
  }));
  if (otherDestination.trim()) {
    stops.push({
      key: "other",
      title: otherDestination.trim(),
      options: defaultTripOptions,
    });
  }

  const choiceFor = (key: string) => choices[key] ?? emptyChoice;
  const setChoice = (key: string, changes: Partial<TripChoice>) =>
    setChoices((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? emptyChoice), ...changes },
    }));

  // What is still missing on a step ("" = the step is complete)
  const stepProblem = (i: number) => {
    if (i === 0) {
      return hasDestination ? "" : t("errors.destination");
    }
    if (i === 1) {
      if (!dates.from || !dates.to) {
        return t("errors.dates");
      }
      for (const { key, title } of stops) {
        const c = choiceFor(key);
        if (!finalValue(c.style, c.otherStyle)) {
          return t("errors.style", { title });
        }
        if (!finalValue(c.accommodation, c.otherAccommodation)) {
          return t("errors.accommodation", { title });
        }
        if (!c.budget) return t("errors.budget", { title });
      }
      return "";
    }
    if (!details.name.trim()) return t("errors.name");
    if (!/^\S+@\S+\.\S+$/.test(details.email.trim())) {
      return t("errors.email");
    }
    if (!details.phone || !isValidPhoneNumber(details.phone)) {
      return t("errors.phone");
    }
    if (!details.fromRwanda) return t("errors.fromRwanda");
    if (details.fromRwanda === "No" && !details.country.trim()) {
      return t("errors.country");
    }
    return "";
  };

  // Checks the first "count" steps and stops on the first one that is not finished
  const stepsComplete = (count: number) => {
    for (let i = 0; i < count; i++) {
      const problem = stepProblem(i);
      if (problem) {
        setError(problem);
        setStep(i);
        return false;
      }
    }
    setError("");
    return true;
  };

  const goTo = (next: number) => {
    if (stepsComplete(next)) setStep(next);
    document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" });
  };

  // Hero booking bar: add the destination to the trip and jump into the planner
  const startBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroDestination) {
      setSelected((prev) =>
        prev.includes(heroDestination) ? prev : [...prev, heroDestination],
      );
      setError("");
      setStep(1);
    }
    document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < steps.length - 1) {
      goTo(step + 1);
      return;
    }

    if (!stepsComplete(steps.length) || !dates.from || !dates.to) return;

    // The trip is saved as a booking the admin sees under Bookings
    setSending(true);
    setError("");
    try {
      const booking = await createBooking({
        locale, // emails go out in the visitor's language
        customer: details.name.trim(),
        email: details.email.trim(),
        phone: details.phone.trim(),
        country:
          details.fromRwanda === "Yes" ? "Rwanda" : details.country.trim(),
        destinations: stops.map(({ key, title, titleEn }) => {
          const c = choiceFor(key);
          return {
            title: titleEn ?? title,
            travelStyle: finalValue(c.style, c.otherStyle),
            accommodation: finalValue(c.accommodation, c.otherAccommodation),
            budget: c.budget,
          };
        }),
        startDate: format(dates.from, "yyyy-MM-dd"),
        endDate: format(dates.to, "yyyy-MM-dd"),
        travelers: adults + children,
        children,
        notes: details.notes.trim() || undefined,
      });
      setBookingLink(`/my-booking/${booking.accessToken}`);
      setSubmitted(true);
      document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  // Dates in the visitor's language ("1 déc. – 7 déc. 2026")
  const short = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });
  const long = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
  const dateText = dates.from
    ? dates.to
      ? `${short.format(dates.from)} – ${long.format(dates.to)}`
      : long.format(dates.from)
    : t("flexible");

  return (
    <div className="bg-white font-sans text-[#0a120b] selection:bg-[#c5a86d] selection:text-black">
      {/* Hero */}
      <section className="relative z-30 w-full bg-[#0a1811] text-white px-6">
        <div className="absolute inset-0 overflow-hidden">
          <SmartImage src="https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=2000&q=80" alt={t("heroAlt")} className="w-full h-full object-cover object-center brightness-[0.85]" sizes="100vw" priority />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1d16] via-transparent to-black/60" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto pt-40 pb-16 md:pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <nav
              className="flex items-center justify-center gap-1.5 text-xs text-zinc-300 mb-6"
              aria-label={t("breadcrumb")}
            >
              <Link href="/" className="hover:text-white transition-colors">
                {t("home")}
              </Link>
              <ChevronRight size={12} />
              <span className="text-[#c5a86d]">{t("booking")}</span>
            </nav>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif uppercase tracking-[0.06em] leading-none mb-5">
              {t("title1")} <span className="text-[#c5a86d]">{t("title2")}</span>
            </h1>
            <p className="text-sm md:text-base text-zinc-300 font-light max-w-md mx-auto mb-10">
              {t("subtitle")}
            </p>
          </motion.div>

          {/* Booking bar */}
          <motion.form
            onSubmit={startBooking}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-left bg-white text-[#0a120b] rounded-2xl shadow-2xl p-2 grid grid-cols-1 md:grid-cols-[1.3fr_1.3fr_1fr_auto] gap-1"
          >
            <label className="relative rounded-xl px-4 py-2.5 hover:bg-[#f7f5f0] transition-colors cursor-pointer">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0a120b]/45">
                <MapPin size={12} className="text-[#c5a86d]" /> {t("barDestination")}
              </span>
              <select
                value={heroValue}
                onChange={(e) => setHeroDestination(e.target.value)}
                className="w-full bg-transparent text-sm font-medium outline-none appearance-none cursor-pointer pt-0.5"
              >
                <option value="">{t("whereTo")}</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-xl px-4 py-2.5 hover:bg-[#f7f5f0] transition-colors md:border-l border-[#0a120b]/10">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0a120b]/45">
                <CalendarDays size={12} className="text-[#c5a86d]" /> {t("barDates")}
              </span>
              <div className="[&>div>button]:border-0 [&>div>button]:py-0.5 [&>div>button]:font-sans [&>div>button]:text-sm [&>div>button]:font-medium">
                <DateRangePicker
                  date={dates}
                  onSelect={(range) =>
                    setDates({ from: range?.from, to: range?.to })
                  }
                  placeholder={t("addDates")}
                />
              </div>
            </div>
            <label className="rounded-xl px-4 py-2.5 hover:bg-[#f7f5f0] transition-colors md:border-l border-[#0a120b]/10 cursor-pointer">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0a120b]/45">
                <Users size={12} className="text-[#c5a86d]" /> {t("barGuests")}
              </span>
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full bg-transparent text-sm font-medium outline-none appearance-none cursor-pointer pt-0.5"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {t("adults", { count: n })}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="group inline-flex items-center justify-center gap-2 bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-8 py-4 rounded-xl transition-all"
            >
              {t("bookNow")}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </motion.form>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6">
            {perks.map((p) => (
              <span
                key={p.key}
                className="flex items-center gap-2 text-xs md:text-sm text-zinc-200"
              >
                <p.icon size={15} className="text-[#c5a86d]" /> {t(`perks.${p.key}`)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Planner */}
      <section
        id="planner"
        className="relative z-20 px-6 pt-16 pb-24 scroll-mt-24"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Form card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_20px_50px_-15px_rgba(10,24,17,0.35)] border border-[#0a120b]/5">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 md:p-16 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-[#12231a] text-[#c5a86d] flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={36} />
                </div>
                <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-wide mb-3">
                  {details.name ? t("sentName", { name: details.name.split(" ")[0] }) : t("sent")}
                </h2>
                <p className="text-sm text-[#0a120b]/60 max-w-md mx-auto leading-relaxed mb-8">
                  {t("sentText")}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {bookingLink && (
                    <Link
                      href={bookingLink}
                      className="bg-[#12231a] hover:bg-[#1F5A42] text-white font-medium text-sm px-7 py-3 rounded-sm transition-all"
                    >
                      {t("follow")}
                    </Link>
                  )}
                  <Link
                    href="/destination"
                    className="bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-7 py-3 rounded-sm transition-all"
                  >
                    {t("exploreDestinations")}
                  </Link>
                  <Link
                    href="/"
                    className="border border-[#0a120b]/20 hover:border-[#0a120b] text-sm px-7 py-3 rounded-sm transition-all"
                  >
                    {t("backHome")}
                  </Link>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Stepper */}
                <div className="px-6 md:px-10 pt-8">
                  <div className="flex items-center">
                    {steps.map((s, i) => (
                      <React.Fragment key={s}>
                        <button
                          type="button"
                          onClick={() => i !== step && goTo(i)}
                          className="flex items-center gap-3 text-left shrink-0"
                        >
                          <span
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                              i < step
                                ? "bg-[#1F5A42] text-white"
                                : i === step
                                  ? "bg-[#c5a86d] text-[#0e1d16] shadow-[0_0_0_5px_rgba(197,168,109,0.2)]"
                                  : "bg-[#f7f5f0] text-[#0a120b]/40"
                            }`}
                          >
                            {i < step ? <Check size={16} /> : i + 1}
                          </span>
                          <span className="hidden sm:block">
                            <span className="block text-[10px] uppercase tracking-widest text-[#0a120b]/40">
                              {t(`steps.${s}.short`)}
                            </span>
                            <span
                              className={`block text-sm font-medium ${i === step ? "text-[#0a120b]" : "text-[#0a120b]/55"}`}
                            >
                              {t(`steps.${s}.title`)}
                            </span>
                          </span>
                        </button>
                        {i < steps.length - 1 && (
                          <div className="flex-1 h-0.5 mx-3 sm:mx-5 bg-[#f7f5f0] rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-[#1F5A42]"
                              initial={false}
                              animate={{ width: i < step ? "100%" : "0%" }}
                              transition={{ duration: 0.4 }}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-10">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Step 1: destinations */}
                      {step === 0 && (
                        <div>
                          <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-wide mb-1">
                            {t("whereGo")}
                          </h2>
                          <p className="text-sm text-[#0a120b]/55 mb-6">
                            {t("pickMany")}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {destinations.map((d) => {
                              const active = isPicked(d);
                              return (
                                <button
                                  key={d.id}
                                  type="button"
                                  onClick={() => toggle(d)}
                                  aria-pressed={active}
                                  className={`group relative h-32 sm:h-36 rounded-xl overflow-hidden text-left ring-2 transition-all duration-300 ${
                                    active
                                      ? "ring-[#c5a86d] shadow-lg"
                                      : "ring-transparent hover:ring-[#c5a86d]/40"
                                  }`}
                                >
                                  <SmartImage src={d.image} alt={d.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 640px) 50vw, 25vw" />
                                  <div
                                    className={`absolute inset-0 transition-colors ${active ? "bg-[#12231a]/55" : "bg-gradient-to-t from-black/80 via-black/20 to-transparent"}`}
                                  />
                                  <span
                                    className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                                      active
                                        ? "bg-[#c5a86d] border-[#c5a86d] text-[#0e1d16]"
                                        : "border-white/70 bg-black/20"
                                    }`}
                                  >
                                    {active && <Check size={14} />}
                                  </span>
                                  <span className="absolute bottom-3 left-3 right-3 text-white">
                                    <span className="block font-serif uppercase tracking-wide text-sm leading-tight">
                                      {d.title}
                                    </span>
                                    <span className="block text-[10px] text-zinc-300 truncate">
                                      {d.location}
                                    </span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          <div className="mt-5">
                            <label htmlFor="other" className={labelClass}>
                              {t("elsewhere")}
                            </label>
                            <input
                              id="other"
                              value={otherDestination}
                              onChange={(e) =>
                                setOtherDestination(e.target.value)
                              }
                              placeholder={t("elsewherePlaceholder")}
                              className={inputClass}
                            />
                          </div>
                        </div>
                      )}

                      {/* Step 2: trip details */}
                      {step === 1 && (
                        <div className="space-y-7">
                          <div>
                            <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-wide mb-1">
                              {t("aboutTrip")}
                            </h2>
                            <p className="text-sm text-[#0a120b]/55">
                              {t("aboutTripText")}
                            </p>
                          </div>
                          <div>
                            <p className={labelClass}>Travel dates *</p>
                            <div className="rounded-md bg-[#f7f5f0] border border-[#0a120b]/10 px-4 [&>div>button]:border-0 [&>div>button]:py-2.5 [&>div>button]:font-sans [&>div>button]:text-sm">
                              <DateRangePicker
                                date={dates}
                                onSelect={(range) =>
                                  setDates({ from: range?.from, to: range?.to })
                                }
                                placeholder={t("selectDates")}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Counter
                              label={t("adultsLabel")}
                              value={adults}
                              min={1}
                              onChange={setAdults}
                            />
                            <Counter
                              label={t("childrenLabel")}
                              value={children}
                              min={0}
                              onChange={setChildren}
                            />
                          </div>
                          {stops.map(({ key, title, options }) => {
                            const c = choiceFor(key);
                            return (
                              <div
                                key={key}
                                className="rounded-xl border border-[#0a120b]/10 p-5 space-y-5"
                              >
                                <h3 className="font-serif uppercase tracking-wide">
                                  {title}
                                </h3>
                                <ChoiceGroup
                                  label={t("style")}
                                  options={options.travelStyles}
                                  value={c.style}
                                  onChange={(style) =>
                                    setChoice(key, { style })
                                  }
                                  other={{
                                    value: c.otherStyle,
                                    onChange: (otherStyle) =>
                                      setChoice(key, { otherStyle }),
                                    placeholder: t("stylePlaceholder"),
                                  }}
                                />
                                <ChoiceGroup
                                  label={t("accommodation")}
                                  options={options.accommodations}
                                  value={c.accommodation}
                                  onChange={(accommodation) =>
                                    setChoice(key, { accommodation })
                                  }
                                  other={{
                                    value: c.otherAccommodation,
                                    onChange: (otherAccommodation) =>
                                      setChoice(key, { otherAccommodation }),
                                    placeholder: t("accommodationPlaceholder"),
                                  }}
                                />
                                <ChoiceGroup
                                  label={t("budget")}
                                  options={options.budgets}
                                  value={c.budget}
                                  onChange={(budget) =>
                                    setChoice(key, { budget })
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Step 3: contact details */}
                      {step === 2 && (
                        <div className="space-y-5">
                          <div>
                            <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-wide mb-1">
                              {t("almost")}
                            </h2>
                            <p className="text-sm text-[#0a120b]/55">
                              {t("sendWhere")}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                              <label htmlFor="name" className={labelClass}>
                                {t("fullName")}
                              </label>
                              <input
                                id="name"
                                required
                                value={details.name}
                                onChange={(e) =>
                                  setDetails({
                                    ...details,
                                    name: e.target.value,
                                  })
                                }
                                placeholder="Jane Doe"
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label htmlFor="email" className={labelClass}>
                                {t("email")}
                              </label>
                              <input
                                id="email"
                                type="email"
                                required
                                value={details.email}
                                onChange={(e) =>
                                  setDetails({
                                    ...details,
                                    email: e.target.value,
                                  })
                                }
                                placeholder="jane@example.com"
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label htmlFor="phone" className={labelClass}>
                                {t("phone")}
                              </label>
                              <PhoneField
                                id="phone"
                                required
                                value={details.phone}
                                onChange={(phone) => setDetails({ ...details, phone })}
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <p className={labelClass}>
                                {t("fromRwanda")}
                              </p>
                              <div className="flex gap-2">
                                {["Yes", "No"].map((answer) => (
                                  <Chip
                                    key={answer}
                                    label={choiceText(answer)}
                                    active={details.fromRwanda === answer}
                                    onClick={() =>
                                      setDetails({
                                        ...details,
                                        fromRwanda: answer,
                                      })
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                            {details.fromRwanda === "No" && (
                              <div>
                                <label htmlFor="country" className={labelClass}>
                                  {t("whichCountry")}
                                </label>
                                <input
                                  id="country"
                                  required
                                  value={details.country}
                                  onChange={(e) =>
                                    setDetails({
                                      ...details,
                                      country: e.target.value,
                                    })
                                  }
                                  placeholder={t("countryPlaceholder")}
                                  className={inputClass}
                                />
                              </div>
                            )}
                          </div>
                          <div>
                            <label htmlFor="notes" className={labelClass}>
                              {t("anythingElse")}
                            </label>
                            <textarea
                              id="notes"
                              rows={4}
                              value={details.notes}
                              onChange={(e) =>
                                setDetails({
                                  ...details,
                                  notes: e.target.value,
                                })
                              }
                              placeholder={t("notesPlaceholder")}
                              className={`${inputClass} resize-none`}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {error && (
                    <p className="mt-5 text-sm text-red-600">{error}</p>
                  )}

                  {/* Navigation */}
                  <div className="mt-8 pt-6 border-t border-[#0a120b]/5 flex items-center justify-between gap-4">
                    {step > 0 ? (
                      <button
                        type="button"
                        onClick={() => goTo(step - 1)}
                        className="group inline-flex items-center gap-2 border-2 border-[#12231a] text-[#12231a] hover:bg-[#12231a] hover:text-white font-medium text-sm px-6 py-3 rounded-sm transition-all"
                      >
                        <ArrowLeft size={16} /> {t("back")}
                      </button>
                    ) : (
                      <span className="text-xs text-[#0a120b]/45">
                        {t("stepOf", { step: 1, total: steps.length })}
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={sending}
                      className="group inline-flex items-center gap-2 bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-8 py-3.5 rounded-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                    >
                      {step < steps.length - 1
                        ? t("continue")
                        : sending
                          ? t("sending")
                          : t("send")}
                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Summary sidebar */}
          <aside className="lg:sticky lg:top-28 space-y-6">
            <div className="rounded-2xl bg-[#12231a] text-white p-6 shadow-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c5a86d] mb-4">
                {t("yourTrip")}
              </p>

              {chosen.length > 0 || otherDestination ? (
                <ul className="space-y-2.5 mb-5">
                  {chosen.map((d) => (
                    <li key={d.id} className="flex items-center gap-3">
                      <SmartImage src={d.image} alt="" className="w-11 h-11 rounded-lg object-cover" sizes="64px" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{d.title}</p>
                        <p className="text-[11px] text-zinc-400 truncate">
                          {d.location}
                        </p>
                      </div>
                      {!submitted && (
                        <button
                          onClick={() => toggle(d)}
                          aria-label={t("remove", { title: d.title })}
                          className="text-zinc-500 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </li>
                  ))}
                  {otherDestination && (
                    <li className="flex items-center gap-3">
                      <span className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center">
                        <MapPin size={16} className="text-[#c5a86d]" />
                      </span>
                      <p className="text-sm truncate">{otherDestination}</p>
                    </li>
                  )}
                </ul>
              ) : (
                <div className="rounded-lg border border-dashed border-white/20 p-5 text-center text-sm text-zinc-400 mb-5">
                  <MapPin size={20} className="mx-auto mb-2 text-[#c5a86d]" />
                  {t("noDestinations")}
                </div>
              )}

              <dl className="space-y-3 text-sm border-t border-white/10 pt-4">
                <div className="flex justify-between gap-4">
                  <dt className="flex items-center gap-2 text-zinc-400">
                    <CalendarDays size={14} /> {t("dates")}
                  </dt>
                  <dd className="text-right">{dateText}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="flex items-center gap-2 text-zinc-400">
                    <Users size={14} /> {t("travelers")}
                  </dt>
                  <dd>
                    {t("adults", { count: adults })}
                    {children > 0 && `, ${t("children", { count: children })}`}
                  </dd>
                </div>
                {stops.map(({ key, title }) => {
                  const c = choiceFor(key);
                  const summary = [
                    choiceText(finalValue(c.style, c.otherStyle)),
                    choiceText(finalValue(c.accommodation, c.otherAccommodation)),
                    c.budget,
                  ]
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    summary && (
                      <div key={key} className="border-t border-white/10 pt-3">
                        <dt className="text-zinc-400 text-xs mb-0.5">
                          {title}
                        </dt>
                        <dd>{summary}</dd>
                      </div>
                    )
                  );
                })}
              </dl>
            </div>

            <div className="rounded-2xl border border-[#0a120b]/10 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-full bg-[#f7f5f0] text-[#1F5A42] flex items-center justify-center">
                  <Headphones size={18} />
                </span>
                <div>
                  <p className="font-serif uppercase tracking-wide">
                    {t("needHelp")}
                  </p>
                  <p className="text-xs text-[#0a120b]/50">
                    {t("talkExpert")}
                  </p>
                </div>
              </div>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full inline-flex items-center justify-center gap-2 border border-[#0a120b]/15 hover:border-[#1F5A42] hover:text-[#1F5A42] text-sm px-5 py-2.5 rounded-sm transition-all"
              >
                <MessageCircle size={16} /> {t("chatWhatsapp")}
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#f7f5f0] px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#c5a86d] font-semibold text-[10px] uppercase tracking-[0.35em] block mb-3">
              {t("simple")}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-wide">
              {t("howItWorks")}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {process.map((p, i) => (
              <motion.div
                key={p}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-white rounded-xl p-6 border border-[#0a120b]/5"
              >
                <span className="text-4xl font-serif text-[#c5a86d]/40">
                  0{i + 1}
                </span>
                <h3 className="font-serif text-lg uppercase tracking-wide mt-2 mb-2">
                  {t(`process.${p}.title`)}
                </h3>
                <p className="text-sm text-[#0a120b]/55 leading-relaxed">
                  {t(`process.${p}.desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[#c5a86d] font-semibold text-[10px] uppercase tracking-[0.35em] block mb-3">
              {t("goodToKnow")}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-wide">
              {t("questions")}
            </h2>
          </div>
          <div className="divide-y divide-[#0a120b]/10 border-y border-[#0a120b]/10">
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={faq}>
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="w-full flex items-center justify-between gap-6 py-5 text-left group"
                  >
                    <span className="font-serif text-lg group-hover:text-[#1F5A42] transition-colors">
                      {t(`faqs.${faq}.q`)}
                    </span>
                    <span
                      className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                        open
                          ? "bg-[#12231a] border-[#12231a] text-[#c5a86d] rotate-45"
                          : "border-[#0a120b]/15 text-[#0a120b]/60"
                      }`}
                    >
                      <Plus size={14} />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 pr-12 text-sm text-[#0a120b]/60 leading-relaxed">
                          {t(`faqs.${faq}.a`)}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
