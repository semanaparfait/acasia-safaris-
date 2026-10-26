// Destinations, loaded from the API. Same pattern as packagesStore.ts.
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api } from "@/lib/api";
import type { Destination, DestinationInput } from "@/lib/types";

type DestinationsState = {
  destinations: Destination[];
  loading: boolean;
  error: string | null;

  load: () => Promise<void>;
  createDestination: (input: DestinationInput) => Promise<Destination>;
  updateDestination: (id: string, input: DestinationInput) => Promise<Destination>;
  deleteDestination: (id: string) => Promise<void>;
};

export const useDestinationsStore = create<DestinationsState>()(
  devtools(
    (set) => ({
      destinations: [],
      loading: false,
      error: null,

      load: async () => {
        set({ loading: true, error: null }, false, "destinations/load/start");
        try {
          const destinations = await api<Destination[]>("/destinations");
          set({ destinations, loading: false }, false, "destinations/load/success");
        } catch (error) {
          set({ error: (error as Error).message, loading: false }, false, "destinations/load/error");
        }
      },

      createDestination: async (input) => {
        const created = await api<Destination>("/destinations", { method: "POST", body: input, admin: true });
        set((state) => ({ destinations: [...state.destinations, created] }), false, "destinations/create");
        return created;
      },

      updateDestination: async (id, input) => {
        const updated = await api<Destination>(`/destinations/${id}`, { method: "PUT", body: input, admin: true });
        set(
          (state) => ({ destinations: state.destinations.map((d) => (d.id === id ? updated : d)) }),
          false,
          "destinations/update",
        );
        return updated;
      },

      deleteDestination: async (id) => {
        await api(`/destinations/${id}`, { method: "DELETE", admin: true });
        set(
          (state) => ({ destinations: state.destinations.filter((d) => d.id !== id) }),
          false,
          "destinations/delete",
        );
      },
    }),
    { name: "destinations" },
  ),
);
