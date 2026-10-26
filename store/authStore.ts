// Admin login state. Admins are workers with "Admin access" (see Admin > Workers).
// The token and the worker are saved in localStorage ("persist"),
// so the admin stays logged in after a page reload (the token lasts 7 days).
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { api } from "@/lib/api";
import type { Worker } from "@/lib/types";

type AuthState = {
  token: string; // empty = logged out
  worker: Worker | null; // the logged-in worker

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        token: "",
        worker: null,

        // Throws "Wrong email or password" etc. so the login page can show it
        login: async (email, password) => {
          const result = await api<{ token: string; worker: Worker }>("/auth/login", {
            method: "POST",
            body: { email, password },
          });
          set({ token: result.token, worker: result.worker }, false, "auth/login");
        },

        logout: () => set({ token: "", worker: null }, false, "auth/logout"),
      }),
      { name: "acacia-admin" }, // localStorage key
    ),
    { name: "auth" }, // name shown in Redux DevTools
  ),
);
