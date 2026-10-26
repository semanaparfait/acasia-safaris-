"use client";

// /admin/workers/new  ->  add a worker
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Worker } from "@/lib/types";
import { useWorkersStore } from "@/store/workersStore";
import WorkerForm from "../WorkerForm";
import { blankWorker, toInput, useWorkerPermissions } from "../parts";

export default function NewWorkerPage() {
  const router = useRouter();
  const createWorker = useWorkersStore((s) => s.createWorker);
  const { iAmMainAdmin } = useWorkerPermissions();

  const save = async (w: Worker, password: string) => {
    try {
      const created = await createWorker(toInput(w, password));
      toast.success("Worker added");
      router.push(`/admin/workers/${created.id}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return <WorkerForm initial={blankWorker} canManageAdmins={iAmMainAdmin} backHref="/admin/workers" onSave={save} />;
}
