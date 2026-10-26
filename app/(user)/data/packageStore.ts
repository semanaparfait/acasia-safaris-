"use client";

// Shared package store used by both the website and the admin panel.
// Mock persistence: changes are saved in this browser's localStorage, so an admin
// edit shows up on /tour right away (also in other tabs). When the backend exists,
// replace read/setPackages with API calls and keep the same hook signature.
import { useSyncExternalStore, type SetStateAction } from "react";
import { packageList, type TourPackage } from "./packages";

const KEY = "acacia.packages.v1";
const listeners = new Set<() => void>();
let cache: TourPackage[] | null = null;

function read(): TourPackage[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as TourPackage[]) : packageList;
  } catch {
    cache = packageList;
  }
  return cache;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function setPackages(update: SetStateAction<TourPackage[]>) {
  cache = typeof update === "function" ? update(read()) : update;
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // storage unavailable: keep the change in memory only
  }
  listeners.forEach((l) => l());
}

export function resetPackages() {
  setPackages(packageList);
}

/** All packages, including drafts (admin). */
export function usePackages() {
  return useSyncExternalStore(subscribe, read, () => packageList);
}

/** Only packages published on the website. */
export function usePublishedPackages() {
  return usePackages().filter((p) => p.active);
}
