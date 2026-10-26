// Workers (admin only). Same pattern as packagesStore.ts.
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api } from "@/lib/api";
import type { Worker, WorkerInput } from "@/lib/types";

type WorkersState = {
  workers: Worker[];
  loading: boolean;
  error: string | null;

  load: () => Promise<void>;
  loadOne: (id: number) => Promise<Worker>; // one worker (details / edit pages)
  createWorker: (input: WorkerInput) => Promise<Worker>;
  updateWorker: (id: number, input: WorkerInput) => Promise<Worker>;
  deleteWorker: (id: number) => Promise<void>;
};

export const useWorkersStore = create<WorkersState>()(
  devtools(
    (set) => ({
      workers: [],
      loading: false,
      error: null,

      load: async () => {
        set({ loading: true, error: null }, false, "workers/load/start");
        try {
          const workers = await api<Worker[]>("/workers", { admin: true });
          set({ workers, loading: false }, false, "workers/load/success");
        } catch (error) {
          set({ error: (error as Error).message, loading: false }, false, "workers/load/error");
        }
      },

      // Fetches one worker and puts it in the list (replacing the old copy)
      loadOne: async (id) => {
        const worker = await api<Worker>(`/workers/${id}`, { admin: true });
        set(
          (state) => ({
            workers: state.workers.some((w) => w.id === id)
              ? state.workers.map((w) => (w.id === id ? worker : w))
              : [...state.workers, worker],
          }),
          false,
          "workers/loadOne",
        );
        return worker;
      },

      createWorker: async (input) => {
        const created = await api<Worker>("/workers", { method: "POST", body: input, admin: true });
        set((state) => ({ workers: [created, ...state.workers] }), false, "workers/create");
        return created;
      },

      updateWorker: async (id, input) => {
        const updated = await api<Worker>(`/workers/${id}`, { method: "PUT", body: input, admin: true });
        set(
          (state) => ({ workers: state.workers.map((w) => (w.id === id ? updated : w)) }),
          false,
          "workers/update",
        );
        return updated;
      },

      deleteWorker: async (id) => {
        await api(`/workers/${id}`, { method: "DELETE", admin: true });
        set((state) => ({ workers: state.workers.filter((w) => w.id !== id) }), false, "workers/delete");
      },
    }),
    { name: "workers" },
  ),
);
