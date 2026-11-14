"use client";

// Admin > Departures: group trips on fixed dates that anyone can join from the website.
// Seats taken = travelers of the bookings that joined (cancelled ones free their seats).
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { CalendarPlus, ChevronRight, Pencil, Trash2, Users } from "lucide-react";
import { Badge, Button, Card, ConfirmDialog, EmptyState, Modal, PageHeader, Tabs, Toggle, inputClass, labelClass } from "../components/ui";
import SmartImage from "@/components/ui/smart-image";
import type { AdminDeparture } from "@/lib/types";
import { useDeparturesStore } from "@/store/departuresStore";
import { usePackagesStore } from "@/store/packagesStore";

type Filter = "Upcoming" | "Past";
const today = () => new Date().toISOString().slice(0, 10);
const day = (d: string) => format(new Date(`${d.slice(0, 10)}T00:00`), "EEE d MMM yyyy");

export default function DeparturesPage() {
  const departures = useDeparturesStore((s) => s.all);
  const loading = useDeparturesStore((s) => s.loading);
  const error = useDeparturesStore((s) => s.error);
  const loadAll = useDeparturesStore((s) => s.loadAll);
  const updateDeparture = useDeparturesStore((s) => s.updateDeparture);
  const deleteDeparture = useDeparturesStore((s) => s.deleteDeparture);
  const loadPackages = usePackagesStore((s) => s.loadAll);

  const [filter, setFilter] = useState<Filter>("Upcoming");
  const [editing, setEditing] = useState<AdminDeparture | "new" | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
    loadPackages();
  }, [loadAll, loadPackages]);

  const upcoming = departures.filter((d) => d.endDate.slice(0, 10) >= today());
  const past = departures.filter((d) => d.endDate.slice(0, 10) < today()).reverse();
  const shown = filter === "Upcoming" ? upcoming : past;

  const run = async (action: () => Promise<void>, message: string) => {
    try {
      await action();
      toast.success(message);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <PageHeader
        title="Group departures"
        subtitle="Fixed dates that solo travelers, couples and friends can join from the website."
        actions={<Button onClick={() => setEditing("new")}><CalendarPlus className="size-4" /> New departure</Button>}
      />

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-[#0a120b]/[0.06]">
          <Tabs
            value={filter}
            onChange={setFilter}
            tabs={[
              { value: "Upcoming", label: "Upcoming", count: upcoming.length },
              { value: "Past", label: "Past", count: past.length },
            ]}
          />
        </div>

        {error ? (
          <p className="p-5 text-sm text-red-700">Could not load departures: {error}</p>
        ) : loading && departures.length === 0 ? (
          <EmptyState title="Loading departures…" />
        ) : shown.length === 0 ? (
          <EmptyState
            title={filter === "Upcoming" ? "No upcoming departures" : "No past departures"}
            text={filter === "Upcoming" ? "Create one: pick a package, a date and how many seats. It appears on the website at once." : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#0a120b]/45 bg-[#f7f5f0]/60 border-b border-[#0a120b]/[0.06]">
                  <th className="px-5 py-3 font-medium">Package</th>
                  <th className="px-5 py-3 font-medium">Dates</th>
                  <th className="px-5 py-3 font-medium">Seats</th>
                  <th className="px-5 py-3 font-medium text-center">Bookings</th>
                  <th className="px-5 py-3 font-medium">On the website</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0a120b]/[0.05]">
                {shown.map((d) => {
                  const left = d.seats - d.travelers;
                  const percent = Math.min(100, Math.round((d.travelers / d.seats) * 100));
                  const started = d.startDate.slice(0, 10) <= today();
                  return (
                    <tr key={d.id} className="hover:bg-[#f7f5f0]/70">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative size-10 shrink-0 rounded-lg overflow-hidden bg-[#f7f5f0]">
                            {d.package.image && <SmartImage src={d.package.image} alt="" className="absolute inset-0 w-full h-full object-cover" sizes="40px" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[260px]">{d.package.title}</p>
                            {d.note && <p className="text-xs text-[#0a120b]/45 truncate max-w-[260px]">{d.note}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <p>{day(d.startDate)}</p>
                        <p className="text-xs text-[#0a120b]/45">to {day(d.endDate)}</p>
                      </td>
                      <td className="px-5 py-3 min-w-[170px]">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-medium tabular-nums">{d.travelers} / {d.seats}</span>
                          <span className={`text-xs ${left <= 0 ? "text-red-700 font-medium" : left <= 3 ? "text-amber-700" : "text-[#0a120b]/45"}`}>
                            {left <= 0 ? (left < 0 ? `${-left} over` : "Full") : `${left} left`}
                          </span>
                        </div>
                        <div className="h-1 mt-1.5 rounded-full bg-[#0a120b]/[0.06] overflow-hidden">
                          <div className={`h-full rounded-full ${left <= 0 ? "bg-red-600" : "bg-[#2E7D5B]"}`} style={{ width: `${percent}%` }} />
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {d.bookingCount > 0 ? (
                          <Link href={`/admin/bookings?trip=${encodeURIComponent(`dep:${d.id}`)}`} className="inline-flex items-center gap-1 text-[#2E7D5B] hover:underline">
                            <Users className="size-3.5" /> {d.bookingCount}
                          </Link>
                        ) : (
                          <span className="text-[#0a120b]/35">0</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {started ? (
                          <Badge tone="gray">Started</Badge>
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <Toggle
                              checked={d.open}
                              label="Open for booking"
                              onChange={(open) => run(() => updateDeparture(d.id, { open }), open ? "Departure open on the website" : "Departure closed")}
                            />
                            <span className="text-xs text-[#0a120b]/55">{d.open ? (left <= 0 ? "Open · full" : "Open") : "Closed"}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-0.5">
                          <button onClick={() => setEditing(d)} title="Edit" className="p-1.5 rounded-lg text-[#0a120b]/50 hover:bg-[#0a120b]/5 cursor-pointer">
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(d.id)}
                            disabled={d.bookingCount > 0}
                            title={d.bookingCount > 0 ? "Travelers joined: close it instead" : "Delete"}
                            className="p-1.5 rounded-lg text-[#0a120b]/50 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                          {d.bookingCount > 0 && (
                            <Link href={`/admin/bookings?trip=${encodeURIComponent(`dep:${d.id}`)}`} title="Travelers and payments" className="p-1.5 rounded-lg text-[#0a120b]/50 hover:bg-[#0a120b]/5">
                              <ChevronRight className="size-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editing && <DepartureForm departure={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && run(() => deleteDeparture(deleteId), "Departure deleted")}
        title="Delete departure"
        message="Delete this group departure? It disappears from the website."
      />
    </>
  );
}

function DepartureForm({ departure, onClose }: { departure: AdminDeparture | null; onClose: () => void }) {
  const packages = usePackagesStore((s) => s.packages);
  const createDeparture = useDeparturesStore((s) => s.createDeparture);
  const updateDeparture = useDeparturesStore((s) => s.updateDeparture);
  const published = useMemo(() => packages.filter((p) => p.active), [packages]);

  const [form, setForm] = useState({
    packageId: departure?.packageId ?? "",
    startDate: departure?.startDate.slice(0, 10) ?? "",
    seats: String(departure?.seats ?? 8),
    note: departure?.note ?? "",
    open: departure?.open ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [tomorrow] = useState(() => format(new Date(Date.now() + 864e5), "yyyy-MM-dd"));
  const locked = (departure?.bookingCount ?? 0) > 0; // travelers joined: the date stays

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const seats = Number(form.seats);
    if (!departure && !form.packageId) return toast.error("Choose a package");
    if (!form.startDate) return toast.error("Choose the start date");
    if (!seats || seats < 1) return toast.error("Enter how many seats");
    if (departure && seats < departure.travelers) return toast.error(`${departure.travelers} travelers already joined: seats cannot be fewer`);
    setSaving(true);
    try {
      if (departure) {
        await updateDeparture(departure.id, {
          ...(locked ? {} : { startDate: form.startDate }),
          seats,
          note: form.note,
          open: form.open,
        });
        toast.success("Departure saved");
      } else {
        await createDeparture({ packageId: form.packageId, startDate: form.startDate, seats, note: form.note || undefined, open: form.open });
        toast.success("Departure created: it is on the website now");
      }
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={departure ? "Edit departure" : "New group departure"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="departure-form" disabled={saving}>{saving ? "Saving…" : departure ? "Save" : "Create departure"}</Button>
        </>
      }
    >
      <form id="departure-form" onSubmit={save} className="space-y-4">
        <label className="block">
          <span className={labelClass}>Package</span>
          {departure ? (
            <p className="text-sm font-medium">{departure.package.title}</p>
          ) : (
            <select value={form.packageId} onChange={(e) => setForm({ ...form, packageId: e.target.value })} className={inputClass} required>
              <option value="">Choose a package…</option>
              {published.map((p) => (
                <option key={p.id} value={p.id}>{p.title} · {p.itinerary.length} days</option>
              ))}
            </select>
          )}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>Start date</span>
            <input
              type="date"
              min={tomorrow}
              value={form.startDate}
              disabled={locked}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className={`${inputClass} disabled:opacity-60`}
            />
            {locked && <span className="block text-[11px] text-[#0a120b]/45 mt-1">Travelers joined: the date cannot change.</span>}
          </label>
          <label className="block">
            <span className={labelClass}>Seats</span>
            <input type="number" min={Math.max(1, departure?.travelers ?? 1)} max={100} value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} className={inputClass} />
            {departure && departure.travelers > 0 && <span className="block text-[11px] text-[#0a120b]/45 mt-1">{departure.travelers} already taken</span>}
          </label>
        </div>
        <label className="block">
          <span className={labelClass}>Note for travelers (optional)</span>
          <input
            value={form.note}
            maxLength={300}
            placeholder="e.g. English & French-speaking guide · guaranteed departure"
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className={inputClass}
          />
        </label>
        <div className="flex items-center justify-between rounded-xl bg-[#f7f5f0] px-4 py-3">
          <div>
            <p className="text-sm font-medium">Open on the website</p>
            <p className="text-xs text-[#0a120b]/50">Visitors can see it and join while seats are left.</p>
          </div>
          <Toggle checked={form.open} onChange={(open) => setForm({ ...form, open })} label="Open on the website" />
        </div>
      </form>
    </Modal>
  );
}
