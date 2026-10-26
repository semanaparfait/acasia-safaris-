"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Download, Eye, Trash2, X, Mail, CalendarDays, Users, Globe, StickyNote, Check, Ban } from "lucide-react";
import { Avatar, Button, Card, ConfirmDialog, EmptyState, PageHeader, SearchInput, StatusBadge, Tabs, inputClass } from "../components/ui";
import { money } from "@/lib/helpers";
import type { Booking, BookingStatus, PaymentStatus } from "@/lib/types";
import { useBookingsStore, type BookingChanges } from "@/store/bookingsStore";

type Filter = "All" | BookingStatus;
const statusList: BookingStatus[] = ["Pending", "Confirmed", "Completed", "Cancelled"];
const paymentList: PaymentStatus[] = ["Unpaid", "Deposit", "Paid", "Refunded"];

const packageTitle = (b: Booking) => b.package?.title ?? "(package deleted)";

export default function BookingsPage() {
  // Bookings are loaded by AdminShell; this page reads and updates them
  const bookings = useBookingsStore((s) => s.bookings);
  const loading = useBookingsStore((s) => s.loading);
  const error = useBookingsStore((s) => s.error);
  const updateBooking = useBookingsStore((s) => s.updateBooking);
  const deleteBooking = useBookingsStore((s) => s.deleteBooking);

  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const selected = bookings.find((b) => b.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return bookings.filter(
      (b) =>
        (filter === "All" || b.status === filter) &&
        [`#${b.id}`, b.customer, b.email, packageTitle(b), b.country].some((f) => f.toLowerCase().includes(q))
    );
  }, [bookings, filter, query]);

  const update = async (id: number, changes: BookingChanges, message: string) => {
    try {
      await updateBooking(id, changes);
      toast.success(message);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const setStatus = (id: number, status: BookingStatus) =>
    update(id, { status }, `#${id} marked as ${status.toLowerCase()}`);

  const remove = async () => {
    if (deleteId === null) return;
    try {
      await deleteBooking(deleteId);
      toast.success(`#${deleteId} deleted`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const exportCsv = () => {
    const header = "id,customer,email,package,start,travelers,amount,status,payment";
    const rows = filtered.map((b) =>
      [b.id, b.customer, b.email, `"${packageTitle(b)}"`, b.startDate.slice(0, 10), b.travelers, b.amount, b.status, b.payment].join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bookings.csv";
    a.click();
  };

  const totals = statusList.map((s) => ({
    status: s,
    count: bookings.filter((b) => b.status === s).length,
    value: bookings.filter((b) => b.status === s).reduce((sum, b) => sum + b.amount, 0),
  }));

  return (
    <>
      <PageHeader
        title="Bookings"
        subtitle="Manage booking requests, confirmations and payments."
        actions={<Button variant="secondary" onClick={exportCsv}><Download className="size-4" /> Export CSV</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {totals.map((t) => (
          <Card key={t.status} className="p-4">
            <div className="flex items-center justify-between">
              <StatusBadge status={t.status} />
              <span className="text-2xl font-semibold tabular-nums">{t.count}</span>
            </div>
            <p className="text-xs text-[#0a120b]/50 mt-3">Total value</p>
            <p className="text-sm font-medium tabular-nums">{money(t.value)}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 border-b border-[#0a120b]/[0.06]">
          <Tabs
            value={filter}
            onChange={setFilter}
            tabs={[
              { value: "All", label: "All", count: bookings.length },
              ...statusList.map((s) => ({ value: s, label: s, count: bookings.filter((b) => b.status === s).length })),
            ]}
          />
          <SearchInput value={query} onChange={setQuery} placeholder="Search by name, ID, package…" className="lg:w-72" />
        </div>

        {error ? (
          <p className="p-5 text-sm text-red-700">Could not load bookings: {error}</p>
        ) : loading && bookings.length === 0 ? (
          <EmptyState title="Loading bookings…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={bookings.length === 0 ? "No bookings yet" : "No bookings found"}
            text={bookings.length === 0 ? "Bookings made on the website will appear here." : "Try a different filter or search term."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#0a120b]/45 bg-[#f7f5f0]/60 border-b border-[#0a120b]/[0.06]">
                  <th className="px-5 py-3 font-medium">Booking</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Package</th>
                  <th className="px-5 py-3 font-medium">Travel dates</th>
                  <th className="px-5 py-3 font-medium text-center">Pax</th>
                  <th className="px-5 py-3 font-medium text-right">Amount</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0a120b]/[0.05]">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-[#f7f5f0]/70 cursor-pointer" onClick={() => setSelectedId(b.id)}>
                    <td className="px-5 py-3">
                      <p className="font-medium">#{b.id}</p>
                      <p className="text-xs text-[#0a120b]/45">{format(new Date(b.createdAt), "d MMM")}</p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={b.customer} size={32} />
                        <div>
                          <p className="font-medium whitespace-nowrap">{b.customer}</p>
                          <p className="text-xs text-[#0a120b]/45">{b.country}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#0a120b]/70 max-w-[220px] truncate">{packageTitle(b)}</td>
                    <td className="px-5 py-3 text-[#0a120b]/70 whitespace-nowrap">
                      {format(new Date(b.startDate), "d MMM")} – {format(new Date(b.endDate), "d MMM yyyy")}
                    </td>
                    <td className="px-5 py-3 text-center tabular-nums">{b.travelers}</td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums">{money(b.amount)}</td>
                    <td className="px-5 py-3"><StatusBadge status={b.payment} /></td>
                    <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        {b.status === "Pending" && (
                          <button onClick={() => setStatus(b.id, "Confirmed")} title="Confirm" className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 cursor-pointer">
                            <Check className="size-4" />
                          </button>
                        )}
                        <button onClick={() => setSelectedId(b.id)} title="View" className="p-1.5 rounded-lg text-[#0a120b]/50 hover:bg-[#0a120b]/5 cursor-pointer">
                          <Eye className="size-4" />
                        </button>
                        <button onClick={() => setDeleteId(b.id)} title="Delete" className="p-1.5 rounded-lg text-[#0a120b]/50 hover:text-red-600 hover:bg-red-50 cursor-pointer">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-[#0a120b]/[0.06] text-xs text-[#0a120b]/50">
          Showing {filtered.length} of {bookings.length} bookings
        </div>
      </Card>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 z-[90]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-[#0a120b]/40 backdrop-blur-sm" onClick={() => setSelectedId(null)} />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 inset-y-0 w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-[#0a120b]/[0.06]">
                <div>
                  <p className="text-xs text-[#0a120b]/45">Booking</p>
                  <p className="font-semibold">Booking #{selected.id}</p>
                </div>
                <button onClick={() => setSelectedId(null)} className="p-1.5 rounded-lg hover:bg-[#0a120b]/5 cursor-pointer" aria-label="Close">
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar name={selected.customer} size={48} />
                  <div>
                    <p className="font-semibold">{selected.customer}</p>
                    <a href={`mailto:${selected.email}`} className="text-sm text-[#2E7D5B] hover:underline flex items-center gap-1">
                      <Mail className="size-3.5" /> {selected.email}
                    </a>
                  </div>
                </div>

                <div className="rounded-xl bg-[#f7f5f0] p-4 space-y-3 text-sm">
                  <p className="font-medium">{packageTitle(selected)}</p>
                  <Row icon={CalendarDays} label="Dates" value={`${format(new Date(selected.startDate), "d MMM")} – ${format(new Date(selected.endDate), "d MMM yyyy")}`} />
                  <Row icon={Users} label="Travelers" value={`${selected.travelers} ${selected.travelers > 1 ? "people" : "person"}`} />
                  <Row icon={Globe} label="Country" value={selected.country} />
                  <div className="pt-3 border-t border-[#0a120b]/10 flex justify-between">
                    <span className="text-[#0a120b]/55">Total</span>
                    <span className="text-lg font-semibold tabular-nums">{money(selected.amount)}</span>
                  </div>
                </div>

                {selected.notes && (
                  <div className="text-sm">
                    <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#0a120b]/45 mb-1.5"><StickyNote className="size-3.5" /> Notes</p>
                    <p className="text-[#0a120b]/75">{selected.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm">
                    <span className="block text-xs text-[#0a120b]/50 mb-1.5">Booking status</span>
                    <select value={selected.status} onChange={(e) => setStatus(selected.id, e.target.value as BookingStatus)} className={inputClass}>
                      {statusList.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </label>
                  <label className="text-sm">
                    <span className="block text-xs text-[#0a120b]/50 mb-1.5">Payment</span>
                    <select
                      value={selected.payment}
                      onChange={(e) => update(selected.id, { payment: e.target.value as PaymentStatus }, "Payment updated")}
                      className={inputClass}
                    >
                      {paymentList.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </label>
                </div>
              </div>

              <div className="p-4 border-t border-[#0a120b]/[0.06] flex gap-2">
                {selected.status !== "Cancelled" && (
                  <Button variant="secondary" className="flex-1" onClick={() => setStatus(selected.id, "Cancelled")}>
                    <Ban className="size-4" /> Cancel trip
                  </Button>
                )}
                {selected.status === "Pending" && (
                  <Button className="flex-1" onClick={() => setStatus(selected.id, "Confirmed")}>
                    <Check className="size-4" /> Confirm booking
                  </Button>
                )}
                <Button variant="secondary" className="flex-1" onClick={() => (window.location.href = `mailto:${selected.email}`)}>
                  <Mail className="size-4" /> Email
                </Button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete booking"
        message={`Are you sure you want to delete booking #${deleteId}? This cannot be undone.`}
      />
    </>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-[#0a120b]/55"><Icon className="size-4" /> {label}</span>
      <span className="text-[#0a120b]">{value}</span>
    </div>
  );
}
