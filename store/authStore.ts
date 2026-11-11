// Admin login state. Admins are workers with "Admin access" (see Admin > Workers).
// The login itself is an httpOnly cookie set by the API: the page never sees the token,
// so a malicious script cannot steal it. Here we only remember WHO is logged in
// (saved in localStorage, so the panel shows at once after a reload). If the cookie
// has expired, the first admin request answers 401 and the admin is sent to the login page.
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { api } from "@/lib/api";
import type { Worker } from "@/lib/types";

export type AccountChanges = {
  name?: string;
  personalEmail?: string; // where the forgot-password and sign-in codes are sent
  phone?: string;
  photo?: string; // "" removes the photo
  currentPassword?: string; // needed to change the personal email
};

// Login step 1 answers with this when a 6 digit code was emailed
export type LoginChallenge = { challenge: string; sentTo: string };

type AuthState = {
  worker: Worker | null; // the logged-in worker (null = logged out)

  // Two-step login. Step 1: password. Returns the code challenge, or null when
  // logged in at once (a trusted browser). Throws "Wrong email or password" etc.
  login: (email: string, password: string) => Promise<LoginChallenge | null>;
  // Step 2: the emailed code. remember = trust this browser for 30 days.
  verifyLogin: (challenge: string, code: string, remember: boolean) => Promise<void>;
  resendLoginCode: (challenge: string) => Promise<void>;

  logout: () => void; // forgets the login in this browser only (used when the API answers 401)
  signOut: () => Promise<void>; // also ends the login on the server (every device)
  updateAccount: (changes: AccountChanges) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;

  // Forgot password (no login needed). "email" is the company email (the login).
  forgotPassword: (email: string) => Promise<string>; // emails a 6 digit code, returns where it went ("sh****it@gmail.com")
  verifyResetCode: (email: string, code: string) => Promise<void>; // throws "Wrong code…" etc.
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>; // also logs in
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        worker: null,

        login: async (email, password) => {
          const result = await api<{ worker: Worker } | ({ twoStep: true } & LoginChallenge)>("/auth/login", {
            method: "POST",
            body: { email, password },
          });
          if ("twoStep" in result) return { challenge: result.challenge, sentTo: result.sentTo };
          set({ worker: result.worker }, false, "auth/login");
          return null;
        },

        verifyLogin: async (challenge, code, remember) => {
          const { worker } = await api<{ worker: Worker }>("/auth/login/verify", {
            method: "POST",
            body: { challenge, code, remember },
          });
          set({ worker }, false, "auth/verifyLogin");
        },

        resendLoginCode: async (challenge) => {
          await api("/auth/login/resend", { method: "POST", body: { challenge } });
        },

        logout: () => set({ worker: null }, false, "auth/logout"),

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
          const { worker } = await api<{ worker: Worker }>("/auth/me/password", {
            method: "PATCH",
            body: { currentPassword, newPassword },
            admin: true,
          });
          set({ worker }, false, "auth/changePassword");
        },

        forgotPassword: async (email) => {
          const result = await api<{ sentTo: string }>("/auth/forgot-password", {
            method: "POST",
            body: { email },
          });
          return result.sentTo;
        },

        verifyResetCode: async (email, code) => {
          await api("/auth/verify-reset-code", { method: "POST", body: { email, code } });
        },

        resetPassword: async (email, code, newPassword) => {
          const { worker } = await api<{ worker: Worker }>("/auth/reset-password", {
            method: "POST",
            body: { email, code, newPassword },
          });
          set({ worker }, false, "auth/resetPassword");
        },
      }),
      {
        name: "acacia-admin", // localStorage key
        // Version 2: the token is no longer kept in the browser. Older saved logins
        // (with a token) are dropped, so everyone signs in once with the new login.
        version: 2,
        migrate: () => ({ worker: null }),
        partialize: (state) => ({ worker: state.worker }),
      },
    ),
    { name: "auth" }, // name shown in Redux DevTools
  ),
);
