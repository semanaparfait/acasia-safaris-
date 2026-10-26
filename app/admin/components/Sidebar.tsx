"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Package,
  MapPinned,
  Users,
  Mail,
  Star,
  Images,
  Settings,
  ExternalLink,
  X,
} from "lucide-react";
import logo from "@/public/logo2.png";
import { useAdmin } from "./AdminStore";

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { bookings, messages, reviews } = useAdmin();

  const groups = [
    {
      label: "Overview",
      items: [{ name: "Dashboard", href: "/admin", icon: LayoutDashboard }],
    },
    {
      label: "Operations",
      items: [
        { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck, count: bookings.filter((b) => b.status === "Pending").length },
        { name: "Customers", href: "/admin/customers", icon: Users },
        { name: "Messages", href: "/admin/messages", icon: Mail, count: messages.filter((m) => !m.read).length },
      ],
    },
    {
      label: "Content",
      items: [
        { name: "Tour Packages", href: "/admin/packages", icon: Package },
        { name: "Destinations", href: "/admin/destinations", icon: MapPinned },
        { name: "Reviews", href: "/admin/reviews", icon: Star, count: reviews.filter((r) => r.status === "Pending").length },
        { name: "Gallery", href: "/admin/gallery", icon: Images },
      ],
    },
    {
      label: "System",
      items: [{ name: "Settings", href: "/admin/settings", icon: Settings }],
    },
  ];

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-[#0a120b]/50 backdrop-blur-sm lg:hidden transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-[264px] flex flex-col bg-[#0a120b] text-white transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* subtle texture */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_0%_0%,rgba(197,168,109,0.14),transparent_60%)]" />

        <div className="relative flex items-center justify-between px-5 h-16 border-b border-white/[0.06]">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src={logo} alt="Acacia Safaris" className="h-9 w-auto rounded" />
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-wide">Acacia Safaris</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#c5a86d]">Admin</p>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-white/60 hover:bg-white/10" aria-label="Close menu">
            <X className="size-4" />
          </button>
        </div>

        <nav className="relative flex-1 overflow-y-auto px-3 py-5 space-y-6">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30">{g.label}</p>
              <ul className="space-y-0.5">
                {g.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                          active ? "bg-white/[0.08] text-white" : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                        }`}
                      >
                        {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-[#c5a86d]" />}
                        <Icon className={`size-[18px] ${active ? "text-[#c5a86d]" : "text-white/45 group-hover:text-white/80"}`} />
                        <span className="flex-1">{item.name}</span>
                        {"count" in item && item.count ? (
                          <span className="min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-[#c5a86d] text-[#0a120b] text-[11px] font-semibold tabular-nums">
                            {item.count}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="relative p-4 border-t border-white/[0.06]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl bg-gradient-to-br from-[#1F5A42] to-[#12231a] border border-white/[0.06] px-4 py-3 text-sm hover:border-[#c5a86d]/40 transition-colors"
          >
            <div>
              <p className="font-medium">View website</p>
              <p className="text-xs text-white/50">acaciasafaris.com</p>
            </div>
            <ExternalLink className="size-4 text-[#c5a86d]" />
          </Link>
        </div>
      </aside>
    </>
  );
}
