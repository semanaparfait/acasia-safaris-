import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Website visitor statistics for Admin > Statistics, read from Umami (umami.is).
// The website sends the visits to Umami (components/Analytics.tsx); here the backend reads
// the totals with a private API key, so the key never reaches a browser.
//   UMAMI_API_KEY      Umami > Settings > API keys
//   UMAMI_WEBSITE_ID   Umami > Settings > Websites > Edit (the real website, not the test one)
//   UMAMI_API_URL      optional, default https://api.umami.is/v1 (self-hosted: https://<server>/api)
// Umami allows 50 calls per 15 seconds per key: one page load makes 8, and results are kept
// for a few minutes.
//
// Free Umami plan (no API keys): set UMAMI_SHARE_URL instead, the website's Share URL
// (Umami > Websites > Edit > Share URL). The backend reads the same numbers the share page
// shows, with the short-lived pass Umami gives that page (renewed when it expires), so
// Admin > Statistics shows its own charts. Only admins see them; the link is never sent
// to the public website. An API key, when set, is used instead.

export const RANGES = ['today', '7d', '30d', '90d'] as const;
export type Range = (typeof RANGES)[number];

const TIMEZONE = 'Africa/Kigali'; // UTC+2 all year (no summer time)
const TZ_OFFSET_MS = 2 * 3_600_000;
const DAY = 86_400_000;
const KEEP_MS = 5 * 60_000;
const DAYS: Record<Range, number> = { today: 1, '7d': 7, '30d': 30, '90d': 90 };

type Stats = {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number; // seconds, all visits together
};
type Metric = { x: string | null; y: number };
type Series = {
  pageviews?: { x: string; y: number }[];
  sessions?: { x: string; y: number }[];
};

export type Row = { label: string; value: number; path?: string };

