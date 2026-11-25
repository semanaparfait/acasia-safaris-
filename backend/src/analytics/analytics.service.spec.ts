import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from './analytics.service';

const prisma = {
  package: { findMany: jest.fn().mockResolvedValue([]) },
  trip: { findMany: jest.fn().mockResolvedValue([]) },
} as unknown as PrismaService;

const json = (body: unknown, status = 200) =>
  Promise.resolve({
    ok: status < 400,
    status,
    json: () => Promise.resolve(body),
  });

const STATS = {
  pageviews: 12,
  visitors: 5,
  visits: 6,
  bounces: 2,
  totaltime: 300,
};

describe('AnalyticsService with a share link (free Umami plan)', () => {
  const realFetch = global.fetch;
  const env = { ...process.env };
  beforeEach(() => {
    delete process.env.UMAMI_API_KEY;
    delete process.env.UMAMI_WEBSITE_ID;
    delete process.env.UMAMI_API_URL;
    delete process.env.UMAMI_REGION;
    process.env.UMAMI_SHARE_URL = 'https://cloud.umami.is/share/abc123';
  });
  afterEach(() => {
    global.fetch = realFetch;
    process.env = { ...env };
  });

  it('finds the Umami Cloud region with the visits, then reads with its pass', async () => {
    const calls: { url: string; headers: Record<string, string> }[] = [];
    global.fetch = jest.fn((input: URL | string, init?: RequestInit) => {
      const url = String(input);
      calls.push({
        url,
        headers: (init?.headers ?? {}) as Record<string, string>,
      });
      if (url.endsWith('/share/abc123'))
        return json({ websiteId: 'w1', token: 'pass' });
      // The account's data is in the EU region; the US region is empty
      if (url.includes('/analytics/us/') && url.includes('/stats'))
        return json({ pageviews: 0, visitors: 0 });
      if (url.includes('/stats')) return json(STATS);
      if (url.includes('/pageviews'))
        return json({ pageviews: [], sessions: [] });
      if (url.includes('/active')) return json({ visitors: 1 });
      return json([]);
    }) as unknown as typeof fetch;

    const report = await new AnalyticsService(prisma).report('7d');
    expect(report.connected).toBe(true);
    if (report.connected) expect(report.stats.visitors).toBe(5);

    // The report is read from the EU region, with the share pass
    const reads = calls.filter(
      (c) => c.url.includes('/websites/w1/') && c.url.includes('timezone'),
    );
    expect(reads.length).toBeGreaterThan(0);
    expect(
      reads.every((c) =>
        c.url.startsWith('https://cloud.umami.is/analytics/eu/api/'),
      ),
    ).toBe(true);
    expect(reads[0].headers).toMatchObject({
      'x-umami-share-token': 'pass',
      'x-umami-share-context': '1',
    });
  });

  it('uses UMAMI_REGION when it is set', async () => {
    process.env.UMAMI_REGION = 'us';
    const urls: string[] = [];
    global.fetch = jest.fn((input: URL | string) => {
      const url = String(input);
      urls.push(url);
      if (url.endsWith('/share/abc123'))
        return json({ websiteId: 'w1', token: 'pass' });
      if (url.includes('/stats')) return json(STATS);
      if (url.includes('/pageviews'))
        return json({ pageviews: [], sessions: [] });
      return json([]);
    }) as unknown as typeof fetch;

    await new AnalyticsService(prisma).report('today');
    expect(urls.every((u) => u.includes('/analytics/us/api/'))).toBe(true);
  });

  it('asks for a new pass once when Umami refuses the old one', async () => {
    process.env.UMAMI_REGION = 'eu';
    let passes = 0;
    global.fetch = jest.fn((input: URL | string) => {
      const url = String(input);
      if (url.endsWith('/share/abc123'))
        return json({ websiteId: 'w1', token: `pass${++passes}` });
      if (passes === 1) return json({}, 401); // the first pass has expired
      if (url.includes('/stats')) return json(STATS);
      if (url.includes('/pageviews'))
        return json({ pageviews: [], sessions: [] });
      return json([]);
    }) as unknown as typeof fetch;

    const report = await new AnalyticsService(prisma).report('today');
    expect(report.connected).toBe(true);
    expect(passes).toBe(2);
  });

  it('says it is not set up without a key or a share link', async () => {
    delete process.env.UMAMI_SHARE_URL;
    await expect(new AnalyticsService(prisma).report('7d')).resolves.toEqual({
      connected: false,
      reason: 'not-configured',
      shareUrl: undefined,
    });
  });
});
