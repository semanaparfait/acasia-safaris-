"use client";

// /admin/packages/<id>  ->  details of one package
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft, Pencil, Trash2, MapPin, Clock, BedDouble, DollarSign, CalendarCheck, FileText, CalendarDays,
  Route, Check, X, Gift, Globe, ExternalLink, Compass,
} from "lucide-react";
import { daysLabel, money, tourHref } from "@/lib/helpers";
import { useBookingsStore } from "@/store/bookingsStore";
import { usePackagesStore } from "@/store/packagesStore";
import { Button, Card, ConfirmDialog, EmptyState, Toggle } from "../../components/ui";
import { LiveBadge, QuotationField, toInput, usePackage } from "../parts";

export default function PackageDetailsPage() {
  const router = useRouter();
  const id = useParams<{ id: string }>().id;
  const { pkg: p, error } = usePackage(id);
  const updatePackage = usePackagesStore((s) => s.updatePackage);
  const deletePackage = usePackagesStore((s) => s.deletePackage);
  const generateQuotation = usePackagesStore((s) => s.generateQuotation);
  const bookings = useBookingsStore((s) => s.bookings);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!p) {
    return <Card>{error ? <p className="p-5 text-sm text-red-700">{error}</p> : <EmptyState title="Loading package…" />}</Card>;
  }

  // Bookings for this package (cancelled ones do not count as revenue)
  const packageBookings = bookings.filter((b) => b.packageId === p.id);
  const revenue = packageBookings.filter((b) => b.status !== "Cancelled").reduce((sum, b) => sum + b.amount, 0);
  const travelers = packageBookings.filter((b) => b.status !== "Cancelled").reduce((sum, b) => sum + b.travelers, 0);

  const togglePublished = async (active: boolean) => {
    try {
      await updatePackage(p.id, toInput({ ...p, active, quotation: undefined }));
      toast.success(active ? "Package published" : "Package moved to drafts");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // Saved at once: there is no Save button on this page
  const saveQuotation = async (quotation: string) => {
    try {
      await updatePackage(p.id, toInput({ ...p, quotation }));
      if (!quotation) toast.success("Quotation removed");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const createQuotation = async () => {
    try {
      await generateQuotation(p.id);
      toast.success("Quotation PDF created");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const remove = async () => {
    try {
      await deletePackage(p.id);
      toast.success("Package deleted");
      router.push("/admin/packages");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="max-w-6xl">
      <Link href="/admin/packages" className="inline-flex items-center gap-1.5 text-sm text-[#0a120b]/55 hover:text-[#0a120b] mb-4">
        <ArrowLeft className="size-4" /> All packages
      </Link>

      {/* Hero */}
      <Card className="overflow-hidden mb-5">
        <div className="relative h-64 sm:h-80 bg-[#12231a]">
          {p.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a120b]/90 via-[#0a120b]/30 to-transparent" />

          <div className="absolute top-4 left-4 flex gap-2">
            {p.badge && <span className="text-[10px] font-semibold tracking-wider bg-[#c5a86d] text-[#0a120b] px-2 py-1 rounded">{p.badge}</span>}
            <span className="bg-white rounded-full"><LiveBadge active={p.active} /></span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#c5a86d]">{p.category}</p>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-1">{p.title}</h1>
              <p className="flex items-center gap-1.5 text-sm text-white/75 mt-1.5"><MapPin className="size-4" /> {p.location}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href={`/admin/packages/${p.id}/edit`}>
                <Button className="bg-white !text-[#0a120b] hover:bg-white/90"><Pencil className="size-4" /> Edit</Button>
              </Link>
              <Button onClick={() => setConfirmDelete(true)} className="bg-white/15 hover:bg-red-600 backdrop-blur"><Trash2 className="size-4" /> Delete</Button>
            </div>
          </div>
        </div>

        {/* Quick facts */}
        {/* gap-px on a tinted background draws thin lines between the white boxes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#0a120b]/[0.06]">
          <Fact icon={DollarSign} label="Price per person" value={money(p.price)} />
          <Fact icon={Clock} label="Duration" value={daysLabel(p)} />
          <Fact icon={BedDouble} label="Lodging" value={p.lodging} />
          <Fact icon={CalendarCheck} label="Bookings" value={`${packageBookings.length}`} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <InfoCard icon={FileText} title="Overview">
            {p.description ? (
              <p className="text-[15px] leading-relaxed text-[#0a120b]/75 whitespace-pre-line">{p.description}</p>
            ) : (
              <p className="text-sm text-[#0a120b]/40">No description yet.</p>
            )}
          </InfoCard>

          {/* Itinerary as a timeline */}
          <InfoCard icon={CalendarDays} title={`Itinerary · ${daysLabel(p)}`}>
            <ol className="relative space-y-5 before:absolute before:left-[15px] before:top-4 before:bottom-4 before:w-px before:bg-[#0a120b]/10">
              {p.itinerary.map((day, i) => (
                <li key={day.id ?? i} className="relative flex gap-4">
                  <span className="relative z-10 size-8 shrink-0 rounded-full bg-[#12231a] text-[#c5a86d] text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                  <div className="flex-1 min-w-0 flex gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-[#0a120b]/45">Day {i + 1}</p>
                      <p className="font-medium">{day.title}</p>
                      {day.description && <p className="text-sm text-[#0a120b]/65 mt-1 leading-relaxed">{day.description}</p>}
                    </div>
                    {day.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={day.image} alt="" className="hidden sm:block w-28 h-20 rounded-lg object-cover shrink-0" />
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </InfoCard>

          <InfoCard icon={Route} title="Route">
            {p.route.length > 0 ? (
              <ol className="flex flex-wrap items-center gap-y-3">
                {p.route.map((stop, i) => (
                  <li key={`${stop}-${i}`} className="flex items-center">
                    <span className="flex items-center gap-2 rounded-full bg-[#f7f5f0] border border-[#0a120b]/[0.06] pl-1.5 pr-3 py-1 text-sm">
                      <span className="size-5 rounded-full bg-[#12231a] text-white text-[10px] font-semibold flex items-center justify-center">{i + 1}</span>
                      {stop}
                    </span>
                    {i < p.route.length - 1 && <span className="w-6 h-px bg-[#c5a86d] mx-1" />}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-[#0a120b]/40">No route stops yet.</p>
            )}
          </InfoCard>

          <InfoCard icon={Check} title="What's included">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CheckList title="Included" items={p.inclusions} good />
              <CheckList title="Not included" items={p.exclusions} />
            </div>
          </InfoCard>

          {p.perks.length > 0 && (
            <InfoCard icon={Gift} title="Perks">
              <div className="flex flex-wrap gap-2">
                {p.perks.map((perk) => (
                  <span key={perk} className="rounded-full bg-[#c5a86d]/15 text-[#8a6d2f] px-3 py-1 text-sm">{perk}</span>
                ))}
              </div>
            </InfoCard>
          )}
        </div>

        <div className="space-y-5">
          <InfoCard icon={FileText} title="Quotation PDF">
            <QuotationField
              value={p.quotation ?? ""}
              manual={p.quotationManual}
              onChange={saveQuotation}
              onGenerate={createQuotation}
              uploadedMessage="Quotation uploaded and live on the website"
            />
          </InfoCard>

          <InfoCard icon={Globe} title="On the website">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Published</p>
                  <p className="text-xs text-[#0a120b]/50 mt-0.5">{p.active ? "Visitors can see and book it." : "Draft: only admins can see it."}</p>
                </div>
                <Toggle checked={p.active} onChange={togglePublished} label="Published" />
              </div>
              {p.active && (
                <a href={tourHref({ package: p.id })} target="_blank" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm bg-[#f7f5f0] hover:bg-[#efece4]">
                  <span className="flex items-center gap-2"><Globe className="size-4 text-[#2E7D5B]" /> View on the website</span>
                  <ExternalLink className="size-3.5 text-[#0a120b]/40" />
                </a>
              )}
            </div>
          </InfoCard>

          <InfoCard icon={CalendarCheck} title="Bookings">
            <dl className="space-y-3 text-sm">
              <Row label="Bookings" value={`${packageBookings.length}`} />
              <Row label="Travelers" value={`${travelers}`} />
              <Row label="Revenue" value={money(revenue)} />
            </dl>
            <Link href="/admin/bookings" className="block mt-4 text-xs text-[#2E7D5B] hover:underline">See all bookings</Link>
          </InfoCard>

          <InfoCard icon={Compass} title="Trip details">
            <dl className="space-y-3 text-sm">
              <Row label="Category" value={p.category} />
              <Row label="Trip type" value={p.tripType || "—"} />
              <Row label="Lodging" value={p.lodging || "—"} />
              <Row label="Location" value={p.location} />
            </dl>
          </InfoCard>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        title="Delete package"
        message={`"${p.title}" will be removed from the website. Existing bookings are kept.`}
      />
    </div>
  );
}

function CheckList({ title, items, good = false }: { title: string; items: string[]; good?: boolean }) {
  const Icon = good ? Check : X;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#0a120b]/50 mb-3">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-[#0a120b]/40">Nothing listed.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-[#0a120b]/75">
              <span className={`mt-0.5 size-5 shrink-0 rounded-full flex items-center justify-center ${good ? "bg-[#2E7D5B]/10 text-[#2E7D5B]" : "bg-red-50 text-red-500"}`}>
                <Icon className="size-3" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-5 sm:px-6 py-4 min-w-0 bg-white">
      <span className="size-10 shrink-0 rounded-xl bg-[#2E7D5B]/10 text-[#2E7D5B] flex items-center justify-center"><Icon className="size-4" /></span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-[#0a120b]/45">{label}</p>
        <p className="text-sm font-semibold truncate">{value || "—"}</p>
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
      <dd className="font-medium text-right tabular-nums">{value}</dd>
    </div>
  );
}
