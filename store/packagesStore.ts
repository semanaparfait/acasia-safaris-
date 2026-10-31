// Tour packages, loaded from the API.
//
// How every store in this folder works:
//   - state:   the data + "loading" + "error"
//   - actions: functions that call the API, then update the state with set()
//   - each set() has a name (e.g. "packages/load/success") that shows up in the
//     Redux DevTools browser extension, so you can see every change while debugging.
//
// Use it in a component:
//   const packages = usePackagesStore((s) => s.packages);
//   const loadPublished = usePackagesStore((s) => s.loadPublished);
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api } from "@/lib/api";
import type { PackageInput, TourPackage } from "@/lib/types";

type PackagesState = {
  packages: TourPackage[];
  loading: boolean;
  error: string | null;

  loadPublished: () => Promise<void>; // website
  loadAll: () => Promise<void>; // admin (drafts included)
  loadOne: (id: string) => Promise<TourPackage>; // one package (details / edit pages)
  createPackage: (input: PackageInput) => Promise<TourPackage>;
  updatePackage: (id: string, input: PackageInput) => Promise<TourPackage>;
  deletePackage: (id: string) => Promise<void>;
  generateQuotation: (id: string) => Promise<TourPackage>; // makes the PDF from the package
  emailQuotation: (id: string, input: { name: string; email: string }) => Promise<void>; // website
};

export const usePackagesStore = create<PackagesState>()(
  devtools(
    (set) => ({
      packages: [],
      loading: false,
      error: null,

      loadPublished: async () => {
        set({ loading: true, error: null }, false, "packages/load/start");
        try {
          const packages = await api<TourPackage[]>("/packages");
          set({ packages, loading: false }, false, "packages/load/success");
        } catch (error) {
          set({ error: (error as Error).message, loading: false }, false, "packages/load/error");
        }
      },

      loadAll: async () => {
        set({ loading: true, error: null }, false, "packages/loadAll/start");
        try {
          const packages = await api<TourPackage[]>("/packages/all", { admin: true });
          set({ packages, loading: false }, false, "packages/loadAll/success");
        } catch (error) {
          set({ error: (error as Error).message, loading: false }, false, "packages/loadAll/error");
        }
      },

      // Fetches one package and puts it in the list (replacing the old copy)
      loadOne: async (id) => {
        const pkg = await api<TourPackage>(`/packages/${id}`);
        set(
          (state) => ({
            packages: state.packages.some((p) => p.id === id)
              ? state.packages.map((p) => (p.id === id ? pkg : p))
              : [...state.packages, pkg],
          }),
          false,
          "packages/loadOne",
        );
        return pkg;
      },

      // Create / update / delete throw on failure, so the page can show a toast
      createPackage: async (input) => {
        const created = await api<TourPackage>("/packages", { method: "POST", body: input, admin: true });
        set((state) => ({ packages: [...state.packages, created] }), false, "packages/create");
        return created;
      },

      updatePackage: async (id, input) => {
        const updated = await api<TourPackage>(`/packages/${id}`, { method: "PUT", body: input, admin: true });
        set(
          (state) => ({ packages: state.packages.map((p) => (p.id === id ? updated : p)) }),
          false,
          "packages/update",
        );
        return updated;
      },

      deletePackage: async (id) => {
        await api(`/packages/${id}`, { method: "DELETE", admin: true });
        set((state) => ({ packages: state.packages.filter((p) => p.id !== id) }), false, "packages/delete");
      },

      generateQuotation: async (id) => {
        const updated = await api<TourPackage>(`/packages/${id}/quotation`, { method: "POST", admin: true });
        set(
          (state) => ({ packages: state.packages.map((p) => (p.id === id ? updated : p)) }),
          false,
          "packages/generateQuotation",
        );
        return updated;
      },

      emailQuotation: async (id, input) => {
        await api(`/packages/${id}/quotation/email`, { method: "POST", body: input });
      },
    }),
    { name: "packages" }, // name shown in Redux DevTools
  ),
);
