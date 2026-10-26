"use client";

// /admin/destinations/new  ->  add a destination
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Destination } from "@/lib/types";
import { useDestinationsStore } from "@/store/destinationsStore";
import DestinationForm from "../DestinationForm";
import { blankDestination, toInput } from "../parts";

export default function NewDestinationPage() {
  const router = useRouter();
  const createDestination = useDestinationsStore((s) => s.createDestination);

  const save = async (d: Destination) => {
    try {
      const created = await createDestination(toInput(d));
      toast.success("Destination added");
      router.push(`/admin/destinations/${created.id}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return <DestinationForm initial={blankDestination} backHref="/admin/destinations" onSave={save} />;
}
