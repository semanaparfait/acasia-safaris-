"use client";

// /admin/trips/<id>  ->  edit one trip
import { use, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import type { Trip, TripInput } from "@/lib/types";
import { useTripsStore } from "@/store/tripsStore";
import { Card, EmptyState } from "../../components/ui";
import TripForm, { toInput } from "../TripForm";
import TranslationsPanel from "../../components/TranslationsPanel";

export default function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const getTrip = useTripsStore((s) => s.getTrip);
  const updateTrip = useTripsStore((s) => s.updateTrip);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTrip(id).then(setTrip, (err: Error) => setError(err.message));
  }, [getTrip, id]);

  const save = async (input: TripInput) => {
    try {
      const saved = await updateTrip(id, input);
      setTrip(saved);
      toast.success("Trip saved");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  if (error)
    return (
      <Card className="p-6 text-sm">
        <p className="text-red-700">Could not load this trip: {error}</p>
        <Link href="/admin/trips" className="text-[#2E7D5B] underline mt-2 inline-block">Back to trips</Link>
      </Card>
    );
  if (!trip) return <Card><EmptyState title="Loading trip…" /></Card>;

  // key: after saving, the form starts again from what the server kept
  return (
    <>
      <TripForm
        key={trip.updatedAt}
        initial={toInput(trip)}
        isNew={false}
        previewHref={trip.active ? `/trips/${trip.id}` : undefined}
        onSave={save}
      />
      {/* French and Swahili texts of the trip page (price option names stay in English) */}
      <div className="mt-6">
        <TranslationsPanel kind="trips" id={trip.id} version={trip.updatedAt} />
      </div>
    </>
  );
}
