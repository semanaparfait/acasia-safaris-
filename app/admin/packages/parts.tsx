"use client";

// Small pieces shared by the package pages (list, details, add / edit).
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { packageCategories } from "@/lib/helpers";
import type { PackageInput, TourPackage } from "@/lib/types";
import { usePackagesStore } from "@/store/packagesStore";
import { Badge, inputClass } from "../components/ui";

// A new package that is not saved yet (id "")
export const blankPackage: TourPackage = {
  id: "",
  title: "",
  category: packageCategories[0],
  location: "",
  description: "",
  tripType: "",
  lodging: "",
  price: 0,
  image: "",
  active: true,
  route: [],
  itinerary: [{ title: "", description: "", image: "" }],
  inclusions: [],
  exclusions: [],
  perks: [],
};

const cleanList = (list: string[] = []) => list.map((s) => s.trim()).filter(Boolean);

// What we send to the API: no id, days in order, empty list items removed
export function toInput(pkg: TourPackage): PackageInput {
  return {
    title: pkg.title.trim(),
    category: pkg.category,
    badge: pkg.badge?.trim() || undefined,
    location: pkg.location.trim(),
    description: pkg.description,
    tripType: pkg.tripType,
    lodging: pkg.lodging,
    image: pkg.image,
    price: pkg.price,
    active: pkg.active,
    route: cleanList(pkg.route),
    itinerary: pkg.itinerary.map((d) => ({ title: d.title, description: d.description, image: d.image })),
    inclusions: cleanList(pkg.inclusions),
    exclusions: cleanList(pkg.exclusions),
    perks: cleanList(pkg.perks),
  };
}

// Loads one package by id (for the details and edit pages).
// Shows the copy already in the store at once, then refreshes it from the API.
export function usePackage(id: string) {
  const pkg = usePackagesStore((s) => s.packages.find((p) => p.id === id));
  const loadOne = usePackagesStore((s) => s.loadOne);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadOne(id).catch((err: Error) => setError(err.message));
  }, [id, loadOne]);

  return { pkg, error };
}

export function LiveBadge({ active }: { active: boolean }) {
  return <Badge tone={active ? "green" : "gray"}>{active ? "Live" : "Draft"}</Badge>;
}

// A list of short texts (route stops, inclusions…): type and press Enter to add,
// × to remove, and arrows to change the order when `ordered` is set.
export function ListInput({
  value,
  onChange,
  placeholder,
  ordered = false,
}: {
  value: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  ordered?: boolean; // show numbers and up / down arrows
}) {
  const [text, setText] = useState("");

  const add = () => {
    const item = text.trim();
    if (item) onChange([...value, item]);
    setText("");
  };
  const move = (index: number, dir: -1 | 1) => {
    const list = [...value];
    [list[index], list[index + dir]] = [list[index + dir], list[index]];
    onChange(list);
  };

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((item, i) => (
            <li key={`${item}-${i}`} className="group flex items-center gap-2 rounded-lg bg-[#f7f5f0] border border-[#0a120b]/[0.05] pl-3 pr-1 py-1.5 text-sm">
              {ordered && <span className="size-5 shrink-0 rounded-full bg-[#12231a] text-white text-[10px] font-semibold flex items-center justify-center">{i + 1}</span>}
              <input
                className="flex-1 min-w-0 bg-transparent outline-none"
                value={item}
                onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))}
              />
              {ordered && (
                <>
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="p-1 rounded text-[#0a120b]/45 hover:bg-[#0a120b]/5 disabled:opacity-25 cursor-pointer" aria-label="Move up"><ArrowUp className="size-3.5" /></button>
                  <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="p-1 rounded text-[#0a120b]/45 hover:bg-[#0a120b]/5 disabled:opacity-25 cursor-pointer" aria-label="Move down"><ArrowDown className="size-3.5" /></button>
                </>
              )}
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="p-1 rounded text-[#0a120b]/45 hover:text-red-600 hover:bg-red-50 cursor-pointer" aria-label="Remove"><X className="size-3.5" /></button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          className={inputClass}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // do not submit the form
              add();
            }
          }}
          placeholder={placeholder}
        />
        <button type="button" onClick={add} disabled={!text.trim()} className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0a120b]/10 bg-white px-3 text-sm hover:bg-[#f7f5f0] disabled:opacity-40 cursor-pointer">
          <Plus className="size-4" /> Add
        </button>
      </div>
    </div>
  );
}
