// The currency a visitor sees prices in (bookings are always charged in USD).
// Live rates come from GET /api/rates. The first time, the currency is guessed from
// the browser's language/country; the visitor can change it, and it is remembered.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

export const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "KES", "RWF"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_NAMES: Record<Currency, string> = {
  USD: "US dollar",
  EUR: "Euro",
  GBP: "British pound",
  CAD: "Canadian dollar",
  KES: "Kenyan shilling",
  RWF: "Rwandan franc",
};

const EURO_COUNTRIES = ["AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK"];

// "fr-BE" -> EUR, "en-GB" -> GBP, "fr-CA" -> CAD, "rw-RW" -> RWF, else USD
export function guessCurrency(): Currency {
  if (typeof navigator === "undefined") return "USD";
  for (const lang of navigator.languages ?? [navigator.language]) {
    const country = lang.split("-")[1]?.toUpperCase();
    if (!country) continue;
    if (country === "GB") return "GBP";
    if (country === "CA") return "CAD";
    if (country === "KE") return "KES";
    if (country === "RW") return "RWF";
    if (EURO_COUNTRIES.includes(country)) return "EUR";
    return "USD";
  }
  return "USD";
}

type CurrencyState = {
  currency: Currency | null; // null = not chosen yet (guessed)
  rates: Partial<Record<Currency, number>>; // 1 USD = rates[X] X
  updatedAt: string | null;
  setCurrency: (c: Currency) => void;
  loadRates: () => Promise<void>;
};

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: null,
      rates: { USD: 1 },
      updatedAt: null,
      setCurrency: (currency) => set({ currency }),
      loadRates: async () => {
        try {
          const data = await api<{ rates: Partial<Record<Currency, number>>; updatedAt: string | null }>("/rates");
          set({ rates: data.rates, updatedAt: data.updatedAt });
        } catch {
          // Offline: keep the last rates (or USD only)
        }
      },
    }),
    { name: "acacia-currency", partialize: (s) => ({ currency: s.currency }) },
  ),
);
