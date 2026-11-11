import { Injectable, Logger } from '@nestjs/common';

// Currencies a visitor can see prices in. Bookings are always charged in USD.
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'KES', 'RWF'] as const;
type Currency = (typeof CURRENCIES)[number];

export type Rates = {
  base: 'USD';
  rates: Record<Currency, number>; // 1 USD = rates[X] X
  updatedAt: string; // when the source last updated them
};

const SOURCE = 'https://open.er-api.com/v6/latest/USD'; // free, no key, updated daily
const KEEP_MS = 6 * 60 * 60 * 1000; // ask again after 6 hours

// Live exchange rates, cached. If the source is down, the last rates are kept
// (and, before the first success, only USD is offered).
@Injectable()
export class RatesService {
  private readonly logger = new Logger(RatesService.name);
  private cache: (Rates & { fetchedAt: number }) | null = null;
  private loading: Promise<void> | null = null;

  async get(): Promise<
    Rates | { base: 'USD'; rates: { USD: 1 }; updatedAt: null }
  > {
    if (!this.cache || Date.now() - this.cache.fetchedAt > KEEP_MS) {
      this.loading ??= this.refresh().finally(() => (this.loading = null));
      await this.loading;
    }
    if (!this.cache) return { base: 'USD', rates: { USD: 1 }, updatedAt: null };
    const { fetchedAt, ...rates } = this.cache;
    void fetchedAt;
    return rates;
  }

  private async refresh() {
    try {
      const res = await fetch(SOURCE, { signal: AbortSignal.timeout(8000) });
      const data = (await res.json()) as {
        result?: string;
        rates?: Record<string, number>;
        time_last_update_utc?: string;
      };
      if (data.result !== 'success' || !data.rates)
        throw new Error(`bad answer: ${data.result}`);
      const rates = {} as Record<Currency, number>;
      for (const c of CURRENCIES) {
        const rate = data.rates[c];
        if (typeof rate !== 'number' || rate <= 0)
          throw new Error(`no rate for ${c}`);
        rates[c] = rate;
      }
      this.cache = {
        base: 'USD',
        rates,
        updatedAt: data.time_last_update_utc
          ? new Date(data.time_last_update_utc).toISOString()
          : new Date().toISOString(),
        fetchedAt: Date.now(),
      };
    } catch (error) {
      this.logger.warn(`Exchange rates not updated: ${error}`);
      // Keep the old rates, but try again in 10 minutes rather than at once
      if (this.cache)
        this.cache.fetchedAt = Date.now() - KEEP_MS + 10 * 60 * 1000;
    }
  }
}
