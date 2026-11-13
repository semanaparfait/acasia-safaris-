"use client";

// Admin > Calendar: every trip as a bar from its first to its last day, the balances to collect,
// and the team's own to-dos. The panel on the right shows the chosen day in detail.
// Each morning at 7:00 (Kigali) the admins also get the day's agenda by email.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  AlarmClock, ArrowDownLeft, ArrowUpRight, Banknote, CalendarDays, Check, ChevronLeft, ChevronRight, Mail,
  Pencil, Plus, Trash2, Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { bookingAmount } from "@/lib/helpers";
import {
  addDays, balancesDue, dayAgenda, dayOf, isLive, kigaliToday, monthWeeks, overdueReminders, shiftMonth,
  showsOnCalendar, toDate, tripName, weekSegments, type Segment,
} from "@/lib/calendar";
import type { AdminReminder, AdminReminderInput, Booking } from "@/lib/types";
import { useBookingsStore } from "@/store/bookingsStore";
import { useCalendarStore } from "@/store/calendarStore";
import { Button, Card, Modal, PageHeader, Tabs, inputClass, labelClass } from "../components/ui";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_LANES = 3; // trip bars per week row; more show as "+2 more"

// Dates are shown as the day itself, whatever the admin's own time zone
const fmt = (day: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...options }).format(toDate(day));
const longDay = (day: string) => fmt(day, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const shortDay = (day: string) => fmt(day, { day: "numeric", month: "short" });

const barStyle = (b: Booking) =>
  b.status === "Confirmed"
    ? "bg-[#1F5A42] text-white hover:bg-[#174634]"
    : b.status === "Completed"
      ? "bg-[#0a120b]/[0.08] text-[#0a120b]/55 hover:bg-[#0a120b]/[0.12]"
      : "bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-300 hover:bg-amber-200/70";

const bookingLink = (b: Booking) => `/admin/bookings?open=${b.id}`;

type View = "month" | "agenda";
type Editing = { reminder?: AdminReminder; day: string } | null;

export default function CalendarPage() {
  const bookings = useBookingsStore((s) => s.bookings);
  const reminders = useCalendarStore((s) => s.reminders);
  const loadReminders = useCalendarStore((s) => s.load);
  const setDone = useCalendarStore((s) => s.setDone);

  const [today] = useState(kigaliToday);
  const [month, setMonth] = useState(() => today.slice(0, 7));
  const [selected, setSelected] = useState(today);
  const [view, setView] = useState<View>("month");
  const [editing, setEditing] = useState<Editing>(null);
  const [emailing, setEmailing] = useState(false);

  useEffect(() => {
    void loadReminders();
  }, [loadReminders]);

  const shown = useMemo(() => bookings.filter(showsOnCalendar), [bookings]);
  const live = useMemo(() => bookings.filter(isLive), [bookings]);
  const todays = useMemo(() => dayAgenda(today, live, reminders), [today, live, reminders]);
  const overdue = useMemo(() => overdueReminders(reminders, today), [reminders, today]);
  const onSafari = [...todays.onTrip, ...todays.departures].reduce((n, b) => n + b.travelers, 0);

  const goTo = (day: string) => {
    setSelected(day);
    setMonth(day.slice(0, 7));
  };

  const toggle = async (r: AdminReminder) => {
    try {
      await setDone(r.id, !r.done);
      if (!r.done) toast.success("Marked as done");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const emailMe = async () => {
    setEmailing(true);
    try {
      await api("/calendar/agenda/email", { method: "POST", admin: true });
      toast.success("Today's agenda was sent to your email");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setEmailing(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle="Trips, payments to collect and the team's to-dos. The admins get the day's agenda by email every morning at 7:00."
        actions={
          <>
            <Button variant="secondary" onClick={emailMe} disabled={emailing}>
              <Mail className="size-4" /> Email me today
            </Button>
            <Button onClick={() => setEditing({ day: selected })}>
              <Plus className="size-4" /> New to-do
            </Button>
          </>
        }
      />

      {/* Today at a glance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat icon={ArrowUpRight} label="Departing today" value={todays.departures.length} onClick={() => goTo(today)} />
        <Stat icon={ArrowDownLeft} label="Returning today" value={todays.returns.length} onClick={() => goTo(today)} />
        <Stat icon={Users} label="Travelers on safari" value={onSafari} onClick={() => goTo(today)} />
        <Stat
          icon={AlarmClock}
          label={overdue.length ? `To-dos · ${overdue.length} overdue` : "To-dos today"}
          value={todays.reminders.filter((r) => !r.done).length + overdue.length}
          alert={overdue.length > 0}
          onClick={() => goTo(today)}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start">
        <Card className="overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-[#0a120b]/[0.06]">
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => goTo(today)} className="!px-3 !py-1.5">Today</Button>
              <div className="flex">
                <button onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month" className="p-2 rounded-lg hover:bg-[#0a120b]/5 cursor-pointer">
                  <ChevronLeft className="size-4" />
                </button>
                <button onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month" className="p-2 rounded-lg hover:bg-[#0a120b]/5 cursor-pointer">
                  <ChevronRight className="size-4" />
                </button>
              </div>
              <h2 className="text-lg font-semibold tracking-tight">{fmt(`${month}-01`, { month: "long", year: "numeric" })}</h2>
            </div>
            <Tabs
              tabs={[
                { value: "month", label: "Month" },
                { value: "agenda", label: "Agenda" },
              ]}
              value={view}
              onChange={setView}
            />
          </div>

          {view === "month" ? (
            <MonthView month={month} today={today} selected={selected} onSelect={setSelected} bookings={shown} reminders={reminders} />
          ) : (
            <AgendaView month={month} today={today} selected={selected} onSelect={setSelected} bookings={shown} reminders={reminders} />
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 border-t border-[#0a120b]/[0.06] text-xs text-[#0a120b]/55">
            <Legend className="bg-[#1F5A42]" label="Confirmed trip" />
            <Legend className="bg-amber-100 ring-1 ring-amber-300" label="Not confirmed yet" />
            <Legend className="bg-[#0a120b]/[0.08]" label="Completed" />
            <Legend className="bg-rose-100 ring-1 ring-rose-300" label="Balance to collect" />
            <Legend className="bg-[#c5a86d]/25 ring-1 ring-[#c5a86d]/50" label="To-do" />
          </div>
        </Card>

        <DayPanel
          day={selected}
          today={today}
          bookings={shown}
          allBookings={bookings}
          reminders={reminders}
          overdue={selected === today ? overdue : []}
          onToggle={toggle}
          onAdd={() => setEditing({ day: selected })}
          onEdit={(r) => setEditing({ reminder: r, day: dayOf(r.date) })}
        />
      </div>

      <ReminderModal editing={editing} onClose={() => setEditing(null)} bookings={live} />
    </>
  );
}

// ---------- Month ----------

function MonthView({
  month, today, selected, onSelect, bookings, reminders,
}: {
  month: string; today: string; selected: string; onSelect: (day: string) => void; bookings: Booking[]; reminders: AdminReminder[];
}) {
  const weeks = useMemo(() => monthWeeks(month), [month]);
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-7 border-b border-[#0a120b]/[0.06] bg-[#f7f5f0]/60">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#0a120b]/45">{d}</div>
          ))}
        </div>
        {weeks.map((week) => (
          <WeekRow key={week[0]} week={week} month={month} today={today} selected={selected} onSelect={onSelect} bookings={bookings} reminders={reminders} />
        ))}
      </div>
    </div>
  );
}

function WeekRow({
  week, month, today, selected, onSelect, bookings, reminders,
}: {
  week: string[]; month: string; today: string; selected: string; onSelect: (day: string) => void; bookings: Booking[]; reminders: AdminReminder[];
}) {
  const segments = useMemo(() => weekSegments(week, bookings), [week, bookings]);
  const lanes = Math.min(MAX_LANES, segments.reduce((n, s) => Math.max(n, s.lane + 1), 0));
  const hidden = (col: number) => segments.filter((s) => s.lane >= MAX_LANES && s.start <= col && s.end >= col).length;

  return (
    <div
      className="grid grid-cols-7 border-b border-[#0a120b]/[0.06] last:border-b-0"
      style={{ gridTemplateRows: `30px ${lanes ? `repeat(${lanes}, 24px) ` : ""}minmax(52px, auto)` }}
    >
      {/* Day cells (clickable background) */}
      {week.map((day, i) => {
        const inMonth = day.startsWith(month);
        return (
          <button
            key={`bg-${day}`}
            type="button"
            onClick={() => onSelect(day)}
            aria-label={longDay(day)}
            aria-pressed={selected === day}
            style={{ gridColumn: i + 1, gridRow: "1 / -1" }}
            className={`cursor-pointer border-r border-[#0a120b]/[0.06] last:border-r-0 transition-colors ${
              selected === day ? "bg-[#c5a86d]/[0.12] ring-2 ring-inset ring-[#c5a86d]" : inMonth ? "bg-white hover:bg-[#f7f5f0]" : "bg-[#f7f5f0]/70 hover:bg-[#f7f5f0]"
            }`}
          />
        );
      })}

      {/* Day numbers */}
      {week.map((day, i) => (
        <div key={`n-${day}`} style={{ gridColumn: i + 1, gridRow: 1 }} className="pointer-events-none px-2 pt-1.5">
          <span
            className={`inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums ${
              day === today ? "bg-[#1F5A42] text-white font-semibold" : day.startsWith(month) ? "text-[#0a120b]/75" : "text-[#0a120b]/30"
            }`}
          >
            {Number(day.slice(8))}
          </span>
        </div>
      ))}

      {/* Trip bars */}
      {segments.filter((s) => s.lane < MAX_LANES).map((s) => (
        <TripBar key={`${s.booking.id}-${week[0]}`} segment={s} />
      ))}

      {/* Balances, to-dos and hidden trips */}
      {week.map((day, i) => {
        const a = dayAgenda(day, bookings, reminders);
        const more = hidden(i + 1);
        return (
          <div key={`s-${day}`} style={{ gridColumn: i + 1, gridRow: lanes + 2 }} className="pointer-events-none px-1.5 pb-1.5 pt-1 space-y-1 min-w-0">
            {a.balances.map((b) => (
              <p key={`bal-${b.id}`} className="truncate rounded-md bg-rose-50 px-1.5 py-0.5 text-[11px] font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
                Balance · {b.customer}
              </p>
            ))}
            {a.reminders.slice(0, 3).map((r) => (
              <p
                key={r.id}
                className={`truncate rounded-md px-1.5 py-0.5 text-[11px] ${
                  r.done ? "text-[#0a120b]/35 line-through" : day < kigaliToday() ? "bg-red-50 text-red-700 font-medium" : "bg-[#c5a86d]/15 text-[#7a5e22] font-medium"
                }`}
              >
                {r.time && <span className="tabular-nums">{r.time} </span>}
                {r.title}
              </p>
            ))}
            {a.reminders.length > 3 && <p className="px-1.5 text-[11px] text-[#0a120b]/45">+{a.reminders.length - 3} to-dos</p>}
            {more > 0 && <p className="px-1.5 text-[11px] font-medium text-[#0a120b]/50">+{more} more trip{more === 1 ? "" : "s"}</p>}
          </div>
        );
      })}
    </div>
  );
}

function TripBar({ segment: s }: { segment: Segment }) {
  const b = s.booking;
  return (
    <Link
      href={bookingLink(b)}
      title={`${b.customer} · ${tripName(b)} · ${shortDay(dayOf(b.startDate))} – ${shortDay(dayOf(b.endDate))} · ${b.status}`}
      style={{ gridColumn: `${s.start} / ${s.end + 1}`, gridRow: s.lane + 2 }}
      className={`relative z-10 my-[2px] flex items-center gap-1 overflow-hidden px-2 text-[11px] font-medium leading-none transition-colors ${barStyle(b)} ${
        s.startsHere ? "ml-1 rounded-l-md" : ""
      } ${s.endsHere ? "mr-1 rounded-r-md" : ""}`}
    >
      {s.startsHere ? <ArrowUpRight className="size-3 shrink-0 opacity-70" /> : <span className="shrink-0 opacity-60">…</span>}
      <span className="truncate">
        {b.customer} · {tripName(b)}
      </span>
    </Link>
  );
}

// ---------- Agenda (list) ----------

function AgendaView({
  month, today, selected, onSelect, bookings, reminders,
}: {
  month: string; today: string; selected: string; onSelect: (day: string) => void; bookings: Booking[]; reminders: AdminReminder[];
}) {
  // From today (or the start of a later month), 60 days ahead
  const start = `${month}-01` > today ? `${month}-01` : today;
  const days = Array.from({ length: 60 }, (_, i) => addDays(start, i))
    .map((day) => ({ day, a: dayAgenda(day, bookings, reminders) }))
    .filter(({ a }) => a.departures.length || a.returns.length || a.balances.length || a.reminders.length);

  if (!days.length) {
    return <p className="px-5 py-16 text-center text-sm text-[#0a120b]/45">Nothing planned in the next 60 days.</p>;
  }
  return (
    <ul className="divide-y divide-[#0a120b]/[0.06]">
      {days.map(({ day, a }) => (
        <li key={day}>
          <button
            type="button"
            onClick={() => onSelect(day)}
            className={`w-full text-left px-5 py-4 flex gap-5 cursor-pointer transition-colors ${selected === day ? "bg-[#c5a86d]/[0.1]" : "hover:bg-[#f7f5f0]"}`}
          >
            <div className="w-14 shrink-0 text-center">
              <p className="text-[11px] uppercase tracking-wider text-[#0a120b]/45">{fmt(day, { weekday: "short" })}</p>
              <p className={`text-2xl font-semibold tabular-nums ${day === today ? "text-[#1F5A42]" : ""}`}>{Number(day.slice(8))}</p>
              <p className="text-[11px] text-[#0a120b]/45">{fmt(day, { month: "short" })}</p>
            </div>
            <div className="flex-1 min-w-0 space-y-1.5 text-sm">
              {a.departures.map((b) => <Line key={`d-${b.id}`} icon={ArrowUpRight} tone="text-[#1F5A42]" text={`Departs: ${b.customer} · ${tripName(b)}`} meta={`${b.travelers} traveler${b.travelers === 1 ? "" : "s"}${b.status !== "Confirmed" ? ` · ${b.status}` : ""}`} />)}
              {a.returns.map((b) => <Line key={`r-${b.id}`} icon={ArrowDownLeft} tone="text-sky-700" text={`Returns: ${b.customer} · ${tripName(b)}`} />)}
              {a.balances.map((b) => <Line key={`b-${b.id}`} icon={Banknote} tone="text-rose-700" text={`Collect the balance: ${b.customer}`} meta={`Trip ${shortDay(dayOf(b.startDate))} · ${bookingAmount(b)}`} />)}
              {a.reminders.map((r) => <Line key={r.id} icon={AlarmClock} tone={r.done ? "text-[#0a120b]/35" : "text-[#8a6d2f]"} text={`${r.time ? `${r.time} · ` : ""}${r.title}`} done={r.done} />)}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Line({ icon: Icon, tone, text, meta, done }: { icon: React.ElementType; tone: string; text: string; meta?: string; done?: boolean }) {
  return (
    <p className={`flex items-start gap-2 ${done ? "line-through text-[#0a120b]/35" : ""}`}>
      <Icon className={`size-4 shrink-0 mt-0.5 ${tone}`} />
      <span className="min-w-0">
        <span className="font-medium">{text}</span>
        {meta && <span className="text-[#0a120b]/45"> · {meta}</span>}
      </span>
    </p>
  );
}

// ---------- The chosen day ----------

function DayPanel({
  day, today, bookings, allBookings, reminders, overdue, onToggle, onAdd, onEdit,
}: {
  day: string; today: string; bookings: Booking[]; allBookings: Booking[]; reminders: AdminReminder[]; overdue: AdminReminder[];
  onToggle: (r: AdminReminder) => void; onAdd: () => void; onEdit: (r: AdminReminder) => void;
}) {
  const a = dayAgenda(day, bookings, reminders);
  const balances = day === today ? balancesDue(allBookings, today) : a.balances;
  const empty = !a.departures.length && !a.returns.length && !a.onTrip.length && !balances.length && !a.reminders.length && !overdue.length;
  const relative = day === today ? "Today" : day === addDays(today, 1) ? "Tomorrow" : day === addDays(today, -1) ? "Yesterday" : null;

  return (
    <Card className="xl:sticky xl:top-6 overflow-hidden">
      <div className="bg-[#12231a] px-5 py-4 text-white">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#c5a86d]">{relative ?? fmt(day, { weekday: "long" })}</p>
        <p className="text-lg font-semibold mt-0.5">{longDay(day)}</p>
      </div>

      <div className="p-5 space-y-5">
        {empty && (
          <div className="text-center py-6">
            <CalendarDays className="size-8 mx-auto text-[#0a120b]/20" />
            <p className="text-sm text-[#0a120b]/45 mt-2">Nothing planned this day.</p>
          </div>
        )}

        {overdue.length > 0 && (
          <Section title="Overdue to-dos" tone="text-red-700">
            {overdue.map((r) => <ReminderItem key={r.id} r={r} late onToggle={onToggle} onEdit={onEdit} />)}
          </Section>
        )}
        {a.reminders.length > 0 && (
          <Section title="To-dos">
            {a.reminders.map((r) => <ReminderItem key={r.id} r={r} onToggle={onToggle} onEdit={onEdit} />)}
          </Section>
        )}
        {a.departures.length > 0 && (
          <Section title="Departing" tone="text-[#1F5A42]">
            {a.departures.map((b) => <BookingItem key={b.id} b={b} icon={ArrowUpRight} />)}
          </Section>
        )}
        {a.returns.length > 0 && (
          <Section title="Returning" tone="text-sky-700">
            {a.returns.map((b) => <BookingItem key={b.id} b={b} icon={ArrowDownLeft} />)}
          </Section>
        )}
        {balances.length > 0 && (
          <Section title={day === today ? "Balances to collect (next 14 days)" : "Collect the balance"} tone="text-rose-700">
            {balances.map((b) => <BookingItem key={b.id} b={b} icon={Banknote} balance />)}
          </Section>
        )}
        {a.onTrip.length > 0 && (
          <Section title="On safari">
            {a.onTrip.map((b) => <BookingItem key={b.id} b={b} icon={Users} />)}
          </Section>
        )}

        <Button variant="secondary" onClick={onAdd} className="w-full">
          <Plus className="size-4" /> Add a to-do on {shortDay(day)}
        </Button>
      </div>
    </Card>
  );
}

function Section({ title, tone = "text-[#0a120b]/50", children }: { title: string; tone?: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${tone}`}>{title}</h3>
      <ul className="space-y-2">{children}</ul>
    </section>
  );
}

function BookingItem({ b, icon: Icon, balance = false }: { b: Booking; icon: React.ElementType; balance?: boolean }) {
  return (
    <li>
      <Link href={bookingLink(b)} className="group flex items-start gap-3 rounded-xl border border-[#0a120b]/[0.06] p-3 hover:border-[#c5a86d] transition-colors">
        <span className={`size-8 shrink-0 rounded-lg flex items-center justify-center ${barStyle(b)}`}>
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium truncate group-hover:text-[#1F5A42]">{b.customer}</span>
          <span className="block text-xs text-[#0a120b]/50 truncate">{tripName(b)}</span>
          <span className="block text-xs text-[#0a120b]/45 mt-0.5">
            {balance
              ? `Trip ${shortDay(dayOf(b.startDate))} · ${b.payment === "Unpaid" ? "nothing paid" : "deposit paid"} · ${bookingAmount(b)}`
              : `${shortDay(dayOf(b.startDate))} – ${shortDay(dayOf(b.endDate))} · ${b.travelers} traveler${b.travelers === 1 ? "" : "s"}${b.status !== "Confirmed" ? ` · ${b.status}` : ""}`}
          </span>
        </span>
      </Link>
    </li>
  );
}

function ReminderItem({ r, late = false, onToggle, onEdit }: { r: AdminReminder; late?: boolean; onToggle: (r: AdminReminder) => void; onEdit: (r: AdminReminder) => void }) {
  return (
    <li className={`flex items-start gap-3 rounded-xl border p-3 ${late ? "border-red-200 bg-red-50/50" : "border-[#0a120b]/[0.06]"}`}>
      <button
        type="button"
        onClick={() => onToggle(r)}
        aria-label={r.done ? "Mark as not done" : "Mark as done"}
        className={`mt-0.5 size-5 shrink-0 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
          r.done ? "bg-[#1F5A42] border-[#1F5A42] text-white" : "border-[#0a120b]/25 hover:border-[#1F5A42]"
        }`}
      >
        {r.done && <Check className="size-3.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${r.done ? "line-through text-[#0a120b]/40" : ""}`}>
          {r.time && <span className="tabular-nums text-[#8a6d2f]">{r.time} · </span>}
          {r.title}
        </p>
        {r.booking && (
          <Link href={`/admin/bookings?open=${r.booking.id}`} className="text-xs text-[#1F5A42] hover:underline">{r.booking.customer}</Link>
        )}
        {r.notes && <p className="text-xs text-[#0a120b]/55 mt-1 whitespace-pre-line">{r.notes}</p>}
        <p className="text-[11px] text-[#0a120b]/40 mt-1">
          {late && <span className="text-red-700 font-medium">Due {shortDay(dayOf(r.date))} · </span>}
          {r.done && r.doneBy ? `Done by ${r.doneBy}` : `Added by ${r.createdBy}`}
        </p>
      </div>
      <button type="button" onClick={() => onEdit(r)} aria-label="Edit" className="p-1.5 rounded-lg text-[#0a120b]/40 hover:bg-[#0a120b]/5 hover:text-[#0a120b] cursor-pointer">
        <Pencil className="size-3.5" />
      </button>
    </li>
  );
}

// ---------- Add / edit a to-do ----------

function ReminderModal({ editing, onClose, bookings }: { editing: Editing; onClose: () => void; bookings: Booking[] }) {
  return (
    <Modal open={editing !== null} onClose={onClose} title={editing?.reminder ? "Edit to-do" : "New to-do"}>
      {/* A new form each time it opens, filled from the to-do or the chosen day */}
      {editing && <ReminderForm key={editing.reminder?.id ?? editing.day} editing={editing} onClose={onClose} bookings={bookings} />}
    </Modal>
  );
}

function ReminderForm({ editing, onClose, bookings }: { editing: NonNullable<Editing>; onClose: () => void; bookings: Booking[] }) {
  const createReminder = useCalendarStore((s) => s.createReminder);
  const updateReminder = useCalendarStore((s) => s.updateReminder);
  const deleteReminder = useCalendarStore((s) => s.deleteReminder);
  const r = editing.reminder;
  const [form, setForm] = useState<AdminReminderInput>({
    title: r?.title ?? "",
    date: r ? dayOf(r.date) : editing.day,
    time: r?.time ?? "",
    notes: r?.notes ?? "",
    bookingId: r?.bookingId ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (changes: Partial<AdminReminderInput>) => setForm((f) => ({ ...f, ...changes }));

  // Upcoming trips first, so the right booking is easy to find
  const options = useMemo(
    () => [...bookings].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [bookings],
  );

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const input = { ...form, time: form.time || null, notes: form.notes || null, bookingId: form.bookingId || null };
    try {
      if (r) await updateReminder(r.id, input);
      else await createReminder(input);
      toast.success(r ? "To-do saved" : "To-do added");
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!r) return;
    try {
      await deleteReminder(r.id);
      toast.success("To-do deleted");
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <form onSubmit={save} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="todo-title">What to do</label>
        <input id="todo-title" className={inputClass} value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Buy gorilla permits for Ana" maxLength={160} required autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="todo-date">Day</label>
          <input id="todo-date" type="date" className={inputClass} value={form.date} onChange={(e) => set({ date: e.target.value })} required />
        </div>
        <div>
          <label className={labelClass} htmlFor="todo-time">Time (optional)</label>
          <input id="todo-time" type="time" className={inputClass} value={form.time ?? ""} onChange={(e) => set({ time: e.target.value })} />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="todo-booking">Booking (optional)</label>
        <select id="todo-booking" className={inputClass} value={form.bookingId ?? ""} onChange={(e) => set({ bookingId: e.target.value })}>
          <option value="">No booking</option>
          {options.map((b) => (
            <option key={b.id} value={b.id}>
              {b.customer} · {tripName(b)} · {shortDay(dayOf(b.startDate))}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="todo-notes">Notes (optional)</label>
        <textarea id="todo-notes" rows={3} className={inputClass} value={form.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} maxLength={2000} />
      </div>

      <div className="flex items-center justify-between gap-2 pt-2">
        {r ? (
          // Two clicks: the first one asks "Sure?"
          <Button type="button" variant={confirmDelete ? "danger" : "ghost"} onClick={() => (confirmDelete ? remove() : setConfirmDelete(true))} className={confirmDelete ? "" : "!text-red-600"}>
            <Trash2 className="size-4" /> {confirmDelete ? "Click again to delete" : "Delete"}
          </Button>
        ) : <span />}
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving || !form.title.trim()}>{r ? "Save" : "Add to-do"}</Button>
        </div>
      </div>
    </form>
  );
}

// ---------- Small parts ----------

function Stat({ icon: Icon, label, value, alert = false, onClick }: { icon: React.ElementType; label: string; value: number; alert?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-left cursor-pointer">
      <Card className={`p-4 flex items-center gap-3 transition-colors hover:border-[#c5a86d] ${alert ? "!border-red-200 !bg-red-50/40" : ""}`}>
        <span className={`size-10 shrink-0 rounded-xl flex items-center justify-center ${alert ? "bg-red-100 text-red-700" : "bg-[#2E7D5B]/10 text-[#2E7D5B]"}`}>
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-semibold tabular-nums leading-none">{value}</p>
          <p className={`text-xs mt-1 truncate ${alert ? "text-red-700" : "text-[#0a120b]/50"}`}>{label}</p>
        </div>
      </Card>
    </button>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-5 rounded-sm ${className}`} />
      {label}
    </span>
  );
}
