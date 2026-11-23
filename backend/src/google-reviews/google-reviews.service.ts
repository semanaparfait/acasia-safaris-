import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

// Our Google rating and up to 5 reviews (Google chooses them), from the Places API (New).
// Fetched at most once a day per language and kept in memory: Google does not allow
// keeping reviews for long, and a daily refresh keeps the cost near zero.
//
// .env:
//   GOOGLE_PLACES_API_KEY  key with "Places API (New)" enabled (falls back to GOOGLE_TRANSLATE_API_KEY)
//   GOOGLE_PLACE_ID        optional; without it, the place is found once by name and
//   GOOGLE_MAPS_CID        the number in our Google Maps listing (from the review link)
//   GOOGLE_PLACE_QUERY     optional search text, default "Acacia Safaris Rwanda"
const API = 'https://places.googleapis.com/v1';
const LANGS = ['en', 'fr', 'sw'] as const;
type Lang = (typeof LANGS)[number];
const DAY = 24 * 60 * 60 * 1000;

export type GoogleReview = {
  author: string;
  authorUrl: string | null; // the reviewer's Google profile (required by Google)
  photo: string | null;
  rating: number;
  text: string;
  when: string; // "2 weeks ago", in the requested language
  publishedAt: string | null;
  url: string | null; // the review on Google Maps
};

export type GoogleProfile = {
  rating: number;
  total: number;
  mapsUrl: string | null;
};

export type GoogleReviews =
  | { available: false }
  | {
      available: true;
      rating: number;
      total: number;
      mapsUrl: string | null;
      reviews: GoogleReview[];
    };

type PlaceResponse = {
  id?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: {
    rating?: number;
    text?: { text?: string };
    originalText?: { text?: string };
    relativePublishTimeDescription?: string;
    publishTime?: string;
    googleMapsUri?: string;
    authorAttribution?: {
      displayName?: string;
      uri?: string;
      photoUri?: string;
    };
  }[];
};

