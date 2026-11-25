"use client";

// Scrolling the page with the mouse wheel over a selected number field must not change its
// value (a price or a number of travelers could change without anyone noticing).
// The field lets go, so the page scrolls as usual.
import { useEffect } from "react";

export default function NumberInputGuard() {
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const el = e.target;
      if (el instanceof HTMLInputElement && el.type === "number" && el === document.activeElement) el.blur();
    };
    document.addEventListener("wheel", onWheel, { passive: true });
    return () => document.removeEventListener("wheel", onWheel);
  }, []);
  return null;
}
