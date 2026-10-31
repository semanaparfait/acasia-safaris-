"use client";

// The add / edit package form, shown as a full page:
//   /admin/packages/new                 -> add a package
//   /admin/packages/<id>/edit  -> edit one package
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowUp, ArrowDown, X, Plus, Package, FileText, CalendarDays, Route, ListChecks, Gift, ImageIcon, DollarSign, Eye,
} from "lucide-react";
import { money, packageCategories } from "@/lib/helpers";
import type { TourPackage } from "@/lib/types";
import { Button, Card, Toggle, inputClass, labelClass } from "../components/ui";
import ImageField from "../components/ImageField";
import { ListInput, QuotationField, RatesInput } from "./parts";

export default function PackageForm({
  initial,
  backHref,
  onSave,
}: {
  initial: TourPackage;
  backHref: string; // where "Back" and "Cancel" go
  onSave: (p: TourPackage) => Promise<void>;
}) {
  const isNew = !initial.id;
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof TourPackage>(key: K, value: TourPackage[K]) => setForm((f) => ({ ...f, [key]: value }));

  const valid =
    form.title.trim() && form.location.trim() && form.price > 0 &&
    form.itinerary.length > 0 && form.itinerary.every((d) => d.title.trim());

  // ---- itinerary days ----
  const setDay = (index: number, field: "title" | "description" | "image", value: string) =>
    set("itinerary", form.itinerary.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  const addDay = () => set("itinerary", [...form.itinerary, { title: "", description: "", image: "" }]);
  const removeDay = (index: number) => set("itinerary", form.itinerary.filter((_, i) => i !== index));
  const moveDay = (index: number, dir: -1 | 1) => {
    const list = [...form.itinerary];
    [list[index], list[index + dir]] = [list[index + dir], list[index]];
    set("itinerary", list);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    const pdfChanged = (form.quotation ?? "") !== (initial.quotation ?? "");
    // the page shows a toast and navigates away on success
    await onSave({ ...form, quotation: pdfChanged ? form.quotation : undefined });
    setSaving(false);
  };

  const days = form.itinerary.length;

  return (
    <form onSubmit={submit} className="max-w-6xl">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-[#0a120b]/55 hover:text-[#0a120b] mb-4">
        <ArrowLeft className="size-4" /> Back
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{isNew ? "Add tour package" : `Edit ${initial.title}`}</h1>
          <p className="text-sm text-[#0a120b]/55 mt-0.5">
            {isNew ? "Build a new package day by day." : "Changes show on the website as soon as you save."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={backHref}><Button type="button" variant="secondary">Cancel</Button></Link>
          <Button type="submit" disabled={!valid || saving}>{saving ? "Saving…" : isNew ? "Create package" : "Save changes"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left: content */}
        <div className="lg:col-span-2 space-y-5">
          <Section icon={Package} title="Basics">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Title *</label>
                <input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. 7-Day Gorilla Trekking Adventure" />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
                  {packageCategories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Location *</label>
                <input className={inputClass} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Rwanda & Uganda" />
              </div>
              <div>
                <label className={labelClass}>Trip type</label>
                <input className={inputClass} value={form.tripType} onChange={(e) => set("tripType", e.target.value)} placeholder="e.g. Wildlife Safari" />
              </div>
              <div>
                <label className={labelClass}>Lodging</label>
                <input className={inputClass} value={form.lodging} onChange={(e) => set("lodging", e.target.value)} placeholder="e.g. Luxury Lodges" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Badge</label>
                <input className={inputClass} value={form.badge ?? ""} onChange={(e) => set("badge", e.target.value || undefined)} placeholder="Optional label on the photo, e.g. POPULAR" />
              </div>
            </div>
          </Section>

          <Section icon={FileText} title="Quotation PDF">
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Prices for adults and children</label>
                <RatesInput price={form.price} value={form.rates} onChange={(rates) => set("rates", rates)} />
              </div>
              <div>
                <label className={labelClass}>Why people choose this package</label>
                <ListInput value={form.whyChoose} onChange={(v) => set("whyChoose", v)} placeholder="e.g. Close to nature: see the Big Five in one short trip" />
              </div>
              <div>
                <label className={labelClass}>Why this price is fair</label>
                <ListInput value={form.fairPrice} onChange={(v) => set("fairPrice", v)} placeholder="e.g. Private vehicle: it is yours alone, so you travel at your own pace" />
              </div>
              <QuotationField manual={form.quotationManual} value={form.quotation ?? ""} onChange={(url) => { set("quotation", url); set("quotationManual", Boolean(url)); }} />
            </div>
          </Section>

          <Section icon={FileText} title="Overview">
            <label className={labelClass}>Description</label>
            <textarea rows={4} className={inputClass} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What makes this trip special?" />
          </Section>

          {/* Itinerary: the package duration is the number of days */}
          <Section
            icon={CalendarDays}
            title={`Itinerary · ${days} ${days === 1 ? "day" : "days"}`}
            action={<Button type="button" variant="secondary" onClick={addDay}><Plus className="size-4" /> Add day</Button>}
          >
            <ol className="relative space-y-4 before:absolute before:left-[15px] before:top-4 before:bottom-4 before:w-px before:bg-[#0a120b]/10">
              {form.itinerary.map((day, i) => (
                <li key={i} className="relative flex gap-4">
                  <span className="relative z-10 size-8 shrink-0 rounded-full bg-[#12231a] text-[#c5a86d] text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                  <div className="flex-1 min-w-0 rounded-xl border border-[#0a120b]/10 bg-[#f7f5f0]/60 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#0a120b]/50">Day {i + 1}</span>
                      <div className="flex gap-1">
                        <button type="button" disabled={i === 0} onClick={() => moveDay(i, -1)} className="p-1.5 rounded-lg text-[#0a120b]/55 hover:bg-[#0a120b]/5 disabled:opacity-30 cursor-pointer" aria-label="Move up"><ArrowUp className="size-3.5" /></button>
                        <button type="button" disabled={i === days - 1} onClick={() => moveDay(i, 1)} className="p-1.5 rounded-lg text-[#0a120b]/55 hover:bg-[#0a120b]/5 disabled:opacity-30 cursor-pointer" aria-label="Move down"><ArrowDown className="size-3.5" /></button>
                        <button type="button" disabled={days === 1} onClick={() => removeDay(i)} className="p-1.5 rounded-lg text-[#0a120b]/55 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 cursor-pointer" aria-label="Remove day"><X className="size-3.5" /></button>
                      </div>
                    </div>
                    <input className={inputClass} value={day.title} onChange={(e) => setDay(i, "title", e.target.value)} placeholder="Day title *, e.g. Arrival in Kigali" />
                    <textarea rows={2} className={inputClass} value={day.description} onChange={(e) => setDay(i, "description", e.target.value)} placeholder="What happens this day" />
                    <ImageField compact bucket="tourpackages" value={day.image} onChange={(url) => setDay(i, "image", url)} />
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section icon={Route} title="Route">
            <p className="text-xs text-[#0a120b]/50 mb-3">The stops in travel order, shown as the trip route on the website.</p>
            <ListInput ordered value={form.route} onChange={(v) => set("route", v)} placeholder="Add a stop, e.g. Volcanoes NP" />
          </Section>

          <Section icon={ListChecks} title="What's included">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Included</label>
                <ListInput value={form.inclusions} onChange={(v) => set("inclusions", v)} placeholder="e.g. Gorilla permit" />
              </div>
              <div>
                <label className={labelClass}>Not included</label>
                <ListInput value={form.exclusions} onChange={(v) => set("exclusions", v)} placeholder="e.g. International flights" />
              </div>
            </div>
          </Section>

          <Section icon={Gift} title="Perks (optional)">
            <ListInput value={form.perks ?? []} onChange={(v) => set("perks", v)} placeholder="e.g. Private champagne dinner" />
          </Section>
        </div>

        {/* Right: image, price, publishing, summary */}
        <div className="space-y-5 lg:sticky lg:top-24">
          <Section icon={ImageIcon} title="Main image">
            <div className="rounded-xl overflow-hidden bg-[#f7f5f0] border border-[#0a120b]/[0.06] aspect-[4/3] mb-3 flex items-center justify-center">
              {form.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <p className="text-xs text-[#0a120b]/40">No image yet</p>
              )}
            </div>
            <ImageField compact bucket="tourpackages" value={form.image} onChange={(url) => set("image", url)} />
          </Section>

          <Section icon={DollarSign} title="Price & visibility">
            <label className={labelClass}>Price per person (USD) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#0a120b]/40">$</span>
              <input type="number" min={0} className={`${inputClass} pl-7`} value={form.price || ""} onChange={(e) => set("price", Number(e.target.value))} placeholder="2450" />
            </div>
            <div className="flex items-start justify-between gap-4 mt-4 pt-4 border-t border-[#0a120b]/[0.06]">
              <div>
                <p className="text-sm font-medium">Publish on website</p>
                <p className="text-xs text-[#0a120b]/50 mt-0.5">Drafts are only visible to admins.</p>
              </div>
              <Toggle checked={form.active} onChange={(v) => set("active", v)} label="Publish on website" />
            </div>
          </Section>

          <Section icon={Eye} title="Summary">
            <dl className="space-y-2.5 text-sm">
              <SummaryRow label="Duration" value={`${days} ${days === 1 ? "day" : "days"}`} />
              <SummaryRow label="Price per person" value={form.price > 0 ? money(form.price) : "—"} />
              <SummaryRow label="Route stops" value={`${form.route.filter((r) => r.trim()).length}`} />
              <SummaryRow label="Included items" value={`${form.inclusions.filter((r) => r.trim()).length}`} />
              <SummaryRow label="Quotation" value={form.quotation ? "Uploaded" : "None"} />
              <SummaryRow label="Status" value={form.active ? "Live" : "Draft"} />
            </dl>
            {!valid && (
              <p className="mt-4 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                To save: add a title, location, a price and a title for every day.
              </p>
            )}
          </Section>
        </div>
      </div>
    </form>
  );
}

function Section({ icon: Icon, title, action, children }: { icon: React.ElementType; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="size-4 text-[#2E7D5B]" /> {title}
        </h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[#0a120b]/50">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
