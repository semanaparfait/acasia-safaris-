"use client";

// /admin/gallery/<album id>  ->  one album: its name and description, and its photos.
// Upload photos into it, choose its cover, edit or move a photo to another album, delete.
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, ImagePlus, Loader2, Pencil, Star, Trash2, Upload } from "lucide-react";
import { uploadImage } from "@/lib/api";
import type { GalleryItem } from "@/lib/types";
import { albumCover, photosOf, useGalleryStore } from "@/store/galleryStore";
import { Button, Card, ConfirmDialog, EmptyState } from "../../components/ui";
import { AlbumForm, PhotoForm } from "../parts";
import TranslationsPanel from "../../components/TranslationsPanel";

export default function GalleryAlbumPage() {
  const id = useParams<{ id: string }>().id;
  const albums = useGalleryStore((s) => s.albums);
  const items = useGalleryStore((s) => s.items);
  const loading = useGalleryStore((s) => s.loading);
  const load = useGalleryStore((s) => s.load);
  const updateAlbum = useGalleryStore((s) => s.updateAlbum);
  const createItem = useGalleryStore((s) => s.createItem);
  const updateItem = useGalleryStore((s) => s.updateItem);
  const deleteItem = useGalleryStore((s) => s.deleteItem);

  useEffect(() => {
    if (!albums.length) load();
  }, [albums.length, load]);

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(0); // files still uploading
  const [editingAlbum, setEditingAlbum] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const album = albums.find((a) => a.id === id);
  if (!album) {
    return (
      <Card>
        <EmptyState title={loading || !albums.length ? "Loading album…" : "This album does not exist any more"} />
      </Card>
    );
  }
  const photos = photosOf(items, album.id);
  const cover = albumCover(album, items);

  // Each file: upload to the "gallery" bucket, then save it as a photo of this album
  const addFiles = async (files: FileList | null) => {
    const images = Array.from(files ?? []).filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;
    setUploading(images.length);
    let added = 0;
    for (const file of images) {
      try {
        const url = await uploadImage("gallery", file);
        await createItem({ title: file.name.replace(/\.[^.]+$/, ""), albumId: album.id, location: "", image: url });
        added++;
      } catch (err) {
        toast.error(`${file.name}: ${(err as Error).message}`);
      }
      setUploading((n) => n - 1);
    }
    if (fileRef.current) fileRef.current.value = "";
    if (added) toast.success(`${added} photo${added > 1 ? "s" : ""} added to ${album.name}`);
  };

  const setCover = async (photo: GalleryItem) => {
    try {
      await updateAlbum(album.id, { name: album.name, description: album.description, coverId: photo.id });
      toast.success("Cover changed");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const savePhoto = async (photo: GalleryItem) => {
    try {
      await updateItem(photo.id, { title: photo.title, albumId: photo.albumId, location: photo.location ?? "", image: photo.image });
      const moved = photo.albumId !== album.id ? albums.find((a) => a.id === photo.albumId) : null;
      toast.success(moved ? `Photo moved to ${moved.name}` : "Photo updated");
      setEditing(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <Link href="/admin/gallery" className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#0a120b]/55 hover:text-[#0a120b]">
        <ArrowLeft className="size-4" /> All albums
      </Link>

      {/* The album */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-44 shrink-0 bg-[#12231a] sm:h-auto sm:w-64">
            {cover && <Image src={cover} alt="" fill unoptimized sizes="256px" className="object-cover" />}
          </div>
          <div className="flex flex-1 flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight">{album.name}</h1>
              <p className="mt-1 text-xs text-[#0a120b]/45">{photos.length} photo{photos.length === 1 ? "" : "s"}</p>
              <p className="mt-3 max-w-2xl whitespace-pre-line text-sm text-[#0a120b]/70">
                {album.description || <span className="italic text-[#0a120b]/40">No description yet: add one so visitors know what this album shows.</span>}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="secondary" onClick={() => setEditingAlbum(true)}>
                <Pencil className="size-4" /> Edit
              </Button>
              <Button onClick={() => fileRef.current?.click()} disabled={uploading > 0}>
                <Upload className="size-4" /> Add photos
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />

      {/* Drop zone: uploads go into this album */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => uploading === 0 && fileRef.current?.click()}
        className={`mb-6 cursor-pointer rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          dragging ? "border-[#c5a86d] bg-[#c5a86d]/10" : "border-[#0a120b]/12 bg-white hover:border-[#c5a86d]/60"
        }`}
      >
        <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#2E7D5B]/10 text-[#2E7D5B]">
          {uploading > 0 ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
        </span>
        {uploading > 0 ? (
          <p className="text-sm font-medium">Uploading {uploading} photo{uploading > 1 ? "s" : ""}…</p>
        ) : (
          <p className="text-sm font-medium">
            Drag & drop photos for <strong>{album.name}</strong> here, or <span className="text-[#2E7D5B]">browse</span>
          </p>
        )}
        <p className="mt-1 text-xs text-[#0a120b]/45">JPG, PNG or WebP · up to 10 MB each · several at once</p>
      </div>

      {/* The photos */}
      {photos.length === 0 ? (
        <Card><EmptyState title="No photos in this album yet" text="Add them above." /></Card>
      ) : (
        <div className="columns-2 gap-4 md:columns-3 xl:columns-4 [&>*]:mb-4">
          {photos.map((g, i) => {
            const isCover = cover === g.image;
            return (
              <Card key={g.id} className="group relative break-inside-avoid overflow-hidden">
                <div className={`relative ${i % 3 === 0 ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
                  <Image src={g.image} alt={g.title} fill unoptimized className="object-cover" />
                  {isCover && (
                    <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-[#c5a86d] px-2 py-0.5 text-[10px] font-semibold text-[#0a120b]">
                      <Star className="size-3 fill-current" /> Cover
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a120b]/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{g.title}</p>
                      {g.location && <p className="truncate text-[11px] text-white/60">{g.location}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {!isCover && (
                        <button onClick={() => setCover(g)} className="cursor-pointer rounded-lg bg-white/15 p-2 backdrop-blur hover:bg-[#c5a86d] hover:text-[#0a120b]" aria-label="Use as the album cover" title="Use as the album cover">
                          <Star className="size-4" />
                        </button>
                      )}
                      <button onClick={() => setEditing(g)} className="cursor-pointer rounded-lg bg-white/15 p-2 backdrop-blur hover:bg-white/30" aria-label="Edit or move the photo" title="Edit or move to another album">
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => setDeleteId(g.id)} className="cursor-pointer rounded-lg bg-white/15 p-2 backdrop-blur hover:bg-red-600" aria-label="Delete the photo">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* French and Swahili: album name, description, and the titles and places of its photos */}
      <div className="mt-8">
        <TranslationsPanel kind="albums" id={album.id} version={`${album.name}|${album.description}|${photos.length}`} />
      </div>

      {editingAlbum && (
        <AlbumForm
          initial={album}
          onClose={() => setEditingAlbum(false)}
          onSave={async (input) => {
            try {
              await updateAlbum(album.id, input);
              toast.success("Album saved");
              setEditingAlbum(false);
            } catch (err) {
              toast.error((err as Error).message);
            }
          }}
        />
      )}

      {editing && <PhotoForm initial={editing} albums={albums} onClose={() => setEditing(null)} onSave={savePhoto} />}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await deleteItem(deleteId);
            toast.success("Photo deleted");
          } catch (err) {
            toast.error((err as Error).message);
          }
        }}
        title="Delete photo"
        message="The photo is removed from the website and deleted from the storage bucket."
      />
    </>
  );
}
