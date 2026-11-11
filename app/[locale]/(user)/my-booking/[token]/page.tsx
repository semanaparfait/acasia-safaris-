"use client";

// The visitor's own booking page: /my-booking/<token>
// The link is emailed to them when they book (the token is the key, no login).
// They see their trip and price, accept a price from the team, and talk with the team.
import React, { use, useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useGroupText } from "@/lib/useGroupText";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  HandCoins,
  Loader2,
  MapPin,
  MessageCircle,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import { API_URL, api } from "@/lib/api";
import { moment, tripDate, tripRange } from "@/lib/dates";
import { liveSocket } from "@/lib/live";
import { depositOf, DEPOSIT_RATE } from "@/lib/helpers";
import { Money, useMoneyText } from "@/components/ui/money";
import type { BookingMessage, PublicBooking } from "@/lib/types";


const statusStyle: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Negotiating: "bg-[#c5a86d]/20 text-[#7a5d22]",
  Confirmed: "bg-emerald-100 text-emerald-800",
  Completed: "bg-sky-100 text-sky-800",
  Cancelled: "bg-red-100 text-red-700",
};

export default function MyBookingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const t = useTranslations("MyBooking");
  const locale = useLocale();
  const [booking, setBooking] = useState<PublicBooking | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    try {
      setBooking(await api<PublicBooking>(`/bookings/track/${token}`));
    } catch {
      setNotFound(true);
    }
  }, [token]);

  // Load now, then live: the team's answers and new prices appear instantly (lib/live.ts)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading data from the API
    load();
    const socket = liveSocket({ booking: token });
    socket.on("booking", (b: PublicBooking) => setBooking(b));
    socket.io.on("reconnect", load); // back online: catch up on anything missed
    return () => {
      socket.disconnect();
    };
  }, [load, token]);

  if (notFound && !booking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 bg-[#faf8f5]">
        <div className="text-center max-w-sm">
          <h1 className="font-serif text-2xl text-[#12231a] mb-2">{t("notFound")}</h1>
          <p className="text-sm text-[#0a120b]/60 mb-6">{t("notFoundText")}</p>
          <Link href="/contact" className="inline-block bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-6 py-3 rounded-lg">{t("contactUs")}</Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#faf8f5]">
        <Loader2 className="size-6 animate-spin text-[#c5a86d]" />
      </div>
    );
  }

  const title = booking.package?.title ?? booking.destinations.map((d) => d.title).join(" · ");

  return (
    <div className="bg-[#faf8f5] min-h-screen font-sans text-[#0a120b]">
      {/* Header */}
      <section className="relative overflow-hidden bg-[#12231a] text-white">
        {booking.package?.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={booking.package.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12231a] via-[#12231a]/80 to-[#12231a]/40" />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-6 pt-32 pb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c5a86d] mb-2">{t("yourBooking")}</p>
          <h1 className="font-serif text-3xl sm:text-4xl leading-tight max-w-3xl">{title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-white/70">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[booking.status] ?? "bg-white/10"}`}>{t(`status.${booking.status}`)}</span>
            <span>{t("hello", { name: booking.customer.split(" ")[0] })}</span>
            <span className="text-white/30">·</span>
            <span>{t("booked", { date: tripDate(booking.createdAt, "long", locale) })}</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Price + trip: first on phones */}
        <div className="space-y-6 lg:order-2">
          {booking.ticketCode && <TicketCard booking={booking} token={token} />}
          <PriceCard booking={booking} token={token} onChange={setBooking} />
          <TripCard booking={booking} />
        </div>
        <div className="lg:col-span-2 lg:order-1">
          <Conversation booking={booking} token={token} onChange={setBooking} />
        </div>
      </div>
    </div>
  );
}

// ---------- Price ----------

function PriceCard({ booking, token, onChange }: { booking: PublicBooking; token: string; onChange: (b: PublicBooking) => void }) {
  const t = useTranslations("MyBooking");
  const [accepting, setAccepting] = useState(false);
  const moneyText = useMoneyText();
  const [error, setError] = useState("");
  const teamOffer = booking.offerBy === "team" && booking.offer ? booking.offer : null;
  const myOffer = booking.offerBy === "customer" && booking.offer ? booking.offer : null;
  const open = booking.status === "Pending" || booking.status === "Negotiating";

  const accept = async () => {
    setAccepting(true);
    setError("");
    try {
      onChange(await api<PublicBooking>(`/bookings/track/${token}/accept`, { method: "POST" }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAccepting(false);
    }
  };

  const acceptButton = (label: string, primary = true) => (
    <button
      type="button"
      onClick={accept}
      disabled={accepting}
      className={`w-full inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-lg transition-all disabled:opacity-60 cursor-pointer ${
        primary ? "bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] shadow-md" : "border border-[#0a120b]/15 hover:border-[#0a120b] text-[#0a120b]"
      }`}
    >
      {accepting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} {label}
    </button>
  );

  return (
    <div className="rounded-2xl bg-white border border-[#0a120b]/[0.07] shadow-sm overflow-hidden">
      <div className="px-5 pt-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#0a120b]/45">{t("price")}</p>
      </div>

      <div className="p-5 pt-3 space-y-4">
        {/* The team proposed a price: the main action */}
        {open && teamOffer ? (
          <>
            <div className="rounded-xl bg-[#c5a86d]/10 border border-[#c5a86d]/40 p-4">
              <p className="text-xs text-[#7a5d22] font-medium">{t("ourOffer")}</p>
              <p className="font-serif text-3xl text-[#12231a] tabular-nums mt-1"><Money usd={teamOffer} approxClassName="font-sans" /></p>
              {booking.listAmount > teamOffer && (
                <p className="text-xs text-[#0a120b]/50 mt-1">
                  {t.rich("insteadOf", { old: () => <span className="line-through">{moneyText(booking.listAmount)}</span> })}
                </p>
              )}
            </div>
            {acceptButton(t("accept", { price: moneyText(teamOffer) }))}
            <p className="text-xs text-[#0a120b]/50 text-center">{t("orReply")}</p>
          </>
        ) : open && myOffer ? (
          <>
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 shrink-0 rounded-lg bg-[#f4efe6] text-[#8e7345] flex items-center justify-center"><Clock size={17} /></span>
              <div>
                <p className="text-sm font-medium">{t.rich("youOffered", { price: () => <Money usd={myOffer} /> })}</p>
                <p className="text-xs text-[#0a120b]/55 mt-0.5">{t.rich("teamWillAnswer", { price: () => <Money usd={booking.listAmount} /> })}</p>
              </div>
            </div>
            {booking.listAmount > 0 && acceptButton(t("bookInstead", { price: moneyText(booking.listAmount) }), false)}
          </>
        ) : booking.amount > 0 ? (
          <>
            <div>
              <p className="font-serif text-3xl text-[#12231a] tabular-nums"><Money usd={booking.amount} approxClassName="font-sans" /></p>
              <p className="text-xs text-[#0a120b]/50 mt-0.5">
                {booking.status === "Pending" ? t("confirmWithin") : t("totalEveryone")}
              </p>
            </div>
            {(booking.status === "Confirmed" || booking.status === "Completed") && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200/70 p-4 text-sm">
                <p className="flex items-center gap-2 font-medium text-emerald-800"><ShieldCheck size={16} /> {t("priceAgreed")}</p>
                {booking.payment === "Paid" ? (
                  <p className="text-xs text-emerald-800/80 mt-1.5">{t("paid")}</p>
                ) : booking.payment === "Deposit" ? (
                  <p className="text-xs text-emerald-800/80 mt-1.5">{t("depositReceived")}</p>
                ) : (
                  <p className="text-xs text-emerald-800/80 mt-1.5">
                    {t.rich("depositDue", {
                      rate: DEPOSIT_RATE * 100,
                      price: () => (
                        <strong>
                          <Money usd={depositOf(booking.amount)} />
                        </strong>
                      ),
                    })}
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 shrink-0 rounded-lg bg-[#f4efe6] text-[#8e7345] flex items-center justify-center"><HandCoins size={17} /></span>
            <p className="text-sm text-[#0a120b]/70">{t("preparing")}</p>
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

// ---------- Ticket ----------

// Confirmed: the QR code the team scans on the day (also in the confirmation email)
function TicketCard({ booking, token }: { booking: PublicBooking; token: string }) {
  const t = useTranslations("MyBooking");
  const locale = useLocale();
  const qr = `${API_URL}/bookings/track/${token}/qr`;
  return (
    <div className="relative rounded-2xl bg-[#12231a] text-white shadow-lg overflow-hidden">
      <div className="absolute -top-20 -right-16 w-52 h-52 rounded-full bg-[#c5a86d]/15" />
      <div className="relative p-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c5a86d]">{t("ticket")}</p>
        <div className="mt-4 mx-auto w-48 rounded-xl bg-white p-3 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt={`Ticket QR code ${booking.ticketCode}`} width={168} height={168} className="w-full h-auto" />
        </div>
        <p className="mt-3 font-mono text-lg font-bold tracking-[0.3em] text-[#c5a86d]">{booking.ticketCode}</p>
        {booking.checkedInAt ? (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200">
            <CheckCircle2 size={13} /> {t("checkedIn", { time: moment(booking.checkedInAt, locale) })}
          </p>
        ) : (
          <p className="mt-3 text-xs text-white/65 leading-relaxed">
            {t("showQr")}
          </p>
        )}
      </div>
      <div className="relative grid grid-cols-2 border-t border-dashed border-white/15 text-xs font-medium text-[#c5a86d]">
        <a href={qr} download={`Acacia ticket ${booking.ticketCode}.png`} className="py-3 text-center hover:bg-white/5 transition-colors">
          {t("saveQr")}
        </a>
        {/* Google, Apple and Outlook calendars open .ics files; with a reminder 2 days before */}
        <a
          href={`${API_URL}/bookings/track/${token}/calendar.ics`}
          download="acacia-safaris-trip.ics"
          className="inline-flex items-center justify-center gap-1.5 py-3 border-l border-dashed border-white/15 hover:bg-white/5 transition-colors"
        >
          <CalendarDays size={13} /> {t("addCalendar")}
        </a>
      </div>
    </div>
  );
}

// ---------- Trip ----------

function TripCard({ booking }: { booking: PublicBooking }) {
  const t = useTranslations("MyBooking");
  const locale = useLocale();
  const group = useGroupText();
  const guests = booking.guests?.filter((g) => g.count > 0) ?? [];
  return (
    <div className="rounded-2xl bg-white border border-[#0a120b]/[0.07] shadow-sm p-5 space-y-3.5 text-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#0a120b]/45">{t("yourTrip")}</p>
      {booking.package?.location && <Row icon={MapPin} text={booking.package.location} />}
      <Row icon={CalendarDays} text={tripRange(booking.startDate, booking.endDate, locale)} />
      <Row
        icon={Users}
        text={
          guests.length > 0
            ? guests.map((g) => group.count(g.label, g.count)).join(", ")
            : group.travelers(booking.travelers)
        }
      />
      {booking.destinations.length > 0 && (
        <div className="pt-2 space-y-2">
          {booking.destinations.map((d) => (
            <div key={d.id} className="rounded-lg bg-[#f7f5f0] px-3 py-2">
              <p className="font-medium">{d.title}</p>
              <p className="text-xs text-[#0a120b]/55">{d.travelStyle} · {d.accommodation} · {d.budget}</p>
            </div>
          ))}
        </div>
      )}
      {booking.package && (
        <Link href={`/tour?package=${booking.package.id}`} className="inline-block text-xs font-medium text-[#8e7345] hover:underline pt-1">
          {t("seeItinerary")}
        </Link>
      )}
    </div>
  );
}

function Row({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <p className="flex items-start gap-2.5 text-[#0a120b]/75">
      <Icon size={16} className="shrink-0 mt-px text-[#8e7345]" /> {text}
    </p>
  );
}

// ---------- Conversation ----------

function Conversation({ booking, token, onChange }: { booking: PublicBooking; token: string; onChange: (b: PublicBooking) => void }) {
  const t = useTranslations("MyBooking");
  const moneyText = useMoneyText();
  const [text, setText] = useState("");
  const [withOffer, setWithOffer] = useState(false);
  const [offer, setOffer] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);

  const closed = booking.status === "Completed" || booking.status === "Cancelled";
  const canOffer = booking.status === "Pending" || booking.status === "Negotiating";
  const count = booking.messages.length;

  // Show the newest message
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [count]);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const offerValue = withOffer ? Number(offer) : undefined;
    if (!text.trim() && !offerValue) return;
    setSending(true);
    setError("");
    try {
      onChange(
        await api<PublicBooking>(`/bookings/track/${token}/messages`, {
          method: "POST",
          body: { text: text.trim() || undefined, offer: offerValue },
        }),
      );
      setText("");
      setOffer("");
      setWithOffer(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-[#0a120b]/[0.07] shadow-sm flex flex-col">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#0a120b]/[0.06]">
        <span className="w-9 h-9 rounded-full bg-[#12231a] text-[#c5a86d] flex items-center justify-center"><MessageCircle size={17} /></span>
        <div>
          <p className="text-sm font-semibold">{t("talkTitle")}</p>
          <p className="text-xs text-[#0a120b]/50">{t("talkText")}</p>
        </div>
      </div>

      <div className="px-4 sm:px-5 py-5 space-y-3 min-h-[260px] max-h-[520px] overflow-y-auto bg-[#faf8f5]/60">
        {count === 0 ? (
          <div className="h-[220px] flex flex-col items-center justify-center text-center text-sm text-[#0a120b]/45">
            <MessageCircle size={28} className="mb-2 text-[#0a120b]/20" />
            {t("noMessages")}
          </div>
        ) : (
          booking.messages.map((m) => <Bubble key={m.id} message={m} />)
        )}
        <div ref={end} />
      </div>

      {closed ? (
        <p className="px-5 py-4 text-sm text-[#0a120b]/50 border-t border-[#0a120b]/[0.06]">
          {t("closed", { status: t(`status.${booking.status}`).toLowerCase() })}
        </p>
      ) : (
        <form onSubmit={send} className="p-4 border-t border-[#0a120b]/[0.06] space-y-3">
          {withOffer && (
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#0a120b]/40">$</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                autoFocus
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                placeholder={booking.listAmount > 0 ? t("offerPlaceholderLower", { price: moneyText(booking.listAmount) }) : t("offerPlaceholderBudget")}
                className="w-full bg-[#c5a86d]/[0.07] border border-[#c5a86d]/50 rounded-lg pl-7 pr-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-[#c5a86d]/15"
              />
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              rows={2}
              value={text}
              maxLength={2000}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={t("write")}
              className="flex-1 resize-none bg-[#f7f5f0] border border-[#0a120b]/10 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#c5a86d] focus:bg-white focus:ring-4 focus:ring-[#c5a86d]/15 transition-all"
            />
            <button
              type="submit"
              disabled={sending || (!text.trim() && !(withOffer && Number(offer) > 0))}
              aria-label={t("send")}
              className="h-11 w-11 shrink-0 rounded-xl bg-[#12231a] hover:bg-[#1F5A42] text-white flex items-center justify-center disabled:opacity-40 transition-colors cursor-pointer"
            >
              {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
            </button>
          </div>
          <div className="flex items-center justify-between gap-3">
            {canOffer ? (
              <button
                type="button"
                onClick={() => setWithOffer(!withOffer)}
                className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 transition-colors cursor-pointer ${
                  withOffer ? "bg-[#c5a86d] text-[#12231a]" : "bg-[#f4efe6] text-[#7a5d22] hover:bg-[#ece3d2]"
                }`}
              >
                <HandCoins size={13} /> {withOffer ? t("removePrice") : t("proposePrice")}
              </button>
            ) : (
              <span />
            )}
            <span className="text-[11px] text-[#0a120b]/35 hidden sm:block">{t("enterHint")}</span>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      )}
    </div>
  );
}

function Bubble({ message: m }: { message: BookingMessage }) {
  const t = useTranslations("MyBooking");
  const locale = useLocale();
  const time = moment(m.createdAt, locale);

  if (m.event === "accepted") {
    return (
      <div className="flex justify-center py-1">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-xs text-emerald-800">
          <CheckCircle2 size={14} /> {m.text} <span className="text-emerald-800/50">{time}</span>
        </span>
      </div>
    );
  }

  const mine = m.sender === "customer";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] sm:max-w-[75%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
        <span className="text-[11px] text-[#0a120b]/45 mb-1 px-1">
          {mine ? t("you") : t("fromTeam", { name: m.authorName })} · {time}
        </span>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
            mine ? "bg-[#12231a] text-white rounded-br-md" : "bg-white border border-[#0a120b]/[0.08] text-[#0a120b] rounded-bl-md shadow-sm"
          }`}
        >
          {m.offer != null && (
            <span className={`flex items-center gap-1.5 text-xs font-semibold mb-1 ${mine ? "text-[#c5a86d]" : "text-[#8e7345]"}`}>
              <HandCoins size={13} /> {mine ? t("yourOfferLabel") : t("ourOfferLabel")}: <Money usd={m.offer} />
            </span>
          )}
          {m.text}
        </div>
      </div>
    </div>
  );
}
