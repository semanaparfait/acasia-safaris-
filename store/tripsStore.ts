// Special trips planned by the team (Admin > Trips), each with its own page on the website.
// The website reads the published ones; the "Trips" menu link only shows when there is one.
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api } from "@/lib/api";
import type { Trip, TripInput } from "@/lib/types";

type TripsState = {
  published: Trip[]; // website
  publishedLoaded: boolean;
  loadPublished: () => Promise<void>;

  trips: Trip[]; // admin: every trip
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  getTrip: (id: string) => Promise<Trip>;
  createTrip: (input: TripInput) => Promise<Trip>;
  updateTrip: (id: string, input: TripInput) => Promise<Trip>;
  setActive: (id: string, active: boolean) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
};

// One request per visit, shared by the navbar and the trips page
let publishedRequest: Promise<void> | null = null;

export const useTripsStore = create<TripsState>()(
  devtools(
    (set) => ({
      published: [],
      publishedLoaded: false,
      loadPublished: () => {
        publishedRequest ??= api<Trip[]>("/trips")
          .then((published) => set({ published, publishedLoaded: true }, false, "trips/loadPublished"))
          .catch(() => {
            // Not essential: without it the menu simply has no "Trips" link
            publishedRequest = null;
            set({ publishedLoaded: true }, false, "trips/loadPublished/error");
          });
        return publishedRequest;
      },

      trips: [],
      loading: false,
      error: null,
      loadAll: async () => {
        set({ loading: true, error: null }, false, "trips/loadAll/start");
        try {
          const trips = await api<Trip[]>("/trips/all", { admin: true });
          set({ trips, loading: false }, false, "trips/loadAll/success");
        } catch (error) {
          set({ error: (error as Error).message, loading: false }, false, "trips/loadAll/error");
        }
      },
      getTrip: (id) => api<Trip>(`/trips/all/${id}`, { admin: true }),
      createTrip: async (input) => {
        const trip = await api<Trip>("/trips", { method: "POST", body: input, admin: true });
        set((s) => ({ trips: [trip, ...s.trips] }), false, "trips/create");
        return trip;
      },
      updateTrip: async (id, input) => {
        const trip = await api<Trip>(`/trips/${id}`, { method: "PUT", body: input, admin: true });
        set((s) => ({ trips: s.trips.map((t) => (t.id === id ? trip : t)) }), false, "trips/update");
        return trip;
      },
      setActive: async (id, active) => {
        const trip = await api<Trip>(`/trips/${id}/active`, { method: "PATCH", body: { active }, admin: true });
        set((s) => ({ trips: s.trips.map((t) => (t.id === id ? trip : t)) }), false, "trips/setActive");
      },
      deleteTrip: async (id) => {
        await api(`/trips/${id}`, { method: "DELETE", admin: true });
        set((s) => ({ trips: s.trips.filter((t) => t.id !== id) }), false, "trips/delete");
      },
    }),
    { name: "trips" },
  ),
);
