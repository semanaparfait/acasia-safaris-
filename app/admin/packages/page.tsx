"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, MapPin, Clock, BedDouble, LayoutGrid, List, ArrowUp, ArrowDown, X } from "lucide-react";
import { daysLabel, money, packageCategories as categories } from "@/lib/helpers";
import type { ItineraryDay, PackageInput, TourPackage } from "@/lib/types";
import { useBookingsStore } from "@/store/bookingsStore";
import { usePackagesStore } from "@/store/packagesStore";
import { Badge, Button, Card, ConfirmDialog, EmptyState, Modal, PageHeader, SearchInput, Tabs, Toggle, inputClass, labelClass } from "../components/ui";
import ImageField from "../components/ImageField";

// A package being edited in the form. id is "" for a new package.
type AdminPackage = TourPackage;

const blank: AdminPackage = {
  id: "",
  title: "",
  category: categories[0],
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

// What we send to the API: no id, days in order, empty list lines removed
function toInput(pkg: AdminPackage): PackageInput {
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

export default function PackagesPage() {
  const packages = usePackagesStore((s) => s.packages);
  const loading = usePackagesStore((s) => s.loading);
  const error = usePackagesStore((s) => s.error);
  const loadAll = usePackagesStore((s) => s.loadAll);
  const createPackage = usePackagesStore((s) => s.createPackage);
  const updatePackage = usePackagesStore((s) => s.updatePackage);
  const deletePackage = usePackagesStore((s) => s.deletePackage);
  const bookings = useBookingsStore((s) => s.bookings);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const bookingCount = (id: string) => bookings.filter((b) => b.packageId === id).length;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [editing, setEditing] = useState<AdminPackage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = packages.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (p.title + p.location).toLowerCase().includes(query.toLowerCase())
  );

  const save = async (pkg: AdminPackage) => {
    try {
      if (!pkg.id) {
        await createPackage(toInput(pkg));
        toast.success("Package created");
      } else {
        await updatePackage(pkg.id, toInput(pkg));
        toast.success("Package updated");
      }
      setEditing(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const toggleActive = async (pkg: AdminPackage, active: boolean) => {
    try {
      await updatePackage(pkg.id, toInput({ ...pkg, active }));
      toast.success(active ? "Package published" : "Package moved to drafts");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      await deletePackage(deleteId);
      toast.success("Package deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <PageHeader
        title="Tour Packages"
        subtitle={`${packages.length} packages · ${packages.filter((p) => p.active).length} live on the website`}
        actions={<Button onClick={() => setEditing(blank)}><Plus className="size-4" /> Add package</Button>}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
        <Tabs
          value={category}
          onChange={setCategory}
          tabs={[{ value: "All", label: "All" }, ...categories.map((c) => ({ value: c, label: c }))]}
        />
        <div className="flex gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="Search packages…" className="flex-1 lg:w-64" />
          <div className="flex bg-white border border-[#0a120b]/10 rounded-lg p-0.5">
            {(["grid", "list"] as const).map((v) => {
              const Icon = v === "grid" ? LayoutGrid : List;
              return (
                <button key={v} onClick={() => setView(v)} aria-label={`${v} view`} className={`p-2 rounded-md cursor-pointer ${view === v ? "bg-[#12231a] text-white" : "text-[#0a120b]/50"}`}>
                  <Icon className="size-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && <Card className="p-5 mb-5 text-sm text-red-700">Could not load packages: {error}</Card>}

      {loading && packages.length === 0 ? (
        <Card><EmptyState title="Loading packages…" /></Card>
      ) : filtered.length === 0 ? (
        <Card><EmptyState title="No packages found" text="Create your first package to get started." /></Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="overflow-hidden group h-full flex flex-col">
                <div className="relative h-48 bg-[#12231a]">
                  {p.image && <Image src={p.image} alt={p.title} fill unoptimized sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a120b]/70 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {p.badge && <span className="text-[10px] font-semibold tracking-wider bg-[#c5a86d] text-[#0a120b] px-2 py-1 rounded">{p.badge}</span>}
                    {!p.active && <span className="text-[10px] font-semibold tracking-wider bg-white/90 text-[#0a120b] px-2 py-1 rounded">DRAFT</span>}
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                    <span className="text-xs bg-white/15 backdrop-blur px-2 py-1 rounded">{p.category}</span>
                    <span className="text-lg font-semibold">{money(p.price)}</span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold leading-snug">{p.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[#0a120b]/55">
                    <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {p.location}</span>
                    <span className="flex items-center gap-1"><Clock className="size-3.5" /> {daysLabel(p)}</span>
                    <span className="flex items-center gap-1"><BedDouble className="size-3.5" /> {p.lodging}</span>
                  </div>
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#0a120b]/[0.06] mt-4">
                    <div className="flex items-center gap-2 text-xs text-[#0a120b]/60">
                      <Toggle checked={p.active} onChange={(v) => toggleActive(p, v)} label="Published" />
                      {p.active ? "Live" : "Draft"} · {bookingCount(p.id)} bookings
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(p)} className="p-2 rounded-lg text-[#0a120b]/55 hover:bg-[#0a120b]/5 cursor-pointer" aria-label="Edit"><Pencil className="size-4" /></button>
                      <button onClick={() => setDeleteId(p.id)} className="p-2 rounded-lg text-[#0a120b]/55 hover:text-red-600 hover:bg-red-50 cursor-pointer" aria-label="Delete"><Trash2 className="size-4" /></button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#0a120b]/45 bg-[#f7f5f0]/60 border-b border-[#0a120b]/[0.06]">
                  <th className="px-5 py-3 font-medium">Package</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Duration</th>
                  <th className="px-5 py-3 font-medium text-right">Price</th>
                  <th className="px-5 py-3 font-medium text-right">Bookings</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0a120b]/[0.05]">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-[#f7f5f0]/70">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 rounded-lg overflow-hidden bg-[#12231a] shrink-0">
                          {p.image && <Image src={p.image} alt="" fill unoptimized sizes="48px" className="object-cover" />}
                        </div>
                        <div>
                          <p className="font-medium">{p.title}</p>
                          <p className="text-xs text-[#0a120b]/45">{p.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#0a120b]/70">{p.category}</td>
                    <td className="px-5 py-3 text-[#0a120b]/70">{daysLabel(p)}</td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums">{money(p.price)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{bookingCount(p.id)}</td>
                    <td className="px-5 py-3"><Badge tone={p.active ? "green" : "gray"}>{p.active ? "Live" : "Draft"}</Badge></td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setEditing(p)} className="p-1.5 rounded-lg text-[#0a120b]/55 hover:bg-[#0a120b]/5 cursor-pointer" aria-label="Edit"><Pencil className="size-4" /></button>
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg text-[#0a120b]/55 hover:text-red-600 hover:bg-red-50 cursor-pointer" aria-label="Delete"><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {editing && <PackageForm initial={editing} onClose={() => setEditing(null)} onSave={save} />}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete package"
        message="This package will be removed from the website. Existing bookings are not affected."
      />
    </>
  );
}

function ListField({ label, hint, value, onChange }: { label: string; hint?: string; value: string[] | undefined; onChange: (v: string[]) => void }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <textarea rows={4} className={inputClass} value={(value ?? []).join("\n")} onChange={(e) => onChange(e.target.value.split("\n"))} placeholder={hint ?? "One per line"} />
    </div>
  );
}

function PackageForm({ initial, onClose, onSave }: { initial: AdminPackage; onClose: () => void; onSave: (p: AdminPackage) => Promise<void> }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };
  const set = <K extends keyof AdminPackage>(key: K, value: AdminPackage[K]) => setForm((f) => ({ ...f, [key]: value }));
  const valid =
    form.title.trim() && form.location.trim() && form.price > 0 &&
    form.itinerary.length > 0 && form.itinerary.every((d) => d.title.trim());

  const setDay = (index: number, field: "title" | "description" | "image", value: string) =>
    set("itinerary", form.itinerary.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  const addDay = () => set("itinerary", [...form.itinerary, { title: "", description: "", image: "" }]);
  const removeDay = (index: number) => set("itinerary", form.itinerary.filter((_, i) => i !== index));
  const moveDay = (index: number, dir: -1 | 1) => {
    const list = [...form.itinerary];
    [list[index], list[index + dir]] = [list[index + dir], list[index]];
    set("itinerary", list);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={initial.id ? "Edit package" : "New package"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={!valid || saving} onClick={submit}>{saving ? "Saving…" : initial.id ? "Save changes" : "Create package"}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Title *</label>
          <input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. 7-Day Gorilla Trekking Adventure" />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Location *</label>
          <input className={inputClass} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Rwanda & Uganda" />
        </div>
        <div>
          <label className={labelClass}>Price per person (USD) *</label>
          <input type="number" min={0} className={inputClass} value={form.price || ""} onChange={(e) => set("price", Number(e.target.value))} placeholder="2450" />
        </div>
        <div>
          <label className={labelClass}>Trip type</label>
          <input className={inputClass} value={form.tripType} onChange={(e) => set("tripType", e.target.value)} placeholder="Wildlife Safari" />
        </div>
        <div>
          <label className={labelClass}>Lodging</label>
          <input className={inputClass} value={form.lodging} onChange={(e) => set("lodging", e.target.value)} placeholder="Luxury Lodges" />
        </div>
        <div>
          <label className={labelClass}>Badge</label>
          <input className={inputClass} value={form.badge ?? ""} onChange={(e) => set("badge", e.target.value || undefined)} placeholder="POPULAR (optional)" />
        </div>
        <div className="sm:col-span-2">
          <ImageField label="Main image" bucket="tourpackages" value={form.image} onChange={(url) => set("image", url)} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        {/* Itinerary: the package duration is the number of days */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className={labelClass}>Itinerary · {form.itinerary.length} {form.itinerary.length === 1 ? "day" : "days"} *</span>
            <Button variant="secondary" onClick={addDay}><Plus className="size-4" /> Add day</Button>
          </div>
          <div className="space-y-3">
            {form.itinerary.map((day, i) => (
              <div key={i} className="rounded-xl border border-[#0a120b]/10 bg-[#f7f5f0]/60 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#12231a]">Day {i + 1}</span>
                  <div className="flex gap-1">
                    <button type="button" disabled={i === 0} onClick={() => moveDay(i, -1)} className="p-1.5 rounded-lg text-[#0a120b]/55 hover:bg-[#0a120b]/5 disabled:opacity-30 cursor-pointer" aria-label="Move up"><ArrowUp className="size-3.5" /></button>
                    <button type="button" disabled={i === form.itinerary.length - 1} onClick={() => moveDay(i, 1)} className="p-1.5 rounded-lg text-[#0a120b]/55 hover:bg-[#0a120b]/5 disabled:opacity-30 cursor-pointer" aria-label="Move down"><ArrowDown className="size-3.5" /></button>
                    <button type="button" disabled={form.itinerary.length === 1} onClick={() => removeDay(i)} className="p-1.5 rounded-lg text-[#0a120b]/55 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 cursor-pointer" aria-label="Remove day"><X className="size-3.5" /></button>
                  </div>
                </div>
                <input className={inputClass} value={day.title} onChange={(e) => setDay(i, "title", e.target.value)} placeholder="Day title *" />
                <textarea rows={2} className={inputClass} value={day.description} onChange={(e) => setDay(i, "description", e.target.value)} placeholder="What happens this day" />
                <ImageField compact bucket="tourpackages" value={day.image} onChange={(url) => setDay(i, "image", url)} />
              </div>
            ))}
          </div>
        </div>

        <ListField label="Route stops (in order)" hint={"Kigali\nVolcanoes NP\nAkagera NP"} value={form.route} onChange={(v) => set("route", v)} />
        <ListField label="Perks (optional)" value={form.perks} onChange={(v) => set("perks", v)} />
        <ListField label="Inclusions" value={form.inclusions} onChange={(v) => set("inclusions", v)} />
        <ListField label="Exclusions" value={form.exclusions} onChange={(v) => set("exclusions", v)} />

        <div className="sm:col-span-2 flex items-center justify-between rounded-xl bg-[#f7f5f0] px-4 py-3">
          <div>
            <p className="text-sm font-medium">Publish on website</p>
            <p className="text-xs text-[#0a120b]/50">Drafts are only visible to admins.</p>
          </div>
          <Toggle checked={form.active} onChange={(v) => set("active", v)} label="Publish on website" />
        </div>
      </div>
    </Modal>
  );
}
