"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { AdminStoreProvider } from "./AdminStore";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
  if (pathname === "/admin/login") {
    return <>{children}{toaster}</>;
  }

  return (
    <AdminStoreProvider>
      <div className="min-h-screen bg-[#f7f5f0] text-[#0a120b]">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="lg:pl-[264px]">
          <Topbar onMenu={() => setMenuOpen(true)} />
          <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1440px]">{children}</main>
        </div>
      </div>
      {toaster}
    </AdminStoreProvider>
  );
}
