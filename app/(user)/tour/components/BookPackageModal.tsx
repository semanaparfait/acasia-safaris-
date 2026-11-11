"use client";

// "Book this package" pop-up, in 3 steps:
//   1. Trip:    start date and travelers per price group (Adult, Teenager, Child, Infant)
//   2. Details: name, email, phone, country
//   3. Price:   the total, then "Book at this price" or "Ask for a better price"
// The booking is saved, and the visitor goes to their booking page (/my-booking/<token>),
// where they follow it and talk with the team.
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { addDays, format } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  HandCoins,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import type { TourPackage } from "@/lib/types";
import { DEPOSIT_RATE, daysLabel, money, packageDays, packageRates } from "@/lib/helpers";
import { useBookingsStore } from "@/store/bookingsStore";

const inputClass =
  "w-full bg-[#f7f5f0] border border-[#0a120b]/10 rounded-lg px-4 py-3 text-sm text-[#0a120b] placeholder:text-[#0a120b]/35 outline-none focus:border-[#c5a86d] focus:bg-white focus:ring-4 focus:ring-[#c5a86d]/15 transition-all";
const labelClass = "block text-[11px] font-semibold uppercase tracking-wider text-[#0a120b]/55 mb-1.5";

const steps = ["Your trip", "Your details", "Price"];

