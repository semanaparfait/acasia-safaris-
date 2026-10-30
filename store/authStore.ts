// Admin login state. Admins are workers with "Admin access" (see Admin > Workers).
// The token and the worker are saved in localStorage ("persist"),
// so the admin stays logged in after a page reload (the token lasts 7 days).
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { api } from "@/lib/api";
import type { Worker } from "@/lib/types";

export type AccountChanges = {
  name?: string;
  email?: string;
  phone?: string;
  photo?: string; // "" removes the photo
  currentPassword?: string; // needed to change the email
};

type AuthState = {
  token: string; // empty = logged out
  worker: Worker | null; // the logged-in worker

  login: (email: string, password: string) => Promise<void>;
  logout: () => void; // forgets the login in this browser only (used when the API answers 401)
  signOut: () => Promise<void>; // also ends the login on the server
  updateAccount: (changes: AccountChanges) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
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

        signOut: async () => {
          try {
            await api("/auth/logout", { method: "POST", admin: true });
          } catch {
            // The server could not be reached: still log out of this browser
          }
          get().logout();
        },

        updateAccount: async (changes) => {
          const worker = await api<Worker>("/auth/me", { method: "PATCH", body: changes, admin: true });
          set({ worker }, false, "auth/updateAccount");
        },

        changePassword: async (currentPassword, newPassword) => {
          const result = await api<{ token: string; worker: Worker }>("/auth/me/password", {
            method: "PATCH",
            body: { currentPassword, newPassword },
            admin: true,
          });
          set({ token: result.token, worker: result.worker }, false, "auth/changePassword");
        },
      }),
      { name: "acacia-admin" }, // localStorage key
    ),
    { name: "auth" }, // name shown in Redux DevTools
  ),
);
