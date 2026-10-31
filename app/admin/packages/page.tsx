"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, MapPin, Clock, BedDouble, LayoutGrid, List } from "lucide-react";
import { daysLabel, money, packageCategories as categories } from "@/lib/helpers";
import type { TourPackage } from "@/lib/types";
import { useBookingsStore } from "@/store/bookingsStore";
import { usePackagesStore } from "@/store/packagesStore";
import { Button, Card, ConfirmDialog, EmptyState, PageHeader, SearchInput, Tabs, Toggle } from "../components/ui";
import { LiveBadge, toInput } from "./parts";

// /admin/packages  ->  all tour packages, as cards or a table.
// Click a package to see its details; adding and editing happen on their own pages.
export default function PackagesPage() {
  const packages = usePackagesStore((s) => s.packages);
  const loading = usePackagesStore((s) => s.loading);
  const error = usePackagesStore((s) => s.error);
  const loadAll = usePackagesStore((s) => s.loadAll);
  const updatePackage = usePackagesStore((s) => s.updatePackage);
  const deletePackage = usePackagesStore((s) => s.deletePackage);
  const bookings = useBookingsStore((s) => s.bookings);
  const router = useRouter();

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const bookingCount = (id: string) => bookings.filter((b) => b.packageId === id).length;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = packages.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (p.title + p.location).toLowerCase().includes(query.toLowerCase())
  );

  const toggleActive = async (pkg: TourPackage, active: boolean) => {
    try {
      await updatePackage(pkg.id, toInput({ ...pkg, active, quotation: undefined }));
      toast.success(active ? "Package published" : "Package moved to drafts");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      await deletePackage(deleteId);
      toast.success("Package deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <PageHeader
        title="Tour Packages"
        subtitle={`${packages.length} packages · ${packages.filter((p) => p.active).length} live on the website`}
        actions={<Link href="/admin/packages/new"><Button><Plus className="size-4" /> Add package</Button></Link>}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
        <Tabs
          value={category}
          onChange={setCategory}
          tabs={[{ value: "All", label: "All" }, ...categories.map((c) => ({ value: c, label: c }))]}
        />
        <div className="flex gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="Search packages…" className="flex-1 lg:w-64" />
          <div className="flex bg-white border border-[#0a120b]/10 rounded-lg p-0.5">
            {(["grid", "list"] as const).map((v) => {
              const Icon = v === "grid" ? LayoutGrid : List;
              return (
                <button key={v} onClick={() => setView(v)} aria-label={`${v} view`} className={`p-2 rounded-md cursor-pointer ${view === v ? "bg-[#12231a] text-white" : "text-[#0a120b]/50"}`}>
                  <Icon className="size-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && <Card className="p-5 mb-5 text-sm text-red-700">Could not load packages: {error}</Card>}

      {loading && packages.length === 0 ? (
        <Card><EmptyState title="Loading packages…" /></Card>
      ) : filtered.length === 0 ? (
        <Card><EmptyState title="No packages found" text="Create your first package to get started." /></Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              {/* Clicking anywhere on the card opens the details page */}
              <Card onClick={() => router.push(`/admin/packages/${p.id}`)} className="overflow-hidden group h-full flex flex-col cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="relative h-48 bg-[#12231a]">
                  {p.image && <Image src={p.image} alt={p.title} fill unoptimized sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a120b]/70 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {p.badge && <span className="text-[10px] font-semibold tracking-wider bg-[#c5a86d] text-[#0a120b] px-2 py-1 rounded">{p.badge}</span>}
                    {!p.active && <span className="text-[10px] font-semibold tracking-wider bg-white/90 text-[#0a120b] px-2 py-1 rounded">DRAFT</span>}
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                    <span className="text-xs bg-white/15 backdrop-blur px-2 py-1 rounded">{p.category}</span>
                    <span className="text-lg font-semibold">{money(p.price)}</span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold leading-snug"><Link href={`/admin/packages/${p.id}`} className="hover:text-[#2E7D5B]">{p.title}</Link></h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[#0a120b]/55">
                    <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {p.location}</span>
                    <span className="flex items-center gap-1"><Clock className="size-3.5" /> {daysLabel(p)}</span>
                    <span className="flex items-center gap-1"><BedDouble className="size-3.5" /> {p.lodging}</span>
                  </div>
                  {/* stopPropagation: the switch and buttons should not also open the details page */}
                  <div onClick={(e) => e.stopPropagation()} className="mt-auto pt-4 flex items-center justify-between border-t border-[#0a120b]/[0.06]">
                    <div className="flex items-center gap-2 text-xs text-[#0a120b]/60">
                      <Toggle checked={p.active} onChange={(v) => toggleActive(p, v)} label="Published" />
                      {p.active ? "Live" : "Draft"} · {bookingCount(p.id)} bookings
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => router.push(`/admin/packages/${p.id}/edit`)} className="p-2 rounded-lg text-[#0a120b]/55 hover:bg-[#0a120b]/5 cursor-pointer" aria-label="Edit"><Pencil className="size-4" /></button>
                      <button onClick={() => setDeleteId(p.id)} className="p-2 rounded-lg text-[#0a120b]/55 hover:text-red-600 hover:bg-red-50 cursor-pointer" aria-label="Delete"><Trash2 className="size-4" /></button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#0a120b]/45 bg-[#f7f5f0]/60 border-b border-[#0a120b]/[0.06]">
                  <th className="px-5 py-3 font-medium">Package</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Duration</th>
                  <th className="px-5 py-3 font-medium text-right">Price</th>
                  <th className="px-5 py-3 font-medium text-right">Bookings</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0a120b]/[0.05]">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-[#f7f5f0]/70">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 rounded-lg overflow-hidden bg-[#12231a] shrink-0">
                          {p.image && <Image src={p.image} alt="" fill unoptimized sizes="48px" className="object-cover" />}
                        </div>
                        <div>
                          <Link href={`/admin/packages/${p.id}`} className="font-medium hover:text-[#2E7D5B] hover:underline">{p.title}</Link>
                          <p className="text-xs text-[#0a120b]/45">{p.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#0a120b]/70">{p.category}</td>
                    <td className="px-5 py-3 text-[#0a120b]/70">{daysLabel(p)}</td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums">{money(p.price)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{bookingCount(p.id)}</td>
                    <td className="px-5 py-3"><LiveBadge active={p.active} /></td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => router.push(`/admin/packages/${p.id}/edit`)} className="p-1.5 rounded-lg text-[#0a120b]/55 hover:bg-[#0a120b]/5 cursor-pointer" aria-label="Edit"><Pencil className="size-4" /></button>
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg text-[#0a120b]/55 hover:text-red-600 hover:bg-red-50 cursor-pointer" aria-label="Delete"><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}


      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete package"
        message="This package will be removed from the website. Existing bookings are not affected."
      />
    </>
  );
}
