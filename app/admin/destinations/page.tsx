"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, MapPin, Sun, Car, Sparkles } from "lucide-react";
import { destinationGroups as groups } from "@/lib/helpers";
import type { Destination, DestinationInput } from "@/lib/types";
import { useDestinationsStore } from "@/store/destinationsStore";
import { Button, Card, ConfirmDialog, EmptyState, Modal, PageHeader, SearchInput, Tabs, Toggle, inputClass, labelClass } from "../components/ui";
import ImageField from "../components/ImageField";

const blank: Destination = {
  id: "",
  title: "",
  description: "",
  group: groups[0],
  location: "",
  image: "",
  highlights: [],
  bestTime: "",
  fromKigali: "",
  featured: false,
};

// What we send to the API (everything except the id)
const toInput = (d: Destination): DestinationInput => ({
  title: d.title,
  description: d.description,
  group: d.group,
  location: d.location,
  image: d.image,
  highlights: d.highlights,
  bestTime: d.bestTime,
  fromKigali: d.fromKigali,
  featured: d.featured,
});

export default function DestinationsPage() {
  const destinations = useDestinationsStore((s) => s.destinations);
  const loading = useDestinationsStore((s) => s.loading);
  const error = useDestinationsStore((s) => s.error);
  const load = useDestinationsStore((s) => s.load);
  const createDestination = useDestinationsStore((s) => s.createDestination);
  const updateDestination = useDestinationsStore((s) => s.updateDestination);
  const deleteDestination = useDestinationsStore((s) => s.deleteDestination);

  useEffect(() => {
    load();
  }, [load]);

  const [group, setGroup] = useState("All");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Destination | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = destinations.filter(
    (d) => (group === "All" || d.group === group) && (d.title + d.location).toLowerCase().includes(query.toLowerCase())
  );

  const save = async (d: Destination) => {
    try {
      if (!d.id) {
        await createDestination(toInput(d));
        toast.success("Destination added");
      } else {
        await updateDestination(d.id, toInput(d));
        toast.success("Destination updated");
      }
      setEditing(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const toggleFeatured = async (d: Destination, featured: boolean) => {
    try {
      await updateDestination(d.id, toInput({ ...d, featured }));
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      await deleteDestination(deleteId);
      toast.success("Destination deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <PageHeader
        title="Destinations"
        subtitle="Places shown on the Destinations page and in the booking form."
        actions={<Button onClick={() => setEditing(blank)}><Plus className="size-4" /> Add destination</Button>}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
        <Tabs value={group} onChange={setGroup} tabs={[{ value: "All", label: "All" }, ...groups.map((g) => ({ value: g, label: g }))]} />
        <SearchInput value={query} onChange={setQuery} placeholder="Search destinations…" className="lg:w-64" />
      </div>

      {error && <Card className="p-5 mb-5 text-sm text-red-700">Could not load destinations: {error}</Card>}
      {loading && destinations.length === 0 && <Card><EmptyState title="Loading destinations…" /></Card>}
      {!loading && filtered.length === 0 && <Card><EmptyState title="No destinations found" /></Card>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {filtered.map((d) => (
          <Card key={d.id} className="overflow-hidden group">
            <div className="relative h-44 bg-[#12231a]">
              {d.image && <Image src={d.image} alt={d.title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-700" />}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a120b]/80 via-[#0a120b]/10 to-transparent" />
              {d.featured && (
                <span className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-semibold tracking-wider bg-[#c5a86d] text-[#0a120b] px-2 py-1 rounded">
                  <Sparkles className="size-3" /> FEATURED
                </span>
              )}
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#c5a86d]">{d.group}</p>
                <h3 className="font-semibold">{d.title}</h3>
              </div>
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(d)} className="p-2 rounded-lg bg-white/90 text-[#0a120b] hover:bg-white cursor-pointer" aria-label="Edit"><Pencil className="size-3.5" /></button>
                <button onClick={() => setDeleteId(d.id)} className="p-2 rounded-lg bg-white/90 text-red-600 hover:bg-white cursor-pointer" aria-label="Delete"><Trash2 className="size-3.5" /></button>
              </div>
            </div>
            <div className="p-4 space-y-2 text-xs text-[#0a120b]/60">
              <p className="flex items-center gap-1.5"><MapPin className="size-3.5 shrink-0" /> <span className="truncate">{d.location}</span></p>
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5"><Sun className="size-3.5" /> {d.bestTime || "—"}</span>
                <span className="flex items-center gap-1.5"><Car className="size-3.5" /> {d.fromKigali || "—"}</span>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {d.highlights.map((h) => (
                  <span key={h} className="px-2 py-0.5 rounded-full bg-[#f7f5f0] text-[#0a120b]/65">{h}</span>
                ))}
              </div>
              <div className="flex items-center justify-end pt-3 mt-1 border-t border-[#0a120b]/[0.06]">
                <label className="flex items-center gap-2">
                  Featured
                  <Toggle checked={d.featured} onChange={(v) => toggleFeatured(d, v)} label="Featured" />
                </label>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {editing && <DestinationForm initial={editing} onClose={() => setEditing(null)} onSave={save} />}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete destination"
        message="This destination will be removed from the website."
      />
    </>
  );
}

function DestinationForm({ initial, onClose, onSave }: { initial: Destination; onClose: () => void; onSave: (d: Destination) => Promise<void> }) {
  const [form, setForm] = useState(initial);
  const [highlights, setHighlights] = useState(initial.highlights.join(", "));
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Destination>(k: K, v: Destination[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    await onSave({ ...form, highlights: highlights.split(",").map((h) => h.trim()).filter(Boolean) });
    setSaving(false);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={initial.id ? "Edit destination" : "New destination"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={!form.title.trim() || saving} onClick={submit}>{saving ? "Saving…" : "Save"}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Title *</label>
          <input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Group</label>
          <select className={inputClass} value={form.group} onChange={(e) => set("group", e.target.value)}>
            {groups.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea rows={2} className={inputClass} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Location</label>
          <input className={inputClass} value={form.location} onChange={(e) => set("location", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Best time to visit</label>
          <input className={inputClass} value={form.bestTime} onChange={(e) => set("bestTime", e.target.value)} placeholder="Jun – Sep" />
        </div>
        <div>
          <label className={labelClass}>Drive from Kigali</label>
          <input className={inputClass} value={form.fromKigali} onChange={(e) => set("fromKigali", e.target.value)} placeholder="2.5 hrs" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Highlights (comma separated)</label>
          <input className={inputClass} value={highlights} onChange={(e) => setHighlights(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <ImageField label="Image" bucket="destinations" value={form.image} onChange={(url) => set("image", url)} />
        </div>
      </div>
    </Modal>
  );
}
