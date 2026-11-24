"use client";

// /admin/quotations  ->  every package's quotation PDF in one place, ready to share with a client:
// open it, download it, copy its link, or send it on WhatsApp. (In a booking's conversation,
// the "Quotation" button sends it in the chat.) Quotations are made in Tour Packages > Edit.
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { Copy, Download, ExternalLink, FileText, Pencil } from "lucide-react";
import { daysLabel, money } from "@/lib/helpers";
import type { TourPackage } from "@/lib/types";
import { usePackagesStore } from "@/store/packagesStore";
import { Card, EmptyState, PageHeader, SearchInput } from "../components/ui";

// WhatsApp brand icon (lucide has none)
function WhatsAppIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.01c0-5.2 4.23-9.43 9.43-9.43 2.52 0 4.88.98 6.66 2.77a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.43 9.43m8.02-17.45A11.27 11.27 0 0 0 12.05.75C5.8.75.72 5.83.72 12.08c0 2 .52 3.95 1.51 5.66L.62 23.25l5.65-1.48a11.3 11.3 0 0 0 5.78 1.47h.01c6.25 0 11.33-5.08 11.33-11.33 0-3.03-1.18-5.87-3.32-8.01" />
    </svg>
  );
}

const pdfName = (p: TourPackage) => `${p.title.replace(/[^\w .-]/g, "").trim() || "Quotation"} - Quotation.pdf`;

export default function QuotationsPage() {
  const packages = usePackagesStore((s) => s.packages);
  const loading = usePackagesStore((s) => s.loading);
  const error = usePackagesStore((s) => s.error);
  const loadAll = usePackagesStore((s) => s.loadAll);
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const matches = packages.filter((p) => (p.title + p.location + p.category).toLowerCase().includes(query.toLowerCase()));
  const ready = matches.filter((p) => p.quotation);
  const missing = matches.filter((p) => !p.quotation);

  const copy = async (p: TourPackage) => {
    try {
      await navigator.clipboard.writeText(p.quotation!);
      toast.success("Link copied: paste it in any chat or email");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  const whatsapp = (p: TourPackage) =>
    `https://wa.me/?text=${encodeURIComponent(`Hello! Here is the quotation for our "${p.title}" trip (${daysLabel(p)}, from ${money(p.price)} per person):\n${p.quotation}`)}`;

  return (
    <>
      <PageHeader
        title="Quotations"
        subtitle={`${packages.filter((p) => p.quotation).length} of ${packages.length} packages have a quotation PDF · share one with a client in a click`}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#0a120b]/55">
          In a booking&apos;s conversation, the <strong>Quotation</strong> button sends it in the chat.
        </p>
        <SearchInput value={query} onChange={setQuery} placeholder="Search quotations…" className="sm:w-72" />
      </div>

      {error && <Card className="mb-5 p-5 text-sm text-red-700">Could not load the packages: {error}</Card>}

      {loading && packages.length === 0 ? (
        <Card><EmptyState title="Loading quotations…" /></Card>
      ) : ready.length === 0 && missing.length === 0 ? (
        <Card><EmptyState title="No packages found" /></Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ready.map((p) => (
              <Card key={p.id} className="flex flex-col overflow-hidden">
                <div className="flex gap-4 p-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#12231a]">
                    {p.image && <Image src={p.image} alt="" fill unoptimized sizes="80px" className="object-cover" />}
                    <span className="absolute bottom-1 right-1 flex size-6 items-center justify-center rounded-md bg-white/95 text-[#8a6d2f] shadow">
                      <FileText className="size-3.5" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold leading-snug">{p.title}</h3>
                    <p className="mt-1 text-xs text-[#0a120b]/55">
                      {daysLabel(p)} · from {money(p.price)} · {p.location}
                    </p>
                    <p className="mt-1.5 flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
                      <span className="rounded bg-[#c5a86d]/15 px-1.5 py-0.5 text-[#8a6d2f]">{p.quotationManual ? "Uploaded" : "Made from the package"}</span>
                      {!p.active && <span className="rounded bg-[#0a120b]/5 px-1.5 py-0.5 text-[#0a120b]/55">Draft</span>}
                    </p>
                  </div>
                </div>
                <div className="mt-auto grid grid-cols-4 border-t border-[#0a120b]/[0.06] text-xs font-medium text-[#0a120b]/70">
                  <a href={p.quotation!} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 py-3 hover:bg-[#f7f5f0]">
                    <ExternalLink className="size-4" /> Open
                  </a>
                  <a
                    href={`${p.quotation}?download=${encodeURIComponent(pdfName(p))}`}
                    className="flex flex-col items-center gap-1 border-l border-[#0a120b]/[0.06] py-3 hover:bg-[#f7f5f0]"
                  >
                    <Download className="size-4" /> Download
                  </a>
                  <button onClick={() => copy(p)} className="flex flex-col items-center gap-1 border-l border-[#0a120b]/[0.06] py-3 hover:bg-[#f7f5f0] cursor-pointer">
                    <Copy className="size-4" /> Copy link
                  </button>
                  <a
                    href={whatsapp(p)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 border-l border-[#0a120b]/[0.06] py-3 text-[#1f8a4c] hover:bg-[#1f8a4c]/[0.06]"
                  >
                    <WhatsAppIcon /> WhatsApp
                  </a>
                </div>
              </Card>
            ))}
          </div>

          {missing.length > 0 && (
            <Card className="mt-6 p-5">
              <p className="text-sm font-medium">No quotation yet</p>
              <p className="mt-0.5 text-xs text-[#0a120b]/50">Make or upload one in the package&apos;s edit page (Quotation section).</p>
              <ul className="mt-3 divide-y divide-[#0a120b]/[0.06]">
                {missing.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="truncate">{p.title}</span>
                    <Link href={`/admin/packages/${p.id}/edit`} className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#2E7D5B] hover:underline">
                      <Pencil className="size-3.5" /> Add quotation
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </>
  );
}
