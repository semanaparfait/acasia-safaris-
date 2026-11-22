"use client";

// /admin/trips/<id>/bookings: who booked the trip, how many seats are taken and how much
// is expected. New bookings appear live (AdminShell listens to the server).
import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { FaWhatsapp } from "react-icons/fa";
import { ArrowLeft, BellRing, CalendarDays, CheckCircle2, Clock, Download, ExternalLink, Mail, MailCheck, MessageSquareText, Pencil, Printer, QrCode, Send, StickyNote, Trash2, Users, Wallet } from "lucide-react";
import { bookingTotal, formatPrice } from "@/lib/trips";
import { TRIP_BOOKING_STATUSES, TRIP_PAYMENT_STATUSES, type AdminTrip, type TripBooking, type TripWaitlistEntry } from "@/lib/types";
import { useTripsStore } from "@/store/tripsStore";
import { Badge, Button, Card, ConfirmDialog, EmptyState, Modal, SearchInput, Tabs, inputClass, labelClass, type Tone } from "../../../components/ui";

type Filter = "All" | TripBooking["status"];

const statusTone: Record<TripBooking["status"], Tone> = { New: "gold", Confirmed: "green", Cancelled: "gray" };
const paymentTone: Record<TripBooking["payment"], Tone> = { Unpaid: "red", Deposit: "amber", Paid: "green", Refunded: "gray" };
const when = (d: string) => format(new Date(d), "d MMM yyyy, HH:mm");
const day = (d: string) => format(new Date(`${d.slice(0, 10)}T00:00`), "EEE d MMM yyyy");
const digits = (phone: string) => phone.replace(/\D/g, "");

