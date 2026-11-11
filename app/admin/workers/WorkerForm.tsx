"use client";

// The add / edit worker form, shown as a full page:
//   /admin/workers/new        -> add a worker
//   /admin/workers/5/edit     -> edit worker 5
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserRound, Contact, Briefcase, StickyNote, Globe } from "lucide-react";
import type { Worker, WorkerStatus } from "@/lib/types";
import { SOCIAL_NETWORKS } from "@/lib/socials";
import { Button, Card, Toggle, inputClass, labelClass } from "../components/ui";
import ImageField from "../components/ImageField";
import { LanguagePicker, WorkerPhoto, companyEmailFor, statuses, useRoles } from "./parts";

export default function WorkerForm({
  initial,
  canManageAdmins,
  backHref,
  onSave,
}: {
  initial: Worker;
  canManageAdmins: boolean; // true when the main admin is logged in
  backHref: string; // where "Back" and "Cancel" go
  onSave: (w: Worker, password: string) => Promise<void>;
}) {
  const isNew = !initial.id;
  const isMainAdmin = Boolean(initial.isOwner);
  const [form, setForm] = useState(initial);
  const roles = useRoles(); // from Admin > Roles

  // If the worker's role is not in the list (e.g. a new worker), use the first role
  const role = roles.length > 0 && !roles.some((r) => r.name === form.role) ? roles[0].name : form.role;
  const roleDescription = roles.find((r) => r.name === role)?.description;
  const [password, setPassword] = useState(""); // empty = keep the current password
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Worker>(key: K, value: Worker[K]) => setForm((f) => ({ ...f, [key]: value }));

  // An admin must have a password: a new one, or the one they already have
  const needsPassword = form.isAdmin && !initial.hasPassword;
  const passwordOk = password === "" ? !needsPassword : password.length >= 8;
  const websiteOk = !form.showOnWebsite || Boolean(form.companyRole?.trim()); // shown on the website = needs a company role
  const valid = form.name.trim() && /\S+@\S+\.\S+/.test(form.personalEmail ?? "") && form.phone.trim() && passwordOk && websiteOk;

  // The company email is made by the server from the first name. It only changes
  // when the first name changes (the main admin's login comes from .env and stays).
  const firstNameEmail = companyEmailFor(form.name);
  const keepsEmail =
    !isNew && (isMainAdmin || initial.email.replace(/\d*@/, "@") === firstNameEmail);
  const companyEmail = keepsEmail ? initial.email : form.name.trim() ? firstNameEmail : "";
  const companyEmailHint = keepsEmail
    ? "Made from the first name."
    : isNew
      ? "Made from the first name. A number is added if it is taken."
      : `Will change from ${initial.email} when you save.`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    await onSave({ ...form, role }, password); // the page shows a toast and navigates away on success
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="max-w-5xl">
      {/* Header */}
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-[#0a120b]/55 hover:text-[#0a120b] mb-4">
        <ArrowLeft className="size-4" /> Back
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <WorkerPhoto worker={form} size={56} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{isNew ? "Add worker" : `Edit ${initial.name}`}</h1>
            <p className="text-sm text-[#0a120b]/55 mt-0.5">{isNew ? "Add a new member to your team." : "Update this worker's details."}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={backHref}><Button type="button" variant="secondary">Cancel</Button></Link>
          <Button type="submit" disabled={!valid || saving}>{saving ? "Saving…" : isNew ? "Add worker" : "Save changes"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: main details */}
        <div className="lg:col-span-2 space-y-5">
          <Section icon={UserRound} title="Personal details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Full name *</label>
                <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Jean Bosco Habimana" />
              </div>
              <div className="sm:col-span-2">
                <ImageField label="Photo" bucket="workers" value={form.photo ?? ""} onChange={(url) => set("photo", url)} />
              </div>
            </div>
          </Section>

          <Section icon={Contact} title="Contact">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Company email (login)</label>
                <input className={`${inputClass} bg-[#0a120b]/3 text-[#0a120b]/60`} value={companyEmail} readOnly tabIndex={-1} />
                <p className="text-xs text-[#0a120b]/50 mt-1">{companyEmailHint}</p>
              </div>
              <div>
                <label className={labelClass}>Personal email *</label>
                <input type="email" className={inputClass} value={form.personalEmail ?? ""} onChange={(e) => set("personalEmail", e.target.value)} placeholder="name@gmail.com" />
                <p className="text-xs text-[#0a120b]/50 mt-1">Receives the code when they forget their password.</p>
              </div>
              <div>
                <label className={labelClass}>Phone *</label>
                <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+250 788 000 000" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Languages</label>
                <LanguagePicker value={form.languages} onChange={(v) => set("languages", v)} />
              </div>
            </div>
          </Section>

          {/* What visitors see on the About us page */}
          <Section icon={Globe} title="About us page">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <p className="text-xs text-[#0a120b]/55">
                  Show this worker in &quot;Meet the team&quot; on the website. Visitors can see their photo, company role, bio,
                  personal email, phone, languages and social links.
                </p>
                <Toggle checked={Boolean(form.showOnWebsite)} onChange={(v) => set("showOnWebsite", v)} label="Show on website" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Company role{form.showOnWebsite ? " *" : ""}</label>
                  <input className={inputClass} value={form.companyRole ?? ""} maxLength={80} onChange={(e) => set("companyRole", e.target.value)} placeholder="e.g. CEO & Founder" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Bio</label>
                  <textarea rows={4} maxLength={1000} className={inputClass} value={form.bio ?? ""} onChange={(e) => set("bio", e.target.value)} placeholder="A few lines about them for visitors: experience, what they love about safaris…" />
                  <p className="text-xs text-[#0a120b]/40 mt-1 text-right">{(form.bio ?? "").length}/1000</p>
                </div>
                {SOCIAL_NETWORKS.map(({ key, label, icon: Icon, placeholder }) => (
                  <div key={key}>
                    <label className={labelClass}>{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#0a120b]/40" />
                      <input
                        className={`${inputClass} pl-9`}
                        value={form.socials?.[key] ?? ""}
                        onChange={(e) => set("socials", { ...form.socials, [key]: e.target.value })}
                        placeholder={placeholder}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section icon={StickyNote} title="Private notes">
            <textarea rows={4} className={inputClass} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} placeholder="Specialties, vehicle, certifications… (only admins see this)" />
          </Section>
        </div>

        {/* Right: job + admin access */}
        <div className="space-y-5">
          <Section icon={Briefcase} title="Job">
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Role</label>
                <select className={inputClass} value={role} onChange={(e) => set("role", e.target.value)}>
                  {roles.map((r) => <option key={r.id}>{r.name}</option>)}
                </select>
                {roleDescription && <p className="text-xs text-[#0a120b]/50 mt-1.5 leading-relaxed">{roleDescription}</p>}
                <Link href="/admin/roles" className="inline-block text-xs text-[#2E7D5B] hover:underline mt-1">Manage roles</Link>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select className={inputClass} value={form.status} disabled={isMainAdmin} onChange={(e) => set("status", e.target.value as WorkerStatus)}>
                  {statuses.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Joined</label>
                <input type="date" className={inputClass} value={form.joined.slice(0, 10)} onChange={(e) => set("joined", e.target.value)} />
              </div>
            </div>
          </Section>

          {/* Second role: admin access to this panel */}
          <Section icon={ShieldCheck} title="Admin access">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <p className="text-xs text-[#0a120b]/55">
                  {isMainAdmin
                    ? "This is the main admin: they always keep admin access and cannot be deleted."
                    : canManageAdmins
                      ? "Can log in to this admin panel with their company email and a password."
                      : "Only the main admin can give or remove admin access."}
                </p>
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
                    placeholder={initial.hasPassword ? "Leave empty to keep it" : "At least 8 characters"}
                  />
                  {password !== "" && password.length < 8 && <p className="text-xs text-red-600 mt-1">At least 8 characters</p>}
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>
    </form>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold mb-4">
        <Icon className="size-4 text-[#2E7D5B]" /> {title}
      </h2>
      {children}
    </Card>
  );
}
