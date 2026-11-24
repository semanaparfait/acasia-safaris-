"use client";

// The conversation with the customer, in the booking drawer (Admin > Bookings).
// The team replies, proposes a price (a counter-offer) or accepts the customer's price.
// Every reply is emailed to the customer with the link to their booking page.
// The team can also send a photo / document (📎) or a package's quotation PDF.
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { AlertTriangle, CheckCircle2, FileText, HandCoins, Loader2, MessageCircle, Paperclip, Send, X } from "lucide-react";
import { money } from "@/lib/helpers";
import type { Booking, BookingMessage } from "@/lib/types";
import { useBookingsStore } from "@/store/bookingsStore";
import { usePackagesStore } from "@/store/packagesStore";
import { ChatAttachments, fileSize } from "@/components/ui/chat-attachments";
import { sendTyping, useCustomerTyping } from "@/lib/live";
import { api } from "@/lib/api";
import { insertReply, useSavedReplies } from "@/lib/useSavedReplies";
import { SavedReplyChips } from "@/components/ui/saved-reply-chips";
import { TypingDots } from "@/components/ui/chat-bits";
import { Button } from "../components/ui";

export default function BookingConversation({ booking }: { booking: Booking }) {
  const sendMessage = useBookingsStore((s) => s.sendMessage);
  const acceptOffer = useBookingsStore((s) => s.acceptOffer);
  const sendFile = useBookingsStore((s) => s.sendFile);
  const sendQuotation = useBookingsStore((s) => s.sendQuotation);
  const packages = usePackagesStore((s) => s.packages);
  const loadPackages = usePackagesStore((s) => s.loadAll);
  const [file, setFile] = useState<File | null>(null); // a photo / document waiting to be sent
  const [showQuotes, setShowQuotes] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [withOffer, setWithOffer] = useState(false);
  const [offer, setOffer] = useState("");
  const [busy, setBusy] = useState(false);
  const thread = useRef<HTMLDivElement>(null);
  const customerTyping = useCustomerTyping((s) => Boolean(s.typing[booking.id]));
  const savedReplies = useSavedReplies((s) => s.replies);
  const loadSavedReplies = useSavedReplies((s) => s.load);
  useEffect(() => {
    loadSavedReplies();
  }, [loadSavedReplies]);

  // Opening the conversation: the customer sees "Seen by <your name>" (only if there is
  // something new from them; the server checks)
  const lastCustomerId = [...(booking.messages ?? [])].reverse().find((m) => m.sender === "customer")?.id;
  useEffect(() => {
    if (!lastCustomerId) return;
    api(`/bookings/${booking.id}/seen`, { method: "POST", admin: true }).catch(() => {});
  }, [booking.id, lastCustomerId]);

  // Tell the customer's page "<name> is typing…": at most every 2 s while typing,
  // and "stopped" after 3 s without a key, on send, or when the drawer closes
  const typingSentAt = useRef(0);
  const typingStop = useRef<ReturnType<typeof setTimeout>>(undefined);
  const stopTyping = () => {
    clearTimeout(typingStop.current);
    if (typingSentAt.current) sendTyping(booking.id, false);
    typingSentAt.current = 0;
  };
  const onTyping = () => {
    if (Date.now() - typingSentAt.current > 2000) {
      sendTyping(booking.id, true);
      typingSentAt.current = Date.now();
    }
    clearTimeout(typingStop.current);
    typingStop.current = setTimeout(stopTyping, 3000);
  };
  const stopRef = useRef(stopTyping);
  useEffect(() => {
    stopRef.current = stopTyping;
  });
  useEffect(() => () => stopRef.current(), []);

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
  }, [messages.length, customerTyping]);

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

  // Quotations to send: this booking's package first
  const quotations = packages
    .filter((p) => p.quotation)
    .sort((a, b) => Number(b.id === booking.package?.id) - Number(a.id === booking.package?.id));
  const openQuotes = () => {
    if (!packages.length) loadPackages();
    setShowQuotes(!showQuotes);
  };
  const shareQuotation = async (packageId: string, title: string) => {
    stopTyping();
    const ok = await run(() => sendQuotation(booking.id, packageId, text.trim()), `Quotation for ${title} sent`);
    if (ok) {
      setText("");
      setShowQuotes(false);
    }
  };

  const pickFile = (picked: File | undefined) => {
    if (!picked) return;
    if (picked.size > 10 * 1024 * 1024) {
      toast.error("This file is too big (10 MB at most)");
      return;
    }
    setFile(picked);
    setWithOffer(false);
  };

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (file) {
      stopTyping();
      const ok = await run(() => sendFile(booking.id, file, text.trim()), `${file.name} sent`);
      if (ok) {
        setText("");
        setFile(null);
      }
      return;
    }
    if (!text.trim() && !offerValue) return;
    stopTyping();
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
          messages.map((m) => <Bubble key={m.id} message={m} filesBase={`/api/bookings/${booking.id}/files`} />)
        )}
        {customerTyping && (
          <div className="flex justify-start">
            <TypingDots label={`${booking.customer} is typing…`} className="bg-white border border-[#0a120b]/10" />
          </div>
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
          {file && (
            <div className="flex items-center gap-2.5 rounded-lg border border-[#c5a86d]/40 bg-[#c5a86d]/[0.07] px-3 py-2">
              <Paperclip className="size-4 shrink-0 text-[#8a6d2f]" />
              <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
              <span className="text-xs text-[#0a120b]/45">{fileSize(file.size)}</span>
              <button type="button" onClick={() => setFile(null)} className="rounded p-0.5 text-[#0a120b]/40 hover:text-[#0a120b]" aria-label="Remove the file">
                <X className="size-4" />
              </button>
            </div>
          )}
          <input
            ref={fileInput}
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp,image/gif,.heic,.heif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
            onChange={(e) => {
              pickFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <SavedReplyChips
            replies={savedReplies ?? []}
            onPick={(reply) => {
              setText((current) => insertReply(current, reply));
              onTyping();
            }}
          />
          <textarea
            rows={3}
            value={text}
            maxLength={2000}
            onChange={(e) => {
              setText(e.target.value);
              if (e.target.value.trim()) onTyping();
              else stopTyping();
            }}
            onBlur={stopTyping}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send();
            }}
            placeholder={
              file ? "Add a message with the file (optional)…" : withOffer ? "Explain your price (optional)…" : "Write to the customer… (Ctrl + Enter to send)"
            }
            className="w-full resize-none bg-white border border-[#0a120b]/10 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#c5a86d] focus:ring-4 focus:ring-[#c5a86d]/15"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={busy || withOffer}
                title="Send a photo or document (10 MB at most)"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#f4efe6] px-3 py-1.5 text-xs font-medium text-[#7a5d22] transition-colors hover:bg-[#ece3d2] disabled:opacity-40 cursor-pointer"
              >
                <Paperclip className="size-3.5" /> File
              </button>
              <button
                type="button"
                onClick={openQuotes}
                disabled={busy}
                title="Send a package's quotation PDF"
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  showQuotes ? "bg-[#c5a86d] text-[#12231a]" : "bg-[#f4efe6] text-[#7a5d22] hover:bg-[#ece3d2]"
                }`}
              >
                <FileText className="size-3.5" /> Quotation
              </button>
              {showQuotes && (
                <div className="absolute bottom-full left-0 z-20 mb-2 w-72 overflow-hidden rounded-xl border border-[#0a120b]/10 bg-white shadow-xl">
                  <p className="border-b border-[#0a120b]/[0.06] px-3.5 py-2 text-[11px] uppercase tracking-wider text-[#0a120b]/45">Send a quotation</p>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {quotations.length === 0 ? (
                      <p className="px-3.5 py-4 text-center text-xs text-[#0a120b]/45">
                        {packages.length ? "No package has a quotation PDF yet (Tour Packages > Edit > Quotation)." : "Loading…"}
                      </p>
                    ) : (
                      quotations.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => shareQuotation(p.id, p.title)}
                          disabled={busy}
                          className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm hover:bg-[#f7f5f0] disabled:opacity-50 cursor-pointer"
                        >
                          <FileText className="size-4 shrink-0 text-[#8a6d2f]" />
                          <span className="min-w-0 flex-1 truncate">{p.title}</span>
                          {p.id === booking.package?.id && (
                            <span className="shrink-0 rounded-full bg-[#c5a86d]/15 px-2 py-0.5 text-[10px] font-semibold text-[#8a6d2f]">This trip</span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
              {canOffer && !file && (
                <button
                  type="button"
                  onClick={() => setWithOffer(!withOffer)}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 transition-colors cursor-pointer ${
                    withOffer ? "bg-[#c5a86d] text-[#12231a]" : "bg-[#f4efe6] text-[#7a5d22] hover:bg-[#ece3d2]"
                  }`}
                >
                  <HandCoins className="size-3.5" /> {withOffer ? "Remove price" : customerOffer != null ? "Counter-offer" : "Propose a price"}
                </button>
              )}
            </div>
            <Button type="submit" disabled={busy || (!file && !text.trim() && !(offerValue && offerValue > 0))}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} {file ? "Send file" : withOffer ? "Send offer" : "Send"}
            </Button>
          </div>
          <p className="text-[11px] text-[#0a120b]/40">The customer gets an email with a link to answer.</p>
        </form>
      )}
    </div>
  );
}

function Bubble({ message: m, filesBase }: { message: BookingMessage; filesBase: string }) {
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
          className={`rounded-2xl px-3.5 py-2 text-sm whitespace-pre-line space-y-1.5 ${
            team ? "bg-[#12231a] text-white rounded-br-md" : "bg-white border border-[#0a120b]/10 rounded-bl-md"
          }`}
        >
          {m.offer != null && (
            <span className={`flex items-center gap-1.5 text-xs font-semibold mb-0.5 ${team ? "text-[#c5a86d]" : "text-[#8a6d2f]"}`}>
              <HandCoins className="size-3.5" /> Offer: {money(m.offer)}
            </span>
          )}
          <ChatAttachments attachments={m.attachments} filesBase={filesBase} dark={team} />
          {m.text && <p>{m.text}</p>}
        </div>
      </div>
    </div>
  );
}
