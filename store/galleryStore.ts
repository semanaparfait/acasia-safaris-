// Gallery photos. Images are uploaded to the "gallery" bucket in Neon Storage.
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api } from "@/lib/api";
import type { GalleryInput, GalleryItem } from "@/lib/types";

type GalleryState = {
  items: GalleryItem[];
  loading: boolean;
  error: string | null;

  load: () => Promise<void>;
  createItem: (input: GalleryInput) => Promise<GalleryItem>; // admin
  updateItem: (id: string, input: GalleryInput) => Promise<GalleryItem>; // admin
  deleteItem: (id: string) => Promise<void>; // admin
};

export const useGalleryStore = create<GalleryState>()(
  devtools(
    (set) => ({
      items: [],
      loading: false,
      error: null,

      load: async () => {
        set({ loading: true, error: null }, false, "gallery/load/start");
        try {
          const items = await api<GalleryItem[]>("/gallery");
          set({ items, loading: false }, false, "gallery/load/success");
        } catch (error) {
          set({ error: (error as Error).message, loading: false }, false, "gallery/load/error");
        }
      },

      createItem: async (input) => {
        const created = await api<GalleryItem>("/gallery", { method: "POST", body: input, admin: true });
        set((state) => ({ items: [created, ...state.items] }), false, "gallery/create");
        return created;
      },

      updateItem: async (id, input) => {
        const updated = await api<GalleryItem>(`/gallery/${id}`, { method: "PUT", body: input, admin: true });
        set((state) => ({ items: state.items.map((i) => (i.id === id ? updated : i)) }), false, "gallery/update");
        return updated;
      },

      deleteItem: async (id) => {
        await api(`/gallery/${id}`, { method: "DELETE", admin: true });
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }), false, "gallery/delete");
      },
    }),
    { name: "gallery" },
  ),
);