export default function TripBookingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const trips = useTripsStore((s) => s.trips);
  const loadAll = useTripsStore((s) => s.loadAll);
  const bookings = useTripsStore((s) => s.bookings[id]);
  const loadBookings = useTripsStore((s) => s.loadBookings);
  const updateBooking = useTripsStore((s) => s.updateBooking);
  const deleteBooking = useTripsStore((s) => s.deleteBooking);
  const trip = trips.find((t) => t.id === id);

  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<TripBooking | null>(null);
  const [deleting, setDeleting] = useState<TripBooking | null>(null);

  useEffect(() => {
    if (!trip) loadAll();
    loadBookings(id).catch((err: Error) => setError(err.message));
  }, [id, trip, loadAll, loadBookings]);

  const list = useMemo(() => bookings ?? [], [bookings]);
  const active = list.filter((b) => b.status !== "Cancelled");
  const shown = list.filter((b) => {
    if (filter !== "All" && b.status !== filter) return false;
    const q = search.trim().toLowerCase();
    return !q || [b.customer, b.email, b.phone ?? "", b.option].some((v) => v.toLowerCase().includes(q));
  });

  const currency = trip?.currency ?? list[0]?.currency ?? "USD";
  const expected = active.reduce((s, b) => s + bookingTotal(b), 0);
  const paid = active.filter((b) => b.payment === "Paid").reduce((s, b) => s + bookingTotal(b), 0);
  const unpaid = active.filter((b) => b.payment === "Unpaid").length;
  const byOption = Object.entries(
    active.reduce<Record<string, number>>((acc, b) => ({ ...acc, [b.option]: (acc[b.option] ?? 0) + b.travelers }), {}),
  );

  const change = async (b: TripBooking, changes: Parameters<typeof updateBooking>[1], message: string) => {
    try {
      await updateBooking(b, changes);
      toast.success(message);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Booked on", "Name", "Email", "Phone", "Option", "Travelers", `Total (${currency})`, "Discount", "Status", "Payment", "Ticket", "Checked in", "Message", "Notes"],
      ...list.map((b) => [when(b.createdAt), b.customer, b.email, b.phone ?? "", b.option, String(b.travelers), String(bookingTotal(b)), b.discountNote ?? "", b.status, b.payment, b.ticketCode ?? "", b.checkedInAt ? when(b.checkedInAt) : "", b.message ?? "", b.notes ?? ""]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `${(trip?.title ?? "trip").replace(/[^\w-]+/g, "-")}-bookings.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error)
    return (
      <Card className="p-6 text-sm">
        <p className="text-red-700">Could not load the bookings: {error}</p>
        <Link href="/admin/trips" className="text-[#2E7D5B] underline mt-2 inline-block">Back to trips</Link>
      </Card>
    );

  return (
    <div className="max-w-7xl">
      <Link href="/admin/trips" className="inline-flex items-center gap-1.5 text-sm text-[#0a120b]/55 hover:text-[#0a120b] mb-4">
        <ArrowLeft className="size-4" /> All trips
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative size-16 shrink-0 rounded-xl overflow-hidden bg-[#12231a]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {trip?.images[0] && <img src={trip.images[0]} alt="" className="size-full object-cover" />}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight truncate">{trip?.title ?? "Trip"} · Bookings</h1>
            <p className="text-sm text-[#0a120b]/55 mt-0.5 flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {trip?.startDate ? day(trip.startDate) : "Dates on request"}
              {trip?.endDate && trip.endDate !== trip.startDate && ` – ${day(trip.endDate)}`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {trip?.active && (
            <a href={`/trips/${id}`} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary"><ExternalLink className="size-4" /> Trip page</Button>
            </a>
          )}
          <Link href={`/admin/trips/${id}`}>
            <Button variant="secondary"><Pencil className="size-4" /> Edit trip</Button>
          </Link>
          <Button onClick={exportCsv} disabled={list.length === 0}><Download className="size-4" /> Export CSV</Button>
        </div>
      </div>

      {/* Numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <Stat icon={Users} label="Travelers booked" value={trip?.seats != null ? `${trip.travelers} / ${trip.seats}` : String(active.reduce((s, b) => s + b.travelers, 0))} hint={trip?.seats != null ? (trip.seatsLeft === 0 ? "Fully booked" : `${trip.seatsLeft} seats left`) : "No seat limit"} bar={trip?.seats ? (trip.travelers / trip.seats) * 100 : undefined} />
        <Stat icon={MessageSquareText} label="Bookings" value={String(active.length)} hint={`${list.filter((b) => b.status === "New").length} new · ${list.filter((b) => b.status === "Cancelled").length} cancelled`} />
        <Stat icon={Wallet} label="Expected" value={formatPrice(expected, currency)} hint="All bookings that are not cancelled" />
        <Stat icon={Wallet} label="Paid in full" value={formatPrice(paid, currency)} hint={`${unpaid} ${unpaid === 1 ? "booking" : "bookings"} not paid yet`} />
      </div>

      {byOption.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {byOption.map(([option, travelers]) => (
            <span key={option} className="rounded-full bg-white px-3.5 py-1.5 text-sm ring-1 ring-[#0a120b]/[0.08]">
              <b>{option}</b> <span className="text-[#0a120b]/55">· {travelers} {travelers === 1 ? "traveler" : "travelers"}</span>
            </span>
          ))}
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-[#0a120b]/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <Tabs
            value={filter}
            onChange={setFilter}
            tabs={[
              { value: "All", label: "All", count: list.length },
              ...TRIP_BOOKING_STATUSES.map((s) => ({ value: s as Filter, label: s, count: list.filter((b) => b.status === s).length })),
            ]}
          />
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, email, phone…" className="md:w-72" />
        </div>

        {!bookings ? (
          <EmptyState title="Loading bookings…" />
        ) : shown.length === 0 ? (
          <EmptyState
            title={list.length === 0 ? "Nobody booked this trip yet" : "No booking matches"}
            text={list.length === 0 ? "Bookings made on the trip's page appear here at once." : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#0a120b]/45 bg-[#f7f5f0]/60 border-b border-[#0a120b]/[0.06]">
                  <th className="px-5 py-3 font-medium">Traveler</th>
                  <th className="px-4 py-3 font-medium">Option</th>
                  <th className="px-4 py-3 font-medium text-center">People</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0a120b]/[0.05]">
                {shown.map((b) => (
                  <tr key={b.id} className={`hover:bg-[#f7f5f0]/70 ${b.status === "Cancelled" ? "opacity-55" : ""}`}>
                    <td className="px-5 py-3">
                      <button onClick={() => setOpen(b)} className="text-left cursor-pointer group">
                        <p className="font-medium group-hover:underline flex items-center gap-1.5">
                          {b.customer}
                          {b.message && <MessageSquareText className="size-3.5 text-[#c5a86d]" aria-label="Has a message" />}
                          {b.notes && <StickyNote className="size-3.5 text-[#0a120b]/35" aria-label="Has notes" />}
                        </p>
                        <p className="text-xs text-[#0a120b]/50">{b.email}{b.phone ? ` · ${b.phone}` : ""}</p>
                        <p className="text-[11px] text-[#0a120b]/35 mt-0.5">Booked {when(b.createdAt)}</p>
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{b.option}</td>
                    <td className="px-4 py-3 text-center tabular-nums">{b.travelers}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <p className="font-semibold tabular-nums">{formatPrice(bookingTotal(b), b.currency)}</p>
                      <p className="text-[11px] text-[#0a120b]/45">{formatPrice(b.price, b.currency)} {b.unit}</p>
                      {b.discountPercent > 0 && <p className="text-[11px] font-medium text-[#2E7D5B]">{b.discountNote ?? `-${b.discountPercent}%`}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={b.status}
                        onChange={(e) => change(b, { status: e.target.value as TripBooking["status"] }, `Booking ${e.target.value.toLowerCase()}`)}
                        className="rounded-lg border border-[#0a120b]/10 bg-white px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                        aria-label="Status"
                      >
                        {TRIP_BOOKING_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={b.payment}
                        onChange={(e) =>
                          change(
                            b,
                            { payment: e.target.value as TripBooking["payment"] },
                            e.target.value === "Paid" && b.payment !== "Paid"
                              ? `Paid: ticket and receipt are being emailed to ${b.email}`
                              : `Payment: ${e.target.value}`,
                          )
                        }
                        className="rounded-lg border border-[#0a120b]/10 bg-white px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                        aria-label="Payment"
                      >
                        {TRIP_PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      {b.ticketCode && (
                        <p className={`mt-1 flex items-center gap-1 text-[11px] ${b.receiptSentAt ? "text-[#2E7D5B]" : "text-amber-700"}`}>
                          {b.checkedInAt ? <CheckCircle2 className="size-3" /> : b.receiptSentAt ? <MailCheck className="size-3" /> : <QrCode className="size-3" />}
                          {b.checkedInAt ? "Checked in" : b.receiptSentAt ? "Ticket emailed" : "Ticket not emailed yet"}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-0.5">
                        {b.phone && (
                          <a href={`https://wa.me/${digits(b.phone)}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="p-1.5 rounded-lg text-[#25D366] hover:bg-[#25D366]/10">
                            <FaWhatsapp className="size-4" />
                          </a>
                        )}
                        <a href={`mailto:${b.email}?subject=${encodeURIComponent(trip?.title ?? "Your trip")}`} title="Email" className="p-1.5 rounded-lg text-[#0a120b]/50 hover:bg-[#0a120b]/5">
                          <Mail className="size-4" />
                        </a>
                        <button onClick={() => setOpen(b)} title="Details & notes" className="p-1.5 rounded-lg text-[#0a120b]/50 hover:bg-[#0a120b]/5 cursor-pointer">
                          <StickyNote className="size-4" />
                        </button>
                        <button onClick={() => setDeleting(b)} title="Delete" className="p-1.5 rounded-lg text-[#0a120b]/50 hover:text-red-600 hover:bg-red-50 cursor-pointer">
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
      </Card>

      <WaitlistPanel tripId={id} seatsLeft={trip?.seatsLeft ?? null} />

      {open && <BookingDetails key={open.id} booking={list.find((b) => b.id === open.id) ?? open} trip={trip} onClose={() => setOpen(null)} />}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteBooking(deleting);
            toast.success("Booking deleted");
          } catch (err) {
            toast.error((err as Error).message);
          }
        }}
        title="Delete booking"
        message="Delete this booking for good? To keep a record, set it to Cancelled instead: its seats are freed the same way."
      />
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint, bar }: { icon: React.ElementType; label: string; value: string; hint?: string; bar?: number }) {
  return (
    <Card className="p-4">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0a120b]/50">
        <Icon className="size-4 text-[#c5a86d]" /> {label}
      </p>
      <p className="mt-2 text-xl font-semibold tabular-nums truncate">{value}</p>
      {bar !== undefined && (
        <div className="h-1.5 mt-2 rounded-full bg-[#0a120b]/[0.06] overflow-hidden">
          <div className={`h-full rounded-full ${bar >= 100 ? "bg-red-600" : "bg-[#2E7D5B]"}`} style={{ width: `${Math.min(100, bar)}%` }} />
        </div>
      )}
      {hint && <p className="text-xs text-[#0a120b]/50 mt-1.5">{hint}</p>}
    </Card>
  );
}

// Everything about one booking, the traveler's message and the team's notes
function BookingDetails({ booking: b, trip, onClose }: { booking: TripBooking; trip?: AdminTrip; onClose: () => void }) {
  const updateBooking = useTripsStore((s) => s.updateBooking);
  const sendTicket = useTripsStore((s) => s.sendTicket);
  const [sending, setSending] = useState(false);
  const resend = async () => {
    setSending(true);
    try {
      await sendTicket(b);
      toast.success(`Ticket and receipt emailed to ${b.email}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSending(false);
    }
  };
  const [notes, setNotes] = useState(b.notes ?? "");
  const [travelers, setTravelers] = useState(String(b.travelers));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const count = Number(travelers);
    if (!count || count < 1) return toast.error("Enter how many travelers");
    setSaving(true);
    try {
      await updateBooking(b, { notes, ...(count !== b.travelers ? { travelers: count } : {}) });
      toast.success("Booking saved");
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
      setSaving(false);
    }
  };

  const rows: [string, React.ReactNode][] = [
    ["Email", <a key="e" href={`mailto:${b.email}`} className="text-[#2E7D5B] hover:underline">{b.email}</a>],
    ["Phone", b.phone ? <a key="p" href={`https://wa.me/${digits(b.phone)}`} target="_blank" rel="noopener noreferrer" className="text-[#2E7D5B] hover:underline">{b.phone} (WhatsApp)</a> : "—"],
    ["Option", `${b.option} · ${formatPrice(b.price, b.currency)} ${b.unit}`],
    ["Total", formatPrice(bookingTotal(b), b.currency)],
    ...(b.discountPercent > 0 ? ([["Discount", b.discountNote ?? `-${b.discountPercent}%`]] as [string, React.ReactNode][]) : []),
    ...(b.reminderSentAt ? ([["Reminder", `Emailed ${when(b.reminderSentAt)}`]] as [string, React.ReactNode][]) : []),
    ...(b.reviewRequestAt || b.reviewedAt ? ([["Review", b.reviewedAt ? `Left a review ${when(b.reviewedAt)} (see Admin > Reviews)` : `Asked ${when(b.reviewRequestAt!)}`]] as [string, React.ReactNode][]) : []),
    ["Booked on", when(b.createdAt)],
    ...(b.paidAt ? ([["Paid on", when(b.paidAt)]] as [string, React.ReactNode][]) : []),
    ["Website language", { en: "English", fr: "French", sw: "Swahili" }[b.locale] ?? b.locale],
  ];

  return (
    <Modal
      open
      onClose={onClose}
      title={b.customer}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge tone={statusTone[b.status]}>{b.status}</Badge>
          <Badge tone={paymentTone[b.payment]}>{b.payment}</Badge>
          {trip && <Badge tone="gray" dot={false}>{trip.title}</Badge>}
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-[#0a120b]/50">{label}</dt>
              <dd className="font-medium break-words">{value}</dd>
            </div>
          ))}
        </dl>
        {b.ticketCode && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-[#12231a] px-4 py-3.5 text-white">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c5a86d]">Ticket</p>
              <p className="font-mono text-lg tracking-[0.25em]">{b.ticketCode}</p>
              <p className="text-[11px] text-white/60">
                {b.checkedInAt ? `Checked in ${when(b.checkedInAt)}` : b.receiptSentAt ? `Ticket & receipt emailed ${when(b.receiptSentAt)}` : "Not emailed yet"}
              </p>
            </div>
            {b.payment === "Paid" && b.status !== "Cancelled" && (
              <div className="flex flex-col gap-1.5">
                {/* The printable ticket (opens in a new tab, ready to print) */}
                <a href={`/api/trips/bookings/${b.id}/ticket.pdf`} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" className="w-full"><Printer className="size-4" /> Print / PDF</Button>
                </a>
                <Button variant="secondary" onClick={resend} disabled={sending}>
                  <Send className="size-4" /> {sending ? "Sending…" : b.receiptSentAt ? "Resend email" : "Send email"}
                </Button>
              </div>
            )}
          </div>
        )}
        {b.payment !== "Paid" && b.status !== "Cancelled" && (
          <p className="rounded-xl bg-[#f7f5f0] px-3.5 py-2.5 text-xs text-[#0a120b]/60">
            When the money is received, set the payment to <b>Paid</b>: the traveler gets the confirmation, the QR code ticket and the receipt by email, and the admins are told.
          </p>
        )}
        {b.message && (
          <div className="rounded-xl bg-[#c5a86d]/10 p-3.5 text-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a6d2f] mb-1">Message from the traveler</p>
            <p className="whitespace-pre-line">{b.message}</p>
          </div>
        )}
        <label className="block">
          <span className={labelClass}>Travelers</span>
          <input type="number" min={1} max={50} value={travelers} onChange={(e) => setTravelers(e.target.value)} className={`${inputClass} !w-32`} />
        </label>
        <label className="block">
          <span className={labelClass}>Team notes (private)</span>
          <textarea rows={3} value={notes} maxLength={2000} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Paid deposit by MoMo, ref 1234 · vegetarian" className={inputClass} />
        </label>
      </div>
    </Modal>
  );
}

// People waiting for a seat. When seats free up they are emailed automatically;
// "Email the waitlist" does it by hand (only while seats are free).
function WaitlistPanel({ tripId, seatsLeft }: { tripId: string; seatsLeft: number | null }) {
  const list = useTripsStore((s) => s.waitlists[tripId]);
  const loadWaitlist = useTripsStore((s) => s.loadWaitlist);
  const removeFromWaitlist = useTripsStore((s) => s.removeFromWaitlist);
  const notifyWaitlist = useTripsStore((s) => s.notifyWaitlist);
  const [sending, setSending] = useState(false);
  const [removing, setRemoving] = useState<TripWaitlistEntry | null>(null);

  useEffect(() => {
    loadWaitlist(tripId).catch(() => {});
  }, [tripId, loadWaitlist]);

  if (!list || list.length === 0) return null;
  const waiting = list.filter((w) => !w.notifiedAt).length;

  const notify = async () => {
    setSending(true);
    try {
      const sent = await notifyWaitlist(tripId);
      toast.success(sent ? `Emailed ${sent} ${sent === 1 ? "person" : "people"} on the waitlist` : "Nobody to email: no free seats, or everyone was already told");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="mt-5 overflow-hidden">
      <div className="p-4 border-b border-[#0a120b]/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold flex items-center gap-2"><Clock className="size-4 text-[#c5a86d]" /> Waitlist · {list.length}</h2>
          <p className="text-xs text-[#0a120b]/50 mt-0.5">
            When seats free up (a cancellation, or more seats), everyone waiting is emailed automatically. First to book gets the seat.
          </p>
        </div>
        <Button variant="secondary" onClick={notify} disabled={sending || waiting === 0 || seatsLeft === 0}>
          <BellRing className="size-4" /> {sending ? "Sending…" : "Email the waitlist"}
        </Button>
      </div>
      <div className="divide-y divide-[#0a120b]/[0.05]">
        {list.map((w, i) => (
          <div key={w.id} className="px-5 py-3 flex items-center gap-4 text-sm">
            <span className="size-7 shrink-0 rounded-full bg-[#f7f5f0] text-xs font-semibold flex items-center justify-center">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{w.customer} <span className="text-[#0a120b]/45 font-normal">· {w.travelers} {w.travelers === 1 ? "traveler" : "travelers"}</span></p>
              <p className="text-xs text-[#0a120b]/50 truncate">{w.email}{w.phone ? ` · ${w.phone}` : ""} · waiting since {when(w.createdAt)}</p>
            </div>
            {w.notifiedAt ? <Badge tone="green">Emailed {format(new Date(w.notifiedAt), "d MMM")}</Badge> : <Badge tone="amber">Waiting</Badge>}
            <div className="flex gap-0.5">
              {w.phone && (
                <a href={`https://wa.me/${digits(w.phone)}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="p-1.5 rounded-lg text-[#25D366] hover:bg-[#25D366]/10">
                  <FaWhatsapp className="size-4" />
                </a>
              )}
              <a href={`mailto:${w.email}`} title="Email" className="p-1.5 rounded-lg text-[#0a120b]/50 hover:bg-[#0a120b]/5"><Mail className="size-4" /></a>
              <button onClick={() => setRemoving(w)} title="Remove" className="p-1.5 rounded-lg text-[#0a120b]/50 hover:text-red-600 hover:bg-red-50 cursor-pointer"><Trash2 className="size-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={async () => {
          if (!removing) return;
          try {
            await removeFromWaitlist(removing);
            toast.success("Removed from the waitlist");
          } catch (err) {
            toast.error((err as Error).message);
          }
        }}
        title="Remove from waitlist"
        message="Remove this person from the waitlist? They will not be emailed when seats free up."
      />
    </Card>
  );
}
