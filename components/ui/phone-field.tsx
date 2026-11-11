"use client";

// Phone / WhatsApp number with a country picker (flag + dial code).
// The value is always international, e.g. "+250788123456", so WhatsApp links
// (wa.me/250788123456) and calls work from anywhere. "" when empty.
import { useSyncExternalStore } from "react";
import PhoneInput, { isValidPhoneNumber, parsePhoneNumber, type Country } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";

export { isValidPhoneNumber };

const noSubscribe = () => () => {};

// The visitor's country from the browser ("en-GB" -> GB), Rwanda if unknown
function guessCountry(): Country {
  for (const lang of navigator.languages ?? [navigator.language]) {
    const region = lang.split("-")[1]?.toUpperCase();
    if (region && /^[A-Z]{2}$/.test(region)) return region as Country;
  }
  return "RW";
}

export function PhoneField({
  id,
  value,
  onChange,
  className,
  required,
  placeholder = "Phone or WhatsApp number",
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className: string; // the page's input style: the field is drawn around the flag and the number
  required?: boolean;
  placeholder?: string;
}) {
  const country = useSyncExternalStore(noSubscribe, guessCountry, () => "RW" as Country);
  // Numbers saved before the picker existed ("0788 123 456") are read as Rwandan
  const shown = value && !value.startsWith("+") ? (parsePhoneNumber(value, "RW")?.number ?? "") : value;
  return (
    <PhoneInput
      id={id}
      flags={flags}
      international
      countryCallingCodeEditable={false}
      defaultCountry={country}
      value={shown || undefined}
      onChange={(v) => onChange(v ?? "")}
      placeholder={placeholder}
      autoComplete="tel"
      required={required}
      className={`${className} acacia-phone flex items-center gap-2 focus-within:border-[#c5a86d]`}
      numberInputProps={{ className: "flex-1 min-w-0 bg-transparent outline-none border-0 p-0 text-inherit" }}
    />
  );
}
