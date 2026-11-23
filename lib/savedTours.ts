// Packages the visitor saved with the heart, kept in this browser (no account needed).
// Shown on /saved and counted next to the menu.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { track } from "./analytics";

type SavedToursState = {
  ids: string[]; // newest first
  toggle: (id: string) => void;
  remove: (id: string) => void;
};

export const useSavedTours = create<SavedToursState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const saved = get().ids.includes(id);
        if (!saved) track("tour-saved", { package: id });
        set({ ids: saved ? get().ids.filter((x) => x !== id) : [id, ...get().ids].slice(0, 50) });
      },
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
    }),
    { name: "acacia-saved-tours" },
  ),
);
