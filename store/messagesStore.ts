// Messages from the contact form and booking requests.
// The website sends them; the admin reads, stars and deletes them.
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api } from "@/lib/api";
import type { Message, MessageInput } from "@/lib/types";

type MessagesState = {
  messages: Message[];
  loading: boolean;
  error: string | null;

  load: () => Promise<void>; // admin
  sendMessage: (input: MessageInput) => Promise<void>; // website
  updateMessage: (id: number, changes: { read?: boolean; starred?: boolean }) => Promise<void>; // admin
  deleteMessage: (id: number) => Promise<void>; // admin
};

export const useMessagesStore = create<MessagesState>()(
  devtools(
    (set) => ({
      messages: [],
      loading: false,
      error: null,

      load: async () => {
        set({ loading: true, error: null }, false, "messages/load/start");
        try {
          const messages = await api<Message[]>("/messages", { admin: true });
          set({ messages, loading: false }, false, "messages/load/success");
        } catch (error) {
          set({ error: (error as Error).message, loading: false }, false, "messages/load/error");
        }
      },

      sendMessage: async (input) => {
        await api("/messages", { method: "POST", body: input });
      },

      updateMessage: async (id, changes) => {
        // Update the screen right away, then save. Undo if saving fails.
        const before = useMessagesStore.getState().messages;
        set(
          (state) => ({ messages: state.messages.map((m) => (m.id === id ? { ...m, ...changes } : m)) }),
          false,
          "messages/update",
        );
        try {
          await api(`/messages/${id}`, { method: "PATCH", body: changes, admin: true });
        } catch (error) {
          set({ messages: before }, false, "messages/update/undo");
          throw error;
        }
      },

      deleteMessage: async (id) => {
        await api(`/messages/${id}`, { method: "DELETE", admin: true });
        set((state) => ({ messages: state.messages.filter((m) => m.id !== id) }), false, "messages/delete");
      },
    }),
    { name: "messages" },
  ),
);
