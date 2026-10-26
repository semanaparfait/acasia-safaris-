"use client";

// The add / edit destination form, shown as a full page:
//   /admin/destinations/new          -> add a destination
//   /admin/destinations/gorillas/edit -> edit "gorillas"
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPinned, FileText, Sparkles, Route, ImageIcon, Eye } from "lucide-react";
import { destinationGroups } from "@/lib/helpers";
import type { Destination } from "@/lib/types";
import { Button, Card, Toggle, inputClass, labelClass } from "../components/ui";
import ImageField from "../components/ImageField";
import { BestTimePicker, HighlightsInput, WebsiteCardPreview } from "./parts";

const DESCRIPTION_MAX = 400;

export default function DestinationForm({
  initial,
  backHref,
  onSave,
}: {
  initial: Destination;
  backHref: string; // where "Back" and "Cancel" go
  onSave: (d: Destination) => Promise<void>;
}) {
  const isNew = !initial.id;
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Destination>(key: K, value: Destination[K]) => setForm((f) => ({ ...f, [key]: value }));

  const valid = form.title.trim() && form.location.trim();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    await onSave(form); // the page shows a toast and navigates away on success
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="max-w-6xl">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-[#0a120b]/55 hover:text-[#0a120b] mb-4">
        <ArrowLeft className="size-4" /> Back
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{isNew ? "Add destination" : `Edit ${initial.title}`}</h1>
          <p className="text-sm text-[#0a120b]/55 mt-0.5">
            {isNew ? "A new place for the Destinations page and the booking form." : "Changes show on the website as soon as you save."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={backHref}><Button type="button" variant="secondary">Cancel</Button></Link>
          <Button type="submit" disabled={!valid || saving}>{saving ? "Saving…" : isNew ? "Add destination" : "Save changes"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left: content */}
        <div className="lg:col-span-2 space-y-5">
          <Section icon={MapPinned} title="Basics">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Name *</label>
                <input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Volcanoes National Park" />
              </div>
              <div>
                <label className={labelClass}>Group</label>
                <select className={inputClass} value={form.group} onChange={(e) => set("group", e.target.value)}>
                  {destinationGroups.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Location *</label>
                <input className={inputClass} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Musanze, Northern Province" />
              </div>
            </div>
          </Section>

          <Section icon={FileText} title="About">
            <label className={labelClass}>Description</label>
            <textarea
              rows={4}
              maxLength={DESCRIPTION_MAX}
              className={inputClass}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What makes this place special? Shown on the destination card."
            />
            <p className="text-[11px] text-[#0a120b]/40 mt-1 text-right">{form.description.length} / {DESCRIPTION_MAX}</p>
          </Section>

          <Section icon={Sparkles} title="Highlights">
            <HighlightsInput value={form.highlights} onChange={(v) => set("highlights", v)} />
          </Section>

          <Section icon={Route} title="Travel info">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2">
                <label className={labelClass}>Best time to visit</label>
                <BestTimePicker value={form.bestTime} onChange={(v) => set("bestTime", v)} />
              </div>
              <div>
                <label className={labelClass}>Drive from Kigali</label>
                <input className={inputClass} value={form.fromKigali} onChange={(e) => set("fromKigali", e.target.value)} placeholder="e.g. 2.5 hrs" />
              </div>
            </div>
          </Section>
        </div>

        {/* Right: image, visibility, live preview */}
        <div className="space-y-5 lg:sticky lg:top-24">
          <Section icon={ImageIcon} title="Image">
            <div className="rounded-xl overflow-hidden bg-[#f7f5f0] border border-[#0a120b]/[0.06] aspect-[4/3] mb-3 flex items-center justify-center">
              {form.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <p className="text-xs text-[#0a120b]/40">No image yet</p>
              )}
            </div>
            <ImageField compact bucket="destinations" value={form.image} onChange={(url) => set("image", url)} />
          </Section>

          <Section icon={Sparkles} title="Featured">
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs text-[#0a120b]/55">Featured destinations rotate in the big slideshow at the top of the Destinations page.</p>
              <Toggle checked={form.featured} onChange={(v) => set("featured", v)} label="Featured" />
            </div>
          </Section>

          <Section icon={Eye} title="Preview on the website">
            <WebsiteCardPreview destination={form} />
          </Section>
        </div>
      </div>
    </form>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold mb-4">
        <Icon className="size-4 text-[#2E7D5B]" /> {title}
      </h2>
      {children}
    </Card>
  );
}
