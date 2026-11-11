"use client";

// Prices on the website. The real price is always in USD (what is charged);
// in another currency an estimate is added: "$1,450 ≈ €1,330".
import { useEffect, useSyncExternalStore } from "react";
import { CURRENCIES, CURRENCY_NAMES, guessCurrency, useCurrencyStore, type Currency } from "@/store/currencyStore";

let ratesRequested = false;
const noSubscribe = () => () => {};

// The visitor's currency (guessed the first time) and its live rate
export function useCurrency() {
  const chosen = useCurrencyStore((s) => s.currency);
  const rates = useCurrencyStore((s) => s.rates);
  const loadRates = useCurrencyStore((s) => s.loadRates);
  useEffect(() => {
    if (ratesRequested) return;
    ratesRequested = true;
    loadRates();
  }, [loadRates]);

  // USD while rendering on the server: the visitor's currency is only known in the browser
  const inBrowser = useSyncExternalStore(noSubscribe, () => true, () => false);
  const currency: Currency = inBrowser ? (chosen ?? guessCurrency()) : "USD";
  const rate = rates[currency];
  return { currency, rate: rate ?? null };
}

// "$1,450"
export const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

// "€1,330", "RWF 2,031,000"
export function inCurrency(n: number, currency: Currency, rate: number) {
  const value = n * rate;
  // Large currencies are rounded to look like real prices
  const rounded = currency === "RWF" || currency === "KES" ? Math.round(value / 100) * 100 : Math.round(value);
  return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(rounded);
}

// "$1,450" + " ≈ €1,330" (the estimate is hidden for USD, or before the rates load)
export function Money({ usd: amount, className = "", approxClassName = "" }: { usd: number; className?: string; approxClassName?: string }) {
  const { currency, rate } = useCurrency();
  return (
    <span className={className}>
      {usd(amount)}
      {currency !== "USD" && rate && (
        <span className={`ml-1.5 text-[0.75em] font-normal opacity-60 whitespace-nowrap ${approxClassName}`} title={`Estimate in ${CURRENCY_NAMES[currency]}, at today's rate. You pay in US dollars.`}>
          ≈ {inCurrency(amount, currency, rate)}
        </span>
      )}
    </span>
  );
}

// Plain text version, for button labels: "$1,450 (≈ €1,330)"
export function useMoneyText() {
  const { currency, rate } = useCurrency();
  return (amount: number) =>
    currency !== "USD" && rate ? `${usd(amount)} (≈ ${inCurrency(amount, currency, rate)})` : usd(amount);
}

// A small select: "USD $", "EUR €"…
// compact: only the code ("EUR") in the closed menu, for the desktop navbar
export function CurrencyPicker({ className = "", dark = false, compact = false }: { className?: string; dark?: boolean; compact?: boolean }) {
  const { currency } = useCurrency();
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  return (
    <select
      aria-label="Currency"
      value={currency}
      onChange={(e) => setCurrency(e.target.value as Currency)}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer ${
        dark ? "border-white/20 bg-white/10 text-white [&>option]:text-[#0a120b]" : "border-[#0a120b]/15 bg-white text-[#0a120b]"
      } ${className}`}
    >
      {CURRENCIES.map((c) => (
        <option key={c} value={c} title={CURRENCY_NAMES[c]}>
          {compact ? c : `${c} · ${CURRENCY_NAMES[c]}`}
        </option>
      ))}
    </select>
  );
}
