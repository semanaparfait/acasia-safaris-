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
  KINDS,
  LANGUAGES,
  applyAlbum,
  applyDestination,
  applyPackage,
  applyPhoto,
  applyTrip,
  applyWorker,
  prune,
  readTranslations,
  statusOf,
  toTranslate,
  unitsOf,
  type AlbumTexts,
  type DestinationTexts,
  type Kind,
  type Lang,
  type PackageTexts,
  type TripTexts,
  type WorkerTexts,
  type Translations,
  type Unit,
} from './content';
import { MachineTranslate } from './machine-translate';

const withItinerary = { itinerary: { orderBy: { day: 'asc' as const } } };

const NAMES: Record<Kind, string> = {
  package: 'Package',
  destination: 'Destination',
  trip: 'Trip',
  album: 'Album',
  worker: 'Worker',
};

// French and Swahili versions of the packages, destinations, special trips, gallery albums
// (with their photos' titles and places) and team members' titles and bios.
// - After an admin saves a package/destination, the new or changed texts are translated by
//   the translation service in the background (refreshLater). Unchanged texts are never translated twice.
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
    private translator: MachineTranslate,
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

  // A trip in this language (price option names and units stay in English)
  localizeTrip<T extends TripTexts & { translations?: unknown }>(
    trip: T,
    lang?: Lang,
  ) {
    const { translations, ...rest } = trip;
    if (!lang) return rest;
    return applyTrip(
      rest as TripTexts,
      readTranslations(translations)[lang],
    ) as Omit<T, 'translations'>;
  }

  localizeAlbum<T extends AlbumTexts & { translations?: unknown }>(
    album: T,
    lang?: Lang,
  ) {
    const { translations, ...rest } = album;
    if (!lang) return rest;
    return applyAlbum(
      rest as AlbumTexts,
      readTranslations(translations)[lang],
    ) as Omit<T, 'translations'>;
  }

  // Photos in this language, from the translations of their albums
  async localizePhotos<
    T extends { albumId: string; title: string; location?: string | null },
  >(photos: T[], lang?: Lang) {
    if (!lang || !photos.length) return photos;
    const albums = await this.prisma.galleryAlbum.findMany({
      where: { id: { in: [...new Set(photos.map((p) => p.albumId))] } },
      select: { id: true, translations: true },
    });
    const byAlbum = new Map(
      albums.map((a) => [a.id, readTranslations(a.translations)[lang]]),
    );
    return photos.map((p) => applyPhoto(p, byAlbum.get(p.albumId)));
  }

  localizeWorker<T extends WorkerTexts & { translations?: unknown }>(
    worker: T,
    lang?: Lang,
  ) {
    const { translations, ...rest } = worker;
    if (!lang) return rest;
    return applyWorker(
      rest as WorkerTexts,
      readTranslations(translations)[lang],
    ) as Omit<T, 'translations'>;
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
    return { autoTranslate: this.translator.enabled, languages };
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

  // Same, in the background after a save: the admin does not wait for the translation service
  refreshLater(kind: Kind, id: string) {
    void this.withLock(kind, id, () => this.translateRecord(kind, id)).catch(
      (error) =>
        this.logger.error(`Translating ${kind} ${id} failed: ${error}`),
    );
  }

  // Everything (the first time, and each night to catch anything missed)
  async refreshAll() {
    const result: Record<string, number | string> = { texts: 0, failed: 0 };
    if (!this.translator.enabled)
      return { ...result, skipped: 'No translation key is set' };
    for (const kind of KINDS) {
      let done = 0;
      for (const id of await this.ids(kind)) {
        try {
          result.texts =
            (result.texts as number) +
            (await this.withLock(kind, id, () =>
              this.translateRecord(kind, id),
            ));
          done++;
        } catch (error) {
          result.failed = (result.failed as number) + 1;
          this.logger.error(`Translating ${kind} ${id} failed: ${error}`);
        }
      }
      result[`${kind}s`] = done;
    }
    this.logger.log(`Translations: ${JSON.stringify(result)}`);
    return result;
  }

  // The records of a kind worth translating (team: only those shown on the website)
  private async ids(kind: Kind): Promise<string[]> {
    const select = { id: true } as const;
    const rows =
      kind === 'package'
        ? await this.prisma.package.findMany({ select })
        : kind === 'destination'
          ? await this.prisma.destination.findMany({ select })
          : kind === 'trip'
            ? await this.prisma.trip.findMany({ select })
            : kind === 'album'
              ? await this.prisma.galleryAlbum.findMany({ select })
              : await this.prisma.worker.findMany({
                  where: { showOnWebsite: true },
                  select,
                });
    return rows.map((r) => r.id);
  }

  // Shortly after the server starts: translates what is still missing (e.g. the existing
  // packages, the first time the key is set). Nothing is sent to the translation service when all is up to date.
  onApplicationBootstrap() {
    if (!this.translator.enabled || process.env.NODE_ENV === 'test') return;
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
    if (this.translator.enabled) await this.refreshAll().catch(() => undefined); // already logged
  }

  // ---------- Inside ----------

  // Returns how many texts were translated
  private async translateRecord(kind: Kind, id: string) {
    if (!this.translator.enabled) return 0;
    const { units, translations: before } = await this.load(kind, id);

    // Ask the translation service first (slow), then save on top of the latest version
    const fresh: Partial<Record<Lang, Map<string, string>>> = {};
    let count = 0;
    for (const lang of LANGUAGES) {
      const need = toTranslate(before[lang], units);
      if (!need.length) continue;
      const out = await this.translator.translate(
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
    const keep = { translations: false } as const;
    const record: { translations: unknown } | null =
      kind === 'package'
        ? await this.prisma.package.findUnique({
            where: { id },
            include: withItinerary,
            omit: keep,
          })
        : kind === 'destination'
          ? await this.prisma.destination.findUnique({
              where: { id },
              omit: keep,
            })
          : kind === 'trip'
            ? await this.prisma.trip.findUnique({ where: { id }, omit: keep })
            : kind === 'album'
              ? await this.prisma.galleryAlbum.findUnique({
                  where: { id },
                  include: {
                    photos: {
                      orderBy: { createdAt: 'desc' },
                      select: { title: true, location: true },
                    },
                  },
                  omit: keep,
                })
              : await this.prisma.worker.findUnique({
                  where: { id },
                  select: { companyRole: true, bio: true, translations: true },
                });
    if (!record)
      throw new NotFoundException(`${NAMES[kind]} "${id}" not found`);
    return {
      units: unitsOf(kind, record),
      translations: readTranslations(record.translations),
    };
  }

  private async write(kind: Kind, id: string, translations: Translations) {
    const args = {
      where: { id },
      data: { translations: translations as Prisma.InputJsonValue },
      select: { id: true },
    };
    if (kind === 'package') await this.prisma.package.update(args);
    else if (kind === 'destination') await this.prisma.destination.update(args);
    else if (kind === 'trip') await this.prisma.trip.update(args);
    else if (kind === 'album') await this.prisma.galleryAlbum.update(args);
    else await this.prisma.worker.update(args);
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
