"use client";

// /admin/packages/new  ->  add a tour package
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { TourPackage } from "@/lib/types";
import { usePackagesStore } from "@/store/packagesStore";
import PackageForm from "../PackageForm";
import { blankPackage, toInput } from "../parts";

export default function NewPackagePage() {
  const router = useRouter();
  const createPackage = usePackagesStore((s) => s.createPackage);

  const save = async (p: TourPackage) => {
    try {
      const created = await createPackage(toInput(p));
      toast.success("Package created");
      router.push(`/admin/packages/${created.id}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return <PackageForm initial={blankPackage} backHref="/admin/packages" onSave={save} />;
}
