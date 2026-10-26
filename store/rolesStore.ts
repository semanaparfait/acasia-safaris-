// Worker roles (Admin > Roles). Same pattern as packagesStore.ts.
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api } from "@/lib/api";
import type { Role, RoleInput } from "@/lib/types";

type RolesState = {
  roles: Role[];
  loading: boolean;
  error: string | null;

  load: () => Promise<void>;
  createRole: (input: RoleInput) => Promise<Role>;
  updateRole: (id: string, input: RoleInput) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;
};

export const useRolesStore = create<RolesState>()(
  devtools(
    (set, get) => ({
      roles: [],
      loading: false,
      error: null,

      load: async () => {
        set({ loading: true, error: null }, false, "roles/load/start");
        try {
          const roles = await api<Role[]>("/roles", { admin: true });
          set({ roles, loading: false }, false, "roles/load/success");
        } catch (error) {
          set({ error: (error as Error).message, loading: false }, false, "roles/load/error");
        }
      },

      createRole: async (input) => {
        const created = await api<Role>("/roles", { method: "POST", body: input, admin: true });
        const role = { ...created, workerCount: 0 };
        set(
          (state) => ({ roles: [...state.roles, role].sort((a, b) => a.name.localeCompare(b.name)) }),
          false,
          "roles/create",
        );
        return role;
      },

      updateRole: async (id, input) => {
        const updated = await api<Role>(`/roles/${id}`, { method: "PUT", body: input, admin: true });
        // keep the worker count we already know
        const workerCount = get().roles.find((r) => r.id === id)?.workerCount;
        set(
          (state) => ({ roles: state.roles.map((r) => (r.id === id ? { ...updated, workerCount } : r)) }),
          false,
          "roles/update",
        );
        return updated;
      },

      deleteRole: async (id) => {
        await api(`/roles/${id}`, { method: "DELETE", admin: true });
        set((state) => ({ roles: state.roles.filter((r) => r.id !== id) }), false, "roles/delete");
      },
    }),
    { name: "roles" },
  ),
);