export type AnalyticsReport =
  | {
      connected: false;
      reason: 'not-configured' | 'refused';
      shareUrl?: string; // Umami's share page, shown in the admin instead
    }
  | {
      connected: true;
      range: Range;
      from: string;
      to: string;
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

const emptyStats = (): Stats => ({
  pageviews: 0,
  visitors: 0,
  visits: 0,
  bounces: 0,
  totaltime: 0,
});

// The numbers Umami sends (a missing one counts as 0)
function readStats(raw: Record<string, unknown> | undefined): Stats {
  const n = (v: unknown) =>
    typeof v === 'number'
      ? v
      : typeof v === 'object' && v && 'value' in v
        ? Number(v.value) || 0
        : 0;
  if (!raw) return emptyStats();
  return {
    pageviews: n(raw.pageviews),
    visitors: n(raw.visitors),
    visits: n(raw.visits),
    bounces: n(raw.bounces),
    totaltime: n(raw.totaltime),
  };
}

class Refused extends Error {}

// How to read Umami: an API key, or the pass of a share link
type Source = {
  base: string; // e.g. https://api.umami.is/v1
  websiteId: string;
  headers: Record<string, string>;
  renew?: () => void; // share link: forget the pass (it expired)
};

// A share link's pass, and the address where it works
type SharePass = { at: number; base: string; websiteId: string; token: string };

// The share pass lasts a while: asked again after this, or at once when Umami refuses it
const SHARE_PASS_MS = 30 * 60_000;

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private cache = new Map<Range, { at: number; report: AnalyticsReport }>();

  constructor(private prisma: PrismaService) {}

  // Only a real https address (a typo must not end up in the admin page)
  private get shareUrl() {
    const raw = process.env.UMAMI_SHARE_URL?.trim();
    if (!raw) return undefined;
    try {
      const url = new URL(raw);
      return url.protocol === 'https:' ? url.toString() : undefined;
    } catch {
      return undefined;
    }
  }

  private sharePass: SharePass | null = null;
  private cloudBase: string | null = null; // the Umami Cloud region found for this account

  // The share pass from each possible address; with two (Umami Cloud's EU and US regions),
  // keep the one where the website has visits, and remember it
  private async pickShare(
    bases: string[],
    shareId: string,
  ): Promise<SharePass> {
    let best: { pageviews: number; pass: SharePass } | null = null;
    for (const base of bases) {
      const res = await fetch(`${base}/share/${encodeURIComponent(shareId)}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10_000),
      });
      if (res.status === 401 || res.status === 403 || res.status === 404) {
        if (bases.length === 1) throw new Refused(`share link ${res.status}`);
        continue;
      }
      if (!res.ok) throw new Error(`share link answered ${res.status}`);
      const data = (await res.json()) as { websiteId?: string; token?: string };
      if (!data.websiteId || !data.token)
        throw new Error('share link: unexpected answer');
      const pass: SharePass = {
        at: Date.now(),
        base,
        websiteId: data.websiteId,
        token: data.token,
      };
      if (bases.length === 1) return pass;

      // How many page views this region has for the website (2 years)
      const now = Date.now();
      const stats = await fetch(
        `${base}/websites/${encodeURIComponent(data.websiteId)}/stats?startAt=${now - 730 * DAY}&endAt=${now}`,
        {
          headers: {
            Accept: 'application/json',
            'x-umami-share-token': data.token,
            'x-umami-share-context': '1',
          },
          signal: AbortSignal.timeout(10_000),
        },
      )
        .then((r) =>
          r.ok ? (r.json() as Promise<{ pageviews?: unknown }>) : {},
        )
        .catch(() => ({}));
      const pageviews =
        Number((stats as { pageviews?: unknown }).pageviews) || 0;
      if (!best || pageviews > best.pageviews) best = { pageviews, pass };
    }
    if (!best) throw new Refused('share link not found');
    // Remember the region once it has visits (until then, look again next time)
    if (best.pageviews > 0) this.cloudBase = best.pass.base;
    return best.pass;
  }

  // An API key (paid plans, or self-hosted), else the share link (free plan), else nothing
  private async source(): Promise<Source | null> {
    const key = process.env.UMAMI_API_KEY?.trim();
    const websiteId = process.env.UMAMI_WEBSITE_ID?.trim();
    if (key && websiteId) {
      const base = (
        process.env.UMAMI_API_URL?.trim() || 'https://api.umami.is/v1'
      ).replace(/\/+$/, '');
      return { base, websiteId, headers: { Authorization: `Bearer ${key}` } };
    }
    const share = this.shareUrl;
    if (!share) return null;

    // https://cloud.umami.is/share/<id>: Umami Cloud keeps each account's data in one region,
    // /analytics/eu/api or /analytics/us/api (UMAMI_REGION, else found by the backend: the
    // region that has the website's visits). Self-hosted: https://<server>/share/<id> -> /api
    const url = new URL(share);
    const shareId = url.pathname.split('/').filter(Boolean)[1];
    if (!shareId) return null;
    const custom = process.env.UMAMI_API_URL?.trim().replace(/\/+$/, '');
    const cloud = !custom && url.hostname === 'cloud.umami.is';

    if (!this.sharePass || Date.now() - this.sharePass.at > SHARE_PASS_MS) {
      const region = process.env.UMAMI_REGION?.trim().toLowerCase();
      const bases = custom
        ? [custom]
        : !cloud
          ? [`${url.origin}/api`]
          : region === 'eu' || region === 'us'
            ? [`${url.origin}/analytics/${region}/api`]
            : this.cloudBase
              ? [this.cloudBase]
              : [
                  `${url.origin}/analytics/eu/api`,
                  `${url.origin}/analytics/us/api`,
                ];
      this.sharePass = await this.pickShare(bases, shareId);
    }
    const pass = this.sharePass;
    return {
      base: pass.base,
      websiteId: pass.websiteId,
      // What Umami's own share page sends
      headers: {
        'x-umami-share-token': pass.token,
        'x-umami-share-context': '1',
      },
      renew: () => (this.sharePass = null),
    };
  }

  async report(range: Range, fresh = false): Promise<AnalyticsReport> {
    const kept = this.cache.get(range);
    if (!fresh && kept && Date.now() - kept.at < KEEP_MS) return kept.report;

    try {
      let source = await this.source();
      if (!source) {
        return {
          connected: false,
          reason: 'not-configured',
          shareUrl: this.shareUrl,
        };
      }
      let report: AnalyticsReport;
      try {
        report = await this.build(range, source);
      } catch (err) {
        // The share pass expired: ask for a new one, once
        if (!(err instanceof Refused) || !source.renew) throw err;
        source.renew();
        source = (await this.source())!;
        report = await this.build(range, source);
      }
      this.cache.set(range, { at: Date.now(), report });
      return report;
    } catch (err) {
      if (err instanceof Refused)
        return { connected: false, reason: 'refused', shareUrl: this.shareUrl };
      this.logger.warn(`Umami: ${(err as Error).message}`);
      // Umami is down or slow: show the last numbers we had rather than nothing
      if (kept) return kept.report;
      throw new BadGatewayException(
        'Could not reach Umami. Try again in a minute.',
      );
    }
  }

  private async build(range: Range, source: Source): Promise<AnalyticsReport> {
    // From midnight (Kigali time) of the first day until now
    const now = Date.now();
    const todayStart =
      Math.floor((now + TZ_OFFSET_MS) / DAY) * DAY - TZ_OFFSET_MS;
    const startAt = todayStart - (DAYS[range] - 1) * DAY;
    const unit = range === 'today' ? 'hour' : 'day';
    const window = {
      startAt: String(startAt),
      endAt: String(now),
      timezone: TIMEZONE,
    };

    const get = async <T>(
      path: string,
      params: Record<string, string> = {},
    ): Promise<T> => {
      const url = new URL(
        `${source.base}/websites/${encodeURIComponent(source.websiteId)}${path}`,
      );
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
      const res = await fetch(url, {
        headers: { Accept: 'application/json', ...source.headers },
        signal: AbortSignal.timeout(10_000),
      });
      if (res.status === 401 || res.status === 403 || res.status === 404)
        throw new Refused(String(res.status));
      if (!res.ok) throw new Error(`${path} answered ${res.status}`);
      return (await res.json()) as T;
    };
    const metric = (type: string, limit: number) =>
      get<Metric[]>('/metrics', { ...window, type, limit: String(limit) });

    const [
      stats,
      series,
      paths,
      countries,
      referrers,
      devices,
      events,
      active,
    ] = await Promise.all([
      get<Record<string, unknown> & { comparison?: Record<string, unknown> }>(
        '/stats',
        window,
      ),
      get<Series>('/pageviews', { ...window, unit }),
      metric('path', 100),
      metric('country', 10),
      metric('referrer', 10),
      metric('device', 10),
      metric('event', 20),
      get<{ visitors?: number }>('/active').catch(() => ({ visitors: 0 })),
    ]);

    return {
      connected: true,
      range,
      from: new Date(startAt).toISOString(),
      to: new Date(now).toISOString(),
      active: active.visitors ?? 0,
      stats: { ...readStats(stats), previous: readStats(stats.comparison) },
      series: this.fillSeries(series, startAt, range),
      pages: await this.namePages(paths ?? []),
      countries: rows(countries),
      referrers: rows(referrers, 'Direct'),
      devices: rows(devices),
      events: rows(events),
      updatedAt: new Date(now).toISOString(),
    };
  }

  // One point per hour (today) or per day, also where there were no visits
  private fillSeries(series: Series, startAt: number, range: Range) {
    const key = (x: string) => {
      const m =
        /(\d{4}-\d{2}-\d{2})[T ](\d{2})/.exec(x) ??
        /(\d{4}-\d{2}-\d{2})/.exec(x);
      if (!m) return x;
      return range === 'today' ? `${m[1]} ${m[2] ?? '00'}` : m[1];
    };
    const count = (list: { x: string; y: number }[] | undefined) => {
      const map = new Map<string, number>();
      for (const p of list ?? [])
        map.set(key(p.x), (map.get(key(p.x)) ?? 0) + p.y);
      return map;
    };
    const views = count(series.pageviews);
    const visits = count(series.sessions);

    const points = range === 'today' ? 24 : DAYS[range];
    const step = range === 'today' ? 3_600_000 : DAY;
    return Array.from({ length: points }, (_, i) => {
      // Kigali local time of this bucket, written like Umami writes it
      const local = new Date(startAt + i * step + TZ_OFFSET_MS).toISOString();
      const k =
        range === 'today'
          ? `${local.slice(0, 10)} ${local.slice(11, 13)}`
          : local.slice(0, 10);
      return {
        label:
          range === 'today' ? `${local.slice(11, 13)}:00` : local.slice(0, 10),
        visitors: visits.get(k) ?? 0,
        pageviews: views.get(k) ?? 0,
      };
    });
  }

  // "/fr/tour/3f2a…" -> "Gorilla Trekking Safari": the same page in every language counts once,
  // and a package or trip shows its name instead of its id
  private async namePages(list: Metric[]): Promise<Row[]> {
    const LOCALE = /^\/(fr|sw)(?=\/|$)/;
    const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
    const merged = new Map<string, number>();
    for (const m of list) {
      if (!m.x) continue;
      let path = m.x.split(/[?#]/)[0].replace(LOCALE, '') || '/';
      if (path.length > 1) path = path.replace(/\/+$/, '');
      merged.set(path, (merged.get(path) ?? 0) + m.y);
    }
    const top = [...merged.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);

    const ids = (prefix: string) =>
      top
        .map(([p]) => new RegExp(`^/${prefix}/(${UUID})$`, 'i').exec(p)?.[1])
        .filter((x): x is string => Boolean(x));
    const [packages, trips] = await Promise.all([
      this.prisma.package.findMany({
        where: { id: { in: ids('tour') } },
        select: { id: true, title: true },
      }),
      this.prisma.trip.findMany({
        where: { id: { in: ids('trips') } },
        select: { id: true, title: true },
      }),
    ]);
    const names = new Map<string, string>([
      ...packages.map((p) => [`/tour/${p.id}`, p.title] as const),
      ...trips.map((t) => [`/trips/${t.id}`, t.title] as const),
    ]);
    const PAGES: Record<string, string> = {
      '/': 'Home',
      '/tour': 'Tour packages',
      '/destination': 'Destinations',
      '/booking': 'Booking form',
      '/trips': 'Special trips',
      '/gallery': 'Gallery',
      '/aboutus': 'About us',
      '/about': 'About us',
      '/contact': 'Contact',
      '/faq': 'Questions & answers',
      '/saved': 'Saved trips',
      '/my-booking/[link]': "Guests' booking pages",
      '/trip-review/[link]': 'Trip review pages',
      '/privacy': 'Privacy policy',
      '/terms': 'Terms',
    };
    // Two addresses with one name (/about and /aboutus) become one line
    const byName = new Map<string, Row>();
    for (const [path, value] of top) {
      const label = names.get(path) ?? PAGES[path] ?? path;
      const row = byName.get(label);
      if (row) row.value += value;
      else byName.set(label, { label, value, path });
    }
    return [...byName.values()].sort((a, b) => b.value - a.value);
  }
}

const rows = (list: Metric[] | undefined, empty = 'Unknown'): Row[] =>
  (list ?? []).map((m) => ({ label: m.x || empty, value: m.y }));
