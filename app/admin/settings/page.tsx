"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Building2, Bell, Shield, User, Users, Save } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import ImageField from "../components/ImageField";
import { Avatar, Badge, Button, Card, CardHeader, PageHeader, Toggle, inputClass, labelClass } from "../components/ui";

const sections = [
  { id: "account", label: "My account", icon: User },
  { id: "company", label: "Company", icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "team", label: "Team", icon: Users },
  { id: "security", label: "Security", icon: Shield },
] as const;

const team = [
  { name: "Admin User", email: "admin@acaciasafaris.com", role: "Super admin" },
  { name: "Eric Mugisha", email: "eric@acaciasafaris.com", role: "Tour guide" },
  { name: "Diane Ingabire", email: "diane@acaciasafaris.com", role: "Bookings" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<(typeof sections)[number]["id"]>("account");
  const [company, setCompany] = useState({
    name: "Acacia Safaris Ltd",
    email: "info@acaciasafaris.com",
    phone: "+250 788 000 000",
    whatsapp: "+250 788 000 000",
    address: "KG 7 Ave, Kigali, Rwanda",
    currency: "USD",
  });
  const [notify, setNotify] = useState({ booking: true, message: true, review: false, weekly: true });
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <>
      <PageHeader title="Settings" subtitle="Company details, notifications and team access." />

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

        {tab === "company" && (
          <Card>
            <CardHeader title="Company profile" subtitle="Shown in the website footer, emails and invoices." />
            <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  ["name", "Company name"],
                  ["email", "Contact email"],
                  ["phone", "Phone"],
                  ["whatsapp", "WhatsApp number"],
                  ["address", "Address"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className={key === "address" ? "sm:col-span-2" : ""}>
                  <label className={labelClass}>{label}</label>
                  <input className={inputClass} value={company[key]} onChange={(e) => setCompany({ ...company, [key]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className={labelClass}>Currency</label>
                <select className={inputClass} value={company.currency} onChange={(e) => setCompany({ ...company, currency: e.target.value })}>
                  <option>USD</option><option>EUR</option><option>RWF</option><option>KES</option>
                </select>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-[#0a120b]/[0.06] flex justify-end">
              <Button onClick={() => toast.success("Settings saved")}><Save className="size-4" /> Save changes</Button>
            </div>
          </Card>
        )}

        {tab === "notifications" && (
          <Card>
            <CardHeader title="Email notifications" subtitle="Choose what you want to be emailed about." />
            <ul className="px-5 pb-5 divide-y divide-[#0a120b]/[0.06]">
              {(
                [
                  ["booking", "New booking requests", "Get an email as soon as a customer sends a booking request."],
                  ["message", "Contact form messages", "Messages from the contact page and WhatsApp."],
                  ["review", "New reviews", "When a guest submits a review for approval."],
                  ["weekly", "Weekly summary", "Revenue and booking report every Monday."],
                ] as const
              ).map(([key, title, desc]) => (
                <li key={key} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-[#0a120b]/50">{desc}</p>
                  </div>
                  <Toggle checked={notify[key]} onChange={(v) => { setNotify({ ...notify, [key]: v }); toast.success("Preference saved"); }} label={title} />
                </li>
              ))}
            </ul>
          </Card>
        )}

        {tab === "team" && (
          <Card>
            <CardHeader title="Team members" subtitle="People who can sign in to this admin panel." action={<Button className="py-2" onClick={() => toast("Invites will work once the backend is connected")}>Invite</Button>} />
            <ul className="px-5 pb-5 divide-y divide-[#0a120b]/[0.06]">
              {team.map((m) => (
                <li key={m.email} className="flex items-center gap-3 py-3.5">
                  <Avatar name={m.name} size={38} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-[#0a120b]/50 truncate">{m.email}</p>
                  </div>
                  <Badge tone={m.role === "Super admin" ? "gold" : "gray"} dot={false}>{m.role}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {tab === "security" && (
          <Card>
            <CardHeader title="Security" />
            <div className="px-5 pb-5 space-y-4">
              <PasswordForm />
              <div className="flex items-center justify-between rounded-xl bg-[#f7f5f0] px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Two-factor authentication</p>
                  <p className="text-xs text-[#0a120b]/50">Require a code from your phone when signing in.</p>
                </div>
                <Toggle checked={twoFactor} onChange={setTwoFactor} label="Two-factor authentication" />
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}

// The logged-in admin edits their own name, email, phone and photo
function AccountForm() {
  const me = useAuthStore((s) => s.worker);
  const updateAccount = useAuthStore((s) => s.updateAccount);
  const [form, setForm] = useState({
    name: me?.name ?? "",
    email: me?.email ?? "",
    phone: me?.phone ?? "",
    photo: me?.photo ?? "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const emailChanged = form.email.trim().toLowerCase() !== me?.email;
  const valid = form.name.trim() && form.email.trim() && form.phone.trim() && (!emailChanged || currentPassword);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAccount({
        name: form.name.trim(),
        email: form.email.trim(),
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
            <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Email (your login)</label>
            <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          {emailChanged && (
            <div>
              <label className={labelClass}>Current password (to change your email)</label>
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
