"use client";

// The visible part of /trips: a banner, then one large card per trip.
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, MapPin, Tag, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SmartImage from "@/components/ui/smart-image";
import { TripMoney } from "@/components/ui/money";
import { fromPrice, tripDates } from "@/lib/trips";
import type { Trip } from "@/lib/types";

const HERO = "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=2200&auto=format&fit=crop&q=85";

export default function TripsList({ trips }: { trips: Trip[] }) {
  const t = useTranslations("Trips");
  const locale = useLocale();
  const heroImage = trips[0]?.images[0] ?? HERO;

  return (
    <>
      <section className="relative h-[420px] sm:h-[480px] w-full overflow-hidden bg-[#0a1811] text-white">
        <SmartImage src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1811] via-[#0a1811]/45 to-black/40" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-14">
          <span className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#d4af37]">{t("eyebrow")}</span>
          <h1 className="font-serif text-4xl font-bold leading-tight sm:text-6xl">{t("title")}</h1>
          <p className="mt-4 max-w-2xl text-sm text-zinc-200 sm:text-lg font-light">{t("subtitle")}</p>
        </div>
      </section>

      <section className="bg-[#f7f5f0] py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {trips.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
              <p className="text-neutral-600">{t("empty")}</p>
              <Link
                href="/booking"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0a1811] px-6 py-3 text-sm font-semibold text-white hover:bg-[#12231a]"
              >
                {t("planCustom")} <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {trips.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} reverse={i % 2 === 1} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function TripCard({ trip, reverse, locale }: { trip: Trip; reverse: boolean; locale: string }) {
  const t = useTranslations("Trips");
  const dates = tripDates(trip, locale);
  const from = fromPrice(trip);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="group grid overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_-30px_rgba(10,24,17,0.35)] ring-1 ring-black/5 lg:grid-cols-2"
    >
      <Link href={`/trips/${trip.id}`} className={`relative block min-h-[280px] overflow-hidden bg-[#12231a] lg:min-h-[420px] ${reverse ? "lg:order-2" : ""}`}>
        {trip.images[0] && (
          <SmartImage
            src={trip.images[0]}
            alt={trip.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {dates && (
          <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[#0a1811] shadow">
            <CalendarDays size={14} className="text-[#b28236]" /> {dates}
          </span>
        )}
      </Link>

      <div className="flex flex-col p-7 sm:p-10">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-[#b28236]">
          <MapPin size={14} /> {trip.location}
        </p>
        <h2 className="mt-3 font-serif text-2xl font-bold leading-tight text-[#0a1811] sm:text-3xl">{trip.title}</h2>
        {trip.tagline && <p className="mt-2 font-serif text-lg text-neutral-500 italic">{trip.tagline}</p>}
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-neutral-600">{trip.description}</p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs text-neutral-600">
          {!dates && <Chip icon={<CalendarDays size={14} />}>{trip.duration ?? t("datesOnRequest")}</Chip>}
          {dates && trip.duration && <Chip icon={<CalendarDays size={14} />}>{trip.duration}</Chip>}
          {trip.groupSize && <Chip icon={<Users size={14} />}>{trip.groupSize}</Chip>}
          <Chip icon={<Tag size={14} />}>{t("options", { count: trip.prices.length })}</Chip>
          {trip.seatsLeft != null && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold ${trip.seatsLeft === 0 ? "bg-red-50 text-red-700 ring-1 ring-red-200" : "bg-[#c5a86d]/15 text-[#8a6d2f] ring-1 ring-[#c5a86d]/40"}`}>
              <Users size={14} /> {trip.seatsLeft === 0 ? t("full") : t("seatsLeft", { count: trip.seatsLeft })}
            </span>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-neutral-100 pt-6">
          {from > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">{t("from")}</p>
              <TripMoney amount={from} currency={trip.currency} className="font-serif text-3xl font-bold text-[#0a1811]" />
              <span className="ml-1 text-xs text-neutral-500">{trip.prices.find((p) => p.price === from)?.unit}</span>
            </div>
          )}
          <Link
            href={`/trips/${trip.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0a1811] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#b28236] hover:gap-3"
          >
            {t("viewTrip")} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f7f5f0] px-3 py-1.5 ring-1 ring-black/5">
      <span className="text-[#b28236]">{icon}</span>
      {children}
    </span>
  );
}
