"use client";

// Admin > Backups (main admin only): the nightly encrypted copies of the database.
// Made at 02:15 (Kigali), each one downloaded again and checked before it counts.
// How to restore: "Backups" in backend/README.md.
import { useCallback, useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { AlertTriangle, CheckCircle2, DatabaseBackup, Download, Loader2, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Badge, Button, Card, EmptyState, PageHeader } from "../components/ui";

type Result = { at: string; ok: boolean; file?: string; size?: number; rows?: number; tables?: number; error?: string };
type Status = {
  enabled: boolean;
  reason: string | null;
  bucket: string;
  keepDays: number;
  running: boolean;
  last: Result | null;
  error?: string;
  files: { key: string; size: number; date: string }[];
};

const size = (bytes: number) =>
  bytes < 1024 ? `${bytes} B` : bytes < 1024 ** 2 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`;

export default function BackupsPage() {
  const me = useAuthStore((s) => s.worker);
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    try {
      setStatus(await api<Status>("/backups", { admin: true }));
      setError("");
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    if (me?.isOwner) void load();
  }, [me?.isOwner, load]);

  const runNow = async () => {
    setRunning(true);
    try {
      const result = await api<Result>("/backups/run", { method: "POST", admin: true });
      toast.success(`Backup made and checked: ${result.rows} rows`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setRunning(false);
      void load();
    }
  };

  if (me && !me.isOwner) {
    return (
      <>
        <PageHeader title="Backups" />
        <EmptyState title="Only the main admin can see the backups" />
      </>
    );
  }

  const newest = status?.files[0];
  const newestAge = newest ? Date.now() - new Date(newest.date).getTime() : Infinity;
  const healthy = Boolean(status?.enabled && newest && newestAge < 36 * 3_600_000 && status.last?.ok !== false);

  return (
    <>
      <PageHeader
        title="Backups"
        subtitle="An encrypted copy of the whole database, made every night at 02:15 and checked. Photos are kept separately in storage."
        actions={
          <Button onClick={runNow} disabled={running || !status?.enabled}>
            {running ? <Loader2 className="size-4 animate-spin" /> : <DatabaseBackup className="size-4" />} Back up now
          </Button>
        }
      />

      {error && <Card className="p-5 mb-5 text-sm text-red-700">{error}</Card>}
      {!status && !error && <Card><EmptyState title="Loading backups…" /></Card>}

      {status && (
        <div className="space-y-5">
          {/* Health */}
          <Card className="p-5">
            {!status.enabled ? (
              <Notice tone="red" title="Backups are off" text={`${status.reason}. Ask your developer to set it in the backend settings (see "Backups" in backend/README.md).`} />
            ) : status.error ? (
              <Notice tone="red" title="The backup storage cannot be read" text={status.error} />
            ) : status.last && !status.last.ok ? (
              <Notice tone="red" title="The last backup failed" text={`${status.last.error} (${formatDistanceToNow(new Date(status.last.at), { addSuffix: true })}). Press "Back up now" to try again.`} />
            ) : healthy ? (
              <Notice
                tone="green"
                title="Backups are working"
                text={`Last backup ${formatDistanceToNow(new Date(newest!.date), { addSuffix: true })}${status.last?.rows ? `, ${status.last.rows} rows checked` : ""}. Kept ${status.keepDays} days (at least the last 7).`}
              />
            ) : (
              <Notice tone="amber" title="No recent backup" text={newest ? `The newest one is ${formatDistanceToNow(new Date(newest.date), { addSuffix: true })}. Press "Back up now".` : 'No backup yet. Press "Back up now" to make the first one.'} />
            )}
            <p className="mt-4 flex items-start gap-2 text-xs text-[#0a120b]/50 leading-relaxed">
              <ShieldCheck className="size-4 shrink-0 text-[#2E7D5B]" />
              Files are encrypted (AES-256) in the private &ldquo;{status.bucket}&rdquo; bucket. They can only be opened with the
              backup key, kept in the backend settings and in your password manager. Neon also keeps its own history of the
              database: this is a second, independent copy.
            </p>
          </Card>

          {/* Files */}
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-[#0a120b]/[0.06] flex items-center justify-between">
              <h2 className="text-sm font-semibold">Saved backups</h2>
              <span className="text-xs text-[#0a120b]/45">{status.files.length}</span>
            </div>
            {status.files.length === 0 ? (
              <EmptyState title="No backups yet" />
            ) : (
              <ul className="divide-y divide-[#0a120b]/[0.06]">
                {status.files.map((f, i) => (
                  <li key={f.key} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium flex items-center gap-2">
                        {format(new Date(f.date), "d MMM yyyy, HH:mm")}
                        {i === 0 && <Badge tone="green">Newest</Badge>}
                      </p>
                      <p className="text-xs text-[#0a120b]/45 truncate">{f.key} · {size(f.size)}</p>
                    </div>
                    <a
                      href={`/api/backups/${encodeURIComponent(f.key)}/download`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#1F5A42] hover:bg-[#0a120b]/5"
                    >
                      <Download className="size-3.5" /> Download
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </>
  );
}

function Notice({ tone, title, text }: { tone: "green" | "amber" | "red"; title: string; text: string }) {
  const style = {
    green: "bg-emerald-50 text-emerald-800",
    amber: "bg-amber-50 text-amber-800",
    red: "bg-red-50 text-red-800",
  }[tone];
  const Icon = tone === "green" ? CheckCircle2 : AlertTriangle;
  return (
    <div className={`flex items-start gap-3 rounded-xl px-4 py-3 ${style}`}>
      <Icon className="size-5 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm opacity-90 mt-0.5 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
