"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, MapPin, Sun, Car, Sparkles } from "lucide-react";
import { useAdmin } from "../components/AdminStore";
import { Button, Card, ConfirmDialog, Modal, PageHeader, SearchInput, Tabs, Toggle, inputClass, labelClass } from "../components/ui";
import type { AdminDestination } from "../data/mock";

const groups = ["Wildlife", "Nature", "Culture", "Adventure", "Luxury"];

const blank: AdminDestination = {
  id: "",
  title: "",
  group: groups[0],
  location: "",
  image: "",
  bestTime: "",
  fromKigali: "",
  highlights: [],
  featured: false,
  visitors: 0,
};

export default function DestinationsPage() {
  const { destinations, setDestinations } = useAdmin();
  const [group, setGroup] = useState("All");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AdminDestination | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = destinations.filter(
    (d) => (group === "All" || d.group === group) && (d.title + d.location).toLowerCase().includes(query.toLowerCase())
  );

  const save = (d: AdminDestination) => {
    if (!d.id) {
      setDestinations((list) => [{ ...d, id: d.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + Date.now().toString(36) }, ...list]);
      toast.success("Destination added");
    } else {
      setDestinations((list) => list.map((x) => (x.id === d.id ? d : x)));
      toast.success("Destination updated");
    }
    setEditing(null);
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
              <div className="flex items-center justify-between pt-3 mt-1 border-t border-[#0a120b]/[0.06]">
                <span><span className="font-semibold text-[#0a120b] tabular-nums">{d.visitors.toLocaleString()}</span> page views</span>
                <label className="flex items-center gap-2">
                  Featured
                  <Toggle
                    checked={d.featured}
                    onChange={(v) => setDestinations((list) => list.map((x) => (x.id === d.id ? { ...x, featured: v } : x)))}
                    label="Featured"
                  />
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
        onConfirm={() => { setDestinations((list) => list.filter((d) => d.id !== deleteId)); toast.success("Destination deleted"); }}
        title="Delete destination"
        message="This destination will be removed from the website."
      />
    </>
  );
}

function DestinationForm({ initial, onClose, onSave }: { initial: AdminDestination; onClose: () => void; onSave: (d: AdminDestination) => void }) {
  const [form, setForm] = useState(initial);
  const [highlights, setHighlights] = useState(initial.highlights.join(", "));
  const set = <K extends keyof AdminDestination>(k: K, v: AdminDestination[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      open
      onClose={onClose}
      title={initial.id ? "Edit destination" : "New destination"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!form.title.trim()}
            onClick={() => onSave({ ...form, highlights: highlights.split(",").map((h) => h.trim()).filter(Boolean) })}
          >
            Save
          </Button>
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
          <label className={labelClass}>Image URL</label>
          <input className={inputClass} value={form.image} onChange={(e) => set("image", e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
