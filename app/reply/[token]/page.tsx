"use client";

// Quick reply: an admin answers a customer from the link in an alert, without logging in.
// The link is personal (one admin, one booking, 48 hours). On a new device it asks for the
// admin's 4 digit PIN (Admin > Settings > Security); the device is then trusted for 30 days.
// Replies land in the same conversation as Admin > Bookings / Messages.
import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { AlertTriangle, CalendarDays, CheckCircle2, HandCoins, KeyRound, Loader2, Lock, Send, Users } from "lucide-react";
import { api } from "@/lib/api";
import { money } from "@/lib/helpers";
import type { BookingMessage, SavedReply } from "@/lib/types";
import { insertReply } from "@/lib/useSavedReplies";
import { SavedReplyChips } from "@/components/ui/saved-reply-chips";

type ReplyBooking = {
  id: string;
  customer: string;
  country: string;
  trip: string;
  startDate: string;
  endDate: string;
  travelers: number;
  status: string;
  listAmount: number;
  amount: number;
  floorAmount: number | null;
  offer: number | null;
  offerBy: "customer" | "team" | null;
  needsReply: boolean;
  messages: BookingMessage[];
};

type Opened =
  | { trusted: false; workerName: string; pinSet: boolean }
  | { trusted: true; workerName: string; booking: ReplyBooking; savedReplies: SavedReply[] };

const POLL_MS = 15_000; // new customer messages show up without a reload

export default function QuickReplyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const base = `/quick-reply/${encodeURIComponent(token)}`;
  const [state, setState] = useState<Opened | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setState(await api<Opened>(base));
      setError("");
    } catch (err) {
      setError((err as Error).message);
    }
  }, [base]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading data from the API
    load();
  }, [load]);

  // Keep the conversation fresh while the page is open and visible
  const trusted = state?.trusted === true;
  useEffect(() => {
    if (!trusted) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [trusted, load]);

  if (error && !state) return <Problem text={error} />;
  if (!state) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[#0a120b]/40" />
      </div>
    );
  }
  if (!state.trusted) return <PinStep base={base} name={state.workerName} pinSet={state.pinSet} onUnlocked={setState} />;
  return (
    <Conversation
      base={base}
      name={state.workerName}
      booking={state.booking}
      savedReplies={state.savedReplies}
      onChange={setState}
      onExpired={setError}
      error={error}
    />
  );
}

// ---------- Link expired / not valid ----------

function Problem({ text }: { text: string }) {
  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="size-6" />
        </span>
        <h1 className="text-lg font-semibold">This link cannot be used</h1>
        <p className="mt-2 text-sm text-[#0a120b]/60">{text}</p>
        <Link href="/admin/messages" className="mt-6 inline-block rounded-lg bg-[#12231a] px-5 py-2.5 text-sm font-medium text-white">
          Open the admin panel
        </Link>
      </div>
    </div>
  );
}

// ---------- PIN (new device) ----------

function PinStep({
  base,
  name,
  pinSet,
  onUnlocked,
}: {
  base: string;
  name: string;
  pinSet: boolean;
  onUnlocked: (s: Opened) => void;
}) {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const first = name.split(/\s+/)[0];

  const submit = async (value: string) => {
    setBusy(true);
    setError("");
    try {
      onUnlocked(await api<Opened>(`${base}/pin`, { method: "POST", body: { pin: value } }));
    } catch (err) {
      setError((err as Error).message);
      setPin("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <div className="w-full max-w-xs text-center">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#12231a] text-[#c5a86d]">
          <Lock className="size-5" />
        </span>
        <h1 className="text-lg font-semibold">Hi {first}</h1>
        {pinSet ? (
          <>
            <p className="mt-1.5 text-sm text-[#0a120b]/60">
              New device: type your 4 digit quick-reply PIN. This device is then trusted for 30 days.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (pin.length === 4) submit(pin);
              }}
              className="mt-6"
            >
              <input
                autoFocus
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-label="PIN"
                maxLength={4}
                value={pin}
                disabled={busy}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setPin(value);
                  if (value.length === 4) submit(value);
                }}
                placeholder="••••"
                className="w-full rounded-xl border border-[#0a120b]/15 bg-white py-3 text-center text-2xl tracking-[0.6em] outline-none focus:border-[#c5a86d]"
              />
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              {busy && <Loader2 className="mx-auto mt-4 size-5 animate-spin text-[#0a120b]/40" />}
            </form>
          </>
        ) : (
          <>
            <p className="mt-1.5 text-sm text-[#0a120b]/60">
              You have no quick-reply PIN yet. Log in, go to <strong>Settings &gt; Security</strong>, set a 4 digit PIN, then open this
              link again.
            </p>
            <Link href="/admin/settings" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#12231a] px-5 py-2.5 text-sm font-medium text-white">
              <KeyRound className="size-4" /> Set my PIN
            </Link>
          </>
        )}
        <p className="mt-8 text-[11px] text-[#0a120b]/40">This link is only for you. Please do not forward it.</p>
      </div>
    </div>
  );
}

