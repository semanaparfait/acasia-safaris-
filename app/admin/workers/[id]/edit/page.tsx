"use client";

// /admin/workers/5/edit  ->  edit worker 5
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Worker } from "@/lib/types";
import { useWorkersStore } from "@/store/workersStore";
import { Card, EmptyState } from "../../../components/ui";
import WorkerForm from "../../WorkerForm";
import { toInput, useWorker, useWorkerPermissions } from "../../parts";

export default function EditWorkerPage() {
  const router = useRouter();
  const id = useParams<{ id: string }>().id;
  const { worker, error } = useWorker(id);
  const updateWorker = useWorkersStore((s) => s.updateWorker);
  const { iAmMainAdmin, canEdit } = useWorkerPermissions();

  const save = async (w: Worker, password: string) => {
    try {
      await updateWorker(w.id, toInput(w, password));
      toast.success("Worker updated");
      router.push(`/admin/workers/${w.id}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  if (!worker) {
    return <Card>{error ? <p className="p-5 text-sm text-red-700">{error}</p> : <EmptyState title="Loading worker…" />}</Card>;
  }
  if (!canEdit(worker)) {
    return <Card><EmptyState title="You can't edit this account" text="Only the main admin can edit the main admin's account." /></Card>;
  }

  // key: start the form again when a fresh copy of the worker arrives
  return (
    <WorkerForm
      key={worker.id}
      initial={worker}
      canManageAdmins={iAmMainAdmin}
      backHref={`/admin/workers/${worker.id}`}
      onSave={save}
    />
  );
}
