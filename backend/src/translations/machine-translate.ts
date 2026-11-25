import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Lang } from './content';

// Automatic translation of the English texts into French and Swahili, by one of:
//   - Azure AI Translator (free tier: 2 million characters a month, never charged):
//       AZURE_TRANSLATOR_KEY + AZURE_TRANSLATOR_REGION (e.g. "switzerlandnorth")
//       https://learn.microsoft.com/azure/ai-services/translator/text-translation/reference/v3/translate
//   - Google Cloud Translation (Basic, v2): GOOGLE_TRANSLATE_API_KEY
// Azure is used when both are set. Without either, nothing is translated automatically:
// admins can still write the translations by hand.

// Each service's limits per request (we stay well below)
const LIMITS = {
  azure: { texts: 500, chars: 40_000 },
  google: { texts: 100, chars: 20_000 },
};

// Errors from the translation service start with this (shown to the admin as a 400)
export const TRANSLATION_ERROR = 'Translation service';

type Provider = 'azure' | 'google';

@Injectable()
export class MachineTranslate {
  private readonly logger = new Logger(MachineTranslate.name);
  private readonly azureKey: string;
  private readonly azureRegion: string;
  private readonly azureEndpoint: string;
  private readonly googleKey: string;
  readonly provider: Provider | null;

  constructor(config: ConfigService) {
    const get = (name: string) => (config.get<string>(name) ?? '').trim();
    this.azureKey = get('AZURE_TRANSLATOR_KEY');
    this.azureRegion = get('AZURE_TRANSLATOR_REGION');
    this.azureEndpoint = (
      get('AZURE_TRANSLATOR_ENDPOINT') ||
      'https://api.cognitive.microsofttranslator.com'
    ).replace(/\/$/, '');
    this.googleKey = get('GOOGLE_TRANSLATE_API_KEY');
    this.provider = this.azureKey ? 'azure' : this.googleKey ? 'google' : null;

    if (this.provider) {
      this.logger.log(
        `Automatic translation by ${this.provider === 'azure' ? 'Azure AI Translator' : 'Google Cloud Translation'}`,
      );
    } else {
      this.logger.warn(
        'No translation key (AZURE_TRANSLATOR_KEY or GOOGLE_TRANSLATE_API_KEY): packages and destinations are not translated automatically',
      );
    }
  }

  get enabled() {
    return this.provider !== null;
  }

  // English texts -> the same texts in the language, in the same order
  async translate(texts: string[], target: Lang): Promise<string[]> {
    if (!this.provider) {
      throw new Error(
        'Automatic translation is not set up (AZURE_TRANSLATOR_KEY or GOOGLE_TRANSLATE_API_KEY)',
      );
    }
    const out: string[] = [];
    for (const batch of batches(texts, LIMITS[this.provider])) {
      out.push(
        ...(await (this.provider === 'azure'
          ? this.azure(batch, target)
          : this.google(batch, target))),
      );
    }
    return out;
  }

  private async azure(texts: string[], target: Lang): Promise<string[]> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': this.azureKey, // in a header, never in a URL or a log
    };
    // Needed for a resource made in a region (not "global")
    if (this.azureRegion)
      headers['Ocp-Apim-Subscription-Region'] = this.azureRegion;

    const res = await fetch(
      `${this.azureEndpoint}/translate?api-version=3.0&from=en&to=${target}&textType=plain`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(texts.map((Text) => ({ Text }))),
        signal: AbortSignal.timeout(20_000),
      },
    );
    const data = (await res.json().catch(() => null)) as
      | { translations?: { text: string }[] }[]
      | { error?: { code?: number; message?: string } }
      | null;
    if (!res.ok || !Array.isArray(data)) {
      const message =
        (data && !Array.isArray(data) && data.error?.message) ||
        'request failed';
      throw new Error(`${TRANSLATION_ERROR} (Azure ${res.status}): ${message}`);
    }
    if (data.length !== texts.length) {
      throw new Error(`${TRANSLATION_ERROR} (Azure): unexpected answer`);
    }
    return data.map((item) => item.translations?.[0]?.text ?? '');
  }

  private async google(q: string[], target: Lang): Promise<string[]> {
    const res = await fetch(
      'https://translation.googleapis.com/language/translate/v2',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.googleKey, // in a header, never in a URL or a log
        },
        body: JSON.stringify({ q, source: 'en', target, format: 'text' }),
        signal: AbortSignal.timeout(20_000),
      },
    );
    const data = (await res.json().catch(() => null)) as {
      data?: { translations?: { translatedText: string }[] };
      error?: { message?: string };
    } | null;
    if (!res.ok) {
      throw new Error(
        `${TRANSLATION_ERROR} (Google ${res.status}): ${data?.error?.message ?? 'request failed'}`,
      );
    }
    const translations = data?.data?.translations ?? [];
    if (translations.length !== q.length) {
      throw new Error(`${TRANSLATION_ERROR} (Google): unexpected answer`);
    }
    return translations.map((t) => t.translatedText);
  }
}

// Splits the texts into requests the service accepts
export function batches(
  texts: string[],
  limit: { texts: number; chars: number } = LIMITS.google,
): string[][] {
  const out: string[][] = [];
  let current: string[] = [];
  let chars = 0;
  for (const text of texts) {
    if (
      current.length &&
      (current.length >= limit.texts || chars + text.length > limit.chars)
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
