import { parsePhoneNumberFromString } from 'libphonenumber-js';

// "+250 788 123 456", "0788123456" (Rwanda by default) -> "+250788123456".
// A number that cannot be understood is kept as it was typed.
export function toE164(phone?: string | null, defaultCountry: 'RW' = 'RW') {
  const text = phone?.trim();
  if (!text) return undefined;
  const parsed = parsePhoneNumberFromString(text, defaultCountry);
  return parsed?.isValid() ? parsed.number : text;
}
