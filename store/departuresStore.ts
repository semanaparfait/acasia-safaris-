// Group departures: a package on a fixed date that anyone can join.
// The website reads the open ones; Admin > Departures manages them.
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api } from "@/lib/api";
import type { AdminDeparture, Departure } from "@/lib/types";

export type DepartureInput = {
  packageId: string;
  startDate: string; // "2026-12-01"
  seats: number;
  note?: string;
  open?: boolean;
};

type DeparturesState = {
  open: Departure[]; // website: upcoming departures with seats
  openLoaded: boolean;
  loadOpen: () => Promise<void>;

  all: AdminDeparture[]; // admin
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  createDeparture: (input: DepartureInput) => Promise<void>;
  updateDeparture: (id: string, changes: Partial<Omit<DepartureInput, "packageId">>) => Promise<void>;
  deleteDeparture: (id: string) => Promise<void>;
};

export const useDeparturesStore = create<DeparturesState>()(
  devtools(
    (set) => ({
      open: [],
      openLoaded: false,
      loadOpen: async () => {
        try {
          const open = await api<Departure[]>("/departures");
          set({ open, openLoaded: true }, false, "departures/loadOpen");
        } catch {
          // Not essential: the page works without them
          set({ openLoaded: true }, false, "departures/loadOpen/error");
        }
      },

      all: [],
      loading: false,
      error: null,
      loadAll: async () => {
        set({ loading: true, error: null }, false, "departures/loadAll/start");
        try {
          const all = await api<AdminDeparture[]>("/departures/all", { admin: true });
          set({ all, loading: false }, false, "departures/loadAll/success");
        } catch (error) {
          set({ error: (error as Error).message, loading: false }, false, "departures/loadAll/error");
        }
      },
      // Each change returns the whole list again (seats taken are worked out by the server)
      createDeparture: async (input) => {
        const all = await api<AdminDeparture[]>("/departures", { method: "POST", body: input, admin: true });
        set({ all }, false, "departures/create");
      },
      updateDeparture: async (id, changes) => {
        const all = await api<AdminDeparture[]>(`/departures/${id}`, { method: "PATCH", body: changes, admin: true });
        set({ all }, false, "departures/update");
      },
      deleteDeparture: async (id) => {
        const all = await api<AdminDeparture[]>(`/departures/${id}`, { method: "DELETE", admin: true });
        set({ all }, false, "departures/delete");
      },
    }),
    { name: "departures" },
  ),
);
