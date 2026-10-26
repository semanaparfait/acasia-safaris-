"use client";

// Small pieces shared by the destination pages (list, details, add / edit).
import React, { useEffect, useState } from "react";
import { MapPin, Sparkles, X } from "lucide-react";
import { destinationGroups, groupIcon } from "@/lib/helpers";
import type { Destination, DestinationInput } from "@/lib/types";
import { useDestinationsStore } from "@/store/destinationsStore";
import { inputClass } from "../components/ui";

// A new destination that is not saved yet (id "")
export const blankDestination: Destination = {
  id: "",
  title: "",
  description: "",
  group: destinationGroups[0],
  location: "",
  image: "",
  highlights: [],
  bestTime: "",
  fromKigali: "",
  featured: false,
};

// What we send to the API (everything except the id)
export const toInput = (d: Destination): DestinationInput => ({
  title: d.title.trim(),
  description: d.description.trim(),
  group: d.group,
  location: d.location.trim(),
  image: d.image,
  highlights: d.highlights.map((h) => h.trim()).filter(Boolean),
  bestTime: d.bestTime.trim(),
  fromKigali: d.fromKigali.trim(),
  featured: d.featured,
});

// Loads one destination by id (for the details and edit pages).
// Shows the copy already in the store at once, then refreshes it from the API.
export function useDestination(id: string) {
  const destination = useDestinationsStore((s) => s.destinations.find((d) => d.id === id));
  const loadOne = useDestinationsStore((s) => s.loadOne);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadOne(id).catch((err: Error) => setError(err.message));
  }, [id, loadOne]);

  return { destination, error };
}

// "Wildlife" with its icon
export function GroupLabel({ group, className = "" }: { group: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {React.createElement(groupIcon(group), { className: "size-3.5" })}
      {group}
    </span>
  );
}

export function FeaturedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider bg-[#c5a86d] text-[#0a120b] px-2 py-1 rounded">
      <Sparkles className="size-3" /> FEATURED
    </span>
  );
}

// Highlights as tags: type one and press Enter (or comma) to add it, click × to remove it
export function HighlightsInput({ value, onChange }: { value: string[]; onChange: (highlights: string[]) => void }) {
  const [text, setText] = useState("");

  const add = () => {
    const highlight = text.trim().replace(/,$/, "");
    if (highlight && !value.some((h) => h.toLowerCase() === highlight.toLowerCase())) {
      onChange([...value, highlight]);
    }
    setText("");
  };

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((h) => (
            <span key={h} className="inline-flex items-center gap-1 pl-3 pr-1.5 py-1 rounded-full bg-[#2E7D5B]/10 text-[#1F5A42] text-xs font-medium">
              {h}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== h))} className="p-0.5 rounded-full hover:bg-[#2E7D5B]/20 cursor-pointer" aria-label={`Remove ${h}`}>
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        className={inputClass}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault(); // do not submit the form
            add();
          }
        }}
        onBlur={add}
        placeholder="Type a highlight and press Enter, e.g. Mountain gorillas"
      />
    </div>
  );
}

// How the destination looks on the website's Destinations page (used as a live preview)
export function WebsiteCardPreview({ destination: d }: { destination: Destination }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#0a120b]/5 shadow-sm">
      <div className="relative h-40 bg-[#12231a]">
        {d.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={d.image} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-[10px] font-semibold uppercase tracking-widest text-[#12231a]">
          <GroupLabel group={d.group} />
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-serif uppercase tracking-wide leading-tight">{d.title || "Destination name"}</h3>
        <p className="flex items-center gap-1 text-[11px] text-[#0a120b]/50 mt-1"><MapPin className="size-3" /> {d.location || "Location"}</p>
        <p className="text-xs text-[#0a120b]/60 mt-2 line-clamp-2">{d.description || "A short description of the place."}</p>
        {d.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {d.highlights.slice(0, 3).map((h) => (
              <span key={h} className="px-2 py-0.5 rounded-full bg-[#f7f5f0] text-[10px] text-[#0a120b]/65">{h}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Best time to visit: pick months ----------

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "Jun – Sep, Dec – Feb" -> [5, 6, 7, 8, 11, 0, 1]   (month numbers, Jan = 0)
export function parseMonths(text: string): number[] {
  if (text.trim().toLowerCase() === "all year") return MONTHS.map((_, i) => i);
  const index = (name: string) => MONTHS.findIndex((m) => m.toLowerCase() === name.trim().slice(0, 3).toLowerCase());
  const months = new Set<number>();
  for (const part of text.split(",")) {
    const [from, to] = part.split(/[–-]/).map(index);
    if (from < 0) continue;
    const end = to === undefined || to < 0 ? from : to;
    // walk forward, wrapping Dec -> Jan (e.g. "Dec – Feb")
    for (let m = from; ; m = (m + 1) % 12) {
      months.add(m);
      if (m === end) break;
    }
  }
  return [...months];
}

// [5, 6, 7, 8, 11, 0, 1] -> "Jun – Sep, Dec – Feb"
export function formatMonths(months: number[]): string {
  const selected = new Set(months);
  if (selected.size === 12) return "All year";
  if (selected.size === 0) return "";
  const ranges: string[] = [];
  for (let m = 0; m < 12; m++) {
    // a range starts at a selected month whose previous month is not selected
    if (!selected.has(m) || selected.has((m + 11) % 12)) continue;
    let end = m;
    while (selected.has((end + 1) % 12)) end = (end + 1) % 12;
    ranges.push(end === m ? MONTHS[m] : `${MONTHS[m]} – ${MONTHS[end]}`);
  }
  return ranges.join(", ");
}

// Click months to select them; the text ("Jun – Sep, Dec – Feb") is written for you
export function BestTimePicker({ value, onChange }: { value: string; onChange: (text: string) => void }) {
  const selected = parseMonths(value);
  const unreadable = value.trim() !== "" && selected.length === 0; // old free text we cannot turn into months

  const toggle = (m: number) =>
    onChange(formatMonths(selected.includes(m) ? selected.filter((x) => x !== m) : [...selected, m]));

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-6 gap-1.5">
        {MONTHS.map((name, m) => {
          const active = selected.includes(m);
          return (
            <button
              key={name}
              type="button"
              onClick={() => toggle(m)}
              aria-pressed={active}
              className={`py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                active ? "bg-[#12231a] text-white border-[#12231a]" : "bg-white text-[#0a120b]/65 border-[#0a120b]/12 hover:border-[#12231a]"
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-[#0a120b]/60">
          {unreadable ? (
            <span className="text-amber-700">Current text &ldquo;{value}&rdquo; is not months: pick the months to replace it.</span>
          ) : (
            <>Shown as: <span className="font-medium text-[#0a120b]">{value || "—"}</span></>
          )}
        </span>
        <span className="flex gap-2 shrink-0">
          <button type="button" onClick={() => onChange("All year")} className="text-[#2E7D5B] hover:underline cursor-pointer">All year</button>
          <button type="button" onClick={() => onChange("")} className="text-[#0a120b]/45 hover:underline cursor-pointer">Clear</button>
        </span>
      </div>
    </div>
  );
}
