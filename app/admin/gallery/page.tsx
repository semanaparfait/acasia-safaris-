"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Upload, Trash2, ImagePlus, Pencil, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/api";
import { galleryCategories, type GalleryItem } from "@/lib/types";
import { useGalleryStore } from "@/store/galleryStore";
import { Button, Card, ConfirmDialog, EmptyState, Modal, PageHeader, Tabs, inputClass, labelClass } from "../components/ui";

export default function GalleryPage() {
  const items = useGalleryStore((s) => s.items);
  const loading = useGalleryStore((s) => s.loading);
  const error = useGalleryStore((s) => s.error);
  const load = useGalleryStore((s) => s.load);
  const createItem = useGalleryStore((s) => s.createItem);
  const updateItem = useGalleryStore((s) => s.updateItem);
  const deleteItem = useGalleryStore((s) => s.deleteItem);

  useEffect(() => {
    load();
  }, [load]);

  const [category, setCategory] = useState("All");
  const [uploadCategory, setUploadCategory] = useState<string>(galleryCategories[0]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(0); // number of files still uploading
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const list = items.filter((g) => category === "All" || g.category === category);

  // Each file: upload to the "gallery" bucket, then save a gallery item with its URL
  const addFiles = async (files: FileList | null) => {
    const images = Array.from(files ?? []).filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;

    setUploading(images.length);
    let added = 0;
    for (const file of images) {
      try {
        const url = await uploadImage("gallery", file);
        await createItem({
          title: file.name.replace(/\.[^.]+$/, ""), // file name without extension
          category: uploadCategory,
          location: "",
          image: url,
        });
        added++;
      } catch (err) {
        toast.error(`${file.name}: ${(err as Error).message}`);
      }
      setUploading((n) => n - 1);
    }
    if (fileRef.current) fileRef.current.value = "";
    if (added) toast.success(`${added} photo${added > 1 ? "s" : ""} added`);
  };

  const saveEdit = async (item: GalleryItem) => {
    try {
      await updateItem(item.id, { title: item.title, category: item.category, location: item.location ?? "", image: item.image });
      toast.success("Photo updated");
      setEditing(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const remove = async () => {
    if (deleteId === null) return;
    try {
      await deleteItem(deleteId);
      toast.success("Photo removed");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <PageHeader
        title="Gallery"
        subtitle={`${items.length} photos shown on the Gallery page. Uploads are stored in the "gallery" bucket.`}
        actions={<Button onClick={() => fileRef.current?.click()} disabled={uploading > 0}><Upload className="size-4" /> Upload photos</Button>}
      />
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />

      <div className="flex items-center gap-3 mb-3 text-sm">
        <span className="text-[#0a120b]/55">New uploads go to:</span>
        <select className={`${inputClass} w-auto py-1.5`} value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}>
          {galleryCategories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => uploading === 0 && fileRef.current?.click()}
        className={`mb-6 rounded-2xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors ${
          dragging ? "border-[#c5a86d] bg-[#c5a86d]/10" : "border-[#0a120b]/12 bg-white hover:border-[#c5a86d]/60"
        }`}
      >
        <span className="mx-auto size-12 rounded-2xl bg-[#2E7D5B]/10 text-[#2E7D5B] flex items-center justify-center mb-3">
          {uploading > 0 ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
        </span>
        {uploading > 0 ? (
          <p className="text-sm font-medium">Uploading {uploading} photo{uploading > 1 ? "s" : ""}…</p>
        ) : (
          <p className="text-sm font-medium">Drag & drop photos here, or <span className="text-[#2E7D5B]">browse</span></p>
        )}
        <p className="text-xs text-[#0a120b]/45 mt-1">JPG, PNG or WebP · up to 10 MB each</p>
      </div>

      <div className="mb-5">
        <Tabs value={category} onChange={setCategory} tabs={["All", ...galleryCategories].map((c) => ({ value: c, label: c }))} />
      </div>

      {error && <Card className="p-5 mb-5 text-sm text-red-700">Could not load the gallery: {error}</Card>}
      {loading && items.length === 0 && <Card><EmptyState title="Loading photos…" /></Card>}
      {!loading && list.length === 0 && <Card><EmptyState title="No photos yet" text="Upload your first photos above." /></Card>}

      <div className="columns-2 md:columns-3 xl:columns-4 gap-4 [&>*]:mb-4">
        {list.map((g, i) => (
          <Card key={g.id} className="break-inside-avoid overflow-hidden group relative">
            <div className={`relative ${i % 3 === 0 ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
              <Image src={g.image} alt={g.title} fill unoptimized className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a120b]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{g.title}</p>
                  <p className="text-[11px] text-white/60">{g.category}{g.location ? ` · ${g.location}` : ""}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setEditing(g)} className="p-2 rounded-lg bg-white/15 backdrop-blur hover:bg-white/30 cursor-pointer" aria-label="Edit photo">
                    <Pencil className="size-4" />
                  </button>
                  <button onClick={() => setDeleteId(g.id)} className="p-2 rounded-lg bg-white/15 backdrop-blur hover:bg-red-600 cursor-pointer" aria-label="Delete photo">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {editing && <PhotoForm initial={editing} onClose={() => setEditing(null)} onSave={saveEdit} />}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete photo"
        message="The photo is removed from the website and deleted from the storage bucket."
      />
    </>
  );
}

function PhotoForm({ initial, onClose, onSave }: { initial: GalleryItem; onClose: () => void; onSave: (g: GalleryItem) => Promise<void> }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
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
        <div>
          <label className={labelClass}>Title</label>
          <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {galleryCategories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <input className={inputClass} value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Volcanoes Park" />
        </div>
      </div>
    </Modal>
  );
}
