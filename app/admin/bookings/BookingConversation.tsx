"use client";

// The conversation with the customer, in the booking drawer (Admin > Bookings).
// The team replies, proposes a price (a counter-offer) or accepts the customer's price.
// Every reply is emailed to the customer with the link to their booking page.
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { AlertTriangle, CheckCircle2, HandCoins, Loader2, MessageCircle, Send } from "lucide-react";
import { money } from "@/lib/helpers";
import type { Booking, BookingMessage } from "@/lib/types";
import { useBookingsStore } from "@/store/bookingsStore";
import { Button } from "../components/ui";

export default function BookingConversation({ booking }: { booking: Booking }) {
  const sendMessage = useBookingsStore((s) => s.sendMessage);
  const acceptOffer = useBookingsStore((s) => s.acceptOffer);
  const [text, setText] = useState("");
  const [withOffer, setWithOffer] = useState(false);
  const [offer, setOffer] = useState("");
  const [busy, setBusy] = useState(false);
  const thread = useRef<HTMLDivElement>(null);

  const messages = booking.messages ?? [];
  const closed = booking.status === "Completed" || booking.status === "Cancelled";
  const canOffer = booking.status === "Pending" || booking.status === "Negotiating";
  const customerOffer = booking.offerBy === "customer" ? booking.offer : null;
  const belowFloor = customerOffer != null && booking.floorAmount != null && customerOffer < booking.floorAmount;
  const offerValue = withOffer ? Number(offer) : undefined;
  const offerBelowFloor = offerValue != null && booking.floorAmount != null && offerValue < booking.floorAmount;

  useEffect(() => {
    // Show the latest message (scrolls the thread only, not the whole panel)
    if (thread.current) thread.current.scrollTop = thread.current.scrollHeight;
  }, [messages.length]);

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await action();
      toast.success(success);
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() && !offerValue) return;
    const ok = await run(
      () => sendMessage(booking.id, text.trim(), offerValue),
      offerValue ? `Offer of ${money(offerValue)} sent` : "Message sent",
    );
    if (ok) {
      setText("");
      setOffer("");
      setWithOffer(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#0a120b]/45">
        <MessageCircle className="size-3.5" /> Conversation with the customer
      </p>

      {/* The customer asks for a price: accept it, or counter below */}
      {canOffer && customerOffer != null && (
        <div className={`rounded-xl border p-4 ${belowFloor ? "border-red-200 bg-red-50/60" : "border-[#c5a86d]/40 bg-[#c5a86d]/[0.07]"}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-[#0a120b]/55">{booking.customer} asks for</p>
              <p className="text-xl font-semibold tabular-nums">{money(customerOffer)}</p>
              {booking.listAmount > 0 && (
                <p className="text-xs text-[#0a120b]/50">
                  {Math.round((1 - customerOffer / booking.listAmount) * 100)}% off the full price of {money(booking.listAmount)}
                </p>
              )}
            </div>
            <Button onClick={() => run(() => acceptOffer(booking.id), "Price accepted, booking confirmed")} disabled={busy}>
              <CheckCircle2 className="size-4" /> Accept
            </Button>
          </div>
          {belowFloor && (
            <p className="flex items-center gap-1.5 text-xs text-red-700 mt-2.5">
              <AlertTriangle className="size-3.5" /> Below your lowest price ({money(booking.floorAmount!)}). Consider a counter-offer.
            </p>
          )}
        </div>
      )}
      {canOffer && booking.offerBy === "team" && booking.offer != null && (
        <p className="rounded-xl bg-[#f7f5f0] px-4 py-3 text-xs text-[#0a120b]/65">
          You offered <strong className="text-[#0a120b]">{money(booking.offer)}</strong>. Waiting for the customer to accept or reply.
        </p>
      )}

      {/* Thread */}
      <div ref={thread} className="rounded-xl border border-[#0a120b]/10 bg-[#f7f5f0]/50 p-3 space-y-2.5 max-h-80 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-[#0a120b]/40 py-6">No messages yet. Write to the customer below.</p>
        ) : (
          messages.map((m) => <Bubble key={m.id} message={m} />)
        )}
      </div>

      {/* Reply */}
      {closed ? (
        <p className="text-xs text-[#0a120b]/45">This booking is {booking.status.toLowerCase()}: the conversation is closed.</p>
      ) : (
        <form onSubmit={send} className="space-y-2">
          {withOffer && (
            <div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#0a120b]/40">$</span>
                <input
                  type="number"
                  min={1}
                  autoFocus
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  placeholder="Your price for the whole trip (USD)"
                  className="w-full bg-[#c5a86d]/[0.07] border border-[#c5a86d]/50 rounded-lg pl-7 pr-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-[#c5a86d]/15"
                />
              </div>
              {offerBelowFloor && (
                <p className="flex items-center gap-1.5 text-xs text-red-700 mt-1">
                  <AlertTriangle className="size-3.5" /> Below your lowest price ({money(booking.floorAmount!)})
                </p>
              )}
            </div>
          )}
          <textarea
            rows={3}
            value={text}
            maxLength={2000}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send();
            }}
            placeholder={withOffer ? "Explain your price (optional)…" : "Write to the customer… (Ctrl + Enter to send)"}
            className="w-full resize-none bg-white border border-[#0a120b]/10 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#c5a86d] focus:ring-4 focus:ring-[#c5a86d]/15"
          />
          <div className="flex items-center justify-between gap-2">
            {canOffer ? (
              <button
                type="button"
                onClick={() => setWithOffer(!withOffer)}
                className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 transition-colors cursor-pointer ${
                  withOffer ? "bg-[#c5a86d] text-[#12231a]" : "bg-[#f4efe6] text-[#7a5d22] hover:bg-[#ece3d2]"
                }`}
              >
                <HandCoins className="size-3.5" /> {withOffer ? "Remove price" : customerOffer != null ? "Counter-offer" : "Propose a price"}
              </button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={busy || (!text.trim() && !(offerValue && offerValue > 0))}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} {withOffer ? "Send offer" : "Send"}
            </Button>
          </div>
          <p className="text-[11px] text-[#0a120b]/40">The customer gets an email with a link to answer.</p>
        </form>
      )}
    </div>
  );
}

function Bubble({ message: m }: { message: BookingMessage }) {
  const time = format(new Date(m.createdAt), "d MMM, HH:mm");
  if (m.event === "accepted") {
    return (
      <p className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 py-1">
        <CheckCircle2 className="size-3.5" /> {m.text} <span className="text-emerald-700/50">{time}</span>
      </p>
    );
  }
  const team = m.sender === "team";
  return (
    <div className={`flex ${team ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[85%]">
        <p className={`text-[11px] text-[#0a120b]/45 mb-0.5 ${team ? "text-right" : ""}`}>
          {m.authorName} · {time}
        </p>
        <div
          className={`rounded-2xl px-3.5 py-2 text-sm whitespace-pre-line ${
            team ? "bg-[#12231a] text-white rounded-br-md" : "bg-white border border-[#0a120b]/10 rounded-bl-md"
          }`}
        >
          {m.offer != null && (
            <span className={`flex items-center gap-1.5 text-xs font-semibold mb-0.5 ${team ? "text-[#c5a86d]" : "text-[#8a6d2f]"}`}>
              <HandCoins className="size-3.5" /> Offer: {money(m.offer)}
            </span>
          )}
          {m.text}
        </div>
      </div>
    </div>
  );
}
