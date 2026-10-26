// Bookings. The admin loads and updates them; the website can create one.
// Same pattern as packagesStore.ts.
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api } from "@/lib/api";
import type { Booking, BookingStatus, PaymentStatus } from "@/lib/types";

export type BookingInput = {
  customer: string;
  email: string;
  phone?: string;
  country: string;
  packageId: string;
  startDate: string; // "2026-12-01"
  travelers: number;
  notes?: string;
};

export type BookingChanges = {
  status?: BookingStatus;
  payment?: PaymentStatus;
  notes?: string;
};

type BookingsState = {
  bookings: Booking[];
  loading: boolean;
  error: string | null;

  load: () => Promise<void>; // admin
  createBooking: (input: BookingInput) => Promise<Booking>; // website
  updateBooking: (id: string, changes: BookingChanges) => Promise<Booking>; // admin
  deleteBooking: (id: string) => Promise<void>; // admin
};

export const useBookingsStore = create<BookingsState>()(
  devtools(
    (set) => ({
      bookings: [],
      loading: false,
      error: null,

      load: async () => {
        set({ loading: true, error: null }, false, "bookings/load/start");
        try {
          const bookings = await api<Booking[]>("/bookings", { admin: true });
          set({ bookings, loading: false }, false, "bookings/load/success");
        } catch (error) {
          set({ error: (error as Error).message, loading: false }, false, "bookings/load/error");
        }
      },

      createBooking: async (input) => {
        const created = await api<Booking>("/bookings", { method: "POST", body: input });
        set((state) => ({ bookings: [created, ...state.bookings] }), false, "bookings/create");
        return created;
      },

      updateBooking: async (id, changes) => {
        const updated = await api<Booking>(`/bookings/${id}`, { method: "PATCH", body: changes, admin: true });
        set(
          (state) => ({ bookings: state.bookings.map((b) => (b.id === id ? updated : b)) }),
          false,
          "bookings/update",
        );
        return updated;
      },

      deleteBooking: async (id) => {
        await api(`/bookings/${id}`, { method: "DELETE", admin: true });
        set((state) => ({ bookings: state.bookings.filter((b) => b.id !== id) }), false, "bookings/delete");
      },
    }),
    { name: "bookings" },
  ),
);
