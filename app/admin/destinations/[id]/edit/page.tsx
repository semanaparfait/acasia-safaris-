"use client";

// /admin/destinations/<id>/edit  ->  edit one destination
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Destination } from "@/lib/types";
import { useDestinationsStore } from "@/store/destinationsStore";
import { Card, EmptyState } from "../../../components/ui";
import DestinationForm from "../../DestinationForm";
import { toInput, useDestination } from "../../parts";

export default function EditDestinationPage() {
  const router = useRouter();
  const id = useParams<{ id: string }>().id;
  const { destination, error } = useDestination(id);
  const updateDestination = useDestinationsStore((s) => s.updateDestination);

  const save = async (d: Destination) => {
    try {
      await updateDestination(d.id, toInput(d));
      toast.success("Destination updated");
      router.push(`/admin/destinations/${d.id}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  if (!destination) {
    return <Card>{error ? <p className="p-5 text-sm text-red-700">{error}</p> : <EmptyState title="Loading destination…" />}</Card>;
  }

  return <DestinationForm key={destination.id} initial={destination} backHref={`/admin/destinations/${destination.id}`} onSave={save} />;
}
