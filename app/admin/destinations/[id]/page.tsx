"use client";

// /admin/destinations/<id>  ->  details of one destination
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Pencil, Trash2, MapPin, Sun, Car, Sparkles, FileText, Route, Globe, ExternalLink, CalendarPlus } from "lucide-react";
import { useDestinationsStore } from "@/store/destinationsStore";
import { Button, Card, ConfirmDialog, EmptyState, Toggle } from "../../components/ui";
import { FeaturedBadge, GroupLabel, toInput, useDestination } from "../parts";

export default function DestinationDetailsPage() {
  const router = useRouter();
  const id = useParams<{ id: string }>().id;
  const { destination: d, error } = useDestination(id);
  const updateDestination = useDestinationsStore((s) => s.updateDestination);
  const deleteDestination = useDestinationsStore((s) => s.deleteDestination);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!d) {
    return <Card>{error ? <p className="p-5 text-sm text-red-700">{error}</p> : <EmptyState title="Loading destination…" />}</Card>;
  }

  const toggleFeatured = async (featured: boolean) => {
    try {
      await updateDestination(d.id, toInput({ ...d, featured }));
      toast.success(featured ? "Now featured on the website" : "No longer featured");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const remove = async () => {
    try {
      await deleteDestination(d.id);
      toast.success("Destination deleted");
      router.push("/admin/destinations");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="max-w-6xl">
      <Link href="/admin/destinations" className="inline-flex items-center gap-1.5 text-sm text-[#0a120b]/55 hover:text-[#0a120b] mb-4">
        <ArrowLeft className="size-4" /> All destinations
      </Link>

      {/* Hero: image with the name on top */}
      <Card className="overflow-hidden mb-5">
        <div className="relative h-64 sm:h-80 bg-[#12231a]">
          {d.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={d.image} alt={d.title} className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a120b]/90 via-[#0a120b]/30 to-transparent" />

          {d.featured && <div className="absolute top-4 left-4"><FeaturedBadge /></div>}

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="min-w-0">
              <GroupLabel group={d.group} className="text-[11px] uppercase tracking-[0.2em] text-[#c5a86d]" />
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-1">{d.title}</h1>
              <p className="flex items-center gap-1.5 text-sm text-white/75 mt-1.5"><MapPin className="size-4" /> {d.location || "—"}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href={`/admin/destinations/${d.id}/edit`}>
                <Button className="bg-white !text-[#0a120b] hover:bg-white/90"><Pencil className="size-4" /> Edit</Button>
              </Link>
              <Button onClick={() => setConfirmDelete(true)} className="bg-white/15 hover:bg-red-600 backdrop-blur"><Trash2 className="size-4" /> Delete</Button>
            </div>
          </div>
        </div>

        {/* Quick facts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#0a120b]/[0.06]">
          <Fact icon={Sun} label="Best time to visit" value={d.bestTime} />
          <Fact icon={Car} label="Drive from Kigali" value={d.fromKigali} />
          <Fact icon={Sparkles} label="Highlights" value={`${d.highlights.length}`} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <InfoCard icon={FileText} title="About">
            {d.description ? (
              <p className="text-[15px] leading-relaxed text-[#0a120b]/75 whitespace-pre-line">{d.description}</p>
            ) : (
              <p className="text-sm text-[#0a120b]/40">No description yet.</p>
            )}
          </InfoCard>

          <InfoCard icon={Sparkles} title="Highlights">
            {d.highlights.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {d.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2.5 rounded-xl bg-[#f7f5f0] px-3.5 py-2.5 text-sm">
                    <span className="size-1.5 rounded-full bg-[#c5a86d] shrink-0" /> {h}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#0a120b]/40">No highlights yet.</p>
            )}
          </InfoCard>
        </div>

        <div className="space-y-5">
          <InfoCard icon={Globe} title="On the website">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Featured</p>
                  <p className="text-xs text-[#0a120b]/50 mt-0.5">Shown in the slideshow at the top of the Destinations page.</p>
                </div>
                <Toggle checked={d.featured} onChange={toggleFeatured} label="Featured" />
              </div>
              <div className="space-y-2 pt-3 border-t border-[#0a120b]/[0.06]">
                <a href="/destination" target="_blank" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-[#f7f5f0]">
                  <span className="flex items-center gap-2"><Globe className="size-4 text-[#2E7D5B]" /> Destinations page</span>
                  <ExternalLink className="size-3.5 text-[#0a120b]/40" />
                </a>
                <a href={`/booking?destination=${d.id}`} target="_blank" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-[#f7f5f0]">
                  <span className="flex items-center gap-2"><CalendarPlus className="size-4 text-[#2E7D5B]" /> Booking form (pre-selected)</span>
                  <ExternalLink className="size-3.5 text-[#0a120b]/40" />
                </a>
              </div>
            </div>
          </InfoCard>

          <InfoCard icon={Route} title="Travel info">
            <dl className="space-y-3 text-sm">
              <Row label="Group" value={<GroupLabel group={d.group} />} />
              <Row label="Location" value={d.location || "—"} />
              <Row label="Best time" value={d.bestTime || "—"} />
              <Row label="From Kigali" value={d.fromKigali || "—"} />
            </dl>
          </InfoCard>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        title="Delete destination"
        message={`"${d.title}" will be removed from the website. Its uploaded image is deleted too.`}
      />
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-5 sm:px-7 py-4">
      <span className="size-10 shrink-0 rounded-xl bg-[#2E7D5B]/10 text-[#2E7D5B] flex items-center justify-center"><Icon className="size-4" /></span>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-[#0a120b]/45">{label}</p>
        <p className="text-sm font-semibold">{value || "—"}</p>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold mb-4">
        <Icon className="size-4 text-[#2E7D5B]" /> {title}
      </h2>
      {children}
    </Card>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[#0a120b]/50">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}
