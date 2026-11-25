"use client";

// /admin/gallery  ->  the albums of the Gallery page. Open an album to add, move or remove its photos.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FolderPlus } from "lucide-react";
import type { GalleryAlbum } from "@/lib/types";
import { albumCover, photosOf, useGalleryStore } from "@/store/galleryStore";
import { Button, Card, ConfirmDialog, EmptyState, PageHeader, SearchInput } from "../components/ui";
import { AlbumCard, AlbumForm } from "./parts";

export default function GalleryAlbumsPage() {
  const router = useRouter();
  const albums = useGalleryStore((s) => s.albums);
  const items = useGalleryStore((s) => s.items);
  const loading = useGalleryStore((s) => s.loading);
  const error = useGalleryStore((s) => s.error);
  const load = useGalleryStore((s) => s.load);
  const createAlbum = useGalleryStore((s) => s.createAlbum);
  const updateAlbum = useGalleryStore((s) => s.updateAlbum);
  const deleteAlbum = useGalleryStore((s) => s.deleteAlbum);

  useEffect(() => {
    load();
  }, [load]);

  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<GalleryAlbum | null>(null);
  const [deleting, setDeleting] = useState<GalleryAlbum | null>(null);

  const list = albums.filter((a) => (a.name + a.description).toLowerCase().includes(query.toLowerCase()));
  const deletingCount = deleting ? photosOf(items, deleting.id).length : 0;

  return (
    <>
      <PageHeader
        title="Gallery"
        subtitle={`${albums.length} album${albums.length === 1 ? "" : "s"} · ${items.length} photos on the Gallery page`}
        actions={
          <Button onClick={() => setCreating(true)}>
            <FolderPlus className="size-4" /> New album
          </Button>
        }
      />

      {albums.length > 0 && (
        <div className="mb-5 flex justify-end">
          <SearchInput value={query} onChange={setQuery} placeholder="Search albums…" className="w-full sm:w-72" />
        </div>
      )}

      {error && <Card className="mb-5 p-5 text-sm text-red-700">Could not load the gallery: {error}</Card>}
      {loading && albums.length === 0 ? (
        <Card><EmptyState title="Loading albums…" /></Card>
      ) : albums.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="font-medium">No album yet</p>
          <p className="mt-1 text-sm text-[#0a120b]/55">Create an album (for example &quot;Gorilla trekking&quot;), then add its photos.</p>
          <Button className="mt-5" onClick={() => setCreating(true)}>
            <FolderPlus className="size-4" /> Create the first album
          </Button>
        </Card>
      ) : list.length === 0 ? (
        <Card><EmptyState title="No album matches your search" /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              cover={albumCover(album, items)}
              count={photosOf(items, album.id).length}
              onEdit={() => setEditing(album)}
              onDelete={() => setDeleting(album)}
            />
          ))}
        </div>
      )}

      {creating && (
        <AlbumForm
          onClose={() => setCreating(false)}
          onSave={async (input) => {
            try {
              const album = await createAlbum(input);
              toast.success("Album created: now add its photos");
              setCreating(false);
              router.push(`/admin/gallery/${album.id}`);
            } catch (err) {
              toast.error((err as Error).message);
            }
          }}
        />
      )}

      {editing && (
        <AlbumForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (input) => {
            try {
              await updateAlbum(editing.id, input);
              toast.success("Album saved");
              setEditing(null);
            } catch (err) {
              toast.error((err as Error).message);
            }
          }}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteAlbum(deleting.id);
            toast.success("Album deleted");
          } catch (err) {
            toast.error((err as Error).message);
          }
        }}
        title="Delete album"
        message={
          deletingCount > 0
            ? `"${deleting?.name}" and its ${deletingCount} photo${deletingCount === 1 ? "" : "s"} are removed from the website and deleted from storage. To keep some photos, move them to another album first.`
            : `"${deleting?.name}" is removed from the website.`
        }
      />
    </>
  );
}
