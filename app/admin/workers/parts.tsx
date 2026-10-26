"use client";

// Small pieces shared by the worker pages (list, details, add / edit).
import { useEffect, useState } from "react";
import { Crown, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import type { Worker, WorkerInput, WorkerStatus } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";
import { useRolesStore } from "@/store/rolesStore";
import { useWorkersStore } from "@/store/workersStore";
import { Avatar, Badge, Button, inputClass } from "../components/ui";

export const statuses: WorkerStatus[] = ["Active", "On leave", "Inactive"];

// A new worker that is not saved yet (id 0)
export const blankWorker: Worker = {
  id: 0,
  name: "",
  email: "",
  phone: "",
  role: "Tour Guide",
  languages: [],
  status: "Active",
  joined: new Date().toISOString().slice(0, 10),
  notes: "",
  photo: "",
  isAdmin: false,
};

// What we send to the API (everything except the id).
// The password is only sent when a new one was typed.
export function toInput(w: Worker, password = ""): WorkerInput {
  return {
    name: w.name,
    email: w.email,
    phone: w.phone,
    role: w.role,
    languages: w.languages.map((l) => l.trim()).filter(Boolean),
    status: w.status,
    joined: w.joined,
    notes: w.notes || undefined,
    photo: w.photo || undefined,
    isAdmin: w.isAdmin,
    password: password || undefined,
  };
}

// The roles from Admin > Roles (loaded once, then shared by every worker page)
export function useRoles() {
  const roles = useRolesStore((s) => s.roles);
  const load = useRolesStore((s) => s.load);
  useEffect(() => {
    load();
  }, [load]);
  return roles;
}

// Loads one worker by id (for the details and edit pages).
// Shows the copy already in the store at once, then refreshes it from the API.
export function useWorker(id: number) {
  const worker = useWorkersStore((s) => s.workers.find((w) => w.id === id));
  const loadOne = useWorkersStore((s) => s.loadOne);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadOne(id).catch((err: Error) => setError(err.message));
  }, [id, loadOne]);

  return { worker, error };
}

// What the logged-in admin may do with a worker (the API checks the same rules)
export function useWorkerPermissions() {
  const me = useAuthStore((s) => s.worker);
  const iAmMainAdmin = Boolean(me?.isOwner);
  return {
    iAmMainAdmin,
    // Only the main admin edits the main admin's account
    canEdit: (w: Worker) => !w.isOwner || me?.id === w.id,
    // The main admin can never be deleted; other admins only by the main admin
    canDelete: (w: Worker) => !w.isOwner && (!w.isAdmin || iAmMainAdmin),
  };
}

// The worker's uploaded photo, or their initials
export function WorkerPhoto({ worker, size }: { worker: Worker; size: number }) {
  if (worker.photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={worker.photo} alt={worker.name} style={{ width: size, height: size }} className="rounded-full object-cover shrink-0" />
    );
  }
  return <Avatar name={worker.name} size={size} />;
}

// "Main admin" or "Admin" badge (nothing for regular workers)
export function AdminBadge({ worker }: { worker: Worker }) {
  if (worker.isOwner) return <Badge tone="gold" dot={false}><Crown className="size-3" /> Main admin</Badge>;
  if (worker.isAdmin) return <Badge tone="gold" dot={false}><ShieldCheck className="size-3" /> Admin</Badge>;
  return null;
}

// Languages as small pills; extra ones are shown as "+2"
export function LanguageChips({ languages, max = 4 }: { languages: string[]; max?: number }) {
  if (languages.length === 0) return <span className="text-xs text-[#0a120b]/35">No languages</span>;
  const shown = languages.slice(0, max);
  const hidden = languages.slice(max);
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((l) => (
        <span key={l} className="px-2 py-0.5 rounded-full bg-[#f7f5f0] border border-[#0a120b]/[0.06] text-[11px] text-[#0a120b]/70 whitespace-nowrap">{l}</span>
      ))}
      {hidden.length > 0 && (
        <span title={hidden.join(", ")} className="px-2 py-0.5 rounded-full bg-[#12231a]/5 text-[11px] text-[#0a120b]/55">+{hidden.length}</span>
      )}
    </div>
  );
}

// Edit / delete buttons. The rules (who can edit or delete) are decided by the page.
export function WorkerActions({ canEdit, canDelete, onEdit, onDelete }: { canEdit: boolean; canDelete: boolean; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-1">
      {canEdit && (
        <button onClick={onEdit} className="p-1.5 rounded-lg text-[#0a120b]/55 hover:text-[#0a120b] hover:bg-[#0a120b]/5 cursor-pointer" aria-label="Edit" title="Edit"><Pencil className="size-4" /></button>
      )}
      {canDelete && (
        <button onClick={onDelete} className="p-1.5 rounded-lg text-[#0a120b]/55 hover:text-red-600 hover:bg-red-50 cursor-pointer" aria-label="Delete" title="Delete"><Trash2 className="size-4" /></button>
      )}
    </div>
  );
}


// Languages offered as buttons. Anything else is added with "Other".
export const commonLanguages = ["English", "French", "Kinyarwanda", "Swahili"];

// Click a language to select / unselect it. "Other" shows a box to type a new one.
export function LanguagePicker({ value, onChange }: { value: string[]; onChange: (languages: string[]) => void }) {
  const [showOther, setShowOther] = useState(false);
  const [other, setOther] = useState("");

  const selected = value.map((l) => l.trim()).filter(Boolean);
  const custom = selected.filter((l) => !commonLanguages.includes(l)); // languages added with "Other"

  const toggle = (language: string) =>
    onChange(selected.includes(language) ? selected.filter((l) => l !== language) : [...selected, language]);

  const addOther = () => {
    const language = other.trim();
    if (!language) return;
    // Same spelling as an existing one (e.g. "english") -> use the existing one
    const existing = [...commonLanguages, ...selected].find((l) => l.toLowerCase() === language.toLowerCase());
    if (!selected.includes(existing ?? language)) onChange([...selected, existing ?? language]);
    setOther("");
  };

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs border transition-colors cursor-pointer ${
      active ? "bg-[#12231a] text-white border-[#12231a]" : "bg-white text-[#0a120b]/70 border-[#0a120b]/15 hover:border-[#12231a]"
    }`;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {[...commonLanguages, ...custom].map((language) => (
          <button key={language} type="button" onClick={() => toggle(language)} className={chip(selected.includes(language))}>
            {language}
          </button>
        ))}
        <button type="button" onClick={() => setShowOther(!showOther)} className={chip(showOther)}>
          <Plus className="size-3 inline -mt-0.5" /> Other
        </button>
      </div>

      {showOther && (
        <div className="flex gap-2">
          <input
            autoFocus
            className={inputClass}
            value={other}
            onChange={(e) => setOther(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // do not submit the form
                addOther();
              }
            }}
            placeholder="Type a language, e.g. Portuguese"
          />
          <Button variant="secondary" onClick={addOther} disabled={!other.trim()}>Add</Button>
        </div>
      )}
    </div>
  );
}
