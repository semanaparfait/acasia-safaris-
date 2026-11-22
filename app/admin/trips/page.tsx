"use client";

// Admin > Trips: special trips the team plans, each with its own page on the website.
// The "Trips" link in the website menu only shows while at least one is published.
import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { CalendarDays, ChevronRight, ExternalLink, ImageIcon, MapPin, Pencil, Plus, Tag, Trash2, Users } from "lucide-react";
import { formatPrice } from "@/lib/trips";
import type { Trip } from "@/lib/types";
import { useTripsStore } from "@/store/tripsStore";
import { Badge, Button, Card, ConfirmDialog, EmptyState, PageHeader, Tabs, Toggle } from "../components/ui";

type Filter = "Upcoming" | "Drafts" | "Past";
const today = () => new Date().toISOString().slice(0, 10);
const day = (d: string) => format(new Date(`${d.slice(0, 10)}T00:00`), "d MMM yyyy");

const isPast = (t: Trip) => {
  const last = (t.endDate ?? t.startDate)?.slice(0, 10);
  return !!last && last < today();
};

function tripDates(t: Trip) {
  if (t.startDate && t.endDate) return `${day(t.startDate)} – ${day(t.endDate)}`;
  if (t.startDate) return `From ${day(t.startDate)}`;
  return t.duration ? `${t.duration} · dates on request` : "Dates on request";
}

