"use client";

// The visible part of a trip's page (/trips/<id>):
//   photo banner · section menu · overview & key facts · photos · day by day ·
//   price options (each with what is included and not) · comparison · call to action.
// "Reserve" opens a short form saved under Admin > Messages, like the package inquiries.
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, BellRing, CalendarDays, Gift, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, Expand, MapPin, Minus, Sparkles, Star, Tag, Users, X,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SmartImage from "@/components/ui/smart-image";
import { TripMoney } from "@/components/ui/money";
import { PhoneField } from "@/components/ui/phone-field";
import { bookingSubtotal, bookingTotal, earlyBird, fromPrice, tripDates, tripDays, tripDiscount } from "@/lib/trips";
import { whatsappLink, useWhatsAppTopic } from "@/lib/whatsapp";
import type { Trip, TripPrice } from "@/lib/types";
import { useTripsStore } from "@/store/tripsStore";

const GOLD = "text-[#b28236]";

export default function TripPage({ trip, url }: { trip: Trip; url: string }) {
  const t = useTranslations("Trips");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const dates = tripDates(trip, locale);
  const days = tripDays(trip) ?? trip.itinerary.length;
  const from = fromPrice(trip);
  const [reserving, setReserving] = useState<string | null>(null); // the price option's name
  const [photo, setPhoto] = useState<number | null>(null); // open in the full-screen viewer

  // The floating WhatsApp button offers "Ask about <this trip>"
  const setWhatsAppTopic = useWhatsAppTopic((s) => s.setTopic);
  useEffect(() => {
    if (days > 0) setWhatsAppTopic({ title: trip.title, days, url });
    return () => setWhatsAppTopic(null);
  }, [setWhatsAppTopic, trip.title, days, url]);

  const defaultOption = (trip.prices.find((p) => p.popular) ?? trip.prices[0])?.name ?? "";
  const full = trip.seatsLeft === 0;
  const [waiting, setWaiting] = useState(false); // the waitlist form
  // Full: "Reserve" becomes "Join the waitlist"
  const reserve = (option: string) => (full ? setWaiting(true) : setReserving(option));
  const early = earlyBird(trip);
  const group = trip.groupPercent && trip.groupMinTravelers ? { percent: trip.groupPercent, min: trip.groupMinTravelers } : null;
  const dealDate = early ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(early.until)) : "";
  const sections = [
    { id: "overview", label: t("nav.overview"), show: true },
    { id: "photos", label: t("nav.gallery"), show: trip.images.length > 1 },
    { id: "itinerary", label: t("nav.itinerary"), show: trip.itinerary.length > 0 },
    { id: "prices", label: t("nav.prices"), show: trip.prices.length > 0 },
  ].filter((s) => s.show);

  return (
    <div className="bg-white text-neutral-800">
      {/* ---------- Banner ---------- */}
      <section className="relative min-h-[560px] h-[82vh] max-h-[820px] w-full overflow-hidden bg-[#0a1811] text-white">
        {trip.images[0] && (
          <motion.div initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: "easeOut" }} className="absolute inset-0">
            <SmartImage src={trip.images[0]} alt={trip.title} className="h-full w-full object-cover" sizes="100vw" priority />
          </motion.div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1811] via-[#0a1811]/40 to-black/45" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-14 sm:pb-20">
          <Link href="/trips" className="mb-6 inline-flex w-fit items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 hover:text-white">
            <ArrowLeft size={14} /> {t("allTrips")}
          </Link>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-[#d4af37]">
            <MapPin size={14} /> {trip.location}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-3 max-w-4xl font-serif text-4xl font-bold leading-[1.08] sm:text-6xl">
            {trip.title}
          </motion.h1>
          {trip.tagline && (
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-4 max-w-2xl font-serif text-lg italic text-amber-50/90 sm:text-2xl">
              {trip.tagline}
            </motion.p>
          )}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-7 flex flex-wrap gap-2.5 text-sm">
            {dates && <HeroChip icon={<CalendarDays size={15} />}>{dates}</HeroChip>}
            {(trip.duration || days > 0) && <HeroChip icon={<Clock size={15} />}>{trip.duration ?? tc("days", { count: days })}</HeroChip>}
            {!dates && <HeroChip icon={<CalendarDays size={15} />}>{t("datesOnRequest")}</HeroChip>}
            {trip.groupSize && <HeroChip icon={<Users size={15} />}>{trip.groupSize}</HeroChip>}
            {early && (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#0a1811]/80 px-4 py-2 font-semibold text-[#d4af37] ring-1 ring-[#d4af37]/50 backdrop-blur-md">
                <Gift size={15} /> {t("deals.earlyShort", { percent: early.percent, date: dealDate })}
              </span>
            )}
            {trip.seatsLeft != null && (
              <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold ${full ? "bg-red-600/90" : "bg-[#c5a86d] text-[#0e1d16]"}`}>
                {full ? t("full") : t("seatsLeft", { count: trip.seatsLeft })}
              </span>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8 flex flex-wrap gap-3">
            <a href="#prices" className="inline-flex items-center gap-2 rounded-lg bg-[#c5a86d] px-7 py-3.5 text-sm font-bold text-[#0e1d16] shadow-lg shadow-black/30 transition-all hover:-translate-y-0.5 hover:bg-[#d4b97f]">
              {t("seePrices")} <ArrowRight size={16} />
            </a>
            <button onClick={() => reserve(defaultOption)} className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-semibold backdrop-blur-md transition-colors hover:bg-white/20 cursor-pointer">
              {full ? t("waitlist.join") : t("reserve")}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ---------- Section menu ---------- */}
      <nav className="sticky top-16 lg:top-[84px] z-30 border-b border-neutral-200 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <ul className="flex gap-1 overflow-x-auto py-2 text-sm [scrollbar-width:none]">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block whitespace-nowrap rounded-full px-4 py-2 font-medium text-neutral-600 transition-colors hover:bg-[#f7f5f0] hover:text-[#0a1811]">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          {from > 0 && (
            <div className="hidden shrink-0 items-center gap-4 md:flex">
              <p className="text-right leading-tight">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">{t("from")}</span>
                <TripMoney amount={from} currency={trip.currency} className="font-serif text-xl font-bold text-[#0a1811]" />
              </p>
              <button onClick={() => reserve(defaultOption)} className="rounded-lg bg-[#0a1811] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#b28236] transition-colors cursor-pointer">
                {full ? t("waitlist.join") : t("reserve")}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ---------- Overview ---------- */}
      <section id="overview" className="scroll-mt-36 mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:py-24 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Eyebrow>{t("overview")}</Eyebrow>
          <p className="mt-5 whitespace-pre-line text-base leading-[1.85] text-neutral-600 sm:text-lg">{trip.description}</p>

          {trip.highlights.length > 0 && (
            <div className="mt-12">
              <h3 className="flex items-center gap-2 font-serif text-2xl font-bold text-[#0a1811]">
                <Sparkles size={20} className={GOLD} /> {t("highlights")}
              </h3>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {trip.highlights.map((h, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 rounded-2xl bg-[#f7f5f0] p-4 ring-1 ring-black/[0.04]"
                  >
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#c5a86d] text-[#0e1d16]">
                      <Check size={14} strokeWidth={3} />
                    </span>
                    <span className="text-sm leading-relaxed text-neutral-700">{h}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Key facts */}
        <aside className="h-fit rounded-3xl bg-[#0a1811] p-7 text-white shadow-xl lg:sticky lg:top-40">
          <dl className="space-y-5">
            {dates && <Fact icon={<CalendarDays size={18} />} label={t("facts.dates")} value={dates} />}
            {(trip.duration || days > 0) && <Fact icon={<Clock size={18} />} label={t("facts.duration")} value={trip.duration ?? tc("days", { count: days })} />}
            {trip.groupSize && <Fact icon={<Users size={18} />} label={t("facts.group")} value={trip.groupSize} />}
            <Fact icon={<MapPin size={18} />} label={t("facts.location")} value={trip.location} />
          </dl>
          {from > 0 && (
            <div className="mt-7 border-t border-white/10 pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{t("facts.from")}</p>
              <TripMoney amount={from} currency={trip.currency} className="font-serif text-4xl font-bold text-[#d4af37]" approxClassName="text-white" />
              <p className="text-xs text-white/50 mt-1">{trip.prices.find((p) => p.price === from)?.unit}</p>
            </div>
          )}
          <a href="#prices" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c5a86d] py-3.5 text-sm font-bold text-[#0e1d16] hover:bg-[#d4b97f] transition-colors">
            {t("seePrices")} <ArrowRight size={16} />
          </a>
        </aside>
      </section>

      {/* ---------- Photos ---------- */}
      {trip.images.length > 1 && (
        <section id="photos" className="scroll-mt-36 bg-[#f7f5f0] py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Eyebrow>{t("gallery")}</Eyebrow>
            <div className="mt-8 grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] md:grid-cols-4">
              {trip.images.slice(0, 7).map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setPhoto(i)}
                  className={`group relative overflow-hidden rounded-2xl bg-neutral-200 cursor-zoom-in ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                  aria-label={t("photo", { n: i + 1, total: trip.images.length })}
                >
                  <SmartImage src={src} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "25vw"} />
                  <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                  {i === 6 && trip.images.length > 7 ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 font-serif text-2xl text-white">+{trip.images.length - 7}</span>
                  ) : (
                    <Expand size={18} className="absolute right-3 top-3 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Day by day ---------- */}
      {trip.itinerary.length > 0 && (
        <section id="itinerary" className="scroll-mt-36 mx-auto max-w-4xl px-6 py-16 sm:py-24">
          <Eyebrow>{t("itinerary")}</Eyebrow>
          <ol className="relative mt-10 space-y-8 before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-[#c5a86d] before:to-[#c5a86d]/10">
            {trip.itinerary.map((d, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45 }}
                className="relative flex gap-6"
              >
                <span className="relative z-10 flex size-12 shrink-0 flex-col items-center justify-center rounded-full bg-[#0a1811] text-white ring-4 ring-white">
                  <span className="text-[9px] uppercase tracking-wider text-white/60 leading-none">{t("dayLabel")}</span>
                  <span className="font-serif text-base font-bold leading-none mt-0.5">{i + 1}</span>
                </span>
                <div className="flex-1 rounded-2xl border border-neutral-100 bg-white p-5 shadow-[0_10px_30px_-20px_rgba(10,24,17,0.3)]">
                  <h3 className="font-serif text-lg font-bold text-[#0a1811]">{d.title}</h3>
                  {d.description && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-600">{d.description}</p>}
                </div>
              </motion.li>
            ))}
          </ol>
        </section>
      )}

      {/* ---------- Prices ---------- */}
      {trip.prices.length > 0 && (
        <section id="prices" className="scroll-mt-32 bg-gradient-to-b from-[#f7f5f0] to-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className={`text-xs font-semibold uppercase tracking-[0.35em] ${GOLD}`}>{t("pricesEyebrow")}</span>
              <h2 className="mt-3 font-serif text-3xl font-bold text-[#0a1811] sm:text-5xl">{t("pricesTitle")}</h2>
              <p className="mt-4 text-neutral-500">{t("pricesSubtitle")}</p>
              {(early || group) && (
                <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                  {early && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#0a1811] px-4 py-2 text-sm font-semibold text-white shadow-md">
                      <Gift size={15} className="text-[#d4af37]" /> {t("deals.earlyBird", { percent: early.percent, date: dealDate })}
                    </span>
                  )}
                  {group && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#c5a86d] px-4 py-2 text-sm font-semibold text-[#0e1d16] shadow-md">
                      <Users size={15} /> {t("deals.group", { percent: group.percent, min: group.min })}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div
              className={`mt-14 grid items-stretch gap-6 ${
                trip.prices.length === 1 ? "mx-auto max-w-xl" : trip.prices.length === 2 ? "mx-auto max-w-5xl md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {trip.prices.map((p, i) => (
                <PriceCard key={i} option={p} currency={trip.currency} index={i} full={full} earlyPercent={early?.percent ?? 0} onReserve={() => reserve(p.name)} />
              ))}
            </div>

            {trip.prices.length > 1 && <Comparison prices={trip.prices} currency={trip.currency} />}
          </div>
        </section>
      )}

      {/* ---------- Call to action ---------- */}
      <section className="relative overflow-hidden bg-[#0a1811] py-20 text-white">
        {trip.images[1] && <SmartImage src={trip.images[1]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" sizes="100vw" />}
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-serif text-3xl font-bold sm:text-5xl">{t("ctaTitle")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-300">{t("ctaText")}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <button onClick={() => reserve(defaultOption)} className="inline-flex items-center gap-2 rounded-lg bg-[#c5a86d] px-8 py-4 text-sm font-bold text-[#0e1d16] shadow-lg hover:bg-[#d4b97f] transition-colors cursor-pointer">
              {full ? t("waitlist.join") : t("reserve")} <ArrowRight size={16} />
            </button>
            <a
              href={whatsappLink(t("whatsappMessage", { title: trip.title, url }))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/5 px-8 py-4 text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              <FaWhatsapp size={18} className="text-[#25D366]" /> {t("whatsapp")}
            </a>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {reserving !== null && <ReserveModal trip={trip} option={reserving} onClose={() => setReserving(null)} />}
        {waiting && <WaitlistModal trip={trip} onClose={() => setWaiting(false)} />}
      </AnimatePresence>
      {photo !== null && <PhotoViewer images={trip.images} index={photo} onChange={setPhoto} onClose={() => setPhoto(null)} />}
    </div>
  );
}

// ---------- Pieces ----------

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-4 font-serif text-3xl font-bold text-[#0a1811] sm:text-4xl">
      <span className="h-px w-10 bg-[#c5a86d]" />
      {children}
    </h2>
  );
}

function HeroChip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
      <span className="text-[#d4af37]">{icon}</span>
      {children}
    </span>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[#d4af37] ring-1 ring-white/10">{icon}</span>
      <div>
        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium">{value}</dd>
      </div>
    </div>
  );
}

function PriceCard({ option: p, currency, index, full, earlyPercent, onReserve }: { option: TripPrice; currency: string; index: number; full: boolean; earlyPercent: number; onReserve: () => void }) {
  const t = useTranslations("Trips");
  const dark = p.popular;
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className={`relative flex flex-col rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-1 ${
        dark
          ? "bg-[#0a1811] text-white shadow-[0_30px_60px_-25px_rgba(10,24,17,0.7)] ring-2 ring-[#c5a86d] lg:-my-3 lg:py-11"
          : "bg-white shadow-[0_20px_50px_-30px_rgba(10,24,17,0.35)] ring-1 ring-black/[0.06]"
      }`}
    >
      {dark && (
        <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#c5a86d] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e1d16] shadow-lg">
          <Star size={12} className="fill-current" /> {t("popular")}
        </span>
      )}
      <h3 className={`font-serif text-2xl font-bold ${dark ? "text-white" : "text-[#0a1811]"}`}>{p.name}</h3>
      {p.description && <p className={`mt-2 text-sm leading-relaxed ${dark ? "text-white/65" : "text-neutral-500"}`}>{p.description}</p>}

      <div className={`mt-6 border-y py-6 ${dark ? "border-white/10" : "border-neutral-100"}`}>
        {earlyPercent > 0 && (
          <p className={`mb-1 flex items-center gap-2 text-sm ${dark ? "text-white/55" : "text-neutral-400"}`}>
            <TripMoney amount={p.price} currency={currency} className="line-through" />
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white no-underline">-{earlyPercent}%</span>
          </p>
        )}
        <TripMoney
          amount={bookingTotal({ price: p.price, unit: "per person", travelers: 1, discountPercent: earlyPercent })}
          currency={currency}
          className={`font-serif text-5xl font-bold tracking-tight ${dark ? "text-[#d4af37]" : "text-[#0a1811]"}`}
          approxClassName={dark ? "text-white" : ""}
        />
        <p className={`mt-1 text-sm ${dark ? "text-white/55" : "text-neutral-500"}`}>{p.unit}</p>
      </div>

      <div className="mt-6 flex-1 space-y-6">
        <div>
          <p className={`mb-3 text-[11px] font-bold uppercase tracking-[0.2em] ${dark ? "text-emerald-300" : "text-emerald-700"}`}>{t("included")}</p>
          {p.included.length ? (
            <ul className="space-y-2.5">
              {p.included.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 size={18} className={`mt-px shrink-0 ${dark ? "text-emerald-300" : "text-emerald-600"}`} />
                  <span className={dark ? "text-white/90" : "text-neutral-700"}>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`text-sm ${dark ? "text-white/50" : "text-neutral-400"}`}>{t("nothingListed")}</p>
          )}
        </div>
        {p.excluded.length > 0 && (
          <div>
            <p className={`mb-3 text-[11px] font-bold uppercase tracking-[0.2em] ${dark ? "text-white/45" : "text-neutral-400"}`}>{t("excluded")}</p>
            <ul className="space-y-2.5">
              {p.excluded.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <X size={18} className={`mt-px shrink-0 ${dark ? "text-white/35" : "text-neutral-300"}`} />
                  <span className={dark ? "text-white/55" : "text-neutral-500"}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        onClick={onReserve}
        className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold transition-all cursor-pointer ${
          dark ? "bg-[#c5a86d] text-[#0e1d16] hover:bg-[#d4b97f]" : "bg-[#0a1811] text-white hover:bg-[#b28236]"
        }`}
      >
        {full ? t("waitlist.join") : t("choose", { name: p.name })} <ArrowRight size={16} />
      </button>
    </motion.article>
  );
}

// A table of every item, with which option includes it
function Comparison({ prices, currency }: { prices: TripPrice[]; currency: string }) {
  const t = useTranslations("Trips");
  const items = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of prices) for (const item of [...p.included, ...p.excluded]) {
      const key = item.trim().toLowerCase();
      if (!seen.has(key)) seen.set(key, item.trim());
    }
    return [...seen.entries()];
  }, [prices]);
  if (items.length === 0) return null;
  const has = (list: string[], key: string) => list.some((x) => x.trim().toLowerCase() === key);

  return (
    <div className="mx-auto mt-20 max-w-5xl">
      <h3 className="flex items-center justify-center gap-2 text-center font-serif text-2xl font-bold text-[#0a1811]">
        <Tag size={20} className={GOLD} /> {t("compare")}
      </h3>
      <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-[0_20px_50px_-30px_rgba(10,24,17,0.35)] ring-1 ring-black/[0.06]">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-[#f7f5f0]/70">
              <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">{t("item")}</th>
              {prices.map((p, i) => (
                <th key={i} className={`px-4 py-4 text-center font-serif text-base font-bold ${p.popular ? "text-[#b28236]" : "text-[#0a1811]"}`}>
                  {p.name}
                  <TripMoney amount={p.price} currency={currency} className="block font-sans text-xs font-semibold text-neutral-500" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {items.map(([key, label]) => (
              <tr key={key} className="hover:bg-[#f7f5f0]/50">
                <td className="px-5 py-3.5 text-neutral-700">{label}</td>
                {prices.map((p, i) => (
                  <td key={i} className={`px-4 py-3.5 text-center ${p.popular ? "bg-[#c5a86d]/[0.06]" : ""}`}>
                    {has(p.included, key) ? (
                      <span className="inline-flex size-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600" title={t("yes")}>
                        <Check size={16} strokeWidth={3} />
                        <span className="sr-only">{t("yes")}</span>
                      </span>
                    ) : has(p.excluded, key) ? (
                      <span className="inline-flex size-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-400" title={t("no")}>
                        <X size={15} strokeWidth={2.5} />
                        <span className="sr-only">{t("no")}</span>
                      </span>
                    ) : (
                      <Minus size={16} className="mx-auto text-neutral-300" aria-hidden="true" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Full-screen photo viewer: arrows / Esc on the keyboard, buttons on phones
function PhotoViewer({ images, index, onChange, onClose }: { images: string[]; index: number; onChange: (i: number) => void; onClose: () => void }) {
  const t = useTranslations("Trips");
  const go = (dir: number) => onChange((index + dir + images.length) % images.length);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChange((index + 1) % images.length);
      if (e.key === "ArrowLeft") onChange((index - 1 + images.length) % images.length);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, images.length, onChange, onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95" role="dialog" aria-modal="true" onClick={onClose}>
      <button onClick={onClose} aria-label={t("close")} className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer">
        <X size={22} />
      </button>
      <p className="absolute left-1/2 top-6 -translate-x-1/2 text-sm text-white/60">{t("photo", { n: index + 1, total: images.length })}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[index]} alt="" className="max-h-[85vh] max-w-[92vw] rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label={t("prev")} className="absolute left-3 sm:left-6 flex size-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer">
            <ChevronLeft size={26} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); go(1); }} aria-label={t("next")} className="absolute right-3 sm:right-6 flex size-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer">
            <ChevronRight size={26} />
          </button>
        </>
      )}
    </div>,
    document.body,
  );
}

// "Reserve": saved as a booking of the trip (Admin > Trips > Bookings)
function ReserveModal({ trip, option, onClose }: { trip: Trip; option: string; onClose: () => void }) {
  const t = useTranslations("Trips.form");
  const locale = useLocale();
  const book = useTripsStore((s) => s.book);
  const maxTravelers = Math.min(50, trip.seatsLeft ?? 50);
  const [form, setForm] = useState({ option, name: "", email: "", phone: "", travelers: Math.min(2, maxTravelers), message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const chosen = trip.prices.find((p) => p.name === form.option);
  const currency = trip.currency;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await book(trip.id, {
        customer: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone || undefined,
        option: form.option,
        travelers: form.travelers,
        message: form.message.trim() || undefined,
        locale,
      });
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const input = "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c5a86d] focus:ring-4 focus:ring-[#c5a86d]/15";
  const label = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500";

  return createPortal(
    <motion.div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t("title", { title: trip.title })}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 320 }}
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="relative h-28 overflow-hidden bg-[#0a1811]">
          {trip.images[0] && <SmartImage src={trip.images[0]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" sizes="512px" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1811] to-transparent" />
          <p className="absolute bottom-4 left-6 right-14 font-serif text-xl font-bold leading-tight text-white line-clamp-2">{t("title", { title: trip.title })}</p>
          <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="p-8 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={34} />
            </span>
            <h3 className="mt-5 font-serif text-2xl font-bold text-[#0a1811]">{t("sentTitle")}</h3>
            <p className="mt-2 text-neutral-600">{t("sentText", { name: form.name.split(" ")[0] })}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 p-6">
            <p className="text-sm text-neutral-500">{t("subtitle")}</p>
            {trip.prices.length > 1 && (
              <div>
                <span className={label}>{t("option")}</span>
                <div className="grid gap-2">
                  {trip.prices.map((p) => (
                    <label
                      key={p.name}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                        form.option === p.name ? "border-[#c5a86d] bg-[#c5a86d]/10 ring-2 ring-[#c5a86d]/30" : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <input type="radio" name="option" value={p.name} checked={form.option === p.name} onChange={() => setForm({ ...form, option: p.name })} className="accent-[#b28236]" />
                        <span className="font-semibold text-[#0a1811]">{p.name}</span>
                      </span>
                      <TripMoney amount={p.price} currency={currency} className="font-semibold text-[#0a1811]" />
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className={label}>{t("name")}</span>
                <input required minLength={2} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
              </label>
              <label className="block">
                <span className={label}>{t("email")}</span>
                <input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} />
              </label>
              <label className="block">
                <span className={label}>{t("travelers")}</span>
                <input required type="number" min={1} max={maxTravelers} value={form.travelers} onChange={(e) => setForm({ ...form, travelers: Math.min(maxTravelers, Math.max(1, Number(e.target.value) || 1)) })} className={input} />
              </label>
              <div className="sm:col-span-2">
                <label htmlFor="trip-phone" className={label}>{t("phone")}</label>
                <PhoneField id="trip-phone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} className={input} />
              </div>
              <label className="block sm:col-span-2">
                <span className={label}>{t("message")}</span>
                <textarea rows={3} maxLength={2000} placeholder={t("messagePlaceholder")} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={input} />
              </label>
            </div>
            {chosen && <ReserveTotal trip={trip} price={chosen.price} unit={chosen.unit} travelers={form.travelers} />}
            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{t("error", { error })}</p>}
            <button type="submit" disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a1811] py-4 text-sm font-bold text-white transition-colors hover:bg-[#b28236] disabled:opacity-60 cursor-pointer">
              {sending ? t("sending") : t("send")} {!sending && <ArrowRight size={16} />}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  );
}

// The reservation total, with the early bird and group discounts the traveler gets now
function ReserveTotal({ trip, price, unit, travelers }: { trip: Trip; price: number; unit: string; travelers: number }) {
  const t = useTranslations("Trips.form");
  const d = tripDiscount(trip, travelers);
  const subtotal = bookingSubtotal({ price, unit, travelers });
  const total = bookingTotal({ price, unit, travelers, discountPercent: d.percent });
  const groupHint = trip.groupPercent && trip.groupMinTravelers && !d.group ? t("groupHint", { min: trip.groupMinTravelers, percent: trip.groupPercent }) : null;
  return (
    <div className="space-y-1.5 rounded-xl bg-[#f7f5f0] px-4 py-3 text-sm">
      {d.percent > 0 && (
        <>
          <div className="flex items-center justify-between text-neutral-500">
            <span>{t("subtotal")}</span>
            <TripMoney amount={subtotal} currency={trip.currency} />
          </div>
          {d.early > 0 && (
            <div className="flex items-center justify-between font-medium text-emerald-700">
              <span>{t("earlyDiscount", { percent: d.early })}</span>
              <span>−{d.early}%</span>
            </div>
          )}
          {d.group > 0 && (
            <div className="flex items-center justify-between font-medium text-emerald-700">
              <span>{t("groupDiscount", { percent: d.group })}</span>
              <span>−{d.group}%</span>
            </div>
          )}
        </>
      )}
      <div className={`flex items-center justify-between ${d.percent > 0 ? "border-t border-neutral-200 pt-1.5" : ""}`}>
        <span className="text-neutral-600">{t("total")}</span>
        <TripMoney amount={total} currency={trip.currency} className="text-base font-bold text-[#0a1811]" />
      </div>
      {groupHint && <p className="text-xs text-[#8a6d2f]">{groupHint}</p>}
    </div>
  );
}

// The trip is full: wait for a seat. Everyone waiting is emailed when seats free up.
function WaitlistModal({ trip, onClose }: { trip: Trip; onClose: () => void }) {
  const t = useTranslations("Trips.waitlist");
  const tf = useTranslations("Trips.form");
  const locale = useLocale();
  const joinWaitlist = useTripsStore((s) => s.joinWaitlist);
  const [form, setForm] = useState({ name: "", email: "", phone: "", travelers: 2 });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await joinWaitlist(trip.id, {
        customer: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone || undefined,
        travelers: form.travelers,
        locale,
      });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const input = "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c5a86d] focus:ring-4 focus:ring-[#c5a86d]/15";
  const label = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500";

  return createPortal(
    <motion.div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 320 }}
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="relative bg-[#0a1811] px-6 pb-6 pt-7 text-white">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#c5a86d]/15 text-[#d4af37]">
            <BellRing size={22} />
          </span>
          <p className="mt-4 font-serif text-2xl font-bold">{t("title")}</p>
          <p className="mt-1.5 text-sm text-white/65">{t("subtitle", { title: trip.title })}</p>
          <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer">
            <X size={18} />
          </button>
        </div>
        {done ? (
          <div className="p-8 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={34} />
            </span>
            <h3 className="mt-5 font-serif text-2xl font-bold text-[#0a1811]">{t("doneTitle")}</h3>
            <p className="mt-2 text-neutral-600">{t("doneText", { name: form.name.split(" ")[0] })}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 p-6">
            <label className="block">
              <span className={label}>{tf("name")}</span>
              <input required minLength={2} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
            </label>
            <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
              <label className="block">
                <span className={label}>{tf("email")}</span>
                <input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} />
              </label>
              <label className="block">
                <span className={label}>{tf("travelers")}</span>
                <input required type="number" min={1} max={50} value={form.travelers} onChange={(e) => setForm({ ...form, travelers: Math.min(50, Math.max(1, Number(e.target.value) || 1)) })} className={input} />
              </label>
            </div>
            <div>
              <label htmlFor="wait-phone" className={label}>{tf("phone")}</label>
              <PhoneField id="wait-phone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} className={input} />
            </div>
            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{tf("error", { error })}</p>}
            <button type="submit" disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a1811] py-4 text-sm font-bold text-white transition-colors hover:bg-[#b28236] disabled:opacity-60 cursor-pointer">
              <BellRing size={16} /> {sending ? tf("sending") : t("send")}
            </button>
            <p className="text-center text-xs text-neutral-400">{t("note")}</p>
          </form>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
