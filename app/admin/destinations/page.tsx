"use client";

// /admin/destinations  ->  all destinations.
// Click one to see its details; adding and editing happen on their own pages.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, MapPin, Sun, Car } from "lucide-react";
import { destinationGroups as groups } from "@/lib/helpers";
import type { Destination } from "@/lib/types";
import { useDestinationsStore } from "@/store/destinationsStore";
import { Button, Card, ConfirmDialog, EmptyState, PageHeader, SearchInput, Tabs, Toggle } from "../components/ui";
import { FeaturedBadge, GroupLabel, toInput } from "./parts";

export default function DestinationsPage() {
  const router = useRouter();
  const destinations = useDestinationsStore((s) => s.destinations);
  const loading = useDestinationsStore((s) => s.loading);
  const error = useDestinationsStore((s) => s.error);
  const load = useDestinationsStore((s) => s.load);
  const updateDestination = useDestinationsStore((s) => s.updateDestination);
  const deleteDestination = useDestinationsStore((s) => s.deleteDestination);

  useEffect(() => {
    load();
  }, [load]);

  const [group, setGroup] = useState("All");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<Destination | null>(null);

  const filtered = destinations.filter(
    (d) => (group === "All" || d.group === group) && (d.title + d.location).toLowerCase().includes(query.toLowerCase())
  );
  const featuredCount = destinations.filter((d) => d.featured).length;

  const toggleFeatured = async (d: Destination, featured: boolean) => {
    try {
      await updateDestination(d.id, toInput({ ...d, featured }));
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await deleteDestination(deleting.id);
      toast.success("Destination deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <PageHeader
        title="Destinations"
        subtitle={`${destinations.length} places on the website · ${featuredCount} featured in the slideshow`}
        actions={<Link href="/admin/destinations/new"><Button><Plus className="size-4" /> Add destination</Button></Link>}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
        <Tabs
          value={group}
          onChange={setGroup}
          tabs={[
            { value: "All", label: "All", count: destinations.length },
            ...groups.map((g) => ({ value: g, label: g, count: destinations.filter((d) => d.group === g).length })),
          ]}
        />
        <SearchInput value={query} onChange={setQuery} placeholder="Search destinations…" className="lg:w-64" />
      </div>

      {error ? (
        <Card><p className="p-5 text-sm text-red-700">Could not load destinations: {error}</p></Card>
      ) : loading && destinations.length === 0 ? (
        <Card><EmptyState title="Loading destinations…" /></Card>
      ) : filtered.length === 0 ? (
        <Card><EmptyState title="No destinations found" text="Add a destination to get started." /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filtered.map((d) => (
            // Clicking anywhere on the card opens the details page
            <Card key={d.id} onClick={() => router.push(`/admin/destinations/${d.id}`)} className="group relative overflow-hidden flex flex-col cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              {/* Image */}
              <div className="relative h-48 bg-[#12231a] overflow-hidden">
                {d.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.image} alt={d.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a120b]/85 via-[#0a120b]/15 to-transparent" />
                {d.featured && <div className="absolute top-3 left-3"><FeaturedBadge /></div>}

                {/* stopPropagation: these buttons should not also open the details page */}
                <div onClick={(e) => e.stopPropagation()} className="absolute z-10 top-3 right-3 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => router.push(`/admin/destinations/${d.id}/edit`)} className="p-2 rounded-lg bg-white/90 text-[#0a120b] hover:bg-white cursor-pointer" aria-label="Edit" title="Edit">
                    <Pencil className="size-3.5" />
                  </button>
                  <button onClick={() => setDeleting(d)} className="p-2 rounded-lg bg-white/90 text-red-600 hover:bg-white cursor-pointer" aria-label="Delete" title="Delete">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <GroupLabel group={d.group} className="text-[10px] uppercase tracking-[0.2em] text-[#c5a86d]" />
                  <h3 className="font-semibold text-lg leading-tight mt-0.5">
                    <Link href={`/admin/destinations/${d.id}`}>{d.title}</Link>
                  </h3>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 flex-1 flex flex-col gap-3 text-xs text-[#0a120b]/60">
                <p className="flex items-center gap-1.5"><MapPin className="size-3.5 shrink-0" /> <span className="truncate">{d.location || "—"}</span></p>
                {d.description && <p className="text-[13px] text-[#0a120b]/65 leading-relaxed line-clamp-2">{d.description}</p>}
                <div className="grid grid-cols-2 gap-2">
                  <span className="flex items-center gap-1.5 rounded-lg bg-[#f7f5f0] px-2.5 py-1.5"><Sun className="size-3.5 text-[#c5a86d]" /> {d.bestTime || "—"}</span>
                  <span className="flex items-center gap-1.5 rounded-lg bg-[#f7f5f0] px-2.5 py-1.5"><Car className="size-3.5 text-[#c5a86d]" /> {d.fromKigali || "—"}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-[#0a120b]/[0.06] bg-[#f7f5f0]/50 flex items-center justify-between text-xs text-[#0a120b]/55">
                <span>{d.highlights.length} highlights</span>
                <label onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 cursor-pointer">
                  Featured
                  <Toggle checked={d.featured} onChange={(v) => toggleFeatured(d, v)} label="Featured" />
                </label>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        title="Delete destination"
        message={`"${deleting?.title}" will be removed from the website.`}
      />
    </>
  );
}