export default function TripsPage() {
  const trips = useTripsStore((s) => s.trips);
  const loading = useTripsStore((s) => s.loading);
  const error = useTripsStore((s) => s.error);
  const loadAll = useTripsStore((s) => s.loadAll);
  const setActive = useTripsStore((s) => s.setActive);
  const deleteTrip = useTripsStore((s) => s.deleteTrip);

  const [filter, setFilter] = useState<Filter>("Upcoming");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const upcoming = trips.filter((t) => t.active && !isPast(t));
  const drafts = trips.filter((t) => !t.active && !isPast(t));
  const past = trips.filter(isPast);
  const shown = filter === "Upcoming" ? upcoming : filter === "Drafts" ? drafts : past;

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
        title="Trips"
        subtitle="Special trips with their own page on the website: photos, the plan, and price options with what each one covers."
        actions={
          <Link href="/admin/trips/new">
            <Button><Plus className="size-4" /> Plan a trip</Button>
          </Link>
        }
      />

      <div className="mb-5">
        <Tabs
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: "Upcoming", label: "On the website", count: upcoming.length },
            { value: "Drafts", label: "Drafts", count: drafts.length },
            { value: "Past", label: "Past", count: past.length },
          ]}
        />
      </div>

      {error ? (
        <Card className="p-5 text-sm text-red-700">Could not load trips: {error}</Card>
      ) : loading && trips.length === 0 ? (
        <Card><EmptyState title="Loading trips…" /></Card>
      ) : shown.length === 0 ? (
        <Card>
          <EmptyState
            title={filter === "Upcoming" ? "No trip on the website" : filter === "Drafts" ? "No drafts" : "No past trips"}
            text={filter === "Past" ? undefined : "Plan a trip: add photos, the days and the price options, then publish it. The “Trips” menu link appears on the website at once."}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {shown.map((t) => {
            const from = t.prices.length ? Math.min(...t.prices.map((p) => p.price)) : 0;
            return (
              <Card key={t.id} className="overflow-hidden flex flex-col">
                <Link href={`/admin/trips/${t.id}`} className="relative block aspect-[16/10] bg-[#12231a]">
                  {t.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.images[0]} alt="" className="absolute inset-0 size-full object-cover" />
                  ) : (
                    <ImageIcon className="absolute inset-0 m-auto size-8 text-white/25" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge tone={isPast(t) ? "gray" : t.active ? "green" : "amber"}>{isPast(t) ? "Ended" : t.active ? "Live" : "Draft"}</Badge>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="font-serif text-lg leading-tight line-clamp-2">{t.title}</p>
                    <p className="text-xs text-white/75 mt-1 flex items-center gap-1"><MapPin className="size-3" /> {t.location}</p>
                  </div>
                </Link>
                <div className="p-4 space-y-2 text-sm flex-1">
                  <p className="flex items-center gap-2 text-[#0a120b]/65"><CalendarDays className="size-4 text-[#c5a86d]" /> {tripDates(t)}</p>
                  <p className="flex items-center gap-2 text-[#0a120b]/65">
                    <Tag className="size-4 text-[#c5a86d]" />
                    {t.prices.length} price {t.prices.length === 1 ? "option" : "options"}
                    {from > 0 && <span className="text-[#0a120b]"> · from <b>{formatPrice(from, t.currency)}</b></span>}
                  </p>
                  <p className="flex items-center gap-2 text-[#0a120b]/65"><ImageIcon className="size-4 text-[#c5a86d]" /> {t.images.length} photos · {t.itinerary.length} days planned</p>
                  {t.seats != null && (
                    <div className="pt-1">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-[#0a120b]/55">Seats</span>
                        <span className={`font-medium tabular-nums ${t.seatsLeft === 0 ? "text-red-700" : "text-[#0a120b]"}`}>
                          {t.travelers} / {t.seats} {t.seatsLeft === 0 ? "· full" : `· ${t.seatsLeft} left`}
                        </span>
                      </div>
                      <div className="h-1.5 mt-1 rounded-full bg-[#0a120b]/[0.06] overflow-hidden">
                        <div className={`h-full rounded-full ${t.seatsLeft === 0 ? "bg-red-600" : "bg-[#2E7D5B]"}`} style={{ width: `${Math.min(100, Math.round((t.travelers / t.seats) * 100))}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                <Link
                  href={`/admin/trips/${t.id}/bookings`}
                  className="mx-4 mb-3 flex items-center justify-between gap-2 rounded-xl bg-[#f7f5f0] px-3.5 py-2.5 text-sm hover:bg-[#efeadf] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Users className="size-4 text-[#2E7D5B]" />
                    <b>{t.bookingCount}</b> {t.bookingCount === 1 ? "booking" : "bookings"}
                    <span className="text-[#0a120b]/50">· {t.travelers} {t.travelers === 1 ? "traveler" : "travelers"}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    {t.newBookings > 0 && <span className="rounded-full bg-[#c5a86d] px-2 py-0.5 text-[11px] font-bold text-[#0a120b]">{t.newBookings} new</span>}
                    <ChevronRight className="size-4 text-[#0a120b]/40" />
                  </span>
                </Link>
                <div className="px-4 py-3 border-t border-[#0a120b]/[0.06] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={t.active}
                      label="Published"
                      onChange={(active) => run(() => setActive(t.id, active), active ? "Trip published on the website" : "Trip hidden from the website")}
                    />
                    <span className="text-xs text-[#0a120b]/55">{t.active ? "Published" : "Hidden"}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {t.active && !isPast(t) && (
                      <a href={`/trips/${t.id}`} target="_blank" rel="noopener noreferrer" title="View on the website" className="p-1.5 rounded-lg text-[#0a120b]/50 hover:bg-[#0a120b]/5">
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                    <Link href={`/admin/trips/${t.id}`} title="Edit" className="p-1.5 rounded-lg text-[#0a120b]/50 hover:bg-[#0a120b]/5">
                      <Pencil className="size-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteId(t.id)}
                      disabled={t.bookingCount > 0}
                      title={t.bookingCount > 0 ? "People booked this trip: hide it instead" : "Delete"}
                      className="p-1.5 rounded-lg text-[#0a120b]/50 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && run(() => deleteTrip(deleteId), "Trip deleted")}
        title="Delete trip"
        message="Delete this trip? Its page disappears from the website. To keep it for later, hide it instead."
      />
    </>
  );
}
