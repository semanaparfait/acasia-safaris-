"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Plus, Mail, Phone, Languages, LayoutGrid, List, CalendarDays } from "lucide-react";
import type { Worker } from "@/lib/types";
import { useWorkersStore } from "@/store/workersStore";
import { Button, Card, ConfirmDialog, EmptyState, PageHeader, SearchInput, StatusBadge, Tabs } from "../components/ui";
import { AdminBadge, LanguageChips, WorkerActions, WorkerPhoto, useRoles, useWorkerPermissions } from "./parts";

// /admin/workers  ->  all workers, as cards (default) or a table.
// Click a worker to see their details; editing and adding happen on their own pages.
export default function WorkersPage() {
  const workers = useWorkersStore((s) => s.workers);
  const loading = useWorkersStore((s) => s.loading);
  const error = useWorkersStore((s) => s.error);
  const load = useWorkersStore((s) => s.load);
  const roles = useRoles(); // one tab per role
  const deleteWorker = useWorkersStore((s) => s.deleteWorker);
  const { canEdit, canDelete } = useWorkerPermissions();
  const router = useRouter();

  useEffect(() => {
    load();
  }, [load]);

  const [role, setRole] = useState("All");
  const [query, setQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [view, setView] = useState<"cards" | "table">("cards"); // cards by default

  const filtered = workers.filter(
    (w) =>
      (role === "All" || w.role === role) &&
      [w.name, w.email, w.phone, ...w.languages].some((f) => f.toLowerCase().includes(query.toLowerCase()))
  );

  const remove = async () => {
    if (deleteId === null) return;
    try {
      await deleteWorker(deleteId);
      toast.success("Worker removed");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const stats = [
    { label: "Total workers", value: workers.length },
    { label: "Active", value: workers.filter((w) => w.status === "Active").length },
    { label: "On leave", value: workers.filter((w) => w.status === "On leave").length },
    { label: "Admins (can log in)", value: workers.filter((w) => w.isAdmin).length },
  ];

  return (
    <>
      <PageHeader
        title="Workers"
        subtitle="Guides, drivers and office staff working with Acacia Safaris."
        actions={<Link href="/admin/workers/new"><Button><Plus className="size-4" /> Add worker</Button></Link>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-xs text-[#0a120b]/50">{s.label}</p>
            <p className="text-2xl font-semibold mt-1 tabular-nums">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
        <Tabs
          value={role}
          onChange={setRole}
          tabs={[
            { value: "All", label: "All", count: workers.length },
            ...roles.map((r) => ({ value: r.name, label: r.name, count: workers.filter((w) => w.role === r.name).length })),
          ]}
        />
        <div className="flex gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="Search workers…" className="flex-1 lg:w-64" />
          <div className="flex bg-white border border-[#0a120b]/10 rounded-lg p-0.5">
            {(["cards", "table"] as const).map((v) => {
              const Icon = v === "cards" ? LayoutGrid : List;
              return (
                <button key={v} onClick={() => setView(v)} aria-label={`${v} view`} title={v === "cards" ? "Cards" : "Table"} className={`p-2 rounded-md cursor-pointer ${view === v ? "bg-[#12231a] text-white" : "text-[#0a120b]/50"}`}>
                  <Icon className="size-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error ? (
        <Card><p className="p-5 text-sm text-red-700">Could not load workers: {error}</p></Card>
      ) : loading && workers.length === 0 ? (
        <Card><EmptyState title="Loading workers…" /></Card>
      ) : filtered.length === 0 ? (
        <Card><EmptyState title="No workers found" text="Add a worker to get started." /></Card>
      ) : view === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filtered.map((w) => (
            <WorkerCard
              key={w.id}
              worker={w}
              canEdit={canEdit(w)}
              canDelete={canDelete(w)}
              onEdit={() => router.push(`/admin/workers/${w.id}/edit`)}
              onDelete={() => setDeleteId(w.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#0a120b]/45 bg-[#f7f5f0]/60 border-b border-[#0a120b]/[0.06]">
                  <th className="px-5 py-3 font-medium">Worker</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Languages</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0a120b]/[0.05]">
                {filtered.map((w) => (
                  <tr key={w.id} className="group hover:bg-[#f7f5f0]/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <WorkerPhoto worker={w} size={40} />
                        <div className="min-w-0">
                          <Link href={`/admin/workers/${w.id}`} className="font-medium whitespace-nowrap hover:text-[#2E7D5B] hover:underline">{w.name}</Link>
                          <div className="mt-0.5"><AdminBadge worker={w} /></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#0a120b]/75 whitespace-nowrap">{w.role}</td>
                    <td className="px-5 py-3.5 text-[#0a120b]/65">
                      <a href={`mailto:${w.email}`} className="flex items-center gap-1.5 hover:text-[#2E7D5B]"><Mail className="size-3.5 shrink-0" /> {w.email}</a>
                      {w.phone && (
                        <a href={`tel:${w.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 text-xs mt-0.5 hover:text-[#2E7D5B]"><Phone className="size-3.5 shrink-0" /> {w.phone}</a>
                      )}
                    </td>
                    <td className="px-5 py-3.5"><LanguageChips languages={w.languages} max={3} /></td>
                    <td className="px-5 py-3.5"><StatusBadge status={w.status} /></td>
                    <td className="px-5 py-3.5 text-[#0a120b]/65 whitespace-nowrap">{format(new Date(w.joined), "d MMM yyyy")}</td>
                    <td className="px-5 py-3.5">
                      <WorkerActions
                        canEdit={canEdit(w)}
                        canDelete={canDelete(w)}
                        onEdit={() => router.push(`/admin/workers/${w.id}/edit`)}
                        onDelete={() => setDeleteId(w.id)}
                      />
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
        title="Remove worker"
        message="This worker will be removed from your team list."
      />
    </>
  );
}

// One worker in the card view
function WorkerCard({
  worker: w,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  worker: Worker;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="group relative overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      {/* Top band: darker for admins */}
      <div className={`h-20 bg-(--primary-dark)`} />

      <div className="absolute top-3 left-3"><StatusBadge status={w.status} /></div>
      <div className="absolute z-10 top-2 right-2 rounded-lg bg-white/90 backdrop-blur opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <WorkerActions canEdit={canEdit} canDelete={canDelete} onEdit={onEdit} onDelete={onDelete} />
      </div>

      {/* Photo overlapping the band */}
      <div className="-mt-10 flex justify-center">
        <div className="rounded-full ring-4 ring-white shadow-sm">
          <WorkerPhoto worker={w} size={80} />
        </div>
      </div>

      <div className="px-5 pt-3 text-center">
        <h3 className="font-semibold text-[15px] leading-tight">
          {/* The ::after stretches the link over the whole card; the buttons and contact links sit above it */}
          <Link href={`/admin/workers/${w.id}`} className="after:absolute after:inset-0 hover:text-[#2E7D5B]">{w.name}</Link>
        </h3>
        <p className="text-xs text-[#0a120b]/55 mt-1">{w.role}</p>
        <div className="mt-2 min-h-[22px] flex justify-center"><AdminBadge worker={w} /></div>
      </div>

      <div className="px-5 py-4 space-y-2 text-xs text-[#0a120b]/65">
        <a href={`mailto:${w.email}`} className="relative z-10 w-fit max-w-full flex items-center gap-2 hover:text-[#2E7D5B] min-w-0">
          <Mail className="size-3.5 shrink-0 text-[#0a120b]/40" /> <span className="truncate">{w.email}</span>
        </a>
        <a href={w.phone ? `tel:${w.phone.replace(/\s/g, "")}` : undefined} className="relative z-10 w-fit flex items-center gap-2 hover:text-[#2E7D5B]">
          <Phone className="size-3.5 shrink-0 text-[#0a120b]/40" /> {w.phone || "—"}
        </a>
        <div className="flex items-start gap-2 pt-1">
          <Languages className="size-3.5 shrink-0 mt-0.5 text-[#0a120b]/40" />
          <LanguageChips languages={w.languages} />
        </div>
      </div>

      <div className="mt-auto px-5 py-3 border-t border-[#0a120b]/[0.06] bg-[#f7f5f0]/50 flex items-center justify-between text-[11px] text-[#0a120b]/50">
        <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" /> Joined {format(new Date(w.joined), "MMM yyyy")}</span>
        {w.notes && <span className="truncate max-w-[55%] text-right" title={w.notes}>{w.notes}</span>}
      </div>
    </Card>
  );
}
