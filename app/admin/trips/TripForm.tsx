"use client";

// The add / edit trip form, shown as a full page:
//   /admin/trips/new   -> plan a new trip
//   /admin/trips/<id>  -> edit one trip
// A trip has photos, dates, a day-by-day plan and one or more price options,
// each with its own "included" and "not included" lists.
import { useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  Compass,
  Copy,
  Eye,
  ImagePlus,
  Loader2,
  Percent,
  Plus,
  Star,
  Star,
  Tag,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { uploadImage } from "@/lib/api";
import { TRIP_CURRENCIES, formatPrice } from "@/lib/trips";
import type { Trip, TripInput, TripPrice } from "@/lib/types";
import { Button, Card, Toggle, inputClass, labelClass } from "../components/ui";
import { ListInput } from "../packages/parts";

export const blankPrice = (): TripPrice => ({
  name: "",
  price: 0,
  unit: "per person",
  description: "",
  popular: false,
  included: [],
  excluded: [],
});

export const blankTrip: TripInput = {
  title: "",
  tagline: null,
  location: "",
  description: "",
  startDate: null,
  endDate: null,
  duration: null,
  groupSize: null,
  images: [],
  highlights: [],
  itinerary: [{ title: "", description: "" }],
  prices: [{ ...blankPrice(), name: "Standard" }],
  currency: "USD",
  seats: null,
  earlyBirdPercent: null,
  earlyBirdUntil: null,
  groupPercent: null,
  groupMinTravelers: null,
  active: false,
};

// What the form edits: a trip without its id and dates as "yyyy-MM-dd"
export const toInput = (t: Trip): TripInput => ({
  title: t.title,
  tagline: t.tagline,
  location: t.location,
  description: t.description,
  startDate: t.startDate?.slice(0, 10) ?? null,
  endDate: t.endDate?.slice(0, 10) ?? null,
  duration: t.duration,
  groupSize: t.groupSize,
  images: t.images,
  highlights: t.highlights,
  itinerary: t.itinerary.length
    ? t.itinerary
    : [{ title: "", description: "" }],
  prices: t.prices,
  currency: t.currency ?? "USD",
  seats: t.seats ?? null,
  earlyBirdPercent: t.earlyBirdPercent ?? null,
  earlyBirdUntil: t.earlyBirdUntil?.slice(0, 10) ?? null,
  groupPercent: t.groupPercent ?? null,
  groupMinTravelers: t.groupMinTravelers ?? null,
  active: t.active,
});

const move = <T,>(list: T[], index: number, dir: -1 | 1) => {
  const copy = [...list];
  [copy[index], copy[index + dir]] = [copy[index + dir], copy[index]];
  return copy;
};

function Section({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <span className="size-8 rounded-lg bg-[#c5a86d]/12 text-[#8a6d2f] flex items-center justify-center shrink-0">
            <Icon className="size-4" />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold">{title}</h2>
            {subtitle && (
              <p className="text-xs text-[#0a120b]/50 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

export default function TripForm({
  initial,
  isNew,
  previewHref,
  onSave,
}: {
  initial: TripInput;
  isNew: boolean;
  previewHref?: string; // the trip's page on the website (published trips only)
  onSave: (t: TripInput) => Promise<void>;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof TripInput>(key: K, value: TripInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // ---- photos ----
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, 20 - form.images.length);
    setUploading(list.length);
    for (const file of list) {
      try {
        const url = await uploadImage("tourpackages", file);
        setForm((f) => ({ ...f, images: [...f.images, url] }));
      } catch (err) {
        toast.error(`${file.name}: ${(err as Error).message}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (fileInput.current) fileInput.current.value = "";
  };
  const [photoUrl, setPhotoUrl] = useState("");
  const addPhotoUrl = () => {
    const url = photoUrl.trim();
    if (url) set("images", [...form.images, url]);
    setPhotoUrl("");
  };

  // ---- days ----
  const setDay = (i: number, field: "title" | "description", value: string) =>
    set(
      "itinerary",
      form.itinerary.map((d, j) => (j === i ? { ...d, [field]: value } : d)),
    );

  // ---- price options ----
  const setPrice = (i: number, changes: Partial<TripPrice>) =>
    set(
      "prices",
      form.prices.map((p, j) =>
        j === i
          ? { ...p, ...changes }
          : changes.popular
            ? { ...p, popular: false }
            : p,
      ),
    );
  const copyPrice = (i: number) => {
    const p = form.prices[i];
    set("prices", [
      ...form.prices,
      {
        ...p,
        name: `${p.name} (copy)`,
        popular: false,
        included: [...p.included],
        excluded: [...p.excluded],
      },
    ]);
  };

  const datesWrong = !!(
    form.startDate &&
    form.endDate &&
    form.endDate < form.startDate
  );
  const pricesOk =
    form.prices.length > 0 &&
    form.prices.every((p) => p.name.trim() && p.price > 0);
  const problems = [
    !form.title.trim() && "a title",
    !form.location.trim() && "the location",
    form.description.trim().length < 10 &&
      "a description (10 characters or more)",
    !pricesOk && "a name and a price for each price option",
    datesWrong && "an end date after the start date",
    (form.earlyBirdPercent == null) !== (form.earlyBirdUntil == null) &&
      "both the % and the last day of the early bird discount",
    (form.groupPercent == null) !== (form.groupMinTravelers == null) &&
      "both the % and the number of travelers of the group discount",
  ].filter(Boolean) as string[];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (problems.length)
      return toast.error(`Please add ${problems.join(", ")}`);
    setSaving(true);
    await onSave({
      ...form,
      itinerary: form.itinerary.filter((d) => d.title.trim()),
    });
    setSaving(false);
  };

  const cover = form.images[0];

  return (
    <form onSubmit={submit} className="max-w-6xl">
      <Link
        href="/admin/trips"
        className="inline-flex items-center gap-1.5 text-sm text-[#0a120b]/55 hover:text-[#0a120b] mb-4"
      >
        <ArrowLeft className="size-4" /> All trips
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isNew ? "Plan a new trip" : `Edit ${initial.title}`}
          </h1>
          <p className="text-sm text-[#0a120b]/55 mt-0.5">
            {isNew
              ? "Add the photos, the plan and the price options. Publish when it is ready."
              : "Changes show on the website as soon as you save."}
          </p>
        </div>
        <div className="flex gap-2">
          {previewHref && (
            <a href={previewHref} target="_blank" rel="noopener noreferrer">
              <Button type="button" variant="secondary">
                <Eye className="size-4" /> View on website
              </Button>
            </a>
          )}
          <Button type="submit" disabled={saving || uploading > 0}>
            {saving ? "Saving…" : isNew ? "Create trip" : "Save changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <Section icon={Compass} title="Trip details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Title *</label>
                <input
                  className={inputClass}
                  value={form.title}
                  maxLength={160}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Christmas Gorilla Trek & Lake Kivu"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Tagline</label>
                <input
                  className={inputClass}
                  value={form.tagline ?? ""}
                  maxLength={200}
                  onChange={(e) => set("tagline", e.target.value || null)}
                  placeholder="A short line under the title, e.g. Celebrate the holidays with the mountain gorillas"
                />
              </div>
              <div>
                <label className={labelClass}>Location *</label>
                <input
                  className={inputClass}
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="e.g. Volcanoes NP & Lake Kivu, Rwanda"
                />
              </div>
              <div>
                <label className={labelClass}>Group size</label>
                <input
                  className={inputClass}
                  value={form.groupSize ?? ""}
                  onChange={(e) => set("groupSize", e.target.value || null)}
                  placeholder="e.g. 2 to 12 travelers"
                />
              </div>
              <div>
                <label className={labelClass}>Seats (optional)</label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  className={inputClass}
                  value={form.seats ?? ""}
                  onChange={(e) =>
                    set(
                      "seats",
                      e.target.value
                        ? Math.max(1, Math.round(Number(e.target.value)))
                        : null,
                    )
                  }
                  placeholder="No limit"
                />
                <span className="block text-[11px] text-[#0a120b]/45 mt-1">
                  The website shows the seats left and stops bookings when it is
                  full.
                </span>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Description *</label>
                <textarea
                  rows={5}
                  className={inputClass}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="What makes this trip special? What will travelers experience?"
                />
              </div>
            </div>
          </Section>

          <Section
            icon={CalendarDays}
            title="Dates"
            subtitle="Leave the dates empty for a trip on request; then write the duration."
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Start date</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.startDate ?? ""}
                  onChange={(e) => set("startDate", e.target.value || null)}
                />
              </div>
              <div>
                <label className={labelClass}>End date</label>
                <input
                  type="date"
                  min={form.startDate ?? undefined}
                  className={`${inputClass} ${datesWrong ? "border-red-400" : ""}`}
                  value={form.endDate ?? ""}
                  onChange={(e) => set("endDate", e.target.value || null)}
                />
              </div>
              <div>
                <label className={labelClass}>Duration</label>
                <input
                  className={inputClass}
                  value={form.duration ?? ""}
                  onChange={(e) => set("duration", e.target.value || null)}
                  placeholder="e.g. 6 days / 5 nights"
                />
              </div>
            </div>
          </Section>

          <Section
            icon={ImagePlus}
            title={`Photos · ${form.images.length}`}
            subtitle="The first photo is the cover. Use the arrows to change the order."
            action={
              <Button
                type="button"
                variant="secondary"
                disabled={uploading > 0 || form.images.length >= 20}
                onClick={() => fileInput.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ImagePlus className="size-4" />
                )}{" "}
                {uploading ? `Uploading ${uploading}…` : "Upload photos"}
              </Button>
            }
          >
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => addPhotos(e.target.files)}
            />
            {form.images.length === 0 ? (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-[#0a120b]/12 py-10 text-center text-sm text-[#0a120b]/50 hover:border-[#c5a86d] hover:bg-[#c5a86d]/5 transition-colors cursor-pointer"
              >
                <ImagePlus className="size-6 mx-auto mb-2 text-[#0a120b]/30" />
                Click to upload photos (you can pick several at once)
              </button>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {form.images.map((src, i) => (
                  <li
                    key={`${src}-${i}`}
                    className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-[#f7f5f0] ring-1 ring-[#0a120b]/8"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="size-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-2 left-2 rounded-full bg-[#0a120b]/80 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
                        Cover
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 p-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button
                        type="button"
                        disabled={i === 0}
                        onClick={() => set("images", move(form.images, i, -1))}
                        className="p-1 rounded bg-white/90 disabled:opacity-30 cursor-pointer"
                        aria-label="Move left"
                      >
                        <ArrowUp className="size-3.5 -rotate-90" />
                      </button>
                      <button
                        type="button"
                        disabled={i === form.images.length - 1}
                        onClick={() => set("images", move(form.images, i, 1))}
                        className="p-1 rounded bg-white/90 disabled:opacity-30 cursor-pointer"
                        aria-label="Move right"
                      >
                        <ArrowDown className="size-3.5 -rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            "images",
                            form.images.filter((_, j) => j !== i),
                          )
                        }
                        className="p-1 rounded bg-white/90 text-red-600 cursor-pointer"
                        aria-label="Remove photo"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2 mt-3">
              <input
                className={inputClass}
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPhotoUrl();
                  }
                }}
                placeholder="…or paste a photo URL and press Enter"
              />
              <Button
                type="button"
                variant="secondary"
                disabled={!photoUrl.trim()}
                onClick={addPhotoUrl}
              >
                <Plus className="size-4" /> Add
              </Button>
            </div>
          </Section>

          <Section
            icon={Star}
            title="Highlights"
            subtitle="The best moments of the trip, shown as a list at the top of the page."
          >
            <ListInput
              value={form.highlights}
              onChange={(v) => set("highlights", v)}
              placeholder="e.g. One hour with a mountain gorilla family"
            />
          </Section>

          <Section
            icon={CalendarDays}
            title={`Day by day · ${form.itinerary.length} ${form.itinerary.length === 1 ? "day" : "days"}`}
            action={
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  set("itinerary", [
                    ...form.itinerary,
                    { title: "", description: "" },
                  ])
                }
              >
                <Plus className="size-4" /> Add day
              </Button>
            }
          >
            <ol className="space-y-3">
              {form.itinerary.map((d, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2 size-8 shrink-0 rounded-full bg-[#12231a] text-white text-xs font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-1.5">
                      <input
                        className={inputClass}
                        value={d.title}
                        onChange={(e) => setDay(i, "title", e.target.value)}
                        placeholder={`Day ${i + 1}: e.g. Arrival in Kigali`}
                      />
                      <button
                        type="button"
                        disabled={i === 0}
                        onClick={() =>
                          set("itinerary", move(form.itinerary, i, -1))
                        }
                        className="p-2 rounded-lg text-[#0a120b]/45 hover:bg-[#0a120b]/5 disabled:opacity-25 cursor-pointer"
                        aria-label="Move up"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        disabled={i === form.itinerary.length - 1}
                        onClick={() =>
                          set("itinerary", move(form.itinerary, i, 1))
                        }
                        className="p-2 rounded-lg text-[#0a120b]/45 hover:bg-[#0a120b]/5 disabled:opacity-25 cursor-pointer"
                        aria-label="Move down"
                      >
                        <ArrowDown className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            "itinerary",
                            form.itinerary.filter((_, j) => j !== i),
                          )
                        }
                        className="p-2 rounded-lg text-[#0a120b]/45 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        aria-label="Remove day"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      className={inputClass}
                      value={d.description}
                      onChange={(e) => setDay(i, "description", e.target.value)}
                      placeholder="What happens this day"
                    />
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section
            icon={Tag}
            title={`Price options · ${form.prices.length}`}
            subtitle="Each option has its own price and its own list of what is included and not included."
            action={
              <Button
                type="button"
                variant="secondary"
                disabled={form.prices.length >= 8}
                onClick={() => set("prices", [...form.prices, blankPrice()])}
              >
                <Plus className="size-4" /> Add option
              </Button>
            }
          >
            <CurrencyPicker
              value={form.currency}
              onChange={(currency) => set("currency", currency)}
            />
            <div className="space-y-4">
              {form.prices.map((p, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-4 ${p.popular ? "border-[#c5a86d] bg-[#c5a86d]/5" : "border-[#0a120b]/10 bg-[#fbfaf7]"}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#0a120b]/50">
                      Option {i + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={i === 0}
                        onClick={() => set("prices", move(form.prices, i, -1))}
                        className="p-1.5 rounded-lg text-[#0a120b]/45 hover:bg-[#0a120b]/5 disabled:opacity-25 cursor-pointer"
                        aria-label="Move up"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        disabled={i === form.prices.length - 1}
                        onClick={() => set("prices", move(form.prices, i, 1))}
                        className="p-1.5 rounded-lg text-[#0a120b]/45 hover:bg-[#0a120b]/5 disabled:opacity-25 cursor-pointer"
                        aria-label="Move down"
                      >
                        <ArrowDown className="size-4" />
                      </button>
                      <button
                        type="button"
                        disabled={form.prices.length >= 8}
                        onClick={() => copyPrice(i)}
                        title="Duplicate this option"
                        className="p-1.5 rounded-lg text-[#0a120b]/45 hover:bg-[#0a120b]/5 disabled:opacity-25 cursor-pointer"
                        aria-label="Duplicate"
                      >
                        <Copy className="size-4" />
                      </button>
                      <button
                        type="button"
                        disabled={form.prices.length === 1}
                        onClick={() =>
                          set(
                            "prices",
                            form.prices.filter((_, j) => j !== i),
                          )
                        }
                        className="p-1.5 rounded-lg text-[#0a120b]/45 hover:text-red-600 hover:bg-red-50 disabled:opacity-25 cursor-pointer"
                        aria-label="Remove option"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Name *</label>
                      <input
                        className={inputClass}
                        value={p.name}
                        maxLength={80}
                        onChange={(e) => setPrice(i, { name: e.target.value })}
                        placeholder="e.g. Comfort"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>
                        Price ({form.currency}) *
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className={inputClass}
                        value={p.price || ""}
                        onChange={(e) =>
                          setPrice(i, {
                            price: Math.max(
                              0,
                              Math.round(Number(e.target.value) * 100) / 100,
                            ),
                          })
                        }
                        placeholder={
                          form.currency === "RWF" ||
                          form.currency === "UGX" ||
                          form.currency === "TZS"
                            ? "e.g. 100000"
                            : "e.g. 2450"
                        }
                      />
                      {p.price > 0 && (
                        <span className="block text-[11px] text-[#0a120b]/50 mt-1">
                          Shown as {formatPrice(p.price, form.currency)}
                        </span>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Per</label>
                      <input
                        className={inputClass}
                        value={p.unit}
                        list="trip-price-units"
                        onChange={(e) => setPrice(i, { unit: e.target.value })}
                        placeholder="per person"
                      />
                    </div>
                    <div className="sm:col-span-6">
                      <label className={labelClass}>Short description</label>
                      <input
                        className={inputClass}
                        value={p.description}
                        maxLength={400}
                        onChange={(e) =>
                          setPrice(i, { description: e.target.value })
                        }
                        placeholder="e.g. Comfortable mid-range lodges, shared vehicle"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label
                        className={`${labelClass} flex items-center gap-1.5 text-emerald-700`}
                      >
                        <CheckCircle2 className="size-3.5" /> Included
                      </label>
                      <ListInput
                        value={p.included}
                        onChange={(included) => setPrice(i, { included })}
                        placeholder="e.g. Gorilla permit"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label
                        className={`${labelClass} flex items-center gap-1.5 text-red-700`}
                      >
                        <XCircle className="size-3.5" /> Not included
                      </label>
                      <ListInput
                        value={p.excluded}
                        onChange={(excluded) => setPrice(i, { excluded })}
                        placeholder="e.g. International flights"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-[#0a120b]/[0.06]">
                    <Toggle
                      checked={p.popular}
                      onChange={(popular) => setPrice(i, { popular })}
                      label="Most popular"
                    />
                    <span className="text-xs text-[#0a120b]/60 flex items-center gap-1">
                      <Star className="size-3.5 text-[#c5a86d]" /> Highlight as
                      “Most popular”
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <datalist id="trip-price-units">
              <option value="per person" />
              <option value="per person sharing" />
              <option value="per couple" />
              <option value="per group" />
              <option value="per child" />
            </datalist>
          </Section>

          <Section
            icon={Percent}
            title="Discounts"
            subtitle="Optional. Shown on the trip page and taken off the total when booking. Both can add up (at most 90%)."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#0a120b]/10 bg-[#fbfaf7] p-4 space-y-3">
                <p className="text-sm font-semibold">Early bird</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className={labelClass}>% off</span>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      className={inputClass}
                      value={form.earlyBirdPercent ?? ""}
                      onChange={(e) =>
                        set(
                          "earlyBirdPercent",
                          e.target.value
                            ? Math.min(
                                90,
                                Math.max(1, Math.round(Number(e.target.value))),
                              )
                            : null,
                        )
                      }
                      placeholder="e.g. 10"
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Until (last day)</span>
                    <input
                      type="date"
                      className={inputClass}
                      max={form.startDate ?? undefined}
                      value={form.earlyBirdUntil ?? ""}
                      onChange={(e) =>
                        set("earlyBirdUntil", e.target.value || null)
                      }
                    />
                  </label>
                </div>
                <p className="text-xs text-[#0a120b]/50">
                  {form.earlyBirdPercent && form.earlyBirdUntil
                    ? `${form.earlyBirdPercent}% off for bookings made until ${form.earlyBirdUntil}.`
                    : "Rewards people who book early."}
                </p>
              </div>
              <div className="rounded-xl border border-[#0a120b]/10 bg-[#fbfaf7] p-4 space-y-3">
                <p className="text-sm font-semibold">Group</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className={labelClass}>% off</span>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      className={inputClass}
                      value={form.groupPercent ?? ""}
                      onChange={(e) =>
                        set(
                          "groupPercent",
                          e.target.value
                            ? Math.min(
                                90,
                                Math.max(1, Math.round(Number(e.target.value))),
                              )
                            : null,
                        )
                      }
                      placeholder="e.g. 5"
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>From travelers</span>
                    <input
                      type="number"
                      min={2}
                      max={100}
                      className={inputClass}
                      value={form.groupMinTravelers ?? ""}
                      onChange={(e) =>
                        set(
                          "groupMinTravelers",
                          e.target.value
                            ? Math.max(2, Math.round(Number(e.target.value)))
                            : null,
                        )
                      }
                      placeholder="e.g. 6"
                    />
                  </label>
                </div>
                <p className="text-xs text-[#0a120b]/50">
                  {form.groupPercent && form.groupMinTravelers
                    ? `${form.groupPercent}% off for ${form.groupMinTravelers} travelers or more in one booking.`
                    : "Rewards families and friends booking together."}
                </p>
              </div>
            </div>
          </Section>
        </div>

        {/* Right: publish + preview */}
        <div className="space-y-5 lg:sticky lg:top-24">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  Published on the website
                </p>
                <p className="text-xs text-[#0a120b]/50 mt-0.5">
                  {form.active
                    ? "Visitors see it under Trips in the menu."
                    : "Draft: only the team can see it."}
                </p>
              </div>
              <Toggle
                checked={form.active}
                onChange={(v) => set("active", v)}
                label="Published"
              />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="relative aspect-[4/3] bg-[#12231a]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {cover && (
                <img
                  src={cover}
                  alt=""
                  className="absolute inset-0 size-full object-cover opacity-80"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-semibold">
                  {form.location || "Location"}
                </p>
                <p className="font-serif text-lg leading-tight mt-1">
                  {form.title || "Trip title"}
                </p>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0a120b]/45">
                Preview · price options
              </p>
              {form.prices.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {p.popular && (
                      <Star className="size-3.5 text-[#c5a86d] fill-[#c5a86d]" />
                    )}
                    {p.name || `Option ${i + 1}`}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {p.price ? formatPrice(p.price, form.currency) : "—"}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {problems.length > 0 && (
            <Card className="p-4 text-xs text-amber-800 bg-amber-50/60">
              <p className="font-semibold mb-1">Before saving, add:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {problems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </form>
  );
}

// The currency of every price option: the usual ones as buttons, any other ISO code typed
function CurrencyPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (currency: string) => void;
}) {
  const known = (TRIP_CURRENCIES as readonly string[]).includes(value);
  const [other, setOther] = useState(!known);
  const [typed, setTyped] = useState(known ? "" : value);
  const valid = (code: string) => {
    try {
      new Intl.NumberFormat("en", { style: "currency", currency: code });
      return /^[A-Z]{3}$/.test(code);
    } catch {
      return false;
    }
  };
  return (
    <div className="mb-5 rounded-xl border border-[#0a120b]/10 bg-[#fbfaf7] p-4">
      <p className={labelClass}>Currency of the prices</p>
      <div className="flex flex-wrap gap-2">
        {TRIP_CURRENCIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setOther(false);
              onChange(c);
            }}
            className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors cursor-pointer ${
              !other && value === c
                ? "bg-[#12231a] text-white"
                : "bg-white ring-1 ring-[#0a120b]/10 text-[#0a120b]/70 hover:ring-[#c5a86d]"
            }`}
          >
            {c}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOther(true)}
          className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors cursor-pointer ${
            other
              ? "bg-[#12231a] text-white"
              : "bg-white ring-1 ring-[#0a120b]/10 text-[#0a120b]/70 hover:ring-[#c5a86d]"
          }`}
        >
          Other…
        </button>
        {other && (
          <input
            value={typed}
            maxLength={3}
            placeholder="e.g. ZAR"
            onChange={(e) => {
              const code = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
              setTyped(code);
              if (valid(code)) onChange(code);
            }}
            className={`${inputClass} !w-28 uppercase ${typed.length === 3 && !valid(typed) ? "border-red-400" : ""}`}
          />
        )}
      </div>
      <p className="text-xs text-[#0a120b]/50 mt-2">
        Every price below is in <b>{value}</b>, e.g.{" "}
        {formatPrice(100000, value)}. Visitors who chose another currency on the
        website also see an estimate.
      </p>
    </div>
  );
}
