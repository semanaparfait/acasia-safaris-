"use client";

// /admin/roles  ->  the roles workers can have (name + description)
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, BriefcaseBusiness, Users } from "lucide-react";
import type { Role } from "@/lib/types";
import { useRolesStore } from "@/store/rolesStore";
import { Button, Card, ConfirmDialog, EmptyState, Modal, PageHeader, SearchInput, inputClass, labelClass } from "../components/ui";

const blankRole: Role = { id: "", name: "", description: "" }; // id "" = not saved yet

export default function RolesPage() {
  const roles = useRolesStore((s) => s.roles);
  const loading = useRolesStore((s) => s.loading);
  const error = useRolesStore((s) => s.error);
  const load = useRolesStore((s) => s.load);
  const createRole = useRolesStore((s) => s.createRole);
  const updateRole = useRolesStore((s) => s.updateRole);
  const deleteRole = useRolesStore((s) => s.deleteRole);

  useEffect(() => {
    load();
  }, [load]);

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState<Role | null>(null);

  const filtered = roles.filter((r) => (r.name + r.description).toLowerCase().includes(query.toLowerCase()));

  const save = async (role: Role) => {
    const input = { name: role.name.trim(), description: role.description.trim() };
    try {
      if (!role.id) {
        await createRole(input);
        toast.success("Role added");
      } else {
        await updateRole(role.id, input);
        toast.success("Role updated");
      }
      setEditing(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await deleteRole(deleting.id);
      toast.success("Role deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <PageHeader
        title="Roles"
        subtitle="The jobs your workers can have. Each worker gets one role."
        actions={<Button onClick={() => setEditing(blankRole)}><Plus className="size-4" /> Add role</Button>}
      />

      <div className="flex justify-end mb-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search roles…" className="w-full sm:w-64" />
      </div>

      {error ? (
        <Card><p className="p-5 text-sm text-red-700">Could not load roles: {error}</p></Card>
      ) : loading && roles.length === 0 ? (
        <Card><EmptyState title="Loading roles…" /></Card>
      ) : filtered.length === 0 ? (
        <Card><EmptyState title="No roles found" text="Add a role to get started." /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((r) => {
            const inUse = (r.workerCount ?? 0) > 0;
            return (
              <Card key={r.id} className="group p-5 flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-start justify-between gap-3">
                  <span className="size-11 shrink-0 rounded-xl bg-[#2E7D5B]/10 text-[#2E7D5B] flex items-center justify-center">
                    <BriefcaseBusiness className="size-5" />
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(r)} className="p-1.5 rounded-lg text-[#0a120b]/55 hover:text-[#0a120b] hover:bg-[#0a120b]/5 cursor-pointer" aria-label="Edit" title="Edit">
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => setDeleting(r)}
                      disabled={inUse}
                      className="p-1.5 rounded-lg text-[#0a120b]/55 hover:text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                      aria-label="Delete"
                      title={inUse ? "Workers have this role: give them another role first" : "Delete"}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold mt-4">{r.name}</h3>
                <p className="text-sm text-[#0a120b]/60 mt-1.5 leading-relaxed flex-1">
                  {r.description || <span className="text-[#0a120b]/35">No description yet.</span>}
                </p>

                <Link href="/admin/workers" className="mt-4 pt-3 border-t border-[#0a120b]/[0.06] flex items-center gap-1.5 text-xs text-[#0a120b]/55 hover:text-[#2E7D5B]">
                  <Users className="size-3.5" />
                  {r.workerCount ?? 0} {r.workerCount === 1 ? "worker" : "workers"}
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      {editing && <RoleForm initial={editing} onClose={() => setEditing(null)} onSave={save} />}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        title="Delete role"
        message={`The role "${deleting?.name}" will be deleted.`}
      />
    </>
  );
}

function RoleForm({ initial, onClose, onSave }: { initial: Role; onClose: () => void; onSave: (r: Role) => Promise<void> }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const valid = form.name.trim().length >= 2;

  const submit = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={initial.id ? "Edit role" : "New role"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={!valid || saving} onClick={submit}>{saving ? "Saving…" : initial.id ? "Save changes" : "Add role"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Name *</label>
          <input className={inputClass} value={form.name} maxLength={50} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Tour Guide" />
          {initial.id !== "" && (initial.workerCount ?? 0) > 0 && (
            <p className="text-xs text-[#0a120b]/50 mt-1">Renaming also updates the {initial.workerCount} worker(s) with this role.</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea rows={4} className={inputClass} value={form.description} maxLength={500} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does someone in this role do?" />
          <p className="text-[11px] text-[#0a120b]/40 mt-1 text-right">{form.description.length} / 500</p>
        </div>
      </div>
    </Modal>
  );
}
