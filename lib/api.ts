// Small helper for calling the NestJS backend (backend/).
// Every store in /store uses it, so all requests go through one place.
import { useAuthStore } from "@/store/authStore";
import type { Bucket } from "./types";

// The website's own /api address: Next.js forwards it to the backend (see next.config.ts).
// Same address as the page, so the admin login cookie is a normal first-party cookie.
export const API_URL = "/api";

// Every request carries this header. With the login cookie, the backend only accepts
// changes that have it, which other websites cannot add (protection against CSRF).
const BASE_HEADERS = { "X-Requested-With": "acacia" };

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown; // sent as JSON
  admin?: boolean; // true = an admin route (🔒 in backend/README.md): a 401 logs the admin out
};

/**
 * Calls the API and returns the JSON response.
 * Throws an Error with a readable message when the request fails.
 *
 *   const packages = await api<TourPackage[]>("/packages");
 *   await api("/workers/3", { method: "DELETE", admin: true });
 */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, admin = false } = options;

  const headers: Record<string, string> = { ...BASE_HEADERS };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(API_URL + path, {
      method,
      headers,
      credentials: "include", // the login cookie
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  return readResponse<T>(response, admin);
}

/**
 * Uploads an image to a Neon Storage bucket and returns its URL.
 *
 *   const url = await uploadImage("gallery", file);
 */
export async function uploadImage(bucket: Bucket, file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/uploads/${bucket}`, {
      method: "POST",
      headers: BASE_HEADERS,
      credentials: "include",
      body: form,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const result = await readResponse<{ url: string }>(response, true);
  return result.url;
}

async function readResponse<T>(response: Response, admin: boolean): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Login expired or admin access removed: log out so the admin is sent back to the login page
    if (response.status === 401 && admin) useAuthStore.getState().logout();
    throw new Error(errorMessage(data, response.status));
  }
  return data as T;
}

// NestJS errors look like { message: "..." } or { message: ["...", "..."] }
function errorMessage(data: unknown, status: number) {
  const message = (data as { message?: string | string[] } | null)?.message;
  if (Array.isArray(message)) return message.join(", ");
  if (message) return message;
  return `Request failed (${status})`;
}
