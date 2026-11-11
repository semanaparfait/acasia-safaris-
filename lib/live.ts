// Live updates from the backend (Socket.IO, namespace /live): nothing needs a reload.
//   Admin panel:        liveSocket(adminLiveAuth)        -> "booking", "booking:deleted"
//   Visitor's booking:  liveSocket({ booking: <token> }) -> "booking"
// WebSockets go straight to the backend (Next.js cannot forward them).
import { io, type Socket } from "socket.io-client";
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
