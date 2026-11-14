"use client";

// Bookings grouped by trip: the same package on the same start date is one trip.
// Trip list -> the travelers on that trip -> one traveler's booking (BookingDrawer).
import { useMemo, useState } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import { ArrowLeft, CheckCircle2, ChevronRight, Download } from "lucide-react";
import { Avatar, Button, Card, EmptyState, SearchInput, StatusBadge, Tabs } from "../components/ui";
import { balanceOf, bookingAmount, bookingTitle, daysToTrip, money, paidOf } from "@/lib/helpers";
import type { Booking } from "@/lib/types";
import BalanceCell from "./BalanceCell";
import { downloadCsv } from "./csv";

export type Trip = {
  key: string;
  title: string;
  kind: "Package" | "Group departure" | "Custom trip";
  startDate: string;
  endDate: string;
  bookings: Booking[]; // every booking, cancelled ones too
  active: Booking[]; // without the cancelled ones: the totals use these
  travelers: number;
  total: number;
  paid: number;
  balance: number;
  needsReply: number;
  pending: number;
};

const day = (d: string) => d.slice(0, 10);
// A group departure is one trip; otherwise the same package on the same day
const tripKey = (b: Booking) =>
  b.departureId ? `dep:${b.departureId}` : `${b.packageId ?? `custom:${bookingTitle(b)}`}|${day(b.startDate)}`;

