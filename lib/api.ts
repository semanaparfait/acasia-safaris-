// Small helper for calling the NestJS backend (backend/).
// Every store in /store uses it, so all requests go through one place.
import { useAuthStore } from "@/store/authStore";
import type { Bucket } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown; // sent as JSON
  admin?: boolean; // true = send the login token (routes marked 🔒 in backend/README.md)
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

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (admin) headers["Authorization"] = `Bearer ${useAuthStore.getState().token}`;

  let response: Response;
  try {
    response = await fetch(API_URL + path, {
      method,
      headers,
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
      headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
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
    // Expired token or admin access removed: log out so the admin is sent back to the login page
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
