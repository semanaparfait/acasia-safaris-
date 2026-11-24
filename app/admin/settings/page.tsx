"use client";

import { PhoneField } from "@/components/ui/phone-field";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Shield, User, Users, KeyRound, MessageSquareText, Pencil, Plus, Trash2, ExternalLink, MailCheck, Save } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkersStore } from "@/store/workersStore";
import { useSavedReplies } from "@/lib/useSavedReplies";
import type { SavedReply } from "@/lib/types";
import ImageField from "../components/ImageField";
import { Avatar, Badge, Button, Card, CardHeader, PageHeader, inputClass, labelClass } from "../components/ui";

// Only settings that really work. Company contact details live in lib/company.ts.
const sections = [
  { id: "account", label: "My account", icon: User },
  { id: "replies", label: "Saved replies", icon: MessageSquareText },
  { id: "team", label: "Team", icon: Users },
  { id: "security", label: "Security", icon: Shield },
] as const;

export default function SettingsPage() {
  const [tab, setTab] = useState<(typeof sections)[number]["id"]>("account");

  return (
    <>
      <PageHeader title="Settings" subtitle="Your account, saved replies, team access and security." />

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setTab(s.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm whitespace-nowrap cursor-pointer transition-colors ${
                  tab === s.id ? "bg-white shadow-sm font-medium text-[#0a120b]" : "text-[#0a120b]/60 hover:bg-white/60"
                }`}
              >
                <Icon className={`size-4 ${tab === s.id ? "text-[#2E7D5B]" : ""}`} /> {s.label}
              </button>
            );
          })}
        </nav>

        {tab === "account" && <AccountForm />}
        {tab === "replies" && <SavedRepliesCard />}
        {tab === "team" && <TeamCard />}
        {tab === "security" && (
          <div className="space-y-6">
            <ReplyPinCard />
            <Card>
              <CardHeader title="Password" />
              <div className="px-5 pb-5 space-y-4">
                <PasswordForm />
                <p className="flex items-start gap-2 rounded-xl bg-[#f7f5f0] px-4 py-3 text-xs text-[#0a120b]/60">
                  <MailCheck className="size-4 shrink-0 text-[#2E7D5B]" />
                  Two-step login is always on: after your password, a 6 digit code is emailed to your personal email (except on
                  devices you chose to trust for 7 days).
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}

// The people who can log in to this panel (real workers with admin access)
function TeamCard() {
  const workers = useWorkersStore((s) => s.workers);
  const load = useWorkersStore((s) => s.load);
  useEffect(() => {
    load();
  }, [load]);
  const admins = workers.filter((w) => w.isAdmin);

  return (
    <Card>
      <CardHeader
        title="Admin access"
        subtitle="People who can log in to this admin panel. Give or remove access in Workers."
        action={
          <Link href="/admin/workers" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2E7D5B] hover:underline">
            Manage in Workers <ExternalLink className="size-3.5" />
          </Link>
        }
      />
      <ul className="px-5 pb-5 divide-y divide-[#0a120b]/[0.06]">
        {admins.length === 0 && <li className="py-4 text-sm text-[#0a120b]/50">Loading…</li>}
        {admins.map((w) => (
          <li key={w.id} className="flex items-center gap-3 py-3.5">
            <Avatar name={w.name} size={38} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{w.name}</p>
              <p className="text-xs text-[#0a120b]/50 truncate">{w.email}</p>
            </div>
            {w.status !== "Active" && <Badge tone="gray">{w.status}</Badge>}
            <Badge tone={w.isOwner ? "gold" : "gray"} dot={false}>
              {w.isOwner ? "Main admin" : w.role}
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// Ready answers for the booking conversations (buttons above every reply box)
function SavedRepliesCard() {
  const replies = useSavedReplies((s) => s.replies);
  const load = useSavedReplies((s) => s.load);
  const add = useSavedReplies((s) => s.add);
  const edit = useSavedReplies((s) => s.edit);
  const remove = useSavedReplies((s) => s.remove);
  const [editing, setEditing] = useState<SavedReply | "new" | null>(null);
  const [form, setForm] = useState({ title: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load(true);
  }, [load]);

  const open = (reply: SavedReply | "new") => {
    setEditing(reply);
    setForm(reply === "new" ? { title: "", text: "" } : { title: reply.title, text: reply.text });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const input = { title: form.title.trim(), text: form.text.trim() };
      if (editing === "new") await add(input);
      else if (editing) await edit(editing.id, input);
      setEditing(null);
      toast.success("Saved reply saved");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const del = async (reply: SavedReply) => {
    if (!window.confirm(`Delete "${reply.title}"?`)) return;
    try {
      await remove(reply.id);
      toast.success("Deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Saved replies"
        subtitle="Shown as buttons above every reply box (bookings, messages and quick reply). Click one to insert its text, then edit it before sending."
        action={
          <Button className="py-2" onClick={() => open("new")}>
            <Plus className="size-4" /> Add
          </Button>
        }
      />
      {editing && (
        <form onSubmit={save} className="mx-5 mb-4 space-y-3 rounded-xl border border-[#c5a86d]/40 bg-[#c5a86d]/[0.05] p-4">
          <div>
            <label className={labelClass}>Button name (short)</label>
            <input className={inputClass} maxLength={40} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Deposit" />
          </div>
          <div>
            <label className={labelClass}>Text inserted in the reply</label>
            <textarea rows={4} className={`${inputClass} resize-none`} maxLength={2000} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!form.title.trim() || !form.text.trim() || saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      )}
      <ul className="px-5 pb-5 divide-y divide-[#0a120b]/[0.06]">
        {replies === null && <li className="py-4 text-sm text-[#0a120b]/50">Loading…</li>}
        {replies?.length === 0 && <li className="py-4 text-sm text-[#0a120b]/50">No saved replies yet. Add your most common answers.</li>}
        {replies?.map((r) => (
          <li key={r.id} className="flex items-start gap-3 py-3.5">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{r.title}</p>
              <p className="text-xs text-[#0a120b]/55 line-clamp-2 whitespace-pre-line">{r.text}</p>
            </div>
            <button type="button" onClick={() => open(r)} className="p-2 rounded-lg hover:bg-[#0a120b]/5 cursor-pointer" aria-label={`Edit ${r.title}`}>
              <Pencil className="size-4 text-[#0a120b]/50" />
            </button>
            <button type="button" onClick={() => del(r)} className="p-2 rounded-lg hover:bg-red-50 cursor-pointer" aria-label={`Delete ${r.title}`}>
              <Trash2 className="size-4 text-[#0a120b]/50" />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// The logged-in admin edits their own name, personal email, phone and photo.
// The company email (the login) is made from the first name and is only shown.
function AccountForm() {
  const me = useAuthStore((s) => s.worker);
  const updateAccount = useAuthStore((s) => s.updateAccount);
  const [form, setForm] = useState({
    name: me?.name ?? "",
    personalEmail: me?.personalEmail ?? "",
    phone: me?.phone ?? "",
    photo: me?.photo ?? "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const emailChanged = form.personalEmail.trim().toLowerCase() !== (me?.personalEmail ?? "");
  const valid = form.name.trim() && form.personalEmail.trim() && form.phone.trim() && (!emailChanged || currentPassword);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAccount({
        name: form.name.trim(),
        personalEmail: form.personalEmail.trim(),
        phone: form.phone.trim(),
        photo: form.photo,
        currentPassword: emailChanged ? currentPassword : undefined,
      });
      setCurrentPassword("");
      toast.success("Account updated");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader title="My account" subtitle="Your own details. Your role and access are managed under Workers." />
      <form onSubmit={save}>
        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full name</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Phone (used for WhatsApp alerts)</label>
            <PhoneField value={form.phone} onChange={(phone) => setForm({ ...form, phone })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Company email (your login)</label>
            <input className={`${inputClass} bg-[#0a120b]/3 text-[#0a120b]/60`} value={me?.email ?? ""} readOnly tabIndex={-1} />
          </div>
          <div>
            <label className={labelClass}>Personal email (gets the forgot-password code)</label>
            <input type="email" className={inputClass} value={form.personalEmail} onChange={(e) => setForm({ ...form, personalEmail: e.target.value })} placeholder="name@gmail.com" />
          </div>
          {emailChanged && (
            <div>
              <label className={labelClass}>Current password (to change your personal email)</label>
              <input type="password" autoComplete="current-password" className={inputClass} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
          )}
          <div className="sm:col-span-2">
            <ImageField label="Photo" bucket="workers" value={form.photo} onChange={(photo) => setForm({ ...form, photo })} />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-[#0a120b]/[0.06] flex justify-end">
          <Button type="submit" disabled={!valid || saving}><Save className="size-4" /> {saving ? "Saving…" : "Save changes"}</Button>
        </div>
      </form>
    </Card>
  );
}

// Quick reply: when a customer writes, admins get an email / WhatsApp alert with a personal
// link to answer without logging in. On a new device the link asks for this 4 digit PIN.
function ReplyPinCard() {
  const [set, setSet] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<{ set: boolean }>("/auth/me/reply-pin", { admin: true })
      .then((r) => setSet(r.set))
      .catch(() => setSet(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/auth/me/reply-pin", { method: "PUT", body: { pin, currentPassword: password }, admin: true });
      setSet(true);
      setPin("");
      setPassword("");
      toast.success("Quick-reply PIN saved");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Quick-reply PIN"
        subtitle="Answer customers from the link in an email or WhatsApp alert, without logging in. On a new phone or computer the link asks for this PIN once (then 30 days)."
        action={set === null ? null : set ? <Badge tone="green">Set</Badge> : <Badge tone="gold">Not set</Badge>}
      />
      <form onSubmit={save} className="px-5 pb-5 space-y-4">
        {set === false && (
          <p className="flex items-start gap-2 rounded-xl bg-[#c5a86d]/10 px-4 py-3 text-xs text-[#7a5d22]">
            <KeyRound className="size-4 shrink-0" /> Without a PIN, the &quot;Reply now&quot; links in your alerts will not open. Set one below.
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{set ? "New 4 digit PIN" : "4 digit PIN"}</label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              className={`${inputClass} tracking-[0.5em]`}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
            />
          </div>
          <div>
            <label className={labelClass}>Your password (to confirm)</label>
            <input type="password" autoComplete="current-password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <p className="text-xs text-[#0a120b]/45">
          Avoid easy PINs like 1234 or your birthday. Five wrong PINs lock quick replies for 15 minutes and email you. Changing your password or logging out everywhere ends every link.
        </p>
        <div className="flex justify-end">
          <Button type="submit" disabled={pin.length !== 4 || !password || saving}>{saving ? "Saving…" : set ? "Change PIN" : "Save PIN"}</Button>
        </div>
      </form>
    </Card>
  );
}

function PasswordForm() {
  const changePassword = useAuthStore((s) => s.changePassword);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await changePassword(current, next);
      setCurrent("");
      setNext("");
      toast.success("Password updated. Other devices were logged out.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Current password</label>
          <input type="password" autoComplete="current-password" className={inputClass} value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>New password (at least 8 characters)</label>
          <input type="password" autoComplete="new-password" minLength={8} className={inputClass} value={next} onChange={(e) => setNext(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={!current || !next || saving}>{saving ? "Updating…" : "Update password"}</Button>
      </div>
    </form>
  );
}