export function groupTrips(bookings: Booking[]): Trip[] {
  const groups = new Map<string, Booking[]>();
  for (const b of bookings) groups.set(tripKey(b), [...(groups.get(tripKey(b)) ?? []), b]);

  return [...groups.entries()].map(([key, list]) => {
    const active = list.filter((b) => b.status !== "Cancelled");
    const sorted = [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return {
      key,
      title: bookingTitle(list[0]),
      kind: list[0].departureId ? "Group departure" : list[0].packageId ? "Package" : "Custom trip",
      startDate: list[0].startDate,
      endDate: list.reduce((max, b) => (b.endDate > max ? b.endDate : max), list[0].endDate),
      bookings: sorted,
      active,
      travelers: active.reduce((s, b) => s + b.travelers, 0),
      total: active.reduce((s, b) => s + b.amount, 0),
      paid: active.reduce((s, b) => s + paidOf(b), 0),
      balance: active.reduce((s, b) => s + balanceOf(b), 0),
      needsReply: list.filter((b) => b.needsReply).length,
      pending: list.filter((b) => b.status === "Pending" || b.status === "Negotiating").length,
    };
  });
}

// "in 12 days", "Tomorrow", "On the trip now", "Ended 3 days ago"
function when(t: Trip) {
  const today = new Date(new Date().toISOString().slice(0, 10));
  const start = differenceInCalendarDays(new Date(day(t.startDate)), today);
  const end = differenceInCalendarDays(new Date(day(t.endDate)), today);
  if (start > 1) return { text: `in ${start} days`, tone: start <= 14 ? "text-[#8a6d2f] font-medium" : "text-[#0a120b]/50" };
  if (start === 1) return { text: "Tomorrow", tone: "text-[#8a6d2f] font-medium" };
  if (start === 0) return { text: "Starts today", tone: "text-emerald-700 font-medium" };
  if (end >= 0) return { text: "On the trip now", tone: "text-emerald-700 font-medium" };
  return { text: `Ended ${-end} day${end === -1 ? "" : "s"} ago`, tone: "text-[#0a120b]/40" };
}

const isPast = (t: Trip) => day(t.endDate) < new Date().toISOString().slice(0, 10);

type TripFilter = "Upcoming" | "Past" | "All";

// ---------- Trip list ----------

export function TripsList({ bookings, onOpen }: { bookings: Booking[]; onOpen: (key: string) => void }) {
  const [filter, setFilter] = useState<TripFilter>("Upcoming");
  const [query, setQuery] = useState("");
  const trips = useMemo(() => groupTrips(bookings), [bookings]);

  const shown = useMemo(() => {
    const q = query.toLowerCase();
    return trips
      .filter((t) => (filter === "All" ? true : filter === "Past" ? isPast(t) : !isPast(t)))
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.bookings.some((b) => b.customer.toLowerCase().includes(q) || b.email.toLowerCase().includes(q)))
      .sort((a, b) => (filter === "Upcoming" ? a.startDate.localeCompare(b.startDate) : b.startDate.localeCompare(a.startDate)));
  }, [trips, filter, query]);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 border-b border-[#0a120b]/[0.06]">
        <Tabs
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: "Upcoming", label: "Upcoming & ongoing", count: trips.filter((t) => !isPast(t)).length },
            { value: "Past", label: "Past", count: trips.filter(isPast).length },
            { value: "All", label: "All", count: trips.length },
          ]}
        />
        <SearchInput value={query} onChange={setQuery} placeholder="Search a trip or a traveler…" className="lg:w-72" />
      </div>

      {shown.length === 0 ? (
        <EmptyState title="No trips found" text={trips.length === 0 ? "Bookings made on the website will appear here, grouped by trip." : "Try another filter or search."} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[#0a120b]/45 bg-[#f7f5f0]/60 border-b border-[#0a120b]/[0.06]">
                <th className="px-5 py-3 font-medium">Trip</th>
                <th className="px-5 py-3 font-medium">Dates</th>
                <th className="px-5 py-3 font-medium text-center">Bookings</th>
                <th className="px-5 py-3 font-medium text-center">Travelers</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
                <th className="px-5 py-3 font-medium">Collected</th>
                <th className="px-5 py-3 font-medium text-right whitespace-nowrap">Balance due</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0a120b]/[0.05]">
              {shown.map((t) => {
                const w = when(t);
                const percent = t.total > 0 ? Math.min(100, Math.round((t.paid / t.total) * 100)) : 0;
                return (
                  <tr key={t.key} className="hover:bg-[#f7f5f0]/70 cursor-pointer" onClick={() => onOpen(t.key)}>
                    <td className="px-5 py-3 max-w-[280px]">
                      <p className="font-medium truncate">{t.title}</p>
                      <p className="text-xs text-[#0a120b]/45 flex items-center gap-2">
                        {t.kind}
                        {t.needsReply > 0 && (
                          <span className="flex items-center gap-1 font-medium text-[#8a6d2f]">
                            <span className="size-1.5 rounded-full bg-[#c5a86d]" /> {t.needsReply} new message{t.needsReply > 1 ? "s" : ""}
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <p className="text-[#0a120b]/75">{format(new Date(t.startDate), "d MMM")} – {format(new Date(t.endDate), "d MMM yyyy")}</p>
                      <p className={`text-xs ${w.tone}`}>{w.text}</p>
                    </td>
                    <td className="px-5 py-3 text-center tabular-nums">
                      {t.bookings.length}
                      {t.pending > 0 && <p className="text-[11px] text-amber-700 whitespace-nowrap">{t.pending} to answer</p>}
                    </td>
                    <td className="px-5 py-3 text-center tabular-nums font-medium">{t.travelers}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-medium whitespace-nowrap">
                      {t.total > 0 ? money(t.total) : <span className="text-xs font-normal text-[#0a120b]/45">To quote</span>}
                    </td>
                    <td className="px-5 py-3 min-w-[140px]">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="tabular-nums font-medium">{money(t.paid)}</span>
                        {t.total > 0 && <span className="text-[11px] text-[#0a120b]/45 tabular-nums">{percent}%</span>}
                      </div>
                      <div className="h-1 mt-1.5 rounded-full bg-[#0a120b]/[0.06] overflow-hidden">
                        <div className="h-full rounded-full bg-[#2E7D5B]" style={{ width: `${percent}%` }} />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <TripBalance trip={t} />
                    </td>
                    <td className="px-3 py-3 text-[#0a120b]/30"><ChevronRight className="size-4" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="px-5 py-3 border-t border-[#0a120b]/[0.06] text-xs text-[#0a120b]/50">
        {shown.length} trip{shown.length === 1 ? "" : "s"} · cancelled bookings are not counted in the totals
      </div>
    </Card>
  );
}

// ---------- One trip: who is going, and their money ----------

export function TripDetail({ trip, onBack, onOpenBooking }: { trip: Trip; onBack: () => void; onOpenBooking: (id: string) => void }) {
  const w = when(trip);

  const exportTrip = () =>
    downloadCsv(
      `${trip.title}-${day(trip.startDate)}.csv`,
      ["Traveler", "Email", "Phone", "Country", "Booked on", "Travelers", "Children", "Total", "Paid", "Balance due", "Payment", "Status", "Ticket"],
      trip.bookings.map((b) => [
        b.customer, b.email, b.phone ?? "", b.country, day(b.createdAt), b.travelers, b.children,
        b.amount, paidOf(b), balanceOf(b), b.payment, b.status, b.ticketCode ?? "",
      ]),
    );

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-[#0a120b]/60 hover:text-[#0a120b] cursor-pointer">
        <ArrowLeft className="size-4" /> All trips
      </button>

      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <p className="text-xs text-[#0a120b]/45">{trip.kind}</p>
            <h2 className="text-xl font-semibold">{trip.title}</h2>
            <p className="text-sm text-[#0a120b]/65 mt-0.5">
              {format(new Date(trip.startDate), "EEE d MMM")} – {format(new Date(trip.endDate), "EEE d MMM yyyy")} · <span className={w.tone}>{w.text}</span>
            </p>
          </div>
          <Button variant="secondary" onClick={exportTrip}><Download className="size-4" /> Traveler list (CSV)</Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          <Stat label="Travelers" value={String(trip.travelers)} sub={`${trip.active.length} booking${trip.active.length === 1 ? "" : "s"}`} />
          <Stat label="Total value" value={trip.total > 0 ? money(trip.total) : "To quote"} />
          <Stat label="Collected" value={money(trip.paid)} sub={trip.total > 0 ? `${Math.round((trip.paid / trip.total) * 100)}% of the total` : undefined} />
          <Stat
            label="Balance due"
            value={money(trip.balance)}
            tone={trip.balance > 0 && daysToTrip(trip) <= 14 ? "red" : undefined}
            sub={trip.balance > 0 ? `${trip.active.filter((b) => balanceOf(b) > 0).length} traveler${trip.active.filter((b) => balanceOf(b) > 0).length === 1 ? "" : "s"} still owe money` : "Nothing missing"}
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[#0a120b]/45 bg-[#f7f5f0]/60 border-b border-[#0a120b]/[0.06]">
                <th className="px-5 py-3 font-medium">Traveler</th>
                <th className="px-5 py-3 font-medium">Booked on</th>
                <th className="px-5 py-3 font-medium text-center">Pax</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
                <th className="px-5 py-3 font-medium text-right">Paid</th>
                <th className="px-5 py-3 font-medium text-right whitespace-nowrap">Balance due</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0a120b]/[0.05]">
              {trip.bookings.map((b) => {
                const cancelled = b.status === "Cancelled";
                return (
                  <tr key={b.id} className={`hover:bg-[#f7f5f0]/70 cursor-pointer ${cancelled ? "opacity-50" : ""}`} onClick={() => onOpenBooking(b.id)}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={b.customer} size={32} />
                        <div className="min-w-0">
                          <p className="font-medium whitespace-nowrap">{b.customer}</p>
                          {b.needsReply ? (
                            <p className="flex items-center gap-1.5 text-xs font-medium text-[#8a6d2f]"><span className="size-1.5 rounded-full bg-[#c5a86d]" /> New message</p>
                          ) : (
                            <p className="text-xs text-[#0a120b]/45">{b.country}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-[#0a120b]/70">{format(new Date(b.createdAt), "d MMM yyyy")}</td>
                    <td className="px-5 py-3 text-center tabular-nums">{b.travelers}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-medium whitespace-nowrap">{bookingAmount(b)}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-[#0a120b]/70">{money(paidOf(b))}</td>
                    <td className="px-5 py-3 text-right"><BalanceCell booking={b} /></td>
                    <td className="px-5 py-3"><StatusBadge status={b.payment} /></td>
                    <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-3 py-3 text-[#0a120b]/30"><ChevronRight className="size-4" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function TripBalance({ trip }: { trip: Trip }) {
  if (trip.active.length === 0) return <span className="text-[#0a120b]/30">—</span>;
  if (trip.total <= 0) return <span className="text-xs text-[#0a120b]/45 whitespace-nowrap">Awaiting price</span>;
  if (trip.balance <= 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="size-3.5" /> Paid in full
      </span>
    );
  const soon = daysToTrip(trip) <= 14;
  return (
    <span className={`font-semibold tabular-nums whitespace-nowrap ${soon ? "text-red-700" : "text-[#0a120b]"}`}>
      {money(trip.balance)}
      {soon && <span className="block text-[10px] font-medium uppercase tracking-wider">Due soon</span>}
    </span>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "green" | "red" }) {
  const color = tone === "green" ? "text-emerald-700" : tone === "red" ? "text-red-700" : "text-[#0a120b]";
  return (
    <div className="rounded-xl bg-[#f7f5f0] px-4 py-3">
      <p className="text-xs text-[#0a120b]/50">{label}</p>
      <p className={`text-lg font-semibold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-[#0a120b]/45">{sub}</p>}
    </div>
  );
}
