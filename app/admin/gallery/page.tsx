"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Upload, Trash2, ImagePlus } from "lucide-react";
import { useAdmin } from "../components/AdminStore";
import { Button, Card, PageHeader, Tabs } from "../components/ui";

export default function GalleryPage() {
  const { gallery, setGallery } = useAdmin();
  const [category, setCategory] = useState("All");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = ["All", ...Array.from(new Set(gallery.map((g) => g.category)))];
  const list = gallery.filter((g) => category === "All" || g.category === category);

  // Files are previewed locally with object URLs until there is a backend to upload to
  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const items = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: `up-${Date.now()}-${f.name}`,
        title: f.name.replace(/\.[^.]+$/, ""),
        category: category === "All" ? "Uploads" : category,
        image: URL.createObjectURL(f),
        uploadedAt: new Date().toISOString(),
      }));
    setGallery((g) => [...items, ...g]);
    toast.success(`${items.length} photo${items.length > 1 ? "s" : ""} added`);
  };

  return (
    <>
      <PageHeader
        title="Gallery"
        subtitle={`${gallery.length} photos shown on the Gallery page.`}
        actions={<Button onClick={() => fileRef.current?.click()}><Upload className="size-4" /> Upload photos</Button>}
      />
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        className={`mb-6 rounded-2xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors ${
          dragging ? "border-[#c5a86d] bg-[#c5a86d]/10" : "border-[#0a120b]/12 bg-white hover:border-[#c5a86d]/60"
        }`}
      >
        <span className="mx-auto size-12 rounded-2xl bg-[#2E7D5B]/10 text-[#2E7D5B] flex items-center justify-center mb-3">
          <ImagePlus className="size-5" />
        </span>
        <p className="text-sm font-medium">Drag & drop photos here, or <span className="text-[#2E7D5B]">browse</span></p>
        <p className="text-xs text-[#0a120b]/45 mt-1">JPG, PNG or WebP · up to 10 MB each</p>
      </div>

      <div className="mb-5">
        <Tabs value={category} onChange={setCategory} tabs={categories.map((c) => ({ value: c, label: c }))} />
      </div>

      <div className="columns-2 md:columns-3 xl:columns-4 gap-4 [&>*]:mb-4">
        {list.map((g, i) => (
          <Card key={g.id} className="break-inside-avoid overflow-hidden group relative">
            <div className={`relative ${i % 3 === 0 ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
              <Image src={g.image} alt={g.title} fill unoptimized className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a120b]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{g.title}</p>
                  <p className="text-[11px] text-white/60">{g.category}</p>
                </div>
                <button
                  onClick={() => { setGallery((list) => list.filter((x) => x.id !== g.id)); toast.success("Photo removed"); }}
                  className="p-2 rounded-lg bg-white/15 backdrop-blur hover:bg-red-600 cursor-pointer shrink-0"
                  aria-label="Delete photo"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
