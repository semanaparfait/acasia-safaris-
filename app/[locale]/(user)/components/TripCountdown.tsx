"use client";

// Home page badge: a small floating card (bottom-left) announcing the next special trip (Admin > Trips)
// with a live countdown to its departure. Shown only while a published trip is still ahead; it can be closed.
import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SmartImage from "@/components/ui/smart-image";
import type { Trip } from "@/lib/types";

// Trips start at midnight in Rwanda (UTC+2)
const departure = (t: Trip) => new Date(`${t.startDate!.slice(0, 10)}T00:00:00+02:00`).getTime();

// The current second, ticking in the browser; null while rendering on the server
const subscribe = (tick: () => void) => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
};
const nowSecond = () => Math.floor(Date.now() / 1000) * 1000;
const serverNow = () => null;

// Each trip stays this long when there are several
const ROTATE_MS = 6000;

export default function TripCountdown({ trips }: { trips: Trip[] }) {
  const t = useTranslations("Trips.banner");
  const tt = useTranslations("Trips");
  const now = useSyncExternalStore(subscribe, nowSecond, serverNow);
  const [closed, setClosed] = useState(false);
  const [offset, setOffset] = useState(0); // moves the rotation when a dot is clicked
  const [held, setHeld] = useState<number | null>(null); // the trip kept while the mouse is over the badge

  // Trips still ahead, the soonest first (the server list can be up to 5 minutes old)
  const upcoming = now == null ? [] : trips.filter((x) => x.startDate && departure(x) > now).sort((a, b) => departure(a) - departure(b));
  // With several trips, the badge shows each one in turn
  const rotating = now == null || upcoming.length === 0 ? 0 : (Math.floor(now / ROTATE_MS) + offset) % upcoming.length;
  const index = held != null && held < upcoming.length ? held : rotating;
  const trip = upcoming[index];

  const show = (i: number) => {
    setOffset((o) => o + i - index);
    if (held != null) setHeld(i);
  };

  const left = trip && now != null ? departure(trip) - now : 0;
  const units = [
    { key: "days", value: Math.floor(left / 864e5) },
    { key: "hours", value: Math.floor(left / 36e5) % 24 },
    { key: "minutes", value: Math.floor(left / 6e4) % 60 },
    { key: "seconds", value: Math.floor(left / 1e3) % 60 },
  ] as const;

  return (
    <AnimatePresence>
      {trip && !closed && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.5, delay: 1.2, ease: "easeOut" }}
          className="fixed bottom-5 left-4 z-[80] w-[calc(100%-6.5rem)] max-w-[340px] sm:bottom-6 sm:left-6"
        >
          <div
            onMouseEnter={() => setHeld(index)}
            onMouseLeave={() => {
              // carry on from the trip that was on screen
              if (held != null && now != null) setOffset(held - (Math.floor(now / ROTATE_MS) % upcoming.length) + upcoming.length);
              setHeld(null);
            }}
            className="relative overflow-hidden rounded-2xl bg-[#0a1811]/95 text-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] ring-1 ring-[#c5a86d]/40 backdrop-blur-md"
          >
            <button
              type="button"
              onClick={() => setClosed(true)}
              aria-label={tt("close")}
              className="absolute right-2 top-2 z-10 rounded-full p-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={14} />
            </button>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={trip.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}>
                <Link href={`/trips/${trip.id}`} className="group flex gap-3 p-3 pr-7">
                  {trip.images[0] && (
                    <span className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl">
                      <SmartImage src={trip.images[0]} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" sizes="72px" />
                    </span>
                  )}
    
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4af37] opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
                      </span>
                      {t("eyebrow")}
                    </span>
                    <span className="mt-0.5 block truncate font-serif text-sm font-bold">{trip.title}</span>
    
                    <span className="mt-1.5 flex items-end gap-1" role="timer" aria-label={t("label")}>
                      {units.map((u, i) => (
                        <span key={u.key} className="flex items-end gap-1">
                          {i > 0 && <span className="pb-3 text-xs text-[#c5a86d]/60">:</span>}
                          <span className="flex flex-col items-center">
                            <span className="min-w-[30px] rounded-md bg-white/10 px-1 py-0.5 text-center font-serif text-sm font-bold tabular-nums text-[#d4af37]">
                              {String(u.value).padStart(2, "0")}
                            </span>
                            <span className="mt-0.5 text-[8px] uppercase tracking-wider text-zinc-400">{t(u.key)}</span>
                          </span>
                        </span>
                      ))}
                      <ArrowRight size={15} className="mb-3 ml-auto shrink-0 text-[#c5a86d] transition-transform group-hover:translate-x-1" />
                    </span>
                  </span>
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* Several trips: a dot per trip, and the link to all of them */}
            {upcoming.length > 1 && (
              <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
                <div className="flex items-center gap-1.5">
                  {upcoming.map((x, i) => (
                    <button
                      key={x.id}
                      type="button"
                      onClick={() => show(i)}
                      aria-label={x.title}
                      aria-current={i === index}
                      className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-[#d4af37]" : "w-1.5 bg-white/30 hover:bg-white/60"}`}
                    />
                  ))}
                  <span className="ml-1.5 text-[10px] tabular-nums text-zinc-400">
                    {index + 1}/{upcoming.length}
                  </span>
                </div>
                <Link href="/trips" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#c5a86d] hover:text-[#d4af37]">
                  {tt("allTrips")} <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
