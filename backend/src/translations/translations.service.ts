import {
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  LANGUAGES,
  applyDestination,
  applyPackage,
  prune,
  readTranslations,
  statusOf,
  toTranslate,
  unitsOf,
  type DestinationTexts,
  type Kind,
  type Lang,
  type PackageTexts,
  type Translations,
  type Unit,
} from './content';
import { GoogleTranslate } from './google-translate';

const withItinerary = { itinerary: { orderBy: { day: 'asc' as const } } };

// French and Swahili versions of the packages and destinations.
// - After an admin saves a package/destination, the new or changed texts are translated by
//   Google in the background (refreshLater). Unchanged texts are never translated twice.
// - Admins can correct any translation (save); a correction stays until the English text changes.
// - The website asks for a language (?lang=fr) and gets the record already translated (localize*).
//   A text without an up-to-date translation is shown in English.
@Injectable()
export class TranslationsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TranslationsService.name);
  // One refresh at a time per record (a save and the "Translate now" button can come together)
  private queue = new Map<string, Promise<unknown>>();

  constructor(
    private prisma: PrismaService,
    private google: GoogleTranslate,
  ) {}

  // ---------- Website ----------

  // The package as the website shows it in this language (no lang = English)
  localizePackage<T extends PackageTexts & { translations?: unknown }>(
    pkg: T,
    lang?: Lang,
  ) {
    const { translations, ...rest } = pkg;
    if (!lang) return rest;
    return applyPackage(
      rest as PackageTexts,
      readTranslations(translations)[lang],
    ) as Omit<T, 'translations'>;
  }

  // The destination in this language. titleEn = the English name, which bookings keep,
  // so the team always sees the destinations in English.
  localizeDestination<T extends DestinationTexts & { translations?: unknown }>(
    d: T,
    lang?: Lang,
  ) {
    const { translations, ...rest } = d;
    if (!lang) return rest;
    return {
      ...(applyDestination(
        rest as DestinationTexts,
        readTranslations(translations)[lang],
      ) as Omit<T, 'translations'>),
      titleEn: d.title,
    };
  }

  // ---------- Admin ----------

  // Every text with its French and Swahili version and their status
  async forAdmin(kind: Kind, id: string) {
    const { units, translations } = await this.load(kind, id);
    const languages = Object.fromEntries(
      LANGUAGES.map((lang) => {
        const tr = translations[lang];
        return [
          lang,
          units.map((u) => ({
            key: u.key,
            field: u.key.split('|')[0], // "title", "perks", "itinerary.title"...
            en: u.en,
            text: tr?.[u.key]?.t ?? '',
            status: statusOf(tr, u),
          })),
        ];
      }),
    );
    return { autoTranslate: this.google.enabled, languages };
  }

  // An admin wrote or corrected translations: { "<key>": "text" }. An empty text removes it
  // (the next "Translate now" makes a new machine translation).
  async save(
    kind: Kind,
    id: string,
    lang: Lang,
    values: Record<string, string>,
  ) {
    await this.withLock(kind, id, async () => {
      const { units, translations } = await this.load(kind, id);
      const byKey = new Map(units.map((u) => [u.key, u]));
      const tr = { ...(translations[lang] ?? {}) };
      for (const [key, raw] of Object.entries(values)) {
        const unit = byKey.get(key);
        if (!unit) continue; // a text that no longer exists
        const text = raw.trim();
        const current = tr[key];
        if (!text) delete tr[key];
        else if (!(current && current.src === unit.en && current.t === text)) {
          tr[key] = { t: text, src: unit.en, edited: true };
        }
      }
      await this.write(kind, id, { ...translations, [lang]: prune(tr, units) });
    });
    return this.forAdmin(kind, id);
  }

  // Translates what is missing or out of date, now (the admin's "Translate now" button)
  async refresh(kind: Kind, id: string) {
    await this.withLock(kind, id, () => this.translateRecord(kind, id));
    return this.forAdmin(kind, id);
  }

  // Same, in the background after a save: the admin does not wait for Google
  refreshLater(kind: Kind, id: string) {
    void this.withLock(kind, id, () => this.translateRecord(kind, id)).catch(
      (error) =>
        this.logger.error(`Translating ${kind} ${id} failed: ${error}`),
    );
  }

  // Every package and destination (the first time, and each night to catch anything missed)
  async refreshAll() {
    const result = { packages: 0, destinations: 0, texts: 0, failed: 0 };
    if (!this.google.enabled)
      return { ...result, skipped: 'GOOGLE_TRANSLATE_API_KEY is not set' };
    const packages = await this.prisma.package.findMany({
      select: { id: true },
    });
    const destinations = await this.prisma.destination.findMany({
      select: { id: true },
    });
    const jobs: [Kind, string][] = [
      ...packages.map((p): [Kind, string] => ['package', p.id]),
      ...destinations.map((d): [Kind, string] => ['destination', d.id]),
    ];
    for (const [kind, id] of jobs) {
      try {
        const texts = await this.withLock(kind, id, () =>
          this.translateRecord(kind, id),
        );
        result.texts += texts;
        if (kind === 'package') result.packages++;
        else result.destinations++;
      } catch (error) {
        result.failed++;
        this.logger.error(`Translating ${kind} ${id} failed: ${error}`);
      }
    }
    this.logger.log(`Translations: ${JSON.stringify(result)}`);
    return result;
  }

  // Shortly after the server starts: translates what is still missing (e.g. the existing
  // packages, the first time the key is set). Nothing is sent to Google when all is up to date.
  onApplicationBootstrap() {
    if (!this.google.enabled || process.env.NODE_ENV === 'test') return;
    setTimeout(
      () => void this.refreshAll().catch(() => undefined),
      30_000,
    ).unref();
  }

  // Each night: anything a failed background translation missed
  @Cron('30 3 * * *', {
    name: 'content-translations',
    timeZone: 'Africa/Kigali',
  })
  async nightly() {
    if (this.google.enabled) await this.refreshAll().catch(() => undefined); // already logged
  }

  // ---------- Inside ----------

  // Returns how many texts were translated
  private async translateRecord(kind: Kind, id: string) {
    if (!this.google.enabled) return 0;
    const { units, translations: before } = await this.load(kind, id);

    // Ask Google first (slow), then save on top of the latest version
    const fresh: Partial<Record<Lang, Map<string, string>>> = {};
    let count = 0;
    for (const lang of LANGUAGES) {
      const need = toTranslate(before[lang], units);
      if (!need.length) continue;
      const out = await this.google.translate(
        need.map((u) => u.en),
        lang,
      );
      fresh[lang] = new Map(need.map((u, i) => [u.key, out[i]]));
      count += need.length;
    }

    // The latest version, in case an admin saved a correction in the meantime
    const latest = await this.load(kind, id);
    const next: Translations = {};
    for (const lang of LANGUAGES) {
      const tr = { ...(latest.translations[lang] ?? {}) };
      for (const unit of latest.units) {
        const text = fresh[lang]?.get(unit.key);
        const status = statusOf(tr, unit);
        // Never replace a translation that is up to date (an admin's correction included)
        if (text && (status === 'missing' || status === 'outdated')) {
          tr[unit.key] = { t: text, src: unit.en };
        }
      }
      next[lang] = prune(tr, latest.units);
    }
    await this.write(kind, id, next);
    return count;
  }

  private async load(
    kind: Kind,
    id: string,
  ): Promise<{ units: Unit[]; translations: Translations }> {
    const record =
      kind === 'package'
        ? await this.prisma.package.findUnique({
            where: { id },
            include: withItinerary,
            omit: { translations: false },
          })
        : await this.prisma.destination.findUnique({
            where: { id },
            omit: { translations: false },
          });
    if (!record)
      throw new NotFoundException(
        `${kind === 'package' ? 'Package' : 'Destination'} "${id}" not found`,
      );
    return {
      units: unitsOf(kind, record),
      translations: readTranslations(record.translations),
    };
  }

  private async write(kind: Kind, id: string, translations: Translations) {
    const data = { translations: translations as Prisma.InputJsonValue };
    if (kind === 'package')
      await this.prisma.package.update({
        where: { id },
        data,
        select: { id: true },
      });
    else
      await this.prisma.destination.update({
        where: { id },
        data,
        select: { id: true },
      });
  }

  private withLock<T>(
    kind: Kind,
    id: string,
    job: () => Promise<T>,
  ): Promise<T> {
    const key = `${kind}:${id}`;
    const previous = this.queue.get(key) ?? Promise.resolve();
    const next = previous.catch(() => undefined).then(job);
    this.queue.set(key, next);
    void next
      .catch(() => undefined)
      .finally(() => {
        if (this.queue.get(key) === next) this.queue.delete(key);
      });
    return next;
  }
}
