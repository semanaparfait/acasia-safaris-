"use client";

// Small pieces shared by the package pages (list, details, add / edit).
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ArrowDown, ArrowUp, ExternalLink, FileText, Loader2, Plus, Upload, X } from "lucide-react";
import { uploadImage } from "@/lib/api";
import { defaultRates, money, packageCategories } from "@/lib/helpers";
import type { PackageInput, Rate, TourPackage } from "@/lib/types";
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
  fairPrice: [],
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
    quotation: pkg.quotation || null,
    active: pkg.active,
    route: cleanList(pkg.route),
    itinerary: pkg.itinerary.map((d) => ({ title: d.title, description: d.description, image: d.image })),
    inclusions: cleanList(pkg.inclusions),
    exclusions: cleanList(pkg.exclusions),
    perks: cleanList(pkg.perks),
    fairPrice: cleanList(pkg.fairPrice),
    rates: pkg.rates ?? null,
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

const MAX_PDF_SIZE = 10 * 1024 * 1024; // same limit as the API

// The prices table of the quotation PDF. The adult price comes from the package.
export function RatesInput({ price, value, onChange }: { price: number; value?: Rate[] | null; onChange: (rates: Rate[]) => void }) {
  const rows = value?.length ? value : defaultRates(price);
  const setRow = (index: number, changes: Partial<Rate>) => onChange(rows.map((r, i) => (i === index ? { ...r, ...changes } : r)));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_1.4fr_100px] gap-2 text-[11px] font-medium uppercase tracking-wider text-[#0a120b]/45">
        <span>Traveler</span><span>Age</span><span>Price (USD)</span>
      </div>
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr_1.4fr_100px] gap-2">
          <input aria-label="Traveler" className={inputClass} value={row.label} onChange={(e) => setRow(i, { label: e.target.value })} />
          <input aria-label="Age" className={inputClass} value={row.ages} onChange={(e) => setRow(i, { ages: e.target.value })} />
          {i === 0 ? (
            <input aria-label="Adult price" disabled className={`${inputClass} opacity-60`} value={price ? money(price) : "—"} title="Set under Price per person" />
          ) : (
            <input
              aria-label={`${row.label} price`}
              type="number"
              min={0}
              className={inputClass}
              value={row.price}
              onChange={(e) => setRow(i, { price: Math.max(0, Math.round(Number(e.target.value))) })}
            />
          )}
        </div>
      ))}
      <p className="text-xs text-[#0a120b]/50">0 shows as Free. The adult price is the Price per person of this package.</p>
    </div>
  );
}

// View, replace or remove the quotation PDF, or make it from the package. `value` is the PDF's URL.
export function QuotationField({
  value,
  onChange,
  manual = false,
  onGenerate,
  uploadedMessage = "Quotation uploaded. Save the package to publish it.",
}: {
  value: string;
  onChange: (url: string) => void;
  manual?: boolean; // the admin uploaded this PDF
  onGenerate?: () => Promise<void>; // shows the "Create PDF" button
  uploadedMessage?: string;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    if (!onGenerate) return;
    setGenerating(true);
    await onGenerate();
    setGenerating(false);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf") return void toast.error("Please choose a PDF file");
    if (file.size > MAX_PDF_SIZE) return void toast.error("The PDF must be 10 MB or smaller");
    setUploading(true);
    try {
      onChange(await uploadImage("tourpackages", file));
      toast.success(uploadedMessage);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = ""; // allow picking the same file again
    }
  };

  return (
    <div>
      <input ref={fileInput} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-[#0a120b]/10 bg-[#f7f5f0] p-3">
          <span className="size-10 shrink-0 rounded-lg bg-[#12231a] text-[#c5a86d] flex items-center justify-center"><FileText className="size-5" /></span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{manual ? "Your uploaded PDF" : "Made from this package"}</p>
            <a href={value} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#2E7D5B] hover:underline">
              View file <ExternalLink className="size-3" />
            </a>
          </div>
          <button type="button" onClick={() => onChange("")} className="p-2 rounded-lg text-[#0a120b]/45 hover:text-red-600 hover:bg-red-50 cursor-pointer" aria-label="Remove quotation">
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <p className="text-xs text-[#0a120b]/50">
          No PDF yet. {onGenerate ? "Create one from this package, or upload your own." : "One is created from this package when you save it."}
        </p>
      )}
      {value && !manual && <p className="mt-2 text-xs text-[#0a120b]/50">Updates by itself each time you save this package.</p>}
      {onGenerate && (
        <button
          type="button"
          onClick={generate}
          disabled={generating || uploading}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#12231a] text-white px-3 py-2.5 text-sm font-medium hover:bg-[#1F5A42] disabled:opacity-50 cursor-pointer"
        >
          {generating ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
          {generating ? "Creating PDF…" : value ? "Remake PDF from package" : "Create PDF"}
        </button>
      )}
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        disabled={uploading || generating}
        className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#0a120b]/25 px-3 py-2.5 text-sm hover:border-[#2E7D5B] hover:bg-[#f7f5f0] disabled:opacity-50 cursor-pointer"
      >
        {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        {uploading ? "Uploading…" : "Upload my own PDF"}
      </button>
    </div>
  );
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
