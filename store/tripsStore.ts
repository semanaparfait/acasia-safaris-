// Special trips planned by the team (Admin > Trips), each with its own page on the website,
// and who booked them. The website reads the published ones; the "Trips" menu link only
// shows when there is one.
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api } from "@/lib/api";
import type { AdminTrip, Trip, TripBooking, TripBookingInput, TripInput, TripTicket } from "@/lib/types";

type BookingChanges = Partial<Pick<TripBooking, "status" | "payment" | "notes" | "travelers">>;

type TripsState = {
  published: Trip[]; // website
  publishedLoaded: boolean;
  loadPublished: () => Promise<void>;
  book: (tripId: string, input: TripBookingInput) => Promise<void>; // website

  trips: AdminTrip[]; // admin: every trip with its booking numbers
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  getTrip: (id: string) => Promise<AdminTrip>;
  createTrip: (input: TripInput) => Promise<AdminTrip>;
  updateTrip: (id: string, input: TripInput) => Promise<AdminTrip>;
  setActive: (id: string, active: boolean) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;

  // Admin: who booked each trip, by trip id
  bookings: Record<string, TripBooking[]>;
  loadBookings: (tripId: string) => Promise<void>;
  updateBooking: (booking: TripBooking, changes: BookingChanges) => Promise<void>;
  deleteBooking: (booking: TripBooking) => Promise<void>;
  sendTicket: (booking: TripBooking) => Promise<void>; // email the ticket + receipt again
  // Admin > Check-in
  findTicket: (code: string) => Promise<TripTicket>;
  checkInTicket: (code: string) => Promise<{ booking: TripTicket; alreadyCheckedIn: boolean }>;
  // Live updates (AdminShell)
  upsertBooking: (booking: TripBooking) => void;
  removeBooking: (id: string, tripId: string) => void;
};

// One request per visit, shared by the navbar and the trips page
let publishedRequest: Promise<void> | null = null;

const replaceTrip = (trips: AdminTrip[], trip: AdminTrip) => trips.map((t) => (t.id === trip.id ? trip : t));

export const useTripsStore = create<TripsState>()(
  devtools(
    (set, get) => ({
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
      book: async (tripId, input) => {
        await api(`/trips/${tripId}/bookings`, { method: "POST", body: input });
      },

      trips: [],
      loading: false,
      error: null,
      loadAll: async () => {
        set({ loading: get().trips.length === 0, error: null }, false, "trips/loadAll/start");
        try {
          const trips = await api<AdminTrip[]>("/trips/all", { admin: true });
          set({ trips, loading: false }, false, "trips/loadAll/success");
        } catch (error) {
          set({ error: (error as Error).message, loading: false }, false, "trips/loadAll/error");
        }
      },
      getTrip: (id) => api<AdminTrip>(`/trips/all/${id}`, { admin: true }),
      createTrip: async (input) => {
        const trip = await api<AdminTrip>("/trips", { method: "POST", body: input, admin: true });
        set((s) => ({ trips: [trip, ...s.trips] }), false, "trips/create");
        return trip;
      },
      updateTrip: async (id, input) => {
        const trip = await api<AdminTrip>(`/trips/${id}`, { method: "PUT", body: input, admin: true });
        set((s) => ({ trips: replaceTrip(s.trips, trip) }), false, "trips/update");
        return trip;
      },
      setActive: async (id, active) => {
        const trip = await api<AdminTrip>(`/trips/${id}/active`, { method: "PATCH", body: { active }, admin: true });
        set((s) => ({ trips: replaceTrip(s.trips, trip) }), false, "trips/setActive");
      },
      deleteTrip: async (id) => {
        await api(`/trips/${id}`, { method: "DELETE", admin: true });
        set((s) => ({ trips: s.trips.filter((t) => t.id !== id) }), false, "trips/delete");
      },

      bookings: {},
      loadBookings: async (tripId) => {
        const list = await api<TripBooking[]>(`/trips/all/${tripId}/bookings`, { admin: true });
        set((s) => ({ bookings: { ...s.bookings, [tripId]: list } }), false, "trips/loadBookings");
      },
      updateBooking: async (booking, changes) => {
        const saved = await api<TripBooking>(`/trips/bookings/${booking.id}`, { method: "PATCH", body: changes, admin: true });
        get().upsertBooking(saved);
      },
      deleteBooking: async (booking) => {
        await api(`/trips/bookings/${booking.id}`, { method: "DELETE", admin: true });
        get().removeBooking(booking.id, booking.tripId);
      },
      sendTicket: async (booking) => {
        const saved = await api<TripBooking>(`/trips/bookings/${booking.id}/send-ticket`, { method: "POST", admin: true });
        get().upsertBooking(saved);
      },
      findTicket: (code) => api<TripTicket>(`/trips/tickets/${encodeURIComponent(code)}`, { admin: true }),
      checkInTicket: (code) =>
        api<{ booking: TripTicket; alreadyCheckedIn: boolean }>(`/trips/tickets/${encodeURIComponent(code)}/check-in`, { method: "POST", admin: true }),
      // The trip's numbers (seats, new bookings) come from the server: reload them
      upsertBooking: (booking) => {
        set(
          (s) => {
            const list = s.bookings[booking.tripId];
            if (!list) return {};
            const exists = list.some((b) => b.id === booking.id);
            const next = exists ? list.map((b) => (b.id === booking.id ? booking : b)) : [booking, ...list];
            return { bookings: { ...s.bookings, [booking.tripId]: next } };
          },
          false,
          "trips/upsertBooking",
        );
        get().loadAll();
      },
      removeBooking: (id, tripId) => {
        set(
          (s) => (s.bookings[tripId] ? { bookings: { ...s.bookings, [tripId]: s.bookings[tripId].filter((b) => b.id !== id) } } : {}),
          false,
          "trips/removeBooking",
        );
        get().loadAll();
      },
    }),
    { name: "trips" },
  ),
);
