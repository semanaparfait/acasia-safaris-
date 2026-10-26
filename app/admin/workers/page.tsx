"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Mail, Phone, Languages, ShieldCheck, Crown } from "lucide-react";
import { Avatar, Badge, Button, Card, ConfirmDialog, EmptyState, Modal, PageHeader, SearchInput, StatusBadge, Tabs, Toggle, inputClass, labelClass } from "../components/ui";
import { workerRoles, type Worker, type WorkerInput, type WorkerStatus } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";
import { useWorkersStore } from "@/store/workersStore";
import ImageField from "../components/ImageField";

const statuses: WorkerStatus[] = ["Active", "On leave", "Inactive"];

// id 0 = a new worker that is not saved yet
const blank: Worker = {
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
function toInput(w: Worker, password = ""): WorkerInput {
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

export default function WorkersPage() {
  const workers = useWorkersStore((s) => s.workers);
  const loading = useWorkersStore((s) => s.loading);
  const error = useWorkersStore((s) => s.error);
  const load = useWorkersStore((s) => s.load);
  const createWorker = useWorkersStore((s) => s.createWorker);
  const updateWorker = useWorkersStore((s) => s.updateWorker);
  const deleteWorker = useWorkersStore((s) => s.deleteWorker);
  const me = useAuthStore((s) => s.worker); // the logged-in admin
  const iAmMainAdmin = Boolean(me?.isOwner);

  useEffect(() => {
    load();
  }, [load]);

  const [role, setRole] = useState("All");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Worker | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = workers.filter(
    (w) =>
      (role === "All" || w.role === role) &&
      [w.name, w.email, w.phone, ...w.languages].some((f) => f.toLowerCase().includes(query.toLowerCase()))
  );

  const save = async (w: Worker, password: string) => {
    try {
      if (!w.id) {
        await createWorker(toInput(w, password));
        toast.success("Worker added");
      } else {
        await updateWorker(w.id, toInput(w, password));
        toast.success("Worker updated");
      }
      setEditing(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const remove = async () => {
    if (deleteId === null) return;
    try {
      await deleteWorker(deleteId);
      toast.success("Worker removed");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const stats = [
    { label: "Total workers", value: workers.length },
    { label: "Active", value: workers.filter((w) => w.status === "Active").length },
    { label: "On leave", value: workers.filter((w) => w.status === "On leave").length },
    { label: "Admins (can log in)", value: workers.filter((w) => w.isAdmin).length },
  ];

  return (
    <>
      <PageHeader
        title="Workers"
        subtitle="Guides, drivers and office staff working with Acacia Safaris."
        actions={<Button onClick={() => setEditing(blank)}><Plus className="size-4" /> Add worker</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-xs text-[#0a120b]/50">{s.label}</p>
            <p className="text-2xl font-semibold mt-1 tabular-nums">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
        <Tabs
          value={role}
          onChange={setRole}
          tabs={[
            { value: "All", label: "All", count: workers.length },
            ...workerRoles.map((r) => ({ value: r, label: r, count: workers.filter((w) => w.role === r).length })),
          ]}
        />
        <SearchInput value={query} onChange={setQuery} placeholder="Search workers…" className="lg:w-64" />
      </div>

      <Card className="overflow-hidden">
        {error ? (
          <p className="p-5 text-sm text-red-700">Could not load workers: {error}</p>
        ) : loading && workers.length === 0 ? (
          <EmptyState title="Loading workers…" />
        ) : filtered.length === 0 ? (
          <EmptyState title="No workers found" text="Add a worker to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#0a120b]/45 bg-[#f7f5f0]/60 border-b border-[#0a120b]/[0.06]">
                  <th className="px-5 py-3 font-medium">Worker</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Languages</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0a120b]/[0.05]">
                {filtered.map((w) => (
                  <tr key={w.id} className="hover:bg-[#f7f5f0]/70">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {w.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={w.photo} alt={w.name} className="size-9 rounded-full object-cover" />
                        ) : (
                          <Avatar name={w.name} size={36} />
                        )}
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {w.name}
                            {w.isOwner ? (
                              <Badge tone="gold" dot={false}><Crown className="size-3" /> Main admin</Badge>
                            ) : (
                              w.isAdmin && <Badge tone="gold" dot={false}><ShieldCheck className="size-3" /> Admin</Badge>
                            )}
                          </p>
                          <p className="text-xs text-[#0a120b]/45 max-w-[240px] truncate">{w.notes || `#${w.id}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#0a120b]/70 whitespace-nowrap">{w.role}</td>
                    <td className="px-5 py-3 text-[#0a120b]/65">
                      <a href={`mailto:${w.email}`} className="flex items-center gap-1.5 hover:text-[#2E7D5B]"><Mail className="size-3.5" /> {w.email}</a>
                      <a href={`tel:${w.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 text-xs mt-0.5 hover:text-[#2E7D5B]"><Phone className="size-3.5" /> {w.phone}</a>
                    </td>
                    <td className="px-5 py-3 text-[#0a120b]/65">
                      <span className="flex items-center gap-1.5 text-xs"><Languages className="size-3.5 shrink-0" /> {w.languages.join(", ") || "—"}</span>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={w.status} /></td>
                    <td className="px-5 py-3 text-[#0a120b]/65 whitespace-nowrap">{format(new Date(w.joined), "d MMM yyyy")}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        {/* Only the main admin can edit their own account */}
                        {(!w.isOwner || me?.id === w.id) && (
                          <button onClick={() => setEditing(w)} className="p-1.5 rounded-lg text-[#0a120b]/55 hover:bg-[#0a120b]/5 cursor-pointer" aria-label="Edit"><Pencil className="size-4" /></button>
                        )}
                        {/* The main admin can never be deleted; other admins only by the main admin */}
                        {!w.isOwner && (!w.isAdmin || iAmMainAdmin) && (
                          <button onClick={() => setDeleteId(w.id)} className="p-1.5 rounded-lg text-[#0a120b]/55 hover:text-red-600 hover:bg-red-50 cursor-pointer" aria-label="Delete"><Trash2 className="size-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editing && <WorkerForm initial={editing} canManageAdmins={iAmMainAdmin} onClose={() => setEditing(null)} onSave={save} />}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Remove worker"
        message="This worker will be removed from your team list."
      />
    </>
  );
}

function WorkerForm({
  initial,
  canManageAdmins,
  onClose,
  onSave,
}: {
  initial: Worker;
  canManageAdmins: boolean; // true when the main admin is logged in
  onClose: () => void;
  onSave: (w: Worker, password: string) => Promise<void>;
}) {
  const isMainAdmin = Boolean(initial.isOwner);
  const [form, setForm] = useState(initial);
  const [password, setPassword] = useState(""); // empty = keep the current password
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    setSaving(true);
    await onSave(form, password);
    setSaving(false);
  };

  // An admin must have a password: a new one, or the one they already have
  const needsPassword = form.isAdmin && !initial.hasPassword;
  const passwordOk = password === "" ? !needsPassword : password.length >= 8;
  const set = <K extends keyof Worker>(key: K, value: Worker[K]) => setForm((f) => ({ ...f, [key]: value }));
  const valid = form.name.trim() && /\S+@\S+\.\S+/.test(form.email) && form.phone.trim() && passwordOk;

  return (
    <Modal
      open
      onClose={onClose}
      title={initial.id ? "Edit worker" : "New worker"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={!valid || saving} onClick={submit}>{saving ? "Saving…" : initial.id ? "Save changes" : "Add worker"}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Full name *</label>
          <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Jean Bosco Habimana" />
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input type="email" className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@acaciasafaris.rw" />
        </div>
        <div>
          <label className={labelClass}>Phone *</label>
          <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+250 788 000 000" />
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <select className={inputClass} value={form.role} onChange={(e) => set("role", e.target.value as Worker["role"])}>
            {workerRoles.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={form.status} disabled={isMainAdmin} onChange={(e) => set("status", e.target.value as WorkerStatus)}>
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Languages</label>
          <input className={inputClass} value={form.languages.join(", ")} onChange={(e) => set("languages", e.target.value.split(","))} placeholder="English, French, Kinyarwanda" />
        </div>
        <div>
          <label className={labelClass}>Joined</label>
          <input type="date" className={inputClass} value={form.joined.slice(0, 10)} onChange={(e) => set("joined", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <ImageField label="Photo" bucket="workers" value={form.photo ?? ""} onChange={(url) => set("photo", url)} />
        </div>
        {/* Second role: admin access to this panel */}
        <div className="sm:col-span-2 rounded-xl bg-[#f7f5f0] px-4 py-3 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium flex items-center gap-1.5"><ShieldCheck className="size-4 text-[#8a6d2f]" /> Admin access</p>
              <p className="text-xs text-[#0a120b]/50">
                {isMainAdmin
                  ? "This is the main admin: they always keep admin access and cannot be deleted."
                  : canManageAdmins
                    ? "Can log in to this admin panel with their email and a password."
                    : "Only the main admin can give or remove admin access."}
              </p>
            </div>
            {!isMainAdmin && canManageAdmins && (
              <Toggle checked={form.isAdmin} onChange={(v) => set("isAdmin", v)} label="Admin access" />
            )}
          </div>
          {form.isAdmin && canManageAdmins && (
            <div>
              <label className={labelClass}>{initial.hasPassword ? "New password" : "Password *"}</label>
              <input
                type="password"
                autoComplete="new-password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={initial.hasPassword ? "Leave empty to keep the current password" : "At least 8 characters"}
              />
              {password !== "" && password.length < 8 && (
                <p className="text-xs text-red-600 mt-1">At least 8 characters</p>
              )}
            </div>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Notes</label>
          <textarea rows={3} className={inputClass} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} placeholder="Specialties, vehicle, certifications…" />
        </div>
      </div>
    </Modal>
  );
}
