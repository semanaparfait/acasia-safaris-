"use client";

// The team member a visitor "chats with": in the WhatsApp card and the booking conversation.
// When someone from the team already answered (preferName), it is them; otherwise one of the
// workers shown on the website, picked at random and kept for the whole visit.
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { TeamMember } from "@/lib/types";

const MEMBER_KEY = "acacia-chat-member";

let teamRequest: Promise<TeamMember[]> | null = null; // one request for the whole page
const loadTeam = () => (teamRequest ??= api<TeamMember[]>("/team").catch(() => []));

export const initials = (name: string) =>
  name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

export type ChatMember = { name: string; photo: string | null; role: string | null };

export function useChatMember(preferName?: string): ChatMember | null {
  const [team, setTeam] = useState<TeamMember[] | null>(null);
  const [randomId, setRandomId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadTeam().then((list) => {
      if (cancelled) return;
      setTeam(list);
      if (list.length === 0) return;
      let saved: string | null = null;
      try { saved = sessionStorage.getItem(MEMBER_KEY); } catch {}
      const pick = list.find((m) => m.id === saved) ?? list[Math.floor(Math.random() * list.length)];
      try { sessionStorage.setItem(MEMBER_KEY, pick.id); } catch {}
      setRandomId(pick.id);
    });
    return () => { cancelled = true; };
  }, []);

  if (preferName) {
    const known = team?.find((m) => m.name.trim().toLowerCase() === preferName.trim().toLowerCase());
    return { name: preferName, photo: known?.photo ?? null, role: known?.companyRole ?? null };
  }
  const random = team?.find((m) => m.id === randomId);
  return random ? { name: random.name, photo: random.photo, role: random.companyRole } : null;
}
