"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ShieldOff } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { adminLiveAuth, liveSocket, setAdminSocket, setCustomerTyping } from "@/lib/live";
import type { Booking, TripBooking } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";
import { useBookingsStore } from "@/store/bookingsStore";
import { useMessagesStore } from "@/store/messagesStore";
import { useReviewsStore } from "@/store/reviewsStore";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useCalendarStore } from "@/store/calendarStore";
import { useTripsStore } from "@/store/tripsStore";
import { can, canOpenPage } from "@/lib/permissions";

const noSubscribe = () => () => {};

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Logged in = we know the worker (the login itself is an httpOnly cookie)
  const loggedIn = useAuthStore((s) => Boolean(s.worker));
  const me = useAuthStore((s) => s.worker);
  // The areas this admin may open, as one string so effects re-run when it changes
  const access = me?.isOwner ? "owner" : (me?.permissions ?? []).join(",");
  // Pages that work without a login (sign in, forgot password)
  const isLoginPage = pathname === "/admin/login" || pathname === "/admin/forgot-password";

  // The saved login is read from localStorage in the browser only, so wait
  // until we run in the browser before deciding to redirect.
  // (false while rendering on the server, true in the browser)
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);

  // Not logged in -> go to the login page
  useEffect(() => {
    if (mounted && !loggedIn && !isLoginPage) router.replace("/admin/login");
  }, [mounted, loggedIn, isLoginPage, router]);

  // The saved account may be old: read the current access once when the panel opens
  const refreshMe = useAuthStore((s) => s.refresh);
  useEffect(() => {
    if (mounted && loggedIn && !isLoginPage) refreshMe().catch(() => {});
  }, [mounted, loggedIn, isLoginPage, refreshMe]);

  // Data used by the sidebar badges and the top bar on every admin page
  // (only the areas this admin may open: the server refuses the others)
  const loadBookings = useBookingsStore((s) => s.load);
  const loadMessages = useMessagesStore((s) => s.load);
  const loadReviews = useReviewsStore((s) => s.loadAll);
  const loadReminders = useCalendarStore((s) => s.load);
  const loadTrips = useTripsStore((s) => s.loadAll);
  useEffect(() => {
    if (!mounted || !loggedIn || isLoginPage) return;
    const worker = useAuthStore.getState().worker;
    // Lost access: forget what was loaded for that area
    if (!can(worker, "bookings")) useBookingsStore.setState({ bookings: [] });
    if (!can(worker, "messages")) useMessagesStore.setState({ messages: [] });
    if (!can(worker, "reviews")) useReviewsStore.setState({ reviews: [] });
    if (!can(worker, "calendar")) useCalendarStore.setState({ reminders: [] });
    if (!can(worker, "trips")) useTripsStore.setState({ trips: [] });
    const refresh = () => {
      if (can(worker, "bookings")) loadBookings();
      if (can(worker, "messages")) loadMessages();
      if (can(worker, "reviews")) loadReviews();
      if (can(worker, "calendar")) loadReminders();
      if (can(worker, "trips")) loadTrips();
    };
    refresh();
    // Coming back to the tab shows anything that arrived from the website meanwhile
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [mounted, loggedIn, isLoginPage, access, loadBookings, loadMessages, loadReviews, loadReminders, loadTrips]);

  // Live: bookings, customer messages and offers appear instantly (lib/live.ts)
  useEffect(() => {
    if (!mounted || !loggedIn || isLoginPage) return;
    const socket = liveSocket(adminLiveAuth);
    setAdminSocket(socket);
    socket.on("booking", (booking: Booking) => {
      const { bookings, upsertBooking } = useBookingsStore.getState();
      const before = bookings.find((b) => b.id === booking.id);
      const last = booking.messages?.at(-1);
      if (!before) {
        toast.success(`New booking from ${booking.customer}`);
      } else if (last && last.sender === "customer" && !before.messages?.some((m) => m.id === last.id)) {
        toast(last.event === "accepted" ? `${booking.customer} accepted the price` : `New message from ${booking.customer}`, { icon: "💬" });
      }
      if (last?.sender === "customer") setCustomerTyping(booking.id, false); // their message arrived
      upsertBooking(booking);
    });
    socket.on("customerTyping", ({ bookingId, typing }: { bookingId: string; typing: boolean }) =>
      setCustomerTyping(bookingId, typing),
    );
    socket.on("booking:deleted", ({ id }: { id: string }) => useBookingsStore.getState().removeBooking(id));
    // Trip bookings (Admin > Trips > Bookings)
    socket.on("tripBooking", (booking: TripBooking & { tripTitle?: string }) => {
      const { bookings, upsertBooking } = useTripsStore.getState();
      const known = Object.values(bookings).some((list) => list.some((b) => b.id === booking.id));
      if (!known && booking.status === "New") {
        toast.success(`${booking.customer} booked ${booking.tripTitle ?? "a trip"} (${booking.travelers} ${booking.travelers === 1 ? "traveler" : "travelers"})`);
      }
      const { tripTitle, ...plain } = booking;
      void tripTitle;
      upsertBooking(plain);
    });
    socket.on("tripBooking:deleted", ({ id, tripId }: { id: string; tripId: string }) => useTripsStore.getState().removeBooking(id, tripId));
    socket.on("tripWaitlist", ({ tripId }: { tripId: string }) => {
      const { waitlists, loadWaitlist, loadAll } = useTripsStore.getState();
      if (waitlists[tripId]) loadWaitlist(tripId).catch(() => {});
      loadAll();
    });
    // Back online after a break: load everything once, in case something was missed
    // The main admin changed this admin's access: the menu and pages follow at once
    socket.on("access", ({ revoked }: { revoked?: boolean }) => {
      if (revoked) {
        useAuthStore.getState().logout();
        toast.error("Your admin access was removed by the main admin");
        return;
      }
      useAuthStore
        .getState()
        .refresh()
        .then(() => toast("The main admin updated what you can open", { icon: "🔑" }))
        .catch(() => {});
    });
    socket.io.on("reconnect", () => {
      if (can(useAuthStore.getState().worker, "bookings")) loadBookings();
    });
    return () => {
      setAdminSocket(null);
      socket.disconnect();
    };
  }, [mounted, loggedIn, isLoginPage, loadBookings]);

  const toaster = (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: { background: "#0a120b", color: "#fff", fontSize: 14, borderRadius: 12 },
        success: { iconTheme: { primary: "#c5a86d", secondary: "#0a120b" } },
      }}
    />
  );

  // The login screen renders without the sidebar and top bar
  if (isLoginPage) {
    return <>{children}{toaster}</>;
  }

  // Nothing to show until we know the admin is logged in
  if (!mounted || !loggedIn) return null;

  return (
    <>
      <div className="min-h-screen bg-[#f7f5f0] text-[#0a120b]">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="lg:pl-[264px]">
          <Topbar onMenu={() => setMenuOpen(true)} />
          <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1440px]">{canOpenPage(me, pathname) ? children : <NoAccess />}</main>
        </div>
      </div>
      {toaster}
    </>
  );
}

// A page this admin may not open (typed address, old link, or the access was just removed)
function NoAccess() {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-2xl border border-[#0a120b]/[0.06] bg-white p-10 text-center shadow-sm">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#c5a86d]/15 text-[#8a6d2f]">
        <ShieldOff className="size-6" />
      </span>
      <h1 className="mt-4 text-lg font-semibold">You don&apos;t have access to this page</h1>
      <p className="mt-1.5 text-sm text-[#0a120b]/55">Ask the main admin to give it to you in Workers. It works as soon as they save.</p>
      <Link href="/admin" className="mt-6 inline-block rounded-lg bg-[#12231a] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1F5A42]">
        Back to the dashboard
      </Link>
    </div>
  );
}
