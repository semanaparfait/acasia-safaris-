"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Menu, Search, ChevronDown, LogOut, User, Settings, CalendarCheck, Star, CreditCard, XCircle, Pencil } from "lucide-react";
import { activity } from "../data/mock";
import { Avatar } from "./ui";

const activityIcon = {
  booking: CalendarCheck,
  review: Star,
  payment: CreditCard,
  cancel: XCircle,
  update: Pencil,
};

const titles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/bookings": "Bookings",
  "/admin/customers": "Customers",
  "/admin/messages": "Messages",
  "/admin/packages": "Tour Packages",
  "/admin/destinations": "Destinations",
  "/admin/reviews": "Reviews",
  "/admin/gallery": "Gallery",
  "/admin/settings": "Settings",
};

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState<"none" | "notif" | "user">("none");
  const toggle = (m: "notif" | "user") => setMenu((cur) => (cur === m ? "none" : m));

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 sm:px-6 lg:px-8 bg-[#f7f5f0]/80 backdrop-blur-md border-b border-[#0a120b]/[0.06]">
      <button onClick={onMenu} className="lg:hidden p-2 -ml-2 rounded-lg text-[#0a120b]/70 hover:bg-[#0a120b]/5" aria-label="Open menu">
        <Menu className="size-5" />
      </button>

      <div className="hidden md:block text-sm text-[#0a120b]/45">
        Admin <span className="mx-1.5">/</span>
        <span className="text-[#0a120b] font-medium">{titles[pathname] ?? "Admin"}</span>
      </div>

      <div className="flex-1 md:max-w-sm md:ml-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#0a120b]/35" />
        <input
          placeholder="Search bookings, customers…"
          className="w-full bg-white border border-[#0a120b]/10 rounded-lg pl-9 pr-12 py-2 text-sm outline-none focus:border-[#c5a86d] focus:ring-4 focus:ring-[#c5a86d]/15"
        />
        <kbd className="hidden sm:block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#0a120b]/40 border border-[#0a120b]/10 rounded px-1.5 py-0.5">⌘K</kbd>
      </div>

      <div className="relative">
        <button onClick={() => toggle("notif")} className="relative p-2 rounded-lg text-[#0a120b]/70 hover:bg-[#0a120b]/5 cursor-pointer" aria-label="Notifications">
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#E53935] ring-2 ring-[#f7f5f0]" />
        </button>
        <Dropdown open={menu === "notif"} onClose={() => setMenu("none")} className="w-80">
          <div className="px-4 py-3 border-b border-[#0a120b]/[0.06] flex items-center justify-between">
            <p className="text-sm font-semibold">Notifications</p>
            <span className="text-xs text-[#2E7D5B]">{activity.length} new</span>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {activity.map((a) => {
              const Icon = activityIcon[a.type];
              return (
                <li key={a.id} className="flex gap-3 px-4 py-3 hover:bg-[#f7f5f0]">
                  <span className="size-8 shrink-0 rounded-full bg-[#2E7D5B]/10 text-[#2E7D5B] flex items-center justify-center">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm text-[#0a120b]/80">{a.text}</p>
                    <p className="text-xs text-[#0a120b]/40 mt-0.5">{a.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Dropdown>
      </div>

      <div className="relative">
        <button onClick={() => toggle("user")} className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-[#0a120b]/5 cursor-pointer">
          <Avatar name="Admin User" size={32} />
          <span className="hidden sm:block text-left leading-tight">
            <span className="block text-sm font-medium text-[#0a120b]">Admin User</span>
            <span className="block text-[11px] text-[#0a120b]/45">Super admin</span>
          </span>
          <ChevronDown className="hidden sm:block size-4 text-[#0a120b]/40" />
        </button>
        <Dropdown open={menu === "user"} onClose={() => setMenu("none")} className="w-52">
          <div className="p-1.5">
            <Link href="/admin/settings" onClick={() => setMenu("none")} className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-[#f7f5f0]">
              <User className="size-4 text-[#0a120b]/50" /> My profile
            </Link>
            <Link href="/admin/settings" onClick={() => setMenu("none")} className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-[#f7f5f0]">
              <Settings className="size-4 text-[#0a120b]/50" /> Settings
            </Link>
            <div className="my-1 h-px bg-[#0a120b]/[0.06]" />
            <Link href="/admin/login" className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-[#E53935] hover:bg-red-50">
              <LogOut className="size-4" /> Sign out
            </Link>
          </div>
        </Dropdown>
      </div>
    </header>
  );
}

function Dropdown({
  open,
  onClose,
  className = "",
  children,
}: {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 mt-2 z-50 bg-white rounded-xl border border-[#0a120b]/[0.06] shadow-xl ${className}`}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
