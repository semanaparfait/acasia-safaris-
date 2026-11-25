"use client";

// Pieces shared by Admin > Gallery (the albums) and an album's page (its photos)
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Images, Pencil, Trash2 } from "lucide-react";
import type { GalleryAlbum, GalleryAlbumInput, GalleryItem } from "@/lib/types";
import { Button, Card, Modal, inputClass, labelClass } from "../components/ui";

// An album's card: its cover, name, description and number of photos
export function AlbumCard({
  album,
  cover,
  count,
  onEdit,
  onDelete,
}: {
  album: GalleryAlbum;
  cover: string | null;
  count: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/admin/gallery/${album.id}`} className="relative block aspect-[4/3] bg-[#12231a]">
        {cover ? (
          <Image src={cover} alt={album.name} fill unoptimized sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/40">
            <Images className="size-8" />
            <span className="text-xs">No photos yet</span>
          </span>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
          {count} photo{count === 1 ? "" : "s"}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/admin/gallery/${album.id}`} className="font-semibold leading-snug hover:text-[#2E7D5B]">
          {album.name}
        </Link>
        <p className="mt-1 line-clamp-2 text-xs text-[#0a120b]/55">{album.description || "No description yet."}</p>
        <div className="mt-auto flex justify-end gap-1 pt-3">
          <button onClick={onEdit} className="cursor-pointer rounded-lg p-2 text-[#0a120b]/55 hover:bg-[#0a120b]/5" aria-label={`Edit ${album.name}`}>
            <Pencil className="size-4" />
          </button>
          <button onClick={onDelete} className="cursor-pointer rounded-lg p-2 text-[#0a120b]/55 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${album.name}`}>
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}

// New album / edit an album: its name and description
export function AlbumForm({
  initial,
  onClose,
  onSave,
}: {
  initial?: GalleryAlbum;
  onClose: () => void;
  onSave: (input: GalleryAlbumInput) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [saving, setSaving] = useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), description: description.trim(), coverId: initial?.coverId ?? null });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={initial ? "Edit album" : "New album"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={!name.trim() || saving} onClick={() => submit()}>{saving ? "Saving…" : initial ? "Save" : "Create album"}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelClass}>Name *</label>
          <input autoFocus className={inputClass} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="e.g. Gorillas of the Virunga" />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            rows={4}
            className={`${inputClass} resize-none`}
            value={description}
            maxLength={1000}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What this album shows, e.g. our trekking days in Volcanoes National Park, close to the mountain gorilla families."
          />
          <p className="mt-1 text-right text-[11px] text-[#0a120b]/40">{description.length}/1000</p>
        </div>
      </form>
    </Modal>
  );
}

// Edit a photo: its title, place, and the album it is in (to move it)
export function PhotoForm({
  initial,
  albums,
  onClose,
  onSave,
}: {
  initial: GalleryItem;
  albums: GalleryAlbum[];
  onClose: () => void;
  onSave: (photo: GalleryItem) => Promise<void>;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit photo"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={!form.title.trim() || saving} onClick={submit}>{saving ? "Saving…" : "Save"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-[#12231a]">
          <Image src={form.image} alt={form.title} fill unoptimized className="object-contain" />
        </div>
        <div>
          <label className={labelClass}>Title</label>
          <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <input className={inputClass} value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Volcanoes National Park" />
        </div>
        <div>
          <label className={labelClass}>Album</label>
          <select className={inputClass} value={form.albumId} onChange={(e) => setForm({ ...form, albumId: e.target.value })}>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          {form.albumId !== initial.albumId && <p className="mt-1 text-xs text-[#8a6d2f]">The photo moves to this album when you save.</p>}
        </div>
      </div>
    </Modal>
  );
}
