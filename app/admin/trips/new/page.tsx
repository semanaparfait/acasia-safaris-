"use client";

// /admin/trips/new  ->  plan a new trip
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { TripInput } from "@/lib/types";
import { useTripsStore } from "@/store/tripsStore";
import TripForm, { blankTrip } from "../TripForm";

export default function NewTripPage() {
  const router = useRouter();
  const createTrip = useTripsStore((s) => s.createTrip);

  const save = async (input: TripInput) => {
    try {
      const trip = await createTrip(input);
      toast.success(trip.active ? "Trip created: it is on the website now" : "Trip saved as a draft");
      router.push("/admin/trips");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return <TripForm initial={blankTrip} isNew onSave={save} />;
}
