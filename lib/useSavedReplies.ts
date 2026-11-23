"use client";

// Saved replies (Admin > Settings > Saved replies): ready answers inserted in a booking
// conversation with one click. Loaded once and shared by every conversation on the page.
import { create } from "zustand";
import { api } from "@/lib/api";
import type { SavedReply } from "@/lib/types";

type State = {
  replies: SavedReply[] | null; // null = not loaded yet
  load: (force?: boolean) => Promise<void>;
  add: (input: Omit<SavedReply, "id">) => Promise<void>;
  edit: (id: string, input: Omit<SavedReply, "id">) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useSavedReplies = create<State>()((set, get) => ({
  replies: null,
  load: async (force) => {
    if (get().replies && !force) return;
    try {
      set({ replies: await api<SavedReply[]>("/saved-replies", { admin: true }) });
    } catch {
      set({ replies: [] });
    }
  },
  add: async (input) => {
    const created = await api<SavedReply>("/saved-replies", { method: "POST", body: input, admin: true });
    set({ replies: [...(get().replies ?? []), created] });
  },
  edit: async (id, input) => {
    const updated = await api<SavedReply>(`/saved-replies/${id}`, { method: "PATCH", body: input, admin: true });
    set({ replies: (get().replies ?? []).map((r) => (r.id === id ? updated : r)) });
  },
  remove: async (id) => {
    await api(`/saved-replies/${id}`, { method: "DELETE", admin: true });
    set({ replies: (get().replies ?? []).filter((r) => r.id !== id) });
  },
}));

// The row of buttons above a reply box: clicking one puts its text in the box
export function insertReply(current: string, text: string) {
  return current.trim() ? `${current.trimEnd()}\n\n${text}` : text;
}