export default function BookPackageModal({
  tour,
  open,
  onClose,
}: {
  tour: TourPackage;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const createBooking = useBookingsStore((s) => s.createBooking);
  const rates = useMemo(() => packageRates(tour), [tour]);
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const [step, setStep] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [counts, setCounts] = useState<number[]>(() => rates.map((_, i) => (i === 0 ? 2 : 0)));
  const [details, setDetails] = useState({ name: "", email: "", phone: "", country: "", notes: "" });
  const [bargain, setBargain] = useState(false);
  const [offer, setOffer] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Close with Escape, and stop the page behind from scrolling
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !sending && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, sending]);

  const travelers = counts.reduce((a, b) => a + b, 0);
  const total = rates.reduce((sum, r, i) => sum + r.price * counts[i], 0);
  const days = packageDays(tour);
  const endDate = startDate ? addDays(new Date(startDate), Math.max(days - 1, 0)) : null;
  const offerValue = Number(offer);

  // What is still missing on a step ("" = complete)
  const problem = (i: number) => {
    if (i === 0) {
      if (!startDate) return "Please choose your start date.";
      if (startDate < tomorrow) return "Please choose a date from tomorrow.";
      if (travelers < 1) return "Please add at least one traveler.";
      if (travelers > 50) return "For more than 50 travelers, please contact us.";
      return "";
    }
    if (i === 1) {
      if (!details.name.trim()) return "Please enter your full name.";
      if (!/^\S+@\S+\.\S+$/.test(details.email.trim())) return "Please enter a valid email address.";
      if (!/^\+?[\d\s()-]{7,}$/.test(details.phone.trim())) return "Please enter a valid phone or WhatsApp number.";
      if (!details.country.trim()) return "Please tell us which country you are from.";
      return "";
    }
    if (bargain) {
      if (!offerValue || offerValue < 1) return "Please enter the price you would like to pay.";
      if (offerValue >= total) return `Your offer must be lower than ${money(total)}.`;
    }
    return "";
  };

  const next = () => {
    const p = problem(step);
    setError(p);
    if (!p) setStep(step + 1);
  };

  const submit = async () => {
    const p = problem(0) || problem(1) || problem(2);
    if (p) return setError(p);
    setSending(true);
    setError("");
    try {
      const booking = await createBooking({
        customer: details.name.trim(),
        email: details.email.trim(),
        phone: details.phone.trim(),
        country: details.country.trim(),
        notes: details.notes.trim() || undefined,
        packageId: tour.id,
        startDate,
        travelers,
        children: travelers - counts[0],
        guests: rates.map((r, i) => ({ label: r.label, count: counts[i] })).filter((g) => g.count > 0),
        ...(bargain ? { offer: offerValue, offerNote: offerNote.trim() || undefined } : {}),
      });
      router.push(`/my-booking/${booking.accessToken}`);
    } catch (err) {
      setError((err as Error).message);
      setSending(false);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-[#0a120b]/70 backdrop-blur-sm" onClick={() => !sending && onClose()} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full max-w-lg max-h-full overflow-y-auto rounded-2xl bg-white shadow-2xl font-sans"
          >
            {/* Header */}
            <div className="relative overflow-hidden bg-[#12231a] px-6 pt-6 pb-5 text-white">
              {tour.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tour.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#12231a] via-[#12231a]/75 to-[#12231a]/30" />
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                aria-label="Close"
                className="absolute z-10 top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
              <div className="relative">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c5a86d] mb-1.5">Book this package</p>
                <h2 id="book-title" className="font-serif text-xl leading-snug pr-8">{tour.title}</h2>
                <p className="text-xs text-white/60 mt-1">{daysLabel(tour)} · {tour.location}</p>

                {/* Stepper */}
                <div className="flex items-center gap-2 mt-5">
                  {steps.map((s, i) => (
                    <React.Fragment key={s}>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors ${
                            i < step ? "bg-[#c5a86d] text-[#12231a]" : i === step ? "bg-white text-[#12231a]" : "bg-white/15 text-white/60"
                          }`}
                        >
                          {i < step ? <Check size={11} strokeWidth={3} /> : i + 1}
                        </span>
                        <span className={`text-[11px] ${i === step ? "text-white font-medium" : "text-white/50"} hidden sm:inline`}>{s}</span>
                      </div>
                      {i < steps.length - 1 && <span className={`h-px flex-1 ${i < step ? "bg-[#c5a86d]" : "bg-white/15"}`} />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Step 1: date and travelers */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <label className={labelClass} htmlFor="start">Start date</label>
                    <input id="start" type="date" min={tomorrow} value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
                    {endDate && (
                      <p className="flex items-center gap-1.5 text-xs text-[#0a120b]/55 mt-1.5">
                        <CalendarDays size={13} /> {format(new Date(startDate), "EEE d MMM")} to {format(endDate, "EEE d MMM yyyy")} · {daysLabel(tour)}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className={labelClass}>Travelers</p>
                    <div className="divide-y divide-[#0a120b]/[0.06] rounded-xl border border-[#0a120b]/10">
                      {rates.map((r, i) => (
                        <div key={r.label} className="flex items-center justify-between gap-3 px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#0a120b]">{r.label}</p>
                            <p className="text-xs text-[#0a120b]/50">{r.ages} · {r.price > 0 ? `${money(r.price)} each` : "Free"}</p>
                          </div>
                          <div className="flex items-center gap-2.5 shrink-0">
                            <Counter label={`Fewer ${r.label}`} disabled={counts[i] === 0} onClick={() => setCounts(counts.map((c, j) => (j === i ? c - 1 : c)))}>
                              <Minus size={14} />
                            </Counter>
                            <span className="w-5 text-center text-sm font-semibold tabular-nums">{counts[i]}</span>
                            <Counter label={`More ${r.label}`} disabled={travelers >= 50} onClick={() => setCounts(counts.map((c, j) => (j === i ? c + 1 : c)))}>
                              <Plus size={14} />
                            </Counter>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: contact details */}
              {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="b-name">Full name</label>
                    <input id="b-name" autoComplete="name" value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="b-email">Email</label>
                    <input id="b-email" type="email" autoComplete="email" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} placeholder="you@example.com" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="b-phone">Phone / WhatsApp</label>
                    <input id="b-phone" type="tel" autoComplete="tel" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} placeholder="+1 555 000 000" className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="b-country">Country</label>
                    <input id="b-country" autoComplete="country-name" value={details.country} onChange={(e) => setDetails({ ...details, country: e.target.value })} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="b-notes">Anything we should know? (optional)</label>
                    <textarea id="b-notes" rows={2} value={details.notes} onChange={(e) => setDetails({ ...details, notes: e.target.value })} placeholder="Dietary needs, celebrations, flight times…" className={inputClass} />
                  </div>
                  <p className="sm:col-span-2 text-xs text-[#0a120b]/50">We email you a private link to follow your booking and chat with our team.</p>
                </div>
              )}

              {/* Step 3: price */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-[#f7f5f0] p-4 text-sm">
                    {rates.map((r, i) =>
                      counts[i] > 0 ? (
                        <div key={r.label} className="flex justify-between py-1 text-[#0a120b]/70">
                          <span>{counts[i]} × {r.label} {r.price > 0 && <span className="text-[#0a120b]/45">({money(r.price)})</span>}</span>
                          <span className="tabular-nums">{r.price > 0 ? money(r.price * counts[i]) : "Free"}</span>
                        </div>
                      ) : null,
                    )}
                    <div className="flex items-baseline justify-between pt-3 mt-2 border-t border-[#0a120b]/10">
                      <span className="text-[#0a120b]/60">Total</span>
                      <span className="font-serif text-2xl text-[#12231a] tabular-nums">{money(total)}</span>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-[#0a120b]">Is this price good for you?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Choice active={!bargain} onClick={() => setBargain(false)} icon={<Check size={16} />} title="Yes, book it" text={`Confirmed now at ${money(total)}`} />
                    <Choice active={bargain} onClick={() => setBargain(true)} icon={<HandCoins size={16} />} title="Ask for a better price" text="Make an offer to our team" />
                  </div>

                  <AnimatePresence initial={false}>
                    {bargain && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="space-y-3 pt-1">
                          <div>
                            <label className={labelClass} htmlFor="offer">Your price for everyone (USD)</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#0a120b]/40">$</span>
                              <input id="offer" type="number" inputMode="numeric" min={1} max={total - 1} value={offer} onChange={(e) => setOffer(e.target.value)} placeholder={String(Math.round((total * 0.9) / 10) * 10)} className={`${inputClass} pl-8`} />
                            </div>
                          </div>
                          <div>
                            <label className={labelClass} htmlFor="offer-note">Why? (optional, it helps)</label>
                            <textarea id="offer-note" rows={2} maxLength={2000} value={offerNote} onChange={(e) => setOfferNote(e.target.value)} placeholder="e.g. We are students, we can travel in low season…" className={inputClass} />
                          </div>
                          <p className="text-xs text-[#0a120b]/50">Our team answers within 24 hours. You can keep talking with them on your booking page.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="flex items-start gap-2 text-xs text-[#0a120b]/55 leading-relaxed">
                    <ShieldCheck size={14} className="shrink-0 mt-px text-[#1F5A42]" />
                    {bargain
                      ? "Nothing to pay now. Once we agree on a price, you get your confirmation and ticket."
                      : `Confirmed at once: you get your confirmation and QR code ticket by email. Nothing to pay now; a ${DEPOSIT_RATE * 100}% deposit holds your dates.`}
                  </p>
                </div>
              )}

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

              {/* Buttons */}
              <div className="flex items-center gap-3 mt-6">
                {step > 0 && (
                  <button type="button" onClick={() => { setError(""); setStep(step - 1); }} disabled={sending} className="inline-flex items-center gap-1.5 text-sm font-medium border border-[#0a120b]/15 hover:border-[#0a120b] px-4 py-3 rounded-lg transition-all cursor-pointer">
                    <ArrowLeft size={15} /> Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={step < steps.length - 1 ? next : submit}
                  disabled={sending}
                  className="group flex-1 inline-flex items-center justify-center gap-2 bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-semibold text-sm px-6 py-3 rounded-lg shadow-md transition-all disabled:opacity-60 cursor-pointer"
                >
                  {sending && <Loader2 size={16} className="animate-spin" />}
                  {sending ? "Sending…" : step < steps.length - 1 ? "Continue" : bargain ? "Send my offer" : `Book for ${money(total)}`}
                  {!sending && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Counter({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="w-8 h-8 rounded-full border border-[#0a120b]/15 text-[#0a120b] flex items-center justify-center hover:border-[#c5a86d] hover:bg-[#c5a86d]/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-[#0a120b]/15 transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}

function Choice({ active, onClick, icon, title, text }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; text: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-left rounded-xl border p-3.5 transition-all cursor-pointer ${
        active ? "border-[#c5a86d] bg-[#c5a86d]/[0.08] ring-4 ring-[#c5a86d]/15" : "border-[#0a120b]/10 hover:border-[#c5a86d]/60"
      }`}
    >
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${active ? "bg-[#c5a86d] text-[#12231a]" : "bg-[#f7f5f0] text-[#0a120b]/60"}`}>{icon}</span>
      <span className="block text-sm font-semibold text-[#0a120b]">{title}</span>
      <span className="block text-xs text-[#0a120b]/55 mt-0.5">{text}</span>
    </button>
  );
}
