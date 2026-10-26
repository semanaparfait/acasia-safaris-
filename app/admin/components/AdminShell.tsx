"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
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

  const token = useAuthStore((s) => s.token);
  const isLoginPage = pathname === "/admin/login";

  // The saved login is read from localStorage in the browser only, so wait
  // until we run in the browser before deciding to redirect.
  // (false while rendering on the server, true in the browser)
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);

  // Not logged in -> go to the login page
  useEffect(() => {
    if (mounted && !token && !isLoginPage) router.replace("/admin/login");
  }, [mounted, token, isLoginPage, router]);

  // Data used by the sidebar badges and the top bar on every admin page
  const loadBookings = useBookingsStore((s) => s.load);
  const loadMessages = useMessagesStore((s) => s.load);
  const loadReviews = useReviewsStore((s) => s.loadAll);
  useEffect(() => {
    if (!mounted || !token || isLoginPage) return;
    loadBookings();
    loadMessages();
    loadReviews();
  }, [mounted, token, isLoginPage, loadBookings, loadMessages, loadReviews]);

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
  if (!mounted || !token) return null;

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
