"use client";

// One traveler's booking, everything in one place: who they are, the money, the trip,
// the ticket and the conversation.
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { Ban, CalendarDays, Check, Clock, ExternalLink, Globe, Mail, Phone, StickyNote, Users, X } from "lucide-react";
import BookingConversation from "./BookingConversation";
import PaymentsPanel from "./PaymentsPanel";
import { Avatar, Button, StatusBadge, inputClass } from "../components/ui";
import { bookingTitle, shortId } from "@/lib/helpers";
import type { Booking, BookingStatus } from "@/lib/types";
import type { BookingChanges } from "@/store/bookingsStore";

export const statusList: BookingStatus[] = ["Pending", "Negotiating", "Confirmed", "Completed", "Cancelled"];

export const travelersLabel = (b: Booking) =>
  `${b.travelers} ${b.travelers > 1 ? "people" : "person"}${b.children > 0 ? ` (${b.children} child${b.children > 1 ? "ren" : ""})` : ""}`;

export default function BookingDrawer({
  booking,
  onClose,
  update,
}: {
  booking: Booking | null;
  onClose: () => void;
  update: (id: string, changes: BookingChanges, message: string) => Promise<void>;
}) {
  const setStatus = (b: Booking, status: BookingStatus) => update(b.id, { status }, `${shortId(b.id)} marked as ${status.toLowerCase()}`);

  return (
    <AnimatePresence>
      {booking && (
        <motion.div className="fixed inset-0 z-[90]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-[#0a120b]/40 backdrop-blur-sm" onClick={onClose} />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute right-0 inset-y-0 w-full max-w-xl bg-white shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-[#0a120b]/[0.06]">
              <div className="min-w-0">
                <p className="text-xs text-[#0a120b]/45">Booking {shortId(booking.id)}</p>
                <p className="font-semibold truncate">{bookingTitle(booking)}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#0a120b]/5 cursor-pointer" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-7">
              {/* Who */}
              <section className="space-y-3">
                <div className="flex items-center gap-4">
                  <Avatar name={booking.customer} size={48} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg leading-tight">{booking.customer}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <StatusBadge status={booking.status} />
                      <StatusBadge status={booking.payment} />
                    </div>
                  </div>
                  {booking.accessToken && (
                    <a
                      href={`/my-booking/${booking.accessToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="What the customer sees"
                      className="shrink-0 inline-flex items-center gap-1 text-xs text-[#0a120b]/55 hover:text-[#2E7D5B]"
                    >
                      Customer page <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <a href={`mailto:${booking.email}`} className="flex items-center gap-2 text-[#2E7D5B] hover:underline min-w-0">
                    <Mail className="size-4 shrink-0" /> <span className="truncate">{booking.email}</span>
                  </a>
                  {booking.phone ? (
                    <a href={`tel:${booking.phone}`} className="flex items-center gap-2 text-[#2E7D5B] hover:underline">
                      <Phone className="size-4 shrink-0" /> {booking.phone}
                    </a>
                  ) : (
                    <span className="flex items-center gap-2 text-[#0a120b]/40"><Phone className="size-4" /> No phone</span>
                  )}
                  <span className="flex items-center gap-2 text-[#0a120b]/70"><Globe className="size-4" /> {booking.country}</span>
                  <span className="flex items-center gap-2 text-[#0a120b]/70">
                    <Clock className="size-4" /> Booked {format(new Date(booking.createdAt), "d MMM yyyy, HH:mm")}
                  </span>
                </div>
              </section>

              <PaymentsPanel booking={booking} update={update} />

              {/* The trip */}
              <section className="space-y-3 text-sm">
                <p className="text-xs uppercase tracking-wider text-[#0a120b]/45">Trip</p>
                <div className="rounded-xl bg-[#f7f5f0] p-4 space-y-3">
                  <p className="font-medium">{bookingTitle(booking)}</p>
                  <Row icon={CalendarDays} label="Dates" value={`${format(new Date(booking.startDate), "d MMM")} – ${format(new Date(booking.endDate), "d MMM yyyy")}`} />
                  <Row icon={Users} label="Travelers" value={travelersLabel(booking)} />
                </div>
                {booking.destinations?.length > 0 &&
                  booking.destinations.map((d) => (
                    <div key={d.id ?? d.title} className="rounded-xl border border-[#0a120b]/10 p-3">
                      <p className="font-medium">{d.title}</p>
                      <p className="text-xs text-[#0a120b]/60 mt-1">{d.travelStyle} · {d.accommodation} · {d.budget}</p>
                    </div>
                  ))}
                {booking.ticketCode && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[#c5a86d]/60 bg-[#c5a86d]/[0.06] px-4 py-3">
                    <div>
                      <p className="text-xs text-[#0a120b]/50">Ticket</p>
                      <p className="font-mono font-semibold tracking-widest">{booking.ticketCode}</p>
                    </div>
                    {booking.checkedInAt ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                        <Check className="size-3.5" /> Checked in {format(new Date(booking.checkedInAt), "d MMM, HH:mm")}
                      </span>
                    ) : (
                      <span className="text-xs text-[#0a120b]/50">Not checked in yet</span>
                    )}
                  </div>
                )}
                {booking.notes && (
                  <div>
                    <p className="flex items-center gap-1.5 text-xs text-[#0a120b]/45 mb-1"><StickyNote className="size-3.5" /> Customer notes</p>
                    <p className="text-[#0a120b]/75 whitespace-pre-line">{booking.notes}</p>
                  </div>
                )}
                <label className="block">
                  <span className="block text-xs text-[#0a120b]/50 mb-1.5">Booking status</span>
                  <select value={booking.status} onChange={(e) => setStatus(booking, e.target.value as BookingStatus)} className={inputClass}>
                    {statusList.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
              </section>

              <BookingConversation booking={booking} />
            </div>

            <div className="p-4 border-t border-[#0a120b]/[0.06] flex gap-2">
              {booking.status !== "Cancelled" && (
                <Button variant="secondary" className="flex-1" onClick={() => setStatus(booking, "Cancelled")}>
                  <Ban className="size-4" /> Cancel trip
                </Button>
              )}
              {booking.status === "Pending" && (
                <Button className="flex-1" onClick={() => setStatus(booking, "Confirmed")}>
                  <Check className="size-4" /> Confirm booking
                </Button>
              )}
              <Button variant="secondary" className="flex-1" onClick={() => (window.location.href = `mailto:${booking.email}`)}>
                <Mail className="size-4" /> Email
              </Button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
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