// ---------- The conversation ----------

function Conversation({
  base,
  name,
  booking: b,
  savedReplies,
  onChange,
  onExpired,
  error,
}: {
  base: string;
  name: string;
  booking: ReplyBooking;
  savedReplies: SavedReply[];
  onChange: (s: Opened) => void;
  onExpired: (message: string) => void;
  error: string;
}) {
  const [text, setText] = useState("");
  const [withOffer, setWithOffer] = useState(false);
  const [offer, setOffer] = useState("");
  const [busy, setBusy] = useState(false);
  const thread = useRef<HTMLDivElement>(null);

  const closed = b.status === "Completed" || b.status === "Cancelled";
  const canOffer = b.status === "Pending" || b.status === "Negotiating";
  const customerOffer = b.offerBy === "customer" ? b.offer : null;
  const belowFloor = customerOffer != null && b.floorAmount != null && customerOffer < b.floorAmount;
  const offerValue = withOffer ? Number(offer) : undefined;

  useEffect(() => {
    if (thread.current) thread.current.scrollTop = thread.current.scrollHeight;
  }, [b.messages.length]);

  const run = async (action: () => Promise<Opened>, success: string) => {
    setBusy(true);
    try {
      onChange(await action());
      toast.success(success);
      return true;
    } catch (err) {
      const message = (err as Error).message;
      if (/link|PIN/i.test(message)) onExpired(message);
      toast.error(message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() && !offerValue) return;
    const ok = await run(
      () => api<Opened>(`${base}/messages`, { method: "POST", body: { text: text.trim() || undefined, offer: offerValue } }),
      offerValue ? `Offer of ${money(offerValue)} sent` : "Sent. The customer is emailed too.",
    );
    if (ok) {
      setText("");
      setOffer("");
      setWithOffer(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-5 sm:py-8">
      {/* Booking */}
      <div className="rounded-2xl bg-[#12231a] p-5 text-white">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#c5a86d]">Quick reply · as {name}</p>
        <h1 className="mt-1 text-xl font-semibold">{b.customer}</h1>
        <p className="text-sm text-white/70">
          {b.trip} · {b.country}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/70">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" /> {format(new Date(b.startDate), "d MMM")} – {format(new Date(b.endDate), "d MMM yyyy")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5" /> {b.travelers} traveler{b.travelers === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5">{b.status}</span>
          {(b.amount || b.listAmount) > 0 && <span>Price {money(b.amount || b.listAmount)}</span>}
        </div>
      </div>

      {/* The customer's price proposal */}
      {canOffer && customerOffer != null && (
        <div className={`mt-4 rounded-2xl border p-4 ${belowFloor ? "border-red-200 bg-red-50" : "border-[#c5a86d]/40 bg-white"}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-[#0a120b]/55">{b.customer} asks for</p>
              <p className="text-xl font-semibold tabular-nums">{money(customerOffer)}</p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => api<Opened>(`${base}/accept`, { method: "POST" }), "Price accepted, booking confirmed")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1f5a42] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="size-4" /> Accept
            </button>
          </div>
          {belowFloor && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-red-700">
              <AlertTriangle className="size-3.5" /> Below your lowest price ({money(b.floorAmount!)}). Consider a counter-offer.
            </p>
          )}
        </div>
      )}

      {/* Thread */}
      <div ref={thread} className="mt-4 flex-1 space-y-2.5 overflow-y-auto rounded-2xl border border-[#0a120b]/10 bg-white p-4 min-h-[240px] max-h-[55dvh]">
        {b.messages.map((m) => (
          <Bubble key={m.id} message={m} />
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {/* Reply */}
      {closed ? (
        <p className="mt-4 text-sm text-[#0a120b]/50">This booking is {b.status.toLowerCase()}: the conversation is closed.</p>
      ) : (
        <form onSubmit={send} className="mt-4 space-y-2">
          {withOffer && (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#0a120b]/40">$</span>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                autoFocus
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                placeholder="Your price for the whole trip (USD)"
                className="w-full rounded-xl border border-[#c5a86d]/50 bg-[#c5a86d]/[0.07] py-3 pl-7 pr-3 text-sm outline-none"
              />
            </div>
          )}
          <SavedReplyChips replies={savedReplies} onPick={(reply) => setText((current) => insertReply(current, reply))} />
          <div className="flex items-end gap-2">
            <textarea
              rows={2}
              value={text}
              maxLength={2000}
              onChange={(e) => setText(e.target.value)}
              placeholder={withOffer ? "Explain your price (optional)…" : `Write to ${b.customer.split(/\s+/)[0]}…`}
              className="flex-1 resize-none rounded-xl border border-[#0a120b]/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#c5a86d]"
            />
            <button
              type="submit"
              disabled={busy || (!text.trim() && !(offerValue && offerValue > 0))}
              aria-label="Send"
              className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#12231a] text-white disabled:opacity-40 cursor-pointer"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </div>
          <div className="flex items-center justify-between gap-2">
            {canOffer ? (
              <button
                type="button"
                onClick={() => setWithOffer(!withOffer)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer ${
                  withOffer ? "bg-[#c5a86d] text-[#12231a]" : "bg-[#efe8da] text-[#7a5d22]"
                }`}
              >
                <HandCoins className="size-3.5" /> {withOffer ? "Remove price" : customerOffer != null ? "Counter-offer" : "Propose a price"}
              </button>
            ) : (
              <span />
            )}
            <span className="text-[11px] text-[#0a120b]/40">The customer is emailed and sees it on their page.</span>
          </div>
        </form>
      )}
      <p className="mt-6 text-center text-[11px] text-[#0a120b]/40">
        Signed in for this conversation only. <Link href="/admin/messages" className="underline">Open the admin panel</Link>
      </p>
    </div>
  );
}

function Bubble({ message: m }: { message: BookingMessage }) {
  const time = format(new Date(m.createdAt), "d MMM, HH:mm");
  if (m.event === "accepted") {
    return (
      <p className="flex items-center justify-center gap-1.5 py-1 text-xs text-emerald-700">
        <CheckCircle2 className="size-3.5" /> {m.text} <span className="text-emerald-700/50">{time}</span>
      </p>
    );
  }
  const team = m.sender === "team";
  return (
    <div className={`flex ${team ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[85%]">
        <p className={`mb-0.5 text-[11px] text-[#0a120b]/45 ${team ? "text-right" : ""}`}>
          {m.authorName} · {time}
        </p>
        <div
          className={`whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm ${
            team ? "rounded-br-md bg-[#12231a] text-white" : "rounded-bl-md border border-[#0a120b]/10 bg-[#f7f5f0]"
          }`}
        >
          {m.offer != null && (
            <span className={`mb-0.5 flex items-center gap-1.5 text-xs font-semibold ${team ? "text-[#c5a86d]" : "text-[#8a6d2f]"}`}>
              <HandCoins className="size-3.5" /> Offer: {money(m.offer)}
            </span>
          )}
          {m.text}
        </div>
      </div>
    </div>
  );
}
