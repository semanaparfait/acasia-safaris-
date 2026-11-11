// Live updates from the backend (Socket.IO, namespace /live): nothing needs a reload.
//   Admin panel:        liveSocket({ token })            -> "booking", "booking:deleted"
//   Visitor's booking:  liveSocket({ booking: <token> }) -> "booking"
import { io, type Socket } from "socket.io-client";
import { API_URL } from "./api";

// http://localhost:4000/api -> http://localhost:4000
const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

export function liveSocket(auth: { token: string } | { booking: string }): Socket {
  return io(`${SERVER_URL}/live`, {
    auth,
    transports: ["websocket"], // straight to WebSocket, no long-polling first
    reconnectionDelayMax: 5000,
  });
}
