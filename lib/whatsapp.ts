// WhatsApp links, and the package the visitor is looking at (so the chat button can offer
// "Ask about this trip" with the package name already in the message).
import { create } from "zustand";
import { COMPANY } from "./company";

// https://wa.me/250…?text=…  (opens WhatsApp with the message ready to send)
export const whatsappLink = (message?: string) =>
  `https://wa.me/${COMPANY.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export type WhatsAppTopic = { title: string; days: number; url: string };

// Set by the package details (TourDetail) while it is on screen
export const useWhatsAppTopic = create<{
  topic: WhatsAppTopic | null;
  setTopic: (topic: WhatsAppTopic | null) => void;
}>()((set) => ({
  topic: null,
  setTopic: (topic) => set({ topic }),
}));