@Injectable()
export class GoogleReviewsService {
  private readonly logger = new Logger(GoogleReviewsService.name);
  private cache = new Map<Lang, { at: number; data: GoogleReviews }>();
  private placeId: string | null;
  private loading = new Map<Lang, Promise<GoogleReviews>>();

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.placeId = (config.get<string>('GOOGLE_PLACE_ID') ?? '').trim() || null;
  }

  private get key() {
    return (
      this.config.get<string>('GOOGLE_PLACES_API_KEY') ??
      this.config.get<string>('GOOGLE_TRANSLATE_API_KEY') ??
      ''
    ).trim();
  }

  // The rating typed in Admin > Reviews (used while the Google API is not working)
  async getProfile(): Promise<GoogleProfile> {
    const row = await this.prisma.setting.findUnique({
      where: { key: 'googleProfile' },
    });
    const v = (row?.value ?? {}) as Partial<GoogleProfile>;
    return {
      rating: v.rating ?? 0,
      total: v.total ?? 0,
      mapsUrl: v.mapsUrl ?? null,
    };
  }

  async setProfile(profile: GoogleProfile) {
    const value = {
      rating: profile.rating,
      total: profile.total,
      mapsUrl: profile.mapsUrl || null,
    };
    await this.prisma.setting.upsert({
      where: { key: 'googleProfile' },
      create: { key: 'googleProfile', value },
      update: { value },
    });
    return value;
  }

  // From the API when it works; otherwise the rating and Google reviews added by hand
  async get(lang: string): Promise<GoogleReviews> {
    const live = await this.fromApi(lang);
    return live.available ? live : this.manual();
  }

  private async manual(): Promise<GoogleReviews> {
    const profile = await this.getProfile();
    const reviews = await this.prisma.review.findMany({
      where: { source: 'Google', status: 'Published' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    if (!profile.total && !reviews.length) return { available: false };
    return {
      available: true,
      rating: profile.rating,
      total: profile.total,
      mapsUrl: profile.mapsUrl,
      reviews: reviews.map((r) => ({
        author: r.name,
        authorUrl: null,
        photo: null,
        rating: r.rating,
        text: r.text,
        when: '', // the website writes the date in the visitor's language
        publishedAt: r.createdAt.toISOString(),
        url: r.sourceUrl ?? profile.mapsUrl,
      })),
    };
  }

  private async fromApi(lang: string): Promise<GoogleReviews> {
    const l: Lang = (LANGS as readonly string[]).includes(lang)
      ? (lang as Lang)
      : 'en';
    const cached = this.cache.get(l);
    if (cached && Date.now() - cached.at < DAY) return cached.data;
    // One request at a time per language, even if many visitors arrive together
    let pending = this.loading.get(l);
    if (!pending) {
      pending = this.fetch(l).finally(() => this.loading.delete(l));
      this.loading.set(l, pending);
    }
    const data = await pending;
    // A failure keeps yesterday's reviews (if any) and tries again in an hour
    if (data.available || !cached) {
      this.cache.set(l, {
        at: data.available ? Date.now() : Date.now() - DAY + 3_600_000,
        data,
      });
      return data;
    }
    cached.at = Date.now() - DAY + 3_600_000;
    return cached.data;
  }

  // Every morning: fresh reviews before the first visitors
  @Cron('0 6 * * *', { name: 'google-reviews', timeZone: 'Africa/Kigali' })
  async refresh() {
    this.cache.clear();
    for (const lang of LANGS) await this.fromApi(lang);
  }

  private async fetch(lang: Lang): Promise<GoogleReviews> {
    if (!this.key) return { available: false };
    try {
      const placeId = await this.findPlaceId();
      if (!placeId) return { available: false };
      const response = await fetch(
        `${API}/places/${encodeURIComponent(placeId)}?languageCode=${lang}`,
        {
          headers: {
            'X-Goog-Api-Key': this.key,
            'X-Goog-FieldMask':
              'id,rating,userRatingCount,googleMapsUri,reviews',
          },
        },
      );
      if (!response.ok)
        throw new Error(`${response.status} ${await response.text()}`);
      const place = (await response.json()) as PlaceResponse;
      return {
        available: true,
        rating: place.rating ?? 0,
        total: place.userRatingCount ?? 0,
        mapsUrl: place.googleMapsUri ?? null,
        reviews: (place.reviews ?? [])
          .filter((r) => (r.text?.text ?? r.originalText?.text ?? '').trim())
          .map((r) => ({
            author: r.authorAttribution?.displayName ?? 'Google user',
            authorUrl: r.authorAttribution?.uri ?? null,
            photo: r.authorAttribution?.photoUri ?? null,
            rating: r.rating ?? 5,
            text: (r.text?.text ?? r.originalText?.text ?? '').trim(),
            when: r.relativePublishTimeDescription ?? '',
            publishedAt: r.publishTime ?? null,
            url: r.googleMapsUri ?? null,
          })),
      };
    } catch (error) {
      this.logger.error(`Google reviews could not be loaded: ${error}`);
      return { available: false };
    }
  }

  // Without GOOGLE_PLACE_ID: search our name once and keep the result whose Google Maps
  // link has our CID, so another business with a similar name is never picked
  private async findPlaceId() {
    if (this.placeId) return this.placeId;
    const cid = (this.config.get<string>('GOOGLE_MAPS_CID') ?? '').trim();
    if (!cid) {
      this.logger.warn(
        'Set GOOGLE_PLACE_ID or GOOGLE_MAPS_CID to show Google reviews',
      );
      return null;
    }
    const response = await fetch(`${API}/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.key,
        'X-Goog-FieldMask': 'places.id,places.googleMapsUri,places.displayName',
      },
      body: JSON.stringify({
        textQuery:
          this.config.get<string>('GOOGLE_PLACE_QUERY') ??
          'Acacia Safaris Rwanda',
        regionCode: 'RW',
      }),
    });
    if (!response.ok)
      throw new Error(`${response.status} ${await response.text()}`);
    const { places = [] } = (await response.json()) as {
      places?: { id: string; googleMapsUri?: string }[];
    };
    const found = places.find((p) => p.googleMapsUri?.includes(`cid=${cid}`));
    if (!found) {
      this.logger.warn(
        `No Google place with CID ${cid} in the search results. Set GOOGLE_PLACE_ID in .env.`,
      );
      return null;
    }
    this.logger.log(
      `Google place found: set GOOGLE_PLACE_ID="${found.id}" in .env to skip the search`,
    );
    this.placeId = found.id;
    return found.id;
  }
}
