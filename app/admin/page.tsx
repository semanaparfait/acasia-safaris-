"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  DollarSign,
  CalendarCheck,
  Users,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Plus,
  Download,
  Clock,
  Plane,
} from "lucide-react";
import { useAdmin } from "./components/AdminStore";
import { AreaChart, BarList, Sparkline } from "./components/Charts";
import { Avatar, Button, Card, CardHeader, PageHeader, StatusBadge, Tabs } from "./components/ui";
import { activity, monthlyStats, money } from "./data/mock";

const compact = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);

export default function DashboardPage() {
  const { bookings, packages, reviews, messages } = useAdmin();
  const [range, setRange] = useState<"12m" | "6m" | "3m">("12m");

  const months = { "12m": 12, "6m": 6, "3m": 3 }[range];
  const series = monthlyStats.slice(-months);

  const thisMonth = monthlyStats[monthlyStats.length - 1];
  const lastMonth = monthlyStats[monthlyStats.length - 2];
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const activeTravelers = bookings
    .filter((b) => b.status === "Confirmed")
    .reduce((s, b) => s + b.travelers, 0);

  const stats = [
    {
      label: "Revenue this month",
      value: money(thisMonth.revenue),
      change: ((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100,
      icon: DollarSign,
      trend: monthlyStats.map((m) => m.revenue),
    },
    {
      label: "Bookings this month",
      value: thisMonth.bookings.toString(),
      change: ((thisMonth.bookings - lastMonth.bookings) / lastMonth.bookings) * 100,
      icon: CalendarCheck,
      trend: monthlyStats.map((m) => m.bookings),
    },
    {
      label: "Upcoming travelers",
      value: activeTravelers.toString(),
      change: 12.4,
      icon: Users,
      trend: [8, 10, 9, 12, 14, 13, 16, 18, 17, 20, 19, activeTravelers],
    },
    {
      label: "Average rating",
      value: avgRating.toFixed(1) + " / 5",
      change: 2.1,
      icon: Star,
      trend: [4.4, 4.5, 4.5, 4.6, 4.5, 4.6, 4.7, 4.6, 4.7, 4.7, 4.6, avgRating],
    },
  ];

  const topPackages = packages
    .map((p) => ({ label: p.title, value: bookings.filter((b) => b.packageId === p.id).length }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const recent = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const upcoming = bookings
    .filter((b) => b.status === "Confirmed")
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 4);

  const pending = bookings.filter((b) => b.status === "Pending").length;
  const unread = messages.filter((m) => !m.read).length;

  return (
    <>
      <PageHeader
        title="Good morning, Admin "
        subtitle="Here's what's happening with Acacia Safaris today."
        actions={
          <>
            <Button variant="secondary"><Download className="size-4" /> Export</Button>
            <Link href="/admin/packages">
              <Button><Plus className="size-4" /> New package</Button>
            </Link>
          </>
        }
      />

      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-[#12231a] text-white mb-6"
      >
        <Image
          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&auto=format&fit=crop&q=80"
          alt=""
          fill
          className="object-cover opacity-30"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a120b] via-[#0a120b]/85 to-transparent" />
        <div className="relative p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-lg">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#c5a86d] mb-2">Today · {format(new Date(), "EEEE, d MMMM")}</p>
            <h2 className="text-xl sm:text-2xl font-semibold leading-snug">
              You have <span className="text-[#c5a86d]">{pending} booking requests</span> and{" "}
              <span className="text-[#c5a86d]">{unread} unread messages</span> waiting.
            </h2>
            <p className="text-sm text-white/60 mt-2">Peak season is coming. Reply within 24 hours to keep conversion high.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/bookings"><Button className="bg-[#c5a86d] text-[#0a120b] hover:bg-[#B8944D]">Review bookings <ArrowRight className="size-4" /></Button></Link>
            <Link href="/admin/messages"><Button className="bg-white/10 hover:bg-white/20 backdrop-blur">Inbox</Button></Link>
          </div>
        </div>
      </motion.div>

      {/* KPI tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => {
          const up = s.change >= 0;
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
              <Card className="p-5 h-full">
                <div className="flex items-center justify-between">
                  <span className="size-10 rounded-xl bg-[#2E7D5B]/10 text-[#2E7D5B] flex items-center justify-center">
                    <Icon className="size-5" />
                  </span>
                  <Sparkline values={s.trend} />
                </div>
                <p className="text-xs text-[#0a120b]/50 mt-4">{s.label}</p>
                <div className="flex items-end justify-between gap-2 mt-1">
                  <p className="text-2xl font-semibold tracking-tight tabular-nums">{s.value}</p>
                  <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-emerald-700" : "text-red-600"}`}>
                    {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                    {Math.abs(s.change).toFixed(1)}%
                    <span className="text-[#0a120b]/40 font-normal ml-1">vs last month</span>
                  </span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Revenue"
            subtitle={`Total ${money(series.reduce((s, m) => s + m.revenue, 0))} over the last ${months} months`}
            action={
              <Tabs
                value={range}
                onChange={setRange}
                tabs={[
                  { value: "3m", label: "3M" },
                  { value: "6m", label: "6M" },
                  { value: "12m", label: "12M" },
                ]}
              />
            }
          />
          <div className="px-3 pb-4">
            <AreaChart data={series.map((m) => ({ label: m.month, value: m.revenue }))} format={compact} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Top packages" subtitle="By number of bookings" action={<Link href="/admin/packages" className="text-xs text-[#2E7D5B] hover:underline">View all</Link>} />
          <div className="px-5 pb-5">
            <BarList data={topPackages} />
          </div>
        </Card>
      </div>

      {/* Tables & feeds */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 overflow-hidden">
          <CardHeader title="Recent bookings" action={<Link href="/admin/bookings" className="text-xs text-[#2E7D5B] hover:underline">View all</Link>} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#0a120b]/45 border-y border-[#0a120b]/[0.06] bg-[#f7f5f0]/60">
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-5 py-2.5 font-medium">Package</th>
                  <th className="px-5 py-2.5 font-medium">Date</th>
                  <th className="px-5 py-2.5 font-medium text-right">Amount</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0a120b]/[0.05]">
                {recent.map((b) => (
                  <tr key={b.id} className="hover:bg-[#f7f5f0]/70">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={b.customer} size={32} />
                        <div>
                          <p className="font-medium whitespace-nowrap">{b.customer}</p>
                          <p className="text-xs text-[#0a120b]/45">{b.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#0a120b]/70 max-w-[220px] truncate">{b.packageTitle}</td>
                    <td className="px-5 py-3 text-[#0a120b]/70 whitespace-nowrap">{format(new Date(b.startDate), "d MMM yyyy")}</td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums">{money(b.amount)}</td>
                    <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Upcoming departures" subtitle="Confirmed trips" />
            <ul className="px-5 pb-5 space-y-3">
              {upcoming.map((b) => (
                <li key={b.id} className="flex items-center gap-3">
                  <div className="w-12 shrink-0 rounded-lg bg-[#12231a] text-center py-1.5">
                    <p className="text-[10px] uppercase text-[#c5a86d]">{format(new Date(b.startDate), "MMM")}</p>
                    <p className="text-base font-semibold text-white leading-none">{format(new Date(b.startDate), "d")}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{b.customer}</p>
                    <p className="text-xs text-[#0a120b]/50 truncate flex items-center gap-1">
                      <Plane className="size-3" /> {b.packageTitle} · {b.travelers} pax
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Activity" />
            <ul className="px-5 pb-5 space-y-4">
              {activity.map((a, i) => (
                <li key={a.id} className="relative flex gap-3">
                  {i < activity.length - 1 && <span className="absolute left-[5px] top-4 bottom-[-14px] w-px bg-[#0a120b]/10" />}
                  <span className="mt-1.5 size-[11px] rounded-full border-2 border-[#2E7D5B] bg-white shrink-0" />
                  <div>
                    <p className="text-sm text-[#0a120b]/80">{a.text}</p>
                    <p className="text-xs text-[#0a120b]/40 flex items-center gap-1 mt-0.5"><Clock className="size-3" /> {a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
