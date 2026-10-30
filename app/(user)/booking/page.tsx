"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
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
import { defaultTripOptions, tripOptions, type TripOptions } from "@/lib/helpers";
import type { Destination } from "@/lib/types";
import { useBookingsStore } from "@/store/bookingsStore";
import { useDestinationsStore } from "@/store/destinationsStore";

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
type Stop = { key: string; title: string; options: TripOptions };

const steps = [
  { title: "Destinations", short: "Where" },
  { title: "Trip Details", short: "When & how" },
  { title: "Your Details", short: "Who" },
];

const perks = [
  { icon: Clock, text: "Reply within 24 hours" },
  { icon: ShieldCheck, text: "No payment to send a request" },
];

const process = [
  {
    title: "Send your request",
    desc: "Pick your destinations and tell us how you like to travel.",
  },
  {
    title: "Talk to an expert",
    desc: "A local specialist contacts you to fine-tune the details.",
  },
  {
    title: "Get your itinerary",
    desc: "Receive a personal plan with lodges, activities and price.",
  },
  { title: "Confirm & go", desc: "Book securely and get ready for Rwanda." },
];

const faqs = [
  {
    q: "Do I need a visa for Rwanda?",
    a: "Visitors from all countries can get a visa on arrival, or apply for an e-Visa online before travelling.",
  },
  {
    q: "What is the best time to visit?",
    a: "The dry seasons (June – September and December – February) are best for gorilla trekking and safaris, but Rwanda can be visited all year.",
  },
  {
    q: "Is gorilla trekking safe?",
    a: "Yes. Treks are led by experienced rangers and guides who know the gorilla families and the mountains very well.",
  },
  {
    q: "Can I customise my trip?",
    a: "Absolutely. Every part of your journey, from lodges to activities and dietary needs, is tailored to you.",
  },
];

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
  const choices = other ? [...new Set([...options, OTHER])] : options;
  return (
    <div>
      <p className={labelClass}>{label} *</p>
      <div className="flex flex-wrap gap-2">
        {choices.map((c) => (
          <Chip
            key={c}
            label={c}
            active={value === c}
            onClick={() => onChange(value === c ? "" : c)}
          />
        ))}
      </div>
      {other && value === OTHER && (
        <input
          aria-label={`${label}: other`}
          value={other.value}
          onChange={(e) => other.onChange(e.target.value)}
          placeholder={other.placeholder}
          className={`${inputClass} mt-3`}
        />
      )}
    </div>
  );
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
  return (
    <div className="flex items-center justify-between rounded-md bg-[#f7f5f0] border border-[#0a120b]/10 px-4 py-2.5">
      <span className="text-sm text-[#0a120b]/70">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Fewer ${label.toLowerCase()}`}
          className="w-8 h-8 rounded-full border border-[#0a120b]/15 flex items-center justify-center hover:border-[#0a120b] disabled:opacity-30 transition-all"
        >
          <Minus size={14} />
        </button>
        <span className="w-5 text-center font-medium">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          aria-label={`More ${label.toLowerCase()}`}
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

  useEffect(() => {
    loadDestinations();
  }, [loadDestinations]);

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
    key === d.id || key.toLowerCase() === d.title.toLowerCase();
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
      return hasDestination ? "" : "Please choose at least one destination.";
    }
    if (i === 1) {
      if (!dates.from || !dates.to) {
        return "Please choose your arrival and departure dates.";
      }
      for (const { key, title } of stops) {
        const c = choiceFor(key);
        if (!finalValue(c.style, c.otherStyle)) {
          return `Please choose a travel style for ${title}.`;
        }
        if (!finalValue(c.accommodation, c.otherAccommodation)) {
          return `Please choose accommodation for ${title}.`;
        }
        if (!c.budget) return `Please choose a budget for ${title}.`;
      }
      return "";
    }
    if (!details.name.trim()) return "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(details.email.trim())) {
      return "Please enter a valid email address.";
    }
    if (!/^\+?[\d\s()-]{7,}$/.test(details.phone.trim())) {
      return "Please enter a valid phone or WhatsApp number.";
    }
    if (!details.fromRwanda) return "Please tell us if you are from Rwanda.";
    if (details.fromRwanda === "No" && !details.country.trim()) {
      return "Please type the country you are from.";
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
      await createBooking({
        customer: details.name.trim(),
        email: details.email.trim(),
        phone: details.phone.trim(),
        country:
          details.fromRwanda === "Yes" ? "Rwanda" : details.country.trim(),
        destinations: stops.map(({ key, title }) => {
          const c = choiceFor(key);
          return {
            title,
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
      setSubmitted(true);
      document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const dateText = dates.from
    ? dates.to
      ? `${format(dates.from, "MMM d")} – ${format(dates.to, "MMM d, yyyy")}`
      : format(dates.from, "MMM d, yyyy")
    : "Flexible";

  return (
    <div className="bg-white font-sans text-[#0a120b] selection:bg-[#c5a86d] selection:text-black">
      {/* Hero */}
      <section className="relative z-30 w-full bg-[#0a1811] text-white px-6">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=2000&q=80"
            alt="Traveller with a suitcase watching a plane take off"
            className="w-full h-full object-cover object-center brightness-[0.85]"
          />
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
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight size={12} />
              <span className="text-[#c5a86d]">Booking</span>
            </nav>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif uppercase tracking-[0.06em] leading-none mb-5">
              Book Your <span className="text-[#c5a86d]">Trip</span>
            </h1>
            <p className="text-sm md:text-base text-zinc-300 font-light max-w-md mx-auto mb-10">
              Choose your destination, dates and guests to get started.
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
                <MapPin size={12} className="text-[#c5a86d]" /> Destination
              </span>
              <select
                value={heroValue}
                onChange={(e) => setHeroDestination(e.target.value)}
                className="w-full bg-transparent text-sm font-medium outline-none appearance-none cursor-pointer pt-0.5"
              >
                <option value="">Where to?</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-xl px-4 py-2.5 hover:bg-[#f7f5f0] transition-colors md:border-l border-[#0a120b]/10">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0a120b]/45">
                <CalendarDays size={12} className="text-[#c5a86d]" /> Dates
              </span>
              <div className="[&>div>button]:border-0 [&>div>button]:py-0.5 [&>div>button]:font-sans [&>div>button]:text-sm [&>div>button]:font-medium">
                <DateRangePicker
                  date={dates}
                  onSelect={(range) =>
                    setDates({ from: range?.from, to: range?.to })
                  }
                  placeholder="Add dates"
                />
              </div>
            </div>
            <label className="rounded-xl px-4 py-2.5 hover:bg-[#f7f5f0] transition-colors md:border-l border-[#0a120b]/10 cursor-pointer">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0a120b]/45">
                <Users size={12} className="text-[#c5a86d]" /> Guests
              </span>
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full bg-transparent text-sm font-medium outline-none appearance-none cursor-pointer pt-0.5"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} adult{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="group inline-flex items-center justify-center gap-2 bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-8 py-4 rounded-xl transition-all"
            >
              Book Now
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </motion.form>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6">
            {perks.map((p) => (
              <span
                key={p.text}
                className="flex items-center gap-2 text-xs md:text-sm text-zinc-200"
              >
                <p.icon size={15} className="text-[#c5a86d]" /> {p.text}
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
                  Request sent
                  {details.name ? `, ${details.name.split(" ")[0]}` : ""}!
                </h2>
                <p className="text-sm text-[#0a120b]/60 max-w-md mx-auto leading-relaxed mb-8">
                  Thank you for choosing acacia Safaris. One of our travel
                  experts will contact you within 24 hours with your
                  personalised itinerary.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href="/destination"
                    className="bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-7 py-3 rounded-sm transition-all"
                  >
                    Explore Destinations
                  </Link>
                  <Link
                    href="/"
                    className="border border-[#0a120b]/20 hover:border-[#0a120b] text-sm px-7 py-3 rounded-sm transition-all"
                  >
                    Back to Home
                  </Link>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Stepper */}
                <div className="px-6 md:px-10 pt-8">
                  <div className="flex items-center">
                    {steps.map((s, i) => (
                      <React.Fragment key={s.title}>
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
                              {s.short}
                            </span>
                            <span
                              className={`block text-sm font-medium ${i === step ? "text-[#0a120b]" : "text-[#0a120b]/55"}`}
                            >
                              {s.title}
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
                            Where would you like to go?
                          </h2>
                          <p className="text-sm text-[#0a120b]/55 mb-6">
                            Pick as many as you like.
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
                                  <img
                                    src={d.image}
                                    alt={d.title}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                  />
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
                              Somewhere else?
                            </label>
                            <input
                              id="other"
                              value={otherDestination}
                              onChange={(e) =>
                                setOtherDestination(e.target.value)
                              }
                              placeholder="e.g. Gishwati forest, Kigali city tour…"
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
                              Tell us about your trip
                            </h2>
                            <p className="text-sm text-[#0a120b]/55">
                              Choose your dates, then a travel style,
                              accommodation and budget for each destination.
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
                                placeholder="Select your travel dates"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Counter
                              label="Adults"
                              value={adults}
                              min={1}
                              onChange={setAdults}
                            />
                            <Counter
                              label="Children"
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
                                  label="Travel style"
                                  options={options.travelStyles}
                                  value={c.style}
                                  onChange={(style) =>
                                    setChoice(key, { style })
                                  }
                                  other={{
                                    value: c.otherStyle,
                                    onChange: (otherStyle) =>
                                      setChoice(key, { otherStyle }),
                                    placeholder: "Tell us your travel style",
                                  }}
                                />
                                <ChoiceGroup
                                  label="Accommodation"
                                  options={options.accommodations}
                                  value={c.accommodation}
                                  onChange={(accommodation) =>
                                    setChoice(key, { accommodation })
                                  }
                                  other={{
                                    value: c.otherAccommodation,
                                    onChange: (otherAccommodation) =>
                                      setChoice(key, { otherAccommodation }),
                                    placeholder:
                                      "Tell us where you would like to stay",
                                  }}
                                />
                                <ChoiceGroup
                                  label="Budget"
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
                              Almost there!
                            </h2>
                            <p className="text-sm text-[#0a120b]/55">
                              Where should we send your itinerary?
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                              <label htmlFor="name" className={labelClass}>
                                Full name *
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
                                Email *
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
                                Phone / WhatsApp *
                              </label>
                              <input
                                id="phone"
                                type="tel"
                                required
                                value={details.phone}
                                onChange={(e) =>
                                  setDetails({
                                    ...details,
                                    phone: e.target.value,
                                  })
                                }
                                placeholder="+1 555 000 000"
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <p className={labelClass}>
                                Are you from Rwanda? *
                              </p>
                              <div className="flex gap-2">
                                {["Yes", "No"].map((answer) => (
                                  <Chip
                                    key={answer}
                                    label={answer}
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
                                  Which country are you from? *
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
                                  placeholder="e.g. United States"
                                  className={inputClass}
                                />
                              </div>
                            )}
                          </div>
                          <div>
                            <label htmlFor="notes" className={labelClass}>
                              Anything else?
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
                              placeholder="Special occasions, dietary needs, accessibility…"
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
                        <ArrowLeft size={16} /> Back
                      </button>
                    ) : (
                      <span className="text-xs text-[#0a120b]/45">
                        Step 1 of {steps.length}
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={sending}
                      className="group inline-flex items-center gap-2 bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-8 py-3.5 rounded-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                    >
                      {step < steps.length - 1
                        ? "Continue"
                        : sending
                          ? "Sending…"
                          : "Send My Request"}
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
                Your trip
              </p>

              {chosen.length > 0 || otherDestination ? (
                <ul className="space-y-2.5 mb-5">
                  {chosen.map((d) => (
                    <li key={d.id} className="flex items-center gap-3">
                      <img
                        src={d.image}
                        alt=""
                        className="w-11 h-11 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{d.title}</p>
                        <p className="text-[11px] text-zinc-400 truncate">
                          {d.location}
                        </p>
                      </div>
                      {!submitted && (
                        <button
                          onClick={() => toggle(d)}
                          aria-label={`Remove ${d.title}`}
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
                  No destinations yet
                </div>
              )}

              <dl className="space-y-3 text-sm border-t border-white/10 pt-4">
                <div className="flex justify-between gap-4">
                  <dt className="flex items-center gap-2 text-zinc-400">
                    <CalendarDays size={14} /> Dates
                  </dt>
                  <dd className="text-right">{dateText}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="flex items-center gap-2 text-zinc-400">
                    <Users size={14} /> Travelers
                  </dt>
                  <dd>
                    {adults} adult{adults > 1 ? "s" : ""}
                    {children > 0 &&
                      `, ${children} child${children > 1 ? "ren" : ""}`}
                  </dd>
                </div>
                {stops.map(({ key, title }) => {
                  const c = choiceFor(key);
                  const summary = [
                    finalValue(c.style, c.otherStyle),
                    finalValue(c.accommodation, c.otherAccommodation),
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
                    Need help?
                  </p>
                  <p className="text-xs text-[#0a120b]/50">
                    Talk to a travel expert
                  </p>
                </div>
              </div>
              <a
                href="https://wa.me/250798635578"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full inline-flex items-center justify-center gap-2 border border-[#0a120b]/15 hover:border-[#1F5A42] hover:text-[#1F5A42] text-sm px-5 py-2.5 rounded-sm transition-all"
              >
                <MessageCircle size={16} /> Chat on WhatsApp
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
              Simple & easy
            </span>
            <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-wide">
              How it works
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {process.map((p, i) => (
              <motion.div
                key={p.title}
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
                  {p.title}
                </h3>
                <p className="text-sm text-[#0a120b]/55 leading-relaxed">
                  {p.desc}
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
              Good to know
            </span>
            <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-wide">
              Questions
            </h2>
          </div>
          <div className="divide-y divide-[#0a120b]/10 border-y border-[#0a120b]/10">
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={faq.q}>
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="w-full flex items-center justify-between gap-6 py-5 text-left group"
                  >
                    <span className="font-serif text-lg group-hover:text-[#1F5A42] transition-colors">
                      {faq.q}
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
                          {faq.a}
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
