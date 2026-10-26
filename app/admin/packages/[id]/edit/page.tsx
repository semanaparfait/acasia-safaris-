"use client";

// /admin/packages/7-day-gorilla/edit  ->  edit the "7-day-gorilla" package
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { TourPackage } from "@/lib/types";
import { usePackagesStore } from "@/store/packagesStore";
import { Card, EmptyState } from "../../../components/ui";
import PackageForm from "../../PackageForm";
import { toInput, usePackage } from "../../parts";

export default function EditPackagePage() {
  const router = useRouter();
  const id = useParams<{ id: string }>().id;
  const { pkg, error } = usePackage(id);
  const updatePackage = usePackagesStore((s) => s.updatePackage);

  const save = async (p: TourPackage) => {
    try {
      await updatePackage(p.id, toInput(p));
      toast.success("Package updated");
      router.push(`/admin/packages/${p.id}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  if (!pkg) {
    return <Card>{error ? <p className="p-5 text-sm text-red-700">{error}</p> : <EmptyState title="Loading package…" />}</Card>;
  }

  return <PackageForm key={pkg.id} initial={pkg} backHref={`/admin/packages/${pkg.id}`} onSave={save} />;
}
