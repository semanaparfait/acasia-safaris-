"use client";

// Admin > Activity (main admin only): who did what in the admin panel, and when.
// Prices, offers, bookings deleted, check-ins, workers and access changes, logins…
import { useCallback, useEffect, useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ChevronDown, Loader2, LogIn, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Avatar, Button, Card, EmptyState, PageHeader, SearchInput } from "../components/ui";

type Entry = {
  id: string;
  workerId: string | null;
  workerName: string;
  action: string;
  target: string | null;
  details: Record<string, unknown> | null;
  ip: string | null;
  createdAt: string;
};

const PAGE = 50;

// Failed logins and deletions stand out
const tone = (action: string) =>
  /failed/i.test(action) ? "text-red-700" : /deleted/i.test(action) ? "text-amber-700" : "text-[#0a120b]";

export default function ActivityPage() {
  const me = useAuthStore((s) => s.worker);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async (before?: string) => {
    setLoading(true);
    try {
      const page = await api<Entry[]>(`/audit${before ? `?before=${encodeURIComponent(before)}` : ""}`, { admin: true });
      setEntries((prev) => (before ? [...prev, ...page] : page));
      setMore(page.length === PAGE);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (me?.isOwner) load();
  }, [me?.isOwner, load]);

  const shown = useMemo(() => {
    const q = query.toLowerCase();
    return entries.filter((e) => [e.workerName, e.action, e.target ?? "", e.ip ?? ""].some((f) => f.toLowerCase().includes(q)));
  }, [entries, query]);

  if (me && !me.isOwner) {
    return (
      <>
        <PageHeader title="Activity" />
        <EmptyState title="Only the main admin can see the activity" />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Activity" subtitle="Everything done in the admin panel, newest first. Passwords and codes are never recorded." />

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-[#0a120b]/[0.06]">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by person, action, booking…" className="sm:w-80" />
        </div>

        {error ? (
          <p className="p-5 text-sm text-red-700">Could not load the activity: {error}</p>
        ) : loading && entries.length === 0 ? (
          <EmptyState title="Loading activity…" />
        ) : shown.length === 0 ? (
          <EmptyState title={entries.length === 0 ? "No activity yet" : "Nothing found"} />
        ) : (
          <ul className="divide-y divide-[#0a120b]/[0.05]">
            {shown.map((e) => {
              const isOpen = open === e.id;
              const hasDetails = e.details && Object.keys(e.details).length > 0;
              return (
                <li key={e.id} className="px-5 py-3.5">
                  <div className="flex items-start gap-3">
                    {e.workerId ? (
                      <Avatar name={e.workerName} size={34} />
                    ) : (
                      <span className="size-[34px] shrink-0 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                        <ShieldAlert className="size-4" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{e.workerName}</span>{" "}
                        <span className={tone(e.action)}>{e.action.charAt(0).toLowerCase() + e.action.slice(1)}</span>
                        {e.target && <span className="text-[#0a120b]/60"> · {e.target}</span>}
                      </p>
                      <p className="text-xs text-[#0a120b]/45 mt-0.5 flex flex-wrap gap-x-2">
                        <span title={format(new Date(e.createdAt), "d MMM yyyy, HH:mm:ss")}>
                          {formatDistanceToNow(new Date(e.createdAt), { addSuffix: true })} · {format(new Date(e.createdAt), "d MMM, HH:mm")}
                        </span>
                        {e.ip && (
                          <span className="inline-flex items-center gap-1"><LogIn className="size-3" /> {e.ip}</span>
                        )}
                      </p>
                      {isOpen && hasDetails && (
                        <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-[#f7f5f0] p-3 text-[11px] leading-relaxed text-[#0a120b]/75 whitespace-pre-wrap break-words">
                          {JSON.stringify(e.details, null, 2)}
                        </pre>
                      )}
                    </div>
                    {hasDetails && (
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : e.id)}
                        className="shrink-0 inline-flex items-center gap-1 text-xs text-[#0a120b]/50 hover:text-[#2E7D5B] cursor-pointer"
                      >
                        Details <ChevronDown className={`size-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {more && entries.length > 0 && (
          <div className="p-4 border-t border-[#0a120b]/[0.06] flex justify-center">
            <Button variant="secondary" disabled={loading} onClick={() => load(entries[entries.length - 1].createdAt)}>
              {loading && <Loader2 className="size-4 animate-spin" />} Load older
            </Button>
          </div>
        )}
      </Card>
    </>
  );
}
