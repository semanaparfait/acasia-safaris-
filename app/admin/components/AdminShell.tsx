"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { adminLiveAuth, liveSocket } from "@/lib/live";
import type { Booking } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";
import { useBookingsStore } from "@/store/bookingsStore";
import { useMessagesStore } from "@/store/messagesStore";
import { useReviewsStore } from "@/store/reviewsStore";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const noSubscribe = () => () => {};

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Logged in = we know the worker (the login itself is an httpOnly cookie)
  const loggedIn = useAuthStore((s) => Boolean(s.worker));
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

  // Data used by the sidebar badges and the top bar on every admin page
  const loadBookings = useBookingsStore((s) => s.load);
  const loadMessages = useMessagesStore((s) => s.load);
  const loadReviews = useReviewsStore((s) => s.loadAll);
  useEffect(() => {
    if (!mounted || !loggedIn || isLoginPage) return;
    const refresh = () => {
      loadBookings();
      loadMessages();
      loadReviews();
    };
    refresh();
    // Coming back to the tab shows anything that arrived from the website meanwhile
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [mounted, loggedIn, isLoginPage, loadBookings, loadMessages, loadReviews]);

  // Live: bookings, customer messages and offers appear instantly (lib/live.ts)
  useEffect(() => {
    if (!mounted || !loggedIn || isLoginPage) return;
    const socket = liveSocket(adminLiveAuth);
    socket.on("booking", (booking: Booking) => {
      const { bookings, upsertBooking } = useBookingsStore.getState();
      const before = bookings.find((b) => b.id === booking.id);
      const last = booking.messages?.at(-1);
      if (!before) {
        toast.success(`New booking from ${booking.customer}`);
      } else if (last && last.sender === "customer" && !before.messages?.some((m) => m.id === last.id)) {
        toast(last.event === "accepted" ? `${booking.customer} accepted the price` : `New message from ${booking.customer}`, { icon: "💬" });
      }
      upsertBooking(booking);
    });
    socket.on("booking:deleted", ({ id }: { id: string }) => useBookingsStore.getState().removeBooking(id));
    // Back online after a break: load everything once, in case something was missed
    socket.io.on("reconnect", () => loadBookings());
    return () => {
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
          <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1440px]">{children}</main>
        </div>
      </div>
      {toaster}
    </>
  );
}
