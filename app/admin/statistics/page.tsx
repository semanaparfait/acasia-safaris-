"use client";

// Admin > Statistics: who visits the website, from where, and what they do.
// The numbers come from Umami through the backend (GET /api/analytics, see
// backend/src/analytics). Nobody's name or email is in here: only counts.
import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  ExternalLink,
  Eye,
  Loader2,
  LogOut,
  MousePointerClick,
  RefreshCw,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { AreaChart, BarList } from "../components/Charts";
import { Button, Card, CardHeader, EmptyState, PageHeader, Tabs } from "../components/ui";

type Range = "today" | "7d" | "30d" | "90d";
type Stats = { pageviews: number; visitors: number; visits: number; bounces: number; totaltime: number };
type Row = { label: string; value: number; path?: string };
type Report =
  | { connected: false; reason: "not-configured" | "refused"; shareUrl?: string }
  | {
      connected: true;
      range: Range;
      active: number;
      stats: Stats & { previous: Stats };
      series: { label: string; visitors: number; pageviews: number }[];
      pages: Row[];
      countries: Row[];
      referrers: Row[];
      devices: Row[];
      events: Row[];
      updatedAt: string;
    };

const RANGES: { value: Range; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];
const PREVIOUS: Record<Range, string> = {
  today: "vs yesterday",
  "7d": "vs the 7 days before",
  "30d": "vs the 30 days before",
  "90d": "vs the 90 days before",
};

// The moments the website records (lib/analytics.ts) in plain words
const EVENT_NAMES: Record<string, string> = {
  "booking-sent": "Custom trip requests sent",
  "package-booked": "Packages booked",
  "trip-booked": "Special trips booked",
  "trip-waitlist": "Joined a trip waitlist",
  "whatsapp-open": "WhatsApp chats opened",
  "tour-saved": "Trips saved (heart)",
  "tour-shared": "Trips shared",
  "faq-open": "FAQ answers opened",
};

const DEVICE_NAMES: Record<string, string> = { desktop: "Computer", laptop: "Laptop", mobile: "Phone", tablet: "Tablet" };

const countryName = (() => {
  let names: Intl.DisplayNames | null = null;
  try {
    names = new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    // very old browser: show the codes
  }
  return (code: string) => {
    if (!/^[A-Z]{2}$/i.test(code)) return code;
    const flag = String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));
    return `${flag}  ${names?.of(code.toUpperCase()) ?? code}`;
  };
})();

