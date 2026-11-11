// Bookings. The admin loads and updates them; the website can create one.
// Same pattern as packagesStore.ts.
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api } from "@/lib/api";
import type { Booking, BookingDestination, BookingStatus, PaymentStatus, PublicBooking } from "@/lib/types";

// A booking is for a package (packageId) or for destinations (destinations + endDate)
export type BookingInput = {
  customer: string;
  email: string;
  phone?: string;
  country: string;
  packageId?: string;
  destinations?: BookingDestination[];
  startDate: string; // "2026-12-01"
  endDate?: string;
  travelers: number;
  children?: number;
  notes?: string;
  guests?: { label: string; count: number }[]; // package bookings: travelers per price group
  offer?: number; // package bookings: a lower total price the visitor asks for
  offerNote?: string; // why they ask for it
  locale?: string; // the website's language ("en", "fr", "sw"): emails are sent in it
};

export type BookingChanges = {
  status?: BookingStatus;
  payment?: PaymentStatus;
  amount?: number;
  notes?: string;
};

type BookingsState = {
  bookings: Booking[];
  loading: boolean;
  error: string | null;

  load: () => Promise<void>; // admin
  // Website: returns the visitor's view of the booking and its private link token
  createBooking: (input: BookingInput) => Promise<PublicBooking & { accessToken: string }>;
  // Admin: write to the customer (optionally with a new price), or accept their price
  sendMessage: (id: string, text: string, offer?: number) => Promise<Booking>;
  acceptOffer: (id: string) => Promise<Booking>;
  // Live updates (lib/live.ts): put a changed booking in the list, or take a deleted one out
  upsertBooking: (booking: Booking) => void;
  removeBooking: (id: string) => void;
  // Admin > Check-in: find a ticket from its QR code, and mark the travelers as arrived
  findTicket: (code: string) => Promise<Booking>;
  checkIn: (code: string) => Promise<{ booking: Booking; alreadyCheckedIn: boolean }>;
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

      createBooking: (input) => api("/bookings", { method: "POST", body: input }),

      sendMessage: async (id, text, offer) => {
        const updated = await api<Booking>(`/bookings/${id}/messages`, {
          method: "POST",
          body: { text: text || undefined, offer },
          admin: true,
        });
        set((state) => ({ bookings: state.bookings.map((b) => (b.id === id ? updated : b)) }), false, "bookings/sendMessage");
        return updated;
      },

      acceptOffer: async (id) => {
        const updated = await api<Booking>(`/bookings/${id}/accept`, { method: "POST", admin: true });
        set((state) => ({ bookings: state.bookings.map((b) => (b.id === id ? updated : b)) }), false, "bookings/acceptOffer");
        return updated;
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

      upsertBooking: (booking) =>
        set(
          (state) => ({
            bookings: state.bookings.some((b) => b.id === booking.id)
              ? state.bookings.map((b) => (b.id === booking.id ? booking : b))
              : [booking, ...state.bookings],
          }),
          false,
          "bookings/live",
        ),

      removeBooking: (id) =>
        set((state) => ({ bookings: state.bookings.filter((b) => b.id !== id) }), false, "bookings/liveDelete"),

      findTicket: (code) => api<Booking>(`/bookings/ticket/${encodeURIComponent(code)}`, { admin: true }),

      checkIn: (code) =>
        api(`/bookings/ticket/${encodeURIComponent(code)}/check-in`, { method: "POST", admin: true }),

      deleteBooking: async (id) => {
        await api(`/bookings/${id}`, { method: "DELETE", admin: true });
        set((state) => ({ bookings: state.bookings.filter((b) => b.id !== id) }), false, "bookings/delete");
      },
    }),
    { name: "bookings" },
  ),
);
