"use client";

// /admin/workers/5  ->  details of worker 5
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format, formatDistanceToNowStrict } from "date-fns";
import toast from "react-hot-toast";
import { ArrowLeft, Pencil, Trash2, Mail, Phone, Languages, Briefcase, CalendarDays, ShieldCheck, StickyNote, Clock, KeyRound } from "lucide-react";
import { useWorkersStore } from "@/store/workersStore";
import { Button, Card, ConfirmDialog, EmptyState, StatusBadge } from "../../components/ui";
import { AdminBadge, LanguageChips, WorkerPhoto, useRoles, useWorker, useWorkerPermissions } from "../parts";

export default function WorkerDetailsPage() {
  const router = useRouter();
  const id = useParams<{ id: string }>().id;
  const { worker: w, error } = useWorker(id);
  const roles = useRoles();
  const deleteWorker = useWorkersStore((s) => s.deleteWorker);
  const { canEdit, canDelete } = useWorkerPermissions();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!w) {
    return <Card>{error ? <p className="p-5 text-sm text-red-700">{error}</p> : <EmptyState title="Loading worker…" />}</Card>;
  }

  const remove = async () => {
    try {
      await deleteWorker(w.id);
      toast.success("Worker removed");
      router.push("/admin/workers");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const joined = new Date(w.joined);

  return (
    <div className="max-w-5xl">
      <Link href="/admin/workers" className="inline-flex items-center gap-1.5 text-sm text-[#0a120b]/55 hover:text-[#0a120b] mb-4">
        <ArrowLeft className="size-4" /> All workers
      </Link>

      {/* Profile header */}
      <Card className="overflow-hidden mb-5">
        <div className={`h-28 sm:h-32 bg-(--primary-dark)`} />
        <div className="px-5 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="rounded-full ring-4 ring-white shadow-sm w-fit">
              <WorkerPhoto worker={w} size={104} />
            </div>
            <div className="flex-1 min-w-0 sm:pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{w.name}</h1>
                <AdminBadge worker={w} />
              </div>
              <p className="text-sm text-[#0a120b]/55 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1.5"><Briefcase className="size-3.5" /> {w.role}</span>
                <StatusBadge status={w.status} />
              </p>
            </div>
            <div className="flex gap-2 sm:pb-1">
              {canEdit(w) && (
                <Link href={`/admin/workers/${w.id}/edit`}><Button><Pencil className="size-4" /> Edit</Button></Link>
              )}
              {canDelete(w) && (
                <Button variant="secondary" onClick={() => setConfirmDelete(true)} className="hover:!text-red-600"><Trash2 className="size-4" /> Delete</Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <InfoCard icon={Mail} title="Contact">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ContactLink icon={Mail} label="Email" value={w.email} href={`mailto:${w.email}`} />
              <ContactLink icon={Phone} label="Phone" value={w.phone || "—"} href={w.phone ? `tel:${w.phone.replace(/\s/g, "")}` : undefined} />
            </div>
          </InfoCard>

          <InfoCard icon={Languages} title="Languages">
            <LanguageChips languages={w.languages} max={20} />
          </InfoCard>

          <InfoCard icon={StickyNote} title="Notes">
            {w.notes ? (
              <p className="text-sm leading-relaxed text-[#0a120b]/75 whitespace-pre-line">{w.notes}</p>
            ) : (
              <p className="text-sm text-[#0a120b]/40">No notes yet.</p>
            )}
          </InfoCard>
        </div>

        <div className="space-y-5">
          <InfoCard icon={Briefcase} title="Work">
            {roles.find((r) => r.name === w.role)?.description && (
              <p className="text-xs text-[#0a120b]/55 leading-relaxed mb-4 pb-4 border-b border-[#0a120b]/[0.06]">
                <span className="font-medium text-[#0a120b]/75">{w.role}:</span> {roles.find((r) => r.name === w.role)?.description}
              </p>
            )}
            <dl className="space-y-3 text-sm">
              <Row label="Role" value={w.role} />
              <Row label="Status" value={<StatusBadge status={w.status} />} />
              <Row label="Joined" value={format(joined, "d MMM yyyy")} icon={CalendarDays} />
              <Row label="With the team" value={formatDistanceToNowStrict(joined)} icon={Clock} />
            </dl>
          </InfoCard>

          <InfoCard icon={ShieldCheck} title="Admin access">
            {w.isAdmin ? (
              <div className="space-y-2 text-sm">
                <p className="text-[#0a120b]/75">
                  {w.isOwner ? "Main admin: manages the other admins and cannot be deleted." : "Can log in to the admin panel."}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-[#0a120b]/50">
                  <KeyRound className="size-3.5" /> {w.hasPassword ? "Password set" : "No password yet"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-[#0a120b]/50">No access to the admin panel.</p>
            )}
          </InfoCard>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        title="Remove worker"
        message={`${w.name} will be removed from your team list.`}
      />
    </div>
  );
}

function InfoCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold mb-4">
        <Icon className="size-4 text-[#2E7D5B]" /> {title}
      </h2>
      {children}
    </Card>
  );
}

function ContactLink({ icon: Icon, label, value, href }: { icon: React.ElementType; label: string; value: string; href?: string }) {
  return (
    <a href={href} className="flex items-center gap-3 rounded-xl border border-[#0a120b]/[0.08] p-3 hover:border-[#2E7D5B]/40 hover:bg-[#f7f5f0]/60 transition-colors min-w-0">
      <span className="size-9 shrink-0 rounded-lg bg-[#2E7D5B]/10 text-[#2E7D5B] flex items-center justify-center"><Icon className="size-4" /></span>
      <span className="min-w-0">
        <span className="block text-[11px] uppercase tracking-wider text-[#0a120b]/45">{label}</span>
        <span className="block text-sm font-medium truncate">{value}</span>
      </span>
    </a>
  );
}

function Row({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[#0a120b]/50 flex items-center gap-1.5">{Icon && <Icon className="size-3.5" />} {label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}
