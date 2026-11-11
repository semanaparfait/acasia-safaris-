"use client";

// Admin > Check-in: scan the QR code ticket of a confirmed booking on the day of the trip.
// Scanning shows the booking (who, which trip, how many, payment); "Check in" marks them as arrived.
// The camera needs https (or localhost). Without a camera, type the code from the ticket.
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  Clock,
  Keyboard,
  Loader2,
  Phone,
  RotateCcw,
  ScanLine,
  Users,
  XCircle,
} from "lucide-react";
import type { Html5Qrcode } from "html5-qrcode";
import { Avatar, Button, Card, PageHeader, StatusBadge, inputClass } from "../components/ui";
import { bookingTitle, money } from "@/lib/helpers";
import type { Booking } from "@/lib/types";
import { useBookingsStore } from "@/store/bookingsStore";

const READER_ID = "ticket-reader";

type Result =
  | { kind: "found"; booking: Booking }
  | { kind: "checked-in"; booking: Booking; already: boolean }
  | { kind: "error"; message: string };

export default function CheckInPage() {
  const findTicket = useBookingsStore((s) => s.findTicket);
  const checkIn = useBookingsStore((s) => s.checkIn);

  const scanner = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const stopCamera = useCallback(async () => {
    const s = scanner.current;
    scanner.current = null;
    setScanning(false);
    if (s?.isScanning) await s.stop().catch(() => {});
    s?.clear();
  }, []);

  // Looks the ticket up (from the camera or the typed code)
  const lookUp = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setBusy(true);
      try {
        const booking = await findTicket(text.trim());
        setResult({ kind: "found", booking });
      } catch (err) {
        setResult({ kind: "error", message: (err as Error).message });
      } finally {
        setBusy(false);
      }
    },
    [findTicket],
  );

  const startCamera = async () => {
    setCameraError("");
    setResult(null);
    setStarting(true);
    try {
      // Loaded in the browser only (it uses the camera)
      const { Html5Qrcode } = await import("html5-qrcode");
      const s = new Html5Qrcode(READER_ID, { verbose: false });
      scanner.current = s;
      await s.start(
        { facingMode: "environment" }, // the back camera on phones
        { fps: 12, qrbox: { width: 240, height: 240 } },
        (text) => {
          // One scan at a time: stop, then show the booking
          stopCamera();
          if (navigator.vibrate) navigator.vibrate(80);
          lookUp(text);
        },
        () => {}, // no QR code in this frame yet
      );
      setScanning(true);
    } catch (err) {
      scanner.current = null;
      const message = String((err as Error)?.message ?? err);
      setCameraError(
        /permission|NotAllowed/i.test(message)
          ? "Camera access was refused. Allow the camera for this site in your browser settings."
          : /secure|https/i.test(message) || !window.isSecureContext
            ? "The camera only works on https (or localhost). Type the code instead."
            : "No camera could be started on this device. Type the code from the ticket instead.",
      );
    } finally {
      setStarting(false);
    }
  };

  // Turn the camera off when leaving the page
  useEffect(() => () => void stopCamera(), [stopCamera]);

  const confirmCheckIn = async (booking: Booking) => {
    if (!booking.ticketCode) return;
    setBusy(true);
    try {
      const { booking: updated, alreadyCheckedIn } = await checkIn(booking.ticketCode);
      setResult({ kind: "checked-in", booking: updated, already: alreadyCheckedIn });
      if (!alreadyCheckedIn) toast.success(`${updated.customer} checked in`);
    } catch (err) {
      setResult({ kind: "error", message: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    setResult(null);
    setCode("");
    startCamera();
  };

  return (
    <>
      <PageHeader title="Check-in" subtitle="Scan the QR code ticket of travelers when they arrive." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Scanner */}
        <Card className="p-5">
          <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-[#0a120b]">
            <div id={READER_ID} className="absolute inset-0 [&_video]:!w-full [&_video]:!h-full [&_video]:object-cover" />
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
                <span className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                  {cameraError ? <CameraOff className="size-7 text-[#c5a86d]" /> : <ScanLine className="size-7 text-[#c5a86d]" />}
                </span>
                <p className="text-sm text-white/75 max-w-xs">
                  {cameraError || "Point the camera at the QR code on the traveler's phone or printed ticket."}
                </p>
                <Button className="mt-5" onClick={startCamera} disabled={starting || busy}>
                  {starting ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />} {starting ? "Starting camera…" : "Start scanning"}
                </Button>
              </div>
            )}
            {scanning && (
              <>
                {/* Frame for the QR code */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative w-60 h-60">
                    {["top-0 left-0 border-t-4 border-l-4 rounded-tl-xl", "top-0 right-0 border-t-4 border-r-4 rounded-tr-xl", "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl", "bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl"].map((c) => (
                      <span key={c} className={`absolute w-10 h-10 border-[#c5a86d] ${c}`} />
                    ))}
                    <span className="absolute inset-x-3 top-1/2 h-0.5 bg-[#c5a86d]/80 shadow-[0_0_12px_#c5a86d] animate-pulse" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-xs text-white hover:bg-black/80 cursor-pointer"
                >
                  Stop camera
                </button>
              </>
            )}
          </div>

          {/* Without a camera: type the code */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              stopCamera();
              lookUp(code);
            }}
            className="mt-5"
          >
            <label className="flex items-center gap-1.5 text-xs text-[#0a120b]/55 mb-1.5">
              <Keyboard className="size-3.5" /> Or type the ticket code
            </label>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
                placeholder="e.g. AC7K2M9QXP"
                className={`${inputClass} font-mono tracking-widest`}
              />
              <Button type="submit" disabled={busy || code.length < 10}>Find</Button>
            </div>
          </form>
        </Card>

        {/* Result */}
        <div>
          {busy && !result ? (
            <Card className="p-10 flex justify-center"><Loader2 className="size-6 animate-spin text-[#c5a86d]" /></Card>
          ) : result?.kind === "error" ? (
            <Card className="p-6 text-center">
              <XCircle className="size-12 text-red-500 mx-auto mb-3" />
              <p className="font-semibold text-lg">Ticket not valid</p>
              <p className="text-sm text-[#0a120b]/60 mt-1">{result.message}</p>
              <Button className="mt-5" variant="secondary" onClick={next}><RotateCcw className="size-4" /> Scan again</Button>
            </Card>
          ) : result ? (
            <TicketResult result={result} busy={busy} onCheckIn={confirmCheckIn} onNext={next} />
          ) : (
            <Card className="p-8 text-center text-sm text-[#0a120b]/50">
              <ScanLine className="size-8 mx-auto mb-3 text-[#0a120b]/20" />
              The booking appears here after a scan.
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function TicketResult({
  result,
  busy,
  onCheckIn,
  onNext,
}: {
  result: Extract<Result, { booking: Booking }>;
  busy: boolean;
  onCheckIn: (b: Booking) => void;
  onNext: () => void;
}) {
  const b = result.booking;
  const valid = b.status === "Confirmed" || b.status === "Completed";
  const today = new Date();
  const start = new Date(b.startDate);
  const end = new Date(b.endDate);
  const onDates = isSameDay(start, today) || (start <= today && today <= end);
  const guests = b.guests?.filter((g) => g.count > 0) ?? [];

  return (
    <Card className="overflow-hidden">
      {/* Banner */}
      {result.kind === "checked-in" ? (
        result.already ? (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-4 flex items-center gap-3 text-amber-800">
            <Clock className="size-6 shrink-0" />
            <div>
              <p className="font-semibold">Already checked in</p>
              <p className="text-sm">This ticket was scanned on {format(new Date(b.checkedInAt!), "d MMM 'at' HH:mm")}.</p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-600 px-5 py-4 flex items-center gap-3 text-white">
            <CheckCircle2 className="size-7 shrink-0" />
            <div>
              <p className="font-semibold text-lg">Checked in</p>
              <p className="text-sm text-white/85">Welcome, {b.customer.split(" ")[0]}! Enjoy the trip.</p>
            </div>
          </div>
        )
      ) : !valid ? (
        <div className="bg-red-50 border-b border-red-200 px-5 py-4 flex items-center gap-3 text-red-700">
          <XCircle className="size-6 shrink-0" />
          <p className="font-semibold">This booking is {b.status.toLowerCase()}: do not check in</p>
        </div>
      ) : b.checkedInAt ? (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-4 flex items-center gap-3 text-amber-800">
          <Clock className="size-6 shrink-0" />
          <p className="text-sm"><strong>Already checked in</strong> on {format(new Date(b.checkedInAt), "d MMM 'at' HH:mm")}.</p>
        </div>
      ) : (
        <div className="bg-[#12231a] px-5 py-4 flex items-center gap-3 text-white">
          <ScanLine className="size-6 shrink-0 text-[#c5a86d]" />
          <p className="font-semibold">Valid ticket</p>
          <span className="ml-auto font-mono text-sm tracking-widest text-[#c5a86d]">{b.ticketCode}</span>
        </div>
      )}

      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Avatar name={b.customer} size={48} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-lg truncate">{b.customer}</p>
            {b.phone && (
              <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="flex items-center gap-1 text-sm text-[#2E7D5B] hover:underline">
                <Phone className="size-3.5" /> {b.phone}
              </a>
            )}
          </div>
          <StatusBadge status={b.status} />
        </div>

        <div className="rounded-xl bg-[#f7f5f0] p-4 space-y-2.5 text-sm">
          <p className="font-semibold">{bookingTitle(b)}</p>
          <p className="text-[#0a120b]/70">
            {format(start, "EEE d MMM")} – {format(end, "EEE d MMM yyyy")}
          </p>
          <p className="flex items-center gap-2 text-[#0a120b]/70">
            <Users className="size-4" />
            {guests.length > 0
              ? guests.map((g) => `${g.count} ${g.label.toLowerCase()}${g.count > 1 ? "s" : ""}`).join(", ")
              : `${b.travelers} traveler${b.travelers > 1 ? "s" : ""}`}
          </p>
          <div className="flex items-center justify-between pt-2.5 border-t border-[#0a120b]/10">
            <span>{money(b.amount)}</span>
            <StatusBadge status={b.payment} />
          </div>
        </div>

        {valid && !onDates && !b.checkedInAt && (
          <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
            <AlertTriangle className="size-4 shrink-0" /> This trip is not today: it runs {format(start, "d MMM")} – {format(end, "d MMM yyyy")}.
          </p>
        )}
        {valid && b.payment === "Unpaid" && !b.checkedInAt && (
          <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
            <AlertTriangle className="size-4 shrink-0" /> Nothing has been paid for this booking yet.
          </p>
        )}

        <div className="flex gap-2">
          {result.kind === "found" && valid && !b.checkedInAt && (
            <Button className="flex-1 !py-3" onClick={() => onCheckIn(b)} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Check in {b.travelers} traveler{b.travelers > 1 ? "s" : ""}
            </Button>
          )}
          <Button variant="secondary" className="flex-1 !py-3" onClick={onNext}>
            <RotateCcw className="size-4" /> Scan next
          </Button>
        </div>
        <Link href="/admin/bookings" className="block text-center text-xs text-[#0a120b]/50 hover:text-[#2E7D5B]">
          Open in Bookings
        </Link>
      </div>
    </Card>
  );
}
