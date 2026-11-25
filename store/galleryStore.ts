// Gallery albums and their photos. Images are uploaded to the "gallery" bucket in Neon Storage.
// Album cards (cover, number of photos) are worked out from the photos here, so they are
// always right after an upload, a move or a deletion.
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api } from "@/lib/api";
import type { GalleryAlbum, GalleryAlbumInput, GalleryInput, GalleryItem } from "@/lib/types";

type GalleryState = {
  albums: GalleryAlbum[];
  items: GalleryItem[];
  loading: boolean;
  error: string | null;

  load: () => Promise<void>; // albums and photos
  createAlbum: (input: GalleryAlbumInput) => Promise<GalleryAlbum>; // admin
  updateAlbum: (id: string, input: GalleryAlbumInput) => Promise<void>; // admin
  deleteAlbum: (id: string) => Promise<void>; // admin: the album and its photos
  createItem: (input: GalleryInput) => Promise<GalleryItem>; // admin
  updateItem: (id: string, input: GalleryInput) => Promise<GalleryItem>; // admin
  deleteItem: (id: string) => Promise<void>; // admin
};

// The photos of an album, newest first
export const photosOf = (items: GalleryItem[], albumId: string) => items.filter((i) => i.albumId === albumId);

// The picture of an album's card: the chosen cover, else its newest photo
export function albumCover(album: GalleryAlbum, items: GalleryItem[]) {
  const photos = photosOf(items, album.id);
  return photos.find((p) => p.id === album.coverId)?.image ?? photos[0]?.image ?? album.cover;
}

export const useGalleryStore = create<GalleryState>()(
  devtools(
    (set) => ({
      albums: [],
      items: [],
      loading: false,
      error: null,

      load: async () => {
        set({ loading: true, error: null }, false, "gallery/load/start");
        try {
          const [albums, items] = await Promise.all([api<GalleryAlbum[]>("/gallery/albums"), api<GalleryItem[]>("/gallery")]);
          set({ albums, items, loading: false }, false, "gallery/load/success");
        } catch (error) {
          set({ error: (error as Error).message, loading: false }, false, "gallery/load/error");
        }
      },

      createAlbum: async (input) => {
        const created = await api<GalleryAlbum>("/gallery/albums", { method: "POST", body: input, admin: true });
        const album = { ...created, cover: null, photoCount: 0 };
        set((state) => ({ albums: [album, ...state.albums] }), false, "gallery/createAlbum");
        return album;
      },

      updateAlbum: async (id, input) => {
        const updated = await api<GalleryAlbum>(`/gallery/albums/${id}`, { method: "PUT", body: input, admin: true });
        set(
          (state) => ({ albums: state.albums.map((a) => (a.id === id ? { ...a, ...updated, cover: a.cover, photoCount: a.photoCount } : a)) }),
          false,
          "gallery/updateAlbum",
        );
      },

      deleteAlbum: async (id) => {
        await api(`/gallery/albums/${id}`, { method: "DELETE", admin: true });
        set(
          (state) => ({ albums: state.albums.filter((a) => a.id !== id), items: state.items.filter((i) => i.albumId !== id) }),
          false,
          "gallery/deleteAlbum",
        );
      },

      createItem: async (input) => {
        const created = await api<GalleryItem>("/gallery", { method: "POST", body: input, admin: true });
        set((state) => ({ items: [created, ...state.items] }), false, "gallery/create");
        return created;
      },

      updateItem: async (id, input) => {
        const updated = await api<GalleryItem>(`/gallery/${id}`, { method: "PUT", body: input, admin: true });
        set(
          (state) => ({
            items: state.items.map((i) => (i.id === id ? updated : i)),
            // Moved away from its album: it is not that album's cover any more
            albums: state.albums.map((a) => (a.coverId === id && a.id !== updated.albumId ? { ...a, coverId: null } : a)),
          }),
          false,
          "gallery/update",
        );
        return updated;
      },

      deleteItem: async (id) => {
        await api(`/gallery/${id}`, { method: "DELETE", admin: true });
        set(
          (state) => ({
            items: state.items.filter((i) => i.id !== id),
            albums: state.albums.map((a) => (a.coverId === id ? { ...a, coverId: null } : a)),
          }),
          false,
          "gallery/delete",
        );
      },
    }),
    { name: "gallery" },
  ),
);
