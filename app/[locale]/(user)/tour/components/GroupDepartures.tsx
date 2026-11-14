"use client";

// Group departures on the website: a package on a fixed date that anyone can join.
//   DepartureList      on a package page (next to "Book this package")
//   DeparturesShowcase on /tour: every upcoming departure, links to the package page
//                      with ?join=<id>, which opens the booking with that date
import { useEffect } from "react";
import SmartImage from "@/components/ui/smart-image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, CalendarDays, Globe2, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Money } from "@/components/ui/money";
import { tripRange } from "@/lib/dates";
import type { Departure, TourPackage } from "@/lib/types";
import { useDeparturesStore } from "@/store/departuresStore";

export function useOpenDepartures() {
  const open = useDeparturesStore((s) => s.open);
  const loaded = useDeparturesStore((s) => s.openLoaded);
  const load = useDeparturesStore((s) => s.loadOpen);
  useEffect(() => {
    load();
  }, [load]);
  return { departures: open, loaded };
}

const range = (d: Departure, locale: string) => tripRange(d.startDate.slice(0, 10), d.endDate.slice(0, 10), locale);

// Seats taken out of all, as a thin bar
function SeatsBar({ d, dark = false }: { d: Departure; dark?: boolean }) {
  const taken = Math.round(((d.seats - d.seatsLeft) / d.seats) * 100);
  return (
    <div className={`h-1 rounded-full overflow-hidden ${dark ? "bg-white/15" : "bg-[#0a120b]/[0.07]"}`}>
      <div className="h-full rounded-full bg-[#C29342]" style={{ width: `${Math.max(taken, 4)}%` }} />
    </div>
  );
}

function SeatsText({ d }: { d: Departure }) {
  const t = useTranslations("Departures");
  if (d.seatsLeft === 0) return <span>{t("full")}</span>;
  return d.seatsLeft <= 3 ? <span className="font-semibold">{t("fewLeft", { count: d.seatsLeft })}</span> : <span>{t("seatsLeft", { count: d.seatsLeft })}</span>;
}

// ---------- On a package page ----------

export function DepartureList({ tour, onJoin }: { tour: TourPackage; onJoin: (d: Departure) => void }) {
  const t = useTranslations("Departures");
  const locale = useLocale();
  const { departures } = useOpenDepartures();
  const mine = departures.filter((d) => d.packageId === tour.id);
  if (mine.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#C29342]/35 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C29342] mb-1.5 flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5" /> {t("eyebrow")}
      </p>
      <h2 className="font-serif text-lg font-bold leading-snug text-[#122B1E]">{t("title")}</h2>
      <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">{t("text")}</p>

      <ul className="mt-4 space-y-2.5">
        {mine.map((d) => (
          <li key={d.id} className="rounded-xl border border-neutral-200 p-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-[#122B1E]">
              <CalendarDays className="w-3.5 h-3.5 text-[#C29342]" /> {range(d, locale)}
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-600">
              <SeatsText d={d} />
              {d.travelers > 0 && <span>{t("going", { count: d.travelers })}</span>}
            </div>
            <div className="mt-1.5"><SeatsBar d={d} /></div>
            {d.countries.length > 0 && (
              <p className="mt-2 flex items-start gap-1.5 text-[11px] text-neutral-500">
                <Globe2 className="w-3.5 h-3.5 shrink-0 mt-px" /> {t("from", { countries: d.countries.join(", ") })}
              </p>
            )}
            {d.note && <p className="mt-1.5 text-[11px] text-neutral-500 italic">{d.note}</p>}
            <button
              type="button"
              disabled={d.seatsLeft === 0}
              onClick={() => onJoin(d)}
              className="group mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#122B1E] hover:bg-[#1F5A42] text-white text-xs font-semibold uppercase tracking-wider px-3 py-2.5 transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              {d.seatsLeft === 0 ? t("full") : t("join")}
              {d.seatsLeft > 0 && <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- On /tour: every upcoming departure ----------

export function DeparturesShowcase({ packages }: { packages: TourPackage[] }) {
  const t = useTranslations("Departures");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const { departures } = useOpenDepartures();
  const list = departures
    .map((d) => ({ d, tour: packages.find((p) => p.id === d.packageId) }))
    .filter((x): x is { d: Departure; tour: TourPackage } => Boolean(x.tour))
    .slice(0, 6);
  if (list.length === 0) return null;

  return (
    <section className="bg-[#0B1E14] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37] flex items-center gap-2">
            <Users className="w-4 h-4" /> {t("eyebrow")}
          </p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold leading-tight">{t("showcaseTitle")}</h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-300 leading-relaxed">{t("showcaseText")}</p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(({ d, tour }) => (
            <Link
              key={d.id}
              href={`/tour/${tour.id}?join=${d.id}`}
              className="group rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10 hover:border-[#C29342]/60 transition-colors"
            >
              <div className="relative h-40 overflow-hidden">
                {tour.image && (
                  <SmartImage src={tour.image} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" sizes="(min-width: 1024px) 400px, 100vw" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E14] via-[#0B1E14]/30 to-transparent" />
                <span className="absolute top-3 left-3 rounded-full bg-[#0B1E14]/80 backdrop-blur px-3 py-1 text-[11px] font-semibold">
                  <CalendarDays className="inline w-3.5 h-3.5 mr-1 -mt-0.5 text-[#D4AF37]" />
                  {range(d, locale)}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-serif text-lg font-bold leading-snug">{tour.title}</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {tc("days", { count: tour.itinerary.length })} ·{" "}
                  {t.rich("perPerson", { price: () => <Money usd={tour.price} className="text-zinc-200 font-semibold" /> })}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-zinc-300">
                  <SeatsText d={d} />
                  {d.travelers > 0 && <span className="text-zinc-400">{t("going", { count: d.travelers })}</span>}
                </div>
                <div className="mt-1.5"><SeatsBar d={d} dark /></div>
                {d.countries.length > 0 && (
                  <p className="mt-3 flex items-start gap-1.5 text-[11px] text-zinc-400">
                    <Globe2 className="w-3.5 h-3.5 shrink-0 mt-px" /> {t("from", { countries: d.countries.join(", ") })}
                  </p>
                )}
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                  {d.seatsLeft === 0 ? t("full") : t("join")} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
