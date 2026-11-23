// Live updates from the backend (Socket.IO, namespace /live): nothing needs a reload.
//   Admin panel:        liveSocket(adminLiveAuth)        -> "booking", "booking:deleted"
//   Visitor's booking:  liveSocket({ booking: <token> }) -> "booking", "typing" { name, typing }
//   Admin typing a reply: sendTyping(bookingId, true/false) -> the visitor sees "<name> is typing…"
//   Visitor typing: "customerTyping" { bookingId, typing } -> useCustomerTyping in the admin panel
// WebSockets go straight to the backend (Next.js cannot forward them).
import { io, type Socket } from "socket.io-client";
import { create } from "zustand";
import { api } from "./api";

// NEXT_PUBLIC_API_URL is the backend's address, e.g. https://api.example.com/api
const SERVER_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/api\/?$/, "");

type Auth = { token: string } | { booking: string };

// The admin's login is an httpOnly cookie the page cannot read, so the panel asks the
// API for a short live token, again on every reconnect (it is valid 2 minutes)
export const adminLiveAuth = (send: (auth: Auth) => void) => {
  api<{ token: string }>("/auth/live-token", { admin: true })
    .then(({ token }) => send({ token }))
    .catch(() => send({ token: "" })); // the server refuses it; reconnects try again
};

export function liveSocket(auth: Auth | ((send: (auth: Auth) => void) => void)): Socket {
  return io(`${SERVER_URL}/live`, {
    auth,
    transports: ["websocket"], // straight to WebSocket, no long-polling first
    reconnectionDelayMax: 5000,
  });
}

// The admin panel's open connection (set in AdminShell), used to send "typing"
let adminSocket: Socket | null = null;
export const setAdminSocket = (socket: Socket | null) => {
  adminSocket = socket;
};
export const sendTyping = (bookingId: string, typing: boolean) => {
  adminSocket?.emit("typing", { bookingId, typing });
};

// Admin panel: which customers are writing right now (booking ids). A "typing" that is
// never followed by "stopped" (closed tab) ends by itself after 6 seconds.
const typingTimers: Record<string, ReturnType<typeof setTimeout>> = {};
export const useCustomerTyping = create<{ typing: Record<string, true> }>()(() => ({ typing: {} }));
export const setCustomerTyping = (bookingId: string, typing: boolean) => {
  clearTimeout(typingTimers[bookingId]);
  useCustomerTyping.setState((s) => {
    const next = { ...s.typing };
    if (typing) next[bookingId] = true;
    else delete next[bookingId];
    return { typing: next };
  });
  if (typing) typingTimers[bookingId] = setTimeout(() => setCustomerTyping(bookingId, false), 6000);
};
