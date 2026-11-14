"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { BellRing, Download, Hourglass, Trash2, Check, Route, List, Wallet } from "lucide-react";
import BalanceCell from "./BalanceCell";
import BookingDrawer, { statusList } from "./BookingDrawer";
import { TripDetail, TripsList, groupTrips } from "./TripsView";
import { downloadCsv } from "./csv";
import { Avatar, Button, Card, ConfirmDialog, EmptyState, PageHeader, SearchInput, StatusBadge, Tabs } from "../components/ui";
import { balanceOf, bookingTitle, money, moneyState, paidOf, shortId } from "@/lib/helpers";
import type { BookingStatus } from "@/lib/types";
import { useBookingsStore, type BookingChanges } from "@/store/bookingsStore";

type View = "trips" | "list";
type Filter = "All" | "Balance due" | BookingStatus;

// /admin/bookings?open=<id> opens that booking (links from the calendar and the morning email)
export default function BookingsPage() {
  return (
    <Suspense>
      <Bookings />
    </Suspense>
  );
}

function Bookings() {
  // Bookings are loaded by AdminShell; this page reads and updates them
  const bookings = useBookingsStore((s) => s.bookings);
  const loading = useBookingsStore((s) => s.loading);
  const error = useBookingsStore((s) => s.error);
  const updateBooking = useBookingsStore((s) => s.updateBooking);
  const deleteBooking = useBookingsStore((s) => s.deleteBooking);

  const [view, setView] = useState<View>("trips");
  const params = useSearchParams();
  // ?trip=<key> opens a trip (links from Admin > Departures)
  const [tripKey, setTripKey] = useState<string | null>(params.get("trip"));
  const openId = params.get("open");
  const [selectedId, setSelectedId] = useState<string | null>(openId);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const selected = bookings.find((b) => b.id === selectedId) ?? null;
  const trip = useMemo(() => (tripKey ? groupTrips(bookings).find((t) => t.key === tripKey) ?? null : null), [bookings, tripKey]);

  const update = async (id: string, changes: BookingChanges, message: string) => {
    try {
      await updateBooking(id, changes);
      toast.success(message);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const remove = async () => {
    if (deleteId === null) return;
    try {
      await deleteBooking(deleteId);
      toast.success(`${shortId(deleteId)} deleted`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // Money across every booking that is not cancelled
  const active = bookings.filter((b) => b.status !== "Cancelled");
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = groupTrips(bookings).filter((t) => t.endDate.slice(0, 10) >= today && t.active.length > 0);
  const owing = active.filter((b) => balanceOf(b) > 0);
  const dueSoon = active.filter((b) => moneyState(b) === "overdue");
  const stats = [
    { icon: Wallet, label: "Collected", value: money(active.reduce((s, b) => s + paidOf(b), 0)), sub: "Payments received" },
    {
      icon: Hourglass,
      label: "Balance due",
      value: money(owing.reduce((s, b) => s + balanceOf(b), 0)),
      sub: dueSoon.length > 0 ? `${dueSoon.length} due within 14 days` : `${owing.length} booking${owing.length === 1 ? "" : "s"} with a balance`,
      alert: dueSoon.length > 0,
    },
    { icon: Route, label: "Upcoming trips", value: String(upcoming.length), sub: `${upcoming.reduce((s, t) => s + t.travelers, 0)} travelers booked` },
    {
      icon: BellRing,
      label: "Needs attention",
      value: String(bookings.filter((b) => b.needsReply || b.status === "Pending").length),
      sub: "New requests and messages",
    },
  ];

  const isLoading = loading && bookings.length === 0;

  return (
    <>
      <PageHeader
        title="Bookings"
        subtitle="Trips, who is going, and what each traveler has paid."
        actions={
          <div className="flex gap-1 p-1 bg-[#0a120b]/[0.04] rounded-xl">
            <ViewButton active={view === "trips"} onClick={() => setView("trips")}><Route className="size-4" /> By trip</ViewButton>
            <ViewButton active={view === "list"} onClick={() => setView("list")}><List className="size-4" /> All bookings</ViewButton>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <span className="size-10 rounded-xl bg-[#2E7D5B]/10 text-[#2E7D5B] flex items-center justify-center">
              <s.icon className="size-5" />
            </span>
            <p className="text-xs text-[#0a120b]/50 mt-4">{s.label}</p>
            <p className="text-2xl font-semibold tracking-tight tabular-nums mt-1">{s.value}</p>
            <p className={`text-xs mt-1 ${s.alert ? "text-red-700 font-medium" : "text-[#0a120b]/45"}`}>{s.sub}</p>
          </Card>
        ))}
      </div>

      {error ? (
        <Card><p className="p-5 text-sm text-red-700">Could not load bookings: {error}</p></Card>
      ) : isLoading ? (
        <Card><EmptyState title="Loading bookings…" /></Card>
      ) : view === "trips" ? (
        trip ? (
          <TripDetail trip={trip} onBack={() => setTripKey(null)} onOpenBooking={setSelectedId} />
        ) : (
          <TripsList bookings={bookings} onOpen={setTripKey} />
        )
      ) : (
        <AllBookings onOpen={setSelectedId} onDelete={setDeleteId} update={update} />
      )}

      <BookingDrawer booking={selected} onClose={() => setSelectedId(null)} update={update} />

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete booking"
        message={`Are you sure you want to delete booking ${deleteId ? shortId(deleteId) : ""}? This cannot be undone.`}
      />
    </>
  );
}

function ViewButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm rounded-lg cursor-pointer transition-colors ${
        active ? "bg-white shadow-sm font-medium text-[#0a120b]" : "text-[#0a120b]/55 hover:text-[#0a120b]"
      }`}
    >
      {children}
    </button>
  );
}

// ---------- Every booking in one table ----------

function AllBookings({
  onOpen,
  onDelete,
  update,
}: {
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  update: (id: string, changes: BookingChanges, message: string) => Promise<void>;
}) {
  const bookings = useBookingsStore((s) => s.bookings);
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return bookings.filter(
      (b) =>
        (filter === "All" || (filter === "Balance due" ? balanceOf(b) > 0 : b.status === filter)) &&
        [shortId(b.id), b.customer, b.email, bookingTitle(b), b.country].some((f) => f.toLowerCase().includes(q))
    );
  }, [bookings, filter, query]);

  const exportCsv = () =>
    downloadCsv(
      "bookings.csv",
      ["id", "customer", "email", "phone", "country", "trip", "start", "end", "booked on", "travelers", "total", "paid", "balance due", "payment", "status"],
      filtered.map((b) => [
        b.id, b.customer, b.email, b.phone ?? "", b.country, bookingTitle(b), b.startDate.slice(0, 10), b.endDate.slice(0, 10),
        b.createdAt.slice(0, 10), b.travelers, b.amount, paidOf(b), balanceOf(b), b.payment, b.status,
      ]),
    );

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 border-b border-[#0a120b]/[0.06]">
        <Tabs
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: "All", label: "All", count: bookings.length },
            { value: "Balance due", label: "Balance due", count: bookings.filter((b) => balanceOf(b) > 0).length },
            ...statusList.map((s) => ({ value: s, label: s, count: bookings.filter((b) => b.status === s).length })),
          ]}
        />
        <div className="flex gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by name, ID, trip…" className="lg:w-64" />
          <Button variant="secondary" onClick={exportCsv} title="Export CSV"><Download className="size-4" /></Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={bookings.length === 0 ? "No bookings yet" : "No bookings found"}
          text={bookings.length === 0 ? "Bookings made on the website will appear here." : "Try a different filter or search term."}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[#0a120b]/45 bg-[#f7f5f0]/60 border-b border-[#0a120b]/[0.06]">
                <th className="px-5 py-3 font-medium">Traveler</th>
                <th className="px-5 py-3 font-medium">Trip</th>
                <th className="px-5 py-3 font-medium">Travel dates</th>
                <th className="px-5 py-3 font-medium text-center">Pax</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
                <th className="px-5 py-3 font-medium text-right">Paid</th>
                <th className="px-5 py-3 font-medium text-right whitespace-nowrap">Balance due</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="pl-2 pr-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0a120b]/[0.05]">
              {filtered.map((b) => {
                return (
                  <tr key={b.id} className="hover:bg-[#f7f5f0]/70 cursor-pointer" onClick={() => onOpen(b.id)}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={b.customer} size={32} />
                        <div>
                          <p className="font-medium whitespace-nowrap">{b.customer}</p>
                          {b.needsReply ? (
                            <p className="flex items-center gap-1.5 text-xs font-medium text-[#8a6d2f]">
                              <span className="size-1.5 rounded-full bg-[#c5a86d]" /> New message
                            </p>
                          ) : (
                            <p className="text-xs text-[#0a120b]/45">Booked {format(new Date(b.createdAt), "d MMM")}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#0a120b]/70 max-w-[200px] truncate" title={bookingTitle(b)}>{bookingTitle(b)}</td>
                    <td className="px-5 py-3 text-[#0a120b]/70 whitespace-nowrap">
                      {format(new Date(b.startDate), "d MMM")} – {format(new Date(b.endDate), "d MMM yyyy")}
                    </td>
                    <td className="px-5 py-3 text-center tabular-nums">{b.travelers}</td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums whitespace-nowrap">
                      {b.amount > 0 ? money(b.amount) : <span className="text-xs font-normal text-[#0a120b]/45">To quote</span>}
                      {b.offer != null && (
                        <p className="text-[11px] font-normal text-[#8a6d2f]">{b.offerBy === "customer" ? "Asks" : "Offered"} {money(b.offer)}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-[#0a120b]/70">{money(paidOf(b))}</td>
                    <td className="px-5 py-3 text-right"><BalanceCell booking={b} /></td>
                    <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                    <td className="pl-2 pr-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-0.5">
                        {b.status === "Pending" && (
                          <button
                            onClick={() => update(b.id, { status: "Confirmed" }, `${shortId(b.id)} marked as confirmed`)}
                            title="Confirm"
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                          >
                            <Check className="size-4" />
                          </button>
                        )}
                        <button onClick={() => onDelete(b.id)} title="Delete" className="p-1.5 rounded-lg text-[#0a120b]/50 hover:text-red-600 hover:bg-red-50 cursor-pointer">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="px-5 py-3 border-t border-[#0a120b]/[0.06] text-xs text-[#0a120b]/50">
        Showing {filtered.length} of {bookings.length} bookings
      </div>
    </Card>
  );
}
