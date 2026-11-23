"use client";

// On the visitor's booking page, before and during the trip:
//   TripCountdown   "Your trip starts in 23 days", "Day 2 of 5"
//   PackingList     what to do and pack, ticked off in this browser
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Hourglass, Luggage, PartyPopper, Sun } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { PublicBooking } from "@/lib/types";

const DAY = 86_400_000;

// Trip dates are calendar days stored at midnight UTC; today is the visitor's own day
const dayOf = (date: string) => {
  const d = new Date(date);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};
const today = (now: number) => {
  const d = new Date(now);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
};

// Not for a cancelled trip, nor once it is over
export function tripStage(booking: PublicBooking, now: number) {
  if (booking.status === "Cancelled" || booking.status === "Completed") return null;
  const start = dayOf(booking.startDate);
  const end = dayOf(booking.endDate);
  const t = today(now);
  if (t > end) return null;
  if (t < start) return { kind: "before" as const, days: Math.round((start - t) / DAY) };
  return { kind: "during" as const, day: Math.round((t - start) / DAY) + 1, of: Math.round((end - start) / DAY) + 1 };
}

export function TripCountdown({ booking, now }: { booking: PublicBooking; now: number }) {
  const t = useTranslations("MyBooking.countdown");
  const stage = tripStage(booking, now);
  if (!stage) return null;

  if (stage.kind === "during") {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-[#1F5A42] to-[#12231a] text-white shadow-sm p-5">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c5a86d]">
          <Sun size={14} /> {t("onTrip")}
        </p>
        <p className="font-serif text-2xl mt-2">{t("dayOf", { day: stage.day, of: stage.of })}</p>
        <div className="mt-3 h-1.5 rounded-full bg-white/15 overflow-hidden">
          <div className="h-full rounded-full bg-[#c5a86d]" style={{ width: `${(stage.day / stage.of) * 100}%` }} />
        </div>
        <p className="text-xs text-white/65 mt-3">{t("enjoy")}</p>
      </div>
    );
  }

  const { days } = stage;
  // A confirmed trip is something to look forward to; a request is still being arranged
  const confirmed = booking.status === "Confirmed";
  return (
    <div className="rounded-2xl bg-[#12231a] text-white shadow-sm p-5 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#c5a86d]/15" />
      <p className="relative flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c5a86d]">
        {days === 0 ? <PartyPopper size={14} /> : <Hourglass size={14} />} {confirmed ? t("eyebrowConfirmed") : t("eyebrow")}
      </p>
      {days === 0 ? (
        <p className="relative font-serif text-2xl mt-2">{t("today")}</p>
      ) : days === 1 ? (
        <p className="relative font-serif text-2xl mt-2">{t("tomorrow")}</p>
      ) : (
        <p className="relative mt-1 flex items-baseline gap-2">
          <span className="font-serif text-5xl text-[#c5a86d] tabular-nums">{days}</span>
          <span className="text-sm text-white/80">{t("daysToGo", { count: days })}</span>
        </p>
      )}
      <p className="relative text-xs text-white/60 mt-2">{confirmed ? t("readyText") : t("pendingText")}</p>
    </div>
  );
}

// ---------- Checklist ----------

// key = the text in messages (MyBooking.packing.items.<key>); gorilla = only for a gorilla trip
type Item = { key: string; gorilla?: boolean };
const BEFORE: Item[] = [{ key: "passport" }, { key: "visa" }, { key: "yellowFever" }, { key: "insurance" }, { key: "flights" }];
const PACK: Item[] = [
  { key: "boots" },
  { key: "rainJacket" },
  { key: "longSleeves" },
  { key: "gloves", gorilla: true },
  { key: "warmLayer" },
  { key: "sunscreen" },
  { key: "repellent" },
  { key: "binoculars" },
  { key: "cash" },
  { key: "noPlastic" },
];

function useTicks(token: string) {
  const key = `acacia-packing-${token.slice(0, 16)}`;
  const [ticks, setTicks] = useState<string[]>([]);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? "[]");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from the browser after the first render
      if (Array.isArray(saved)) setTicks(saved.filter((x) => typeof x === "string"));
    } catch {
      // Private mode: the list simply is not remembered
    }
  }, [key]);
  const toggle = (item: string) => {
    setTicks((prev) => {
      const next = prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item];
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };
  return { ticks, toggle };
}

export function PackingList({ booking, token, now }: { booking: PublicBooking; token: string; now: number }) {
  const t = useTranslations("MyBooking.packing");
  const { ticks, toggle } = useTicks(token);
  const stage = tripStage(booking, now);
  if (!stage || stage.kind !== "before") return null;

  const trip = `${booking.package?.title ?? ""} ${booking.package?.location ?? ""} ${booking.destinations.map((d) => d.title).join(" ")}`;
  const gorillas = /gorilla|volcano|sokwe|bwindi/i.test(trip);
  const groups = [
    { title: t("before"), items: BEFORE },
    { title: t("pack"), items: PACK.filter((i) => !i.gorilla || gorillas) },
  ];
  const all = groups.flatMap((g) => g.items.map((i) => i.key));
  const done = all.filter((k) => ticks.includes(k)).length;

  return (
    <div className="rounded-2xl bg-white border border-[#0a120b]/[0.07] shadow-sm p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#0a120b]/45">
          <Luggage size={14} /> {t("title")}
        </p>
        <span className="text-xs font-medium text-[#1F5A42] tabular-nums">
          {done}/{all.length}
        </span>
      </div>
      <div className="mt-2 h-1 rounded-full bg-[#0a120b]/[0.06] overflow-hidden">
        <div className="h-full rounded-full bg-[#1F5A42] transition-all" style={{ width: `${(done / all.length) * 100}%` }} />
      </div>

      {groups.map((g) => (
        <div key={g.title} className="mt-4">
          <p className="text-xs font-semibold text-[#12231a] mb-1.5">{g.title}</p>
          <ul className="space-y-0.5">
            {g.items.map((i) => {
              const on = ticks.includes(i.key);
              return (
                <li key={i.key}>
                  <button
                    type="button"
                    onClick={() => toggle(i.key)}
                    aria-pressed={on}
                    className="w-full flex items-start gap-2.5 rounded-lg px-1.5 py-1.5 text-left text-sm hover:bg-[#f7f5f0] cursor-pointer"
                  >
                    <span
                      className={`mt-0.5 size-4 shrink-0 rounded border flex items-center justify-center transition ${
                        on ? "bg-[#1F5A42] border-[#1F5A42] text-white" : "border-[#0a120b]/25"
                      }`}
                    >
                      {on && <Check size={12} strokeWidth={3} />}
                    </span>
                    <span className={on ? "text-[#0a120b]/40 line-through" : "text-[#0a120b]/75"}>{t(`items.${i.key}`)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <Link href="/faq" className="inline-block mt-3 text-xs font-medium text-[#8e7345] hover:underline">
        {t("moreQuestions")}
      </Link>
    </div>
  );
}
