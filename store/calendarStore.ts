// The team's to-dos for Admin > Calendar. Same pattern as the other stores.
// Trips, returns and balances are not here: the calendar builds them from the bookings.
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api } from "@/lib/api";
import type { AdminReminder, AdminReminderInput } from "@/lib/types";

type CalendarState = {
  reminders: AdminReminder[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  createReminder: (input: AdminReminderInput) => Promise<AdminReminder>;
  updateReminder: (id: string, input: AdminReminderInput) => Promise<AdminReminder>;
  setDone: (id: string, done: boolean) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
};

const replace = (list: AdminReminder[], r: AdminReminder) => list.map((x) => (x.id === r.id ? r : x));

export const useCalendarStore = create<CalendarState>()(
  devtools(
    (set) => ({
      reminders: [],
      loading: false,
      error: null,

      load: async () => {
        set({ loading: true, error: null }, false, "calendar/load/start");
        try {
          const reminders = await api<AdminReminder[]>("/calendar/reminders", { admin: true });
          set({ reminders, loading: false }, false, "calendar/load/success");
        } catch (error) {
          set({ error: (error as Error).message, loading: false }, false, "calendar/load/error");
        }
      },

      createReminder: async (input) => {
        const created = await api<AdminReminder>("/calendar/reminders", { method: "POST", body: input, admin: true });
        set((s) => ({ reminders: [...s.reminders, created] }), false, "calendar/create");
        return created;
      },

      updateReminder: async (id, input) => {
        const updated = await api<AdminReminder>(`/calendar/reminders/${id}`, { method: "PUT", body: input, admin: true });
        set((s) => ({ reminders: replace(s.reminders, updated) }), false, "calendar/update");
        return updated;
      },

      // Ticked at once on screen, undone if the server refuses
      setDone: async (id, done) => {
        set((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, done } : r)) }), false, "calendar/done");
        try {
          const updated = await api<AdminReminder>(`/calendar/reminders/${id}/done`, { method: "PATCH", body: { done }, admin: true });
          set((s) => ({ reminders: replace(s.reminders, updated) }), false, "calendar/done/success");
        } catch (error) {
          set((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, done: !done } : r)) }), false, "calendar/done/error");
          throw error;
        }
      },

      deleteReminder: async (id) => {
        await api(`/calendar/reminders/${id}`, { method: "DELETE", admin: true });
        set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) }), false, "calendar/delete");
      },
    }),
    { name: "calendar" },
  ),
);
