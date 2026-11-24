// Photos and files in the booking chat (customer page and Admin > Bookings).
// Photos show as a preview (click to open in full); other files as a card to open or download.
import { Download, FileSpreadsheet, FileText, File as FileIcon } from "lucide-react";
import type { ChatAttachment } from "@/lib/types";

// "/api/bookings/track/<token>/files" or "/api/bookings/<id>/files": where private chat files are read
export function attachmentUrl(a: ChatAttachment, filesBase: string) {
  return a.url ?? `${filesBase}/${a.key}`;
}

// "1.4 MB", "320 KB"
export function fileSize(bytes: number) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const PREVIEW = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function ChatAttachments({
  attachments,
  filesBase,
  dark = false, // inside a dark bubble
}: {
  attachments?: ChatAttachment[];
  filesBase: string;
  dark?: boolean;
}) {
  if (!attachments?.length) return null;
  return (
    <div className="space-y-1.5">
      {attachments.map((a, i) => {
        const href = attachmentUrl(a, filesBase);
        if (PREVIEW.includes(a.type)) {
          return (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl" title={a.name}>
              {/* eslint-disable-next-line @next/next/no-img-element -- private files: not for the image optimizer */}
              <img src={href} alt={a.name} loading="lazy" className="max-h-64 w-full max-w-[260px] object-cover transition-opacity hover:opacity-90" />
            </a>
          );
        }
        const Icon = a.type === "application/pdf" ? FileText : /sheet|excel|csv/.test(a.type) ? FileSpreadsheet : FileIcon;
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
              dark ? "bg-white/10 hover:bg-white/15" : "bg-[#f7f5f0] ring-1 ring-[#0a120b]/[0.06] hover:bg-[#efeae0]"
            }`}
          >
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${dark ? "bg-[#c5a86d]/20 text-[#c5a86d]" : "bg-[#c5a86d]/15 text-[#8a6d2f]"}`}>
              <Icon className="size-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium">{a.name}</span>
              <span className={`block text-[11px] ${dark ? "text-white/55" : "text-[#0a120b]/45"}`}>
                {[a.name.split(".").pop()?.toUpperCase(), fileSize(a.size)].filter(Boolean).join(" · ")}
              </span>
            </span>
            <Download className={`size-4 shrink-0 ${dark ? "text-white/60" : "text-[#0a120b]/40"}`} />
          </a>
        );
      })}
    </div>
  );
}
