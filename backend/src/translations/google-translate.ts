import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Lang } from './content';

// Google Cloud Translation (Basic, v2): https://cloud.google.com/translate/docs/reference/rest/v2/translate
// The key is set in .env (GOOGLE_TRANSLATE_API_KEY). Without it, nothing is translated
// automatically: admins can still write the translations by hand.
const URL = 'https://translation.googleapis.com/language/translate/v2';

// Google's limits per request: 128 texts, and about 30,000 characters (we stay well below)
const MAX_TEXTS = 100;
const MAX_CHARS = 20_000;

@Injectable()
export class GoogleTranslate {
  private readonly logger = new Logger(GoogleTranslate.name);
  private readonly key: string;

  constructor(config: ConfigService) {
    this.key = (config.get<string>('GOOGLE_TRANSLATE_API_KEY') ?? '').trim();
    if (!this.key) {
      this.logger.warn(
        'GOOGLE_TRANSLATE_API_KEY is not set: packages and destinations are not translated automatically',
      );
    }
  }

  get enabled() {
    return this.key !== '';
  }

  // English texts -> the same texts in the language, in the same order
  async translate(texts: string[], target: Lang): Promise<string[]> {
    if (!this.enabled)
      throw new Error(
        'Automatic translation is not set up (GOOGLE_TRANSLATE_API_KEY)',
      );
    const out: string[] = [];
    for (const batch of batches(texts))
      out.push(...(await this.request(batch, target)));
    return out;
  }

  private async request(q: string[], target: Lang): Promise<string[]> {
    const res = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.key, // in a header, so the key never appears in a URL or a log
      },
      body: JSON.stringify({ q, source: 'en', target, format: 'text' }),
      signal: AbortSignal.timeout(20_000),
    });
    const data = (await res.json().catch(() => null)) as {
      data?: { translations?: { translatedText: string }[] };
      error?: { message?: string };
    } | null;
    if (!res.ok) {
      throw new Error(
        `Google Translate ${res.status}: ${data?.error?.message ?? 'request failed'}`,
      );
    }
    const translations = data?.data?.translations ?? [];
    if (translations.length !== q.length)
      throw new Error('Google Translate: unexpected answer');
    return translations.map((t) => t.translatedText);
  }
}

// Splits the texts into requests Google accepts
export function batches(texts: string[]): string[][] {
  const out: string[][] = [];
  let current: string[] = [];
  let chars = 0;
  for (const text of texts) {
    if (
      current.length &&
      (current.length >= MAX_TEXTS || chars + text.length > MAX_CHARS)
    ) {
      out.push(current);
      current = [];
      chars = 0;
    }
    current.push(text);
    chars += text.length;
  }
  if (current.length) out.push(current);
  return out;
}
