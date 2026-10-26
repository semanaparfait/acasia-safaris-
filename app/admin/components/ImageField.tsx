"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadImage } from "@/lib/api";
import type { Bucket } from "@/lib/types";
import { inputClass, labelClass } from "./ui";

// Image input for admin forms: upload a file to a Neon Storage bucket,
// or paste an image URL. `value` is the image URL saved in the database.
export default function ImageField({
  label,
  bucket,
  value,
  onChange,
  compact = false,
}: {
  label?: string;
  bucket: Bucket;
  value: string;
  onChange: (url: string) => void;
  compact?: boolean; // smaller layout, used for itinerary days
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(bucket, file);
      onChange(url);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = ""; // allow picking the same file again
    }
  };

  return (
    <div>
      {label && <label className={labelClass}>{label}</label>}
      <div className="flex items-center gap-3">
        {/* Preview */}
        <div className={`relative shrink-0 overflow-hidden rounded-lg bg-[#f7f5f0] border border-[#0a120b]/10 ${compact ? "size-11" : "size-16"}`}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="absolute inset-0 m-auto size-5 text-[#0a120b]/25" />
          )}
        </div>

        <input
          className={inputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Upload an image or paste a URL"
        />

        <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-[#0a120b]/10 bg-white px-3 py-2.5 text-sm hover:bg-[#f7f5f0] disabled:opacity-50 cursor-pointer"
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {compact ? "" : uploading ? "Uploading…" : "Upload"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className="shrink-0 p-2 rounded-lg text-[#0a120b]/45 hover:bg-[#0a120b]/5 cursor-pointer" aria-label="Remove image">
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