const duration = (seconds: number) => {
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m ${s % 60}s` : `${Math.floor(m / 60)}h ${m % 60}m`;
};

// Average visit time and bounce rate are worked out per visit
const avgTime = (s: Stats) => (s.visits ? s.totaltime / s.visits : 0);
const bounceRate = (s: Stats) => (s.visits ? (Math.min(s.bounces, s.visits) / s.visits) * 100 : 0);

export default function StatisticsPage() {
  const [range, setRange] = useState<Range>("7d");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (r: Range, fresh = false) => {
    setLoading(true);
    setError("");
    try {
      setReport(await api<Report>(`/analytics?range=${r}${fresh ? "&fresh=1" : ""}`, { admin: true }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
     
    load(range);
  }, [load, range]);

  const live = report?.connected ? report : null;

  return (
    <div>
      <PageHeader
        title="Statistics"
        subtitle="Who visits the website, where they come from and what they do. No names or emails, only counts."
        actions={
          live && (
            <>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#2E7D5B]/10 px-3 py-1.5 text-xs font-medium text-[#1F5A42]">
                <span className="relative flex size-2">
                  {live.active > 0 && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2E7D5B] opacity-60" />}
                  <span className="relative inline-flex size-2 rounded-full bg-[#2E7D5B]" />
                </span>
                {live.active} on the website now
              </span>
              <Button variant="secondary" className="py-2" onClick={() => load(range, true)} disabled={loading}>
                <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </>
          )
        }
      />

      {report && !report.connected && report.shareUrl ? (
        <UmamiShare url={report.shareUrl} />
      ) : report && !report.connected ? (
        <NotConnected reason={report.reason} />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Tabs tabs={RANGES} value={range} onChange={setRange} />
            {live && (
              <p className="text-xs text-[#0a120b]/45">
                Updated {new Date(live.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Kigali time
              </p>
            )}
          </div>

          {error && (
            <Card className="p-5 mb-5 border-red-200 bg-red-50/50">
              <p className="text-sm text-red-700">{error}</p>
            </Card>
          )}

          {!live ? (
            !error && (
              <div className="flex items-center justify-center py-24 text-[#0a120b]/40">
                <Loader2 className="size-6 animate-spin" />
              </div>
            )
          ) : (
            <div className={`space-y-5 transition-opacity ${loading ? "opacity-60" : ""}`}>
              {/* Totals, compared with the period before */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <Tile icon={Users} label="Visitors" value={live.stats.visitors} before={live.stats.previous.visitors} range={range} />
                <Tile icon={MousePointerClick} label="Visits" value={live.stats.visits} before={live.stats.previous.visits} range={range} />
                <Tile icon={Eye} label="Page views" value={live.stats.pageviews} before={live.stats.previous.pageviews} range={range} />
                <Tile
                  icon={Clock}
                  label="Average visit"
                  value={avgTime(live.stats)}
                  before={avgTime(live.stats.previous)}
                  range={range}
                  format={duration}
                />
                <Tile
                  icon={LogOut}
                  label="Left after 1 page"
                  value={bounceRate(live.stats)}
                  before={bounceRate(live.stats.previous)}
                  range={range}
                  format={(n) => `${Math.round(n)}%`}
                  lowerIsBetter
                />
              </div>

              <Card>
                <CardHeader
                  title={range === "today" ? "Visitors per hour" : "Visitors per day"}
                  subtitle={`${live.stats.visitors.toLocaleString()} visitors · ${live.stats.pageviews.toLocaleString()} page views`}
                />
                <div className="px-3 pb-4">
                  <AreaChart
                    data={live.series.map((p) => ({
                      label: range === "today" ? p.label : new Date(`${p.label}T12:00:00Z`).toLocaleDateString([], { day: "numeric", month: "short" }),
                      value: p.visitors,
                    }))}
                    height={240}
                  />
                </div>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ListCard
                  title="Most viewed pages"
                  subtitle="The same page in English, French and Swahili counts once"
                  rows={live.pages}
                  empty="No page views in this period yet."
                />
                <ListCard
                  title="What visitors did"
                  subtitle="Bookings, WhatsApp chats and more"
                  rows={live.events.map((e) => ({ ...e, label: EVENT_NAMES[e.label] ?? e.label }))}
                  empty="Nothing recorded yet. These appear once visitors book, open WhatsApp or save a trip."
                />
                <ListCard
                  title="Countries"
                  rows={live.countries.map((c) => ({ ...c, label: countryName(c.label) }))}
                  empty="No visitors in this period yet."
                />
                <ListCard
                  title="Where they found us"
                  subtitle="The website they came from. Direct = typed the address, a bookmark or an app like WhatsApp"
                  rows={live.referrers}
                  empty="No visitors in this period yet."
                />
                <ListCard
                  title="Devices"
                  rows={live.devices.map((d) => ({ ...d, label: DEVICE_NAMES[d.label] ?? d.label }))}
                  empty="No visitors in this period yet."
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  before,
  range,
  format = (n) => Math.round(n).toLocaleString(),
  lowerIsBetter = false,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  before: number;
  range: Range;
  format?: (n: number) => string;
  lowerIsBetter?: boolean;
}) {
  const change = before > 0 ? ((value - before) / before) * 100 : null;
  const up = (change ?? 0) >= 0;
  const good = lowerIsBetter ? !up : up;
  return (
    <Card className="p-4">
      <p className="flex items-center gap-2 text-xs text-[#0a120b]/55">
        <Icon className="size-4 text-[#2E7D5B]" /> {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-[#0a120b]">{format(value)}</p>
      <p className="mt-1 text-[11px] text-[#0a120b]/45 flex items-center gap-1">
        {change === null || Math.round(change) === 0 ? (
          <span>{before > 0 ? "Same" : "Nothing to compare"} {before > 0 && PREVIOUS[range]}</span>
        ) : (
          <>
            <span className={`inline-flex items-center font-medium ${good ? "text-[#1F5A42]" : "text-[#C62828]"}`}>
              {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {Math.abs(Math.round(change))}%
            </span>
            {PREVIOUS[range]}
          </>
        )}
      </p>
    </Card>
  );
}

function ListCard({ title, subtitle, rows, empty }: { title: string; subtitle?: string; rows: Row[]; empty: string }) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <div className="px-5 pb-5">
        {rows.length === 0 ? <p className="text-sm text-[#0a120b]/45 py-6 text-center">{empty}</p> : <BarList data={rows.slice(0, 10)} />}
      </div>
    </Card>
  );
}

function NotConnected({ reason }: { reason: "not-configured" | "refused" }) {
  return (
    <Card className="p-6 max-w-2xl">
      {reason === "refused" ? (
        <EmptyState
          title="Umami refused the connection"
          text="The Share URL (or the API key and website ID) in the backend settings is not accepted. In Umami, check that Share URL is still turned on for the website and copy it again, then update UMAMI_SHARE_URL in Azure (the web app's Environment variables)."
        />
      ) : (
        <>
          <p className="font-medium">Connect the statistics</p>
          <p className="text-sm text-[#0a120b]/60 mt-1">The website sends its visits to Umami. To see them here, with these charts (works on Umami&apos;s free plan):</p>
          <ol className="mt-4 space-y-2.5 text-sm text-[#0a120b]/75 list-decimal pl-5">
            <li>
              In Umami, open <b>Websites</b>, click the pencil next to the website, and turn on <b>Share URL</b>.
            </li>
            <li>Copy that link.</li>
            <li>
              Add it to the backend settings (Azure: the web app&apos;s <b>Environment variables</b>; on your computer: <code className="rounded bg-[#0a120b]/5 px-1.5 py-0.5 text-xs">backend/.env</code>):
              <pre className="mt-2 rounded-lg bg-[#0a120b] text-white/85 p-3 text-xs overflow-x-auto">
                {`UMAMI_SHARE_URL="https://cloud.umami.is/share/..."`}
              </pre>
            </li>
            <li>Apply (Azure restarts the backend by itself) and open this page again.</li>
          </ol>
        </>
      )}
      <a
        href="https://cloud.umami.is"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#1F5A42] hover:underline"
      >
        Open Umami <ExternalLink className="size-3.5" />
      </a>
    </Card>
  );
}

// Umami's own statistics page, inside the admin (free Umami plan)
function UmamiShare({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[#0a120b]/50">
          From Umami. Pick the period and see pages, countries and events on the page below.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#0a120b]/10 bg-white px-3 py-2 text-xs font-medium hover:border-[#c5a86d]"
        >
          Open in a new tab <ExternalLink className="size-3.5" />
        </a>
      </div>
      <Card className="relative overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-[#0a120b]/40">
            <Loader2 className="size-6 animate-spin" />
          </div>
        )}
        <iframe
          src={url}
          title="Website statistics (Umami)"
          onLoad={() => setLoaded(true)}
          referrerPolicy="no-referrer"
          // Umami's page needs its own scripts; it cannot reach the admin page or its login
          sandbox="allow-scripts allow-same-origin allow-popups"
          className="relative block w-full h-[calc(100vh-12rem)] min-h-[640px] border-0"
        />
      </Card>
    </div>
  );
}
