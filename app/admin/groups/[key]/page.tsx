"use client";

// /admin/groups/<key>  ->  one travel group: its travelers, its WhatsApp group link, a message
// to email everyone (one personal email each, in their language if wanted), and what was sent.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Check, Copy, ExternalLink, Languages, Loader2, Mail, Send, Users } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { api } from "@/lib/api";
import type { TravelGroup } from "@/lib/types";
import { Badge, Button, Card, CardHeader, ConfirmDialog, EmptyState, StatusBadge, inputClass, labelClass } from "../../components/ui";
import { GROUP_TYPES, LANG_NAMES, groupDates, whatsappTo, whenText } from "../parts";

const decode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export default function GroupPage() {
  const key = decode(useParams<{ key: string }>().key);
  const path = `/groups/${encodeURIComponent(key)}`;
  const [group, setGroup] = useState<TravelGroup | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(
    () =>
      api<TravelGroup>(path, { admin: true })
        .then((g) => (setGroup(g), setError("")))
        .catch((err: Error) => setError(err.message)),
    [path],
  );
  useEffect(() => {
    void load();
  }, [load]);

  if (error && !group) {
    return (
      <Card className="p-6 text-sm">
        <p className="text-red-700">{error}</p>
        <Link href="/admin/groups" className="mt-2 inline-block text-[#2E7D5B] underline">Back to groups</Link>
      </Card>
    );
  }
  if (!group) return <Card><EmptyState title="Loading group…" /></Card>;

  const type = GROUP_TYPES[group.type];
  const Icon = type.icon;

  return (
    <>
      <Link href="/admin/groups" className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#0a120b]/55 hover:text-[#0a120b]">
        <ArrowLeft className="size-4" /> All groups
      </Link>

      <Card className="mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#12231a] text-[#c5a86d]">
          <Icon className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8a6d2f]">
            {type.label} · {type.text.toLowerCase()}
          </p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">{group.name}</h1>
          <p className="mt-1 text-sm text-[#0a120b]/60">
            {groupDates(group)} · {whenText(group)}
            {group.place ? ` · ${group.place}` : ""}
          </p>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-2xl font-semibold">{group.travelers}</p>
            <p className="text-xs text-[#0a120b]/50">travelers</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{group.members.length}</p>
            <p className="text-xs text-[#0a120b]/50">bookings</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_1fr]">
        <div className="space-y-6">
          <Composer group={group} path={path} onSent={load} />
          <History group={group} />
        </div>
        <div className="space-y-6">
          <WhatsappCard group={group} path={path} onSaved={setGroup} />
          <Members group={group} />
        </div>
      </div>
    </>
  );
}

// ---------- Email everyone ----------

function Composer({ group, path, onSent }: { group: TravelGroup; path: string; onSent: () => void }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [translate, setTranslate] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const withEmail = group.members.filter((m) => m.email);
  const others = withEmail.filter((m) => m.lang !== "en");
  const otherLangs = [...new Set(others.map((m) => LANG_NAMES[m.lang]))];

  const send = async () => {
    setSending(true);
    try {
      const r = await api<{ sent: number; failed: number }>(`${path}/messages`, {
        method: "POST",
        body: { subject: subject.trim(), body: body.trim(), translate },
        admin: true,
      });
      if (r.failed) toast.error(`${r.sent} sent, ${r.failed} could not be sent (check the emails in the bookings)`);
      else toast.success(`Email sent to ${r.sent} traveler${r.sent === 1 ? "" : "s"}`);
      setSubject("");
      setBody("");
      onSent();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${subject.trim()}\n\n${body.trim()}`.trim());
      toast.success("Copied: paste it in the WhatsApp group");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <Card>
      <CardHeader title="Message the group" subtitle="One personal email to each traveler: nobody sees the others' addresses." />
      <div className="space-y-4 px-5 pb-5">
        <div>
          <label className={labelClass}>Subject</label>
          <input className={inputClass} value={subject} maxLength={150} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Pick-up time and what to bring" />
        </div>
        <div>
          <label className={labelClass}>Message</label>
          <textarea
            rows={8}
            maxLength={5000}
            className={`${inputClass} resize-y`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={"We meet at the hotel lobby at 6:30 am on the first day.\n\nPlease bring your passport and gorilla permit…"}
          />
          <p className="mt-1 text-xs text-[#0a120b]/45">Each traveler&apos;s name is added at the top (&quot;Hello Anna,&quot;). Leave an empty line between paragraphs.</p>
        </div>
        {otherLangs.length > 0 && (
          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-[#c5a86d]/[0.08] px-3.5 py-3 text-sm">
            <input type="checkbox" checked={translate} onChange={(e) => setTranslate(e.target.checked)} className="mt-0.5 size-4 accent-[#12231a]" />
            <span>
              <span className="flex items-center gap-1.5 font-medium">
                <Languages className="size-4 text-[#8a6d2f]" /> Send in each traveler&apos;s language
              </span>
              <span className="block text-xs text-[#0a120b]/55">
                {others.length} booking{others.length === 1 ? "" : "s"} use {otherLangs.join(" and ")}: translated automatically. The others get your text as written.
              </span>
            </span>
          </label>
        )}
        {group.whatsappLink && (
          <p className="flex items-center gap-2 text-xs text-[#128C4A]">
            <FaWhatsapp className="size-4" /> A &quot;Join the WhatsApp group&quot; button is added to the email.
          </p>
        )}
        <div className="flex flex-wrap gap-2 border-t border-[#0a120b]/[0.06] pt-4">
          <Button disabled={!subject.trim() || !body.trim() || sending || !withEmail.length} onClick={() => setConfirm(true)}>
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Email {withEmail.length} traveler{withEmail.length === 1 ? "" : "s"}
          </Button>
          <Button variant="secondary" disabled={!body.trim()} onClick={copy}>
            <Copy className="size-4" /> Copy for WhatsApp
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={send}
        title="Send this email?"
        message={`"${subject.trim()}" goes to ${withEmail.length} traveler${withEmail.length === 1 ? "" : "s"} of ${group.name}. It cannot be undone.`}
        confirmLabel="Send"
      />
    </Card>
  );
}

function History({ group }: { group: TravelGroup }) {
  const messages = group.messages ?? [];
  return (
    <Card>
      <CardHeader title="Messages sent" subtitle={messages.length ? undefined : "Nothing sent to this group yet."} />
      {messages.length > 0 && (
        <ul className="divide-y divide-[#0a120b]/[0.06] px-5 pb-3">
          {messages.map((m) => (
            <li key={m.id} className="py-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{m.subject}</p>
                <span className="text-xs text-[#0a120b]/45">
                  {new Date(m.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {m.sentBy}
                </span>
              </div>
              <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm text-[#0a120b]/65">{m.body}</p>
              <p className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                <Badge tone="green">{m.recipients} sent</Badge>
                {m.failed > 0 && <Badge tone="red">{m.failed} failed</Badge>}
                {m.translated && <Badge tone="gold">Translated</Badge>}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ---------- WhatsApp group ----------

function WhatsappCard({ group, path, onSaved }: { group: TravelGroup; path: string; onSaved: (g: TravelGroup) => void }) {
  const [link, setLink] = useState(group.whatsappLink ?? "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const saved = await api<TravelGroup>(`${path}/whatsapp`, { method: "PUT", body: { link: link.trim() }, admin: true });
      onSaved(saved);
      toast.success(link.trim() ? "WhatsApp group linked" : "WhatsApp link removed");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader title="WhatsApp group" subtitle="Businesses cannot add people to WhatsApp groups automatically: create the group, then share its invite link here." />
      <div className="space-y-3 px-5 pb-5">
        {!group.whatsappLink && (
          <ol className="list-decimal space-y-1 pl-5 text-xs text-[#0a120b]/60">
            <li>In WhatsApp: New group → name it (e.g. &quot;{group.name} · {groupDates(group)}&quot;).</li>
            <li>Group info → <b>Invite via link</b> → copy the link.</li>
            <li>Paste it below: it is added as a button to every email you send this group.</li>
          </ol>
        )}
        <div className="flex gap-2">
          <input className={inputClass} value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://chat.whatsapp.com/…" />
          <Button onClick={save} disabled={saving || link.trim() === (group.whatsappLink ?? "")}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
          </Button>
        </div>
        {group.whatsappLink && (
          <div className="flex flex-wrap gap-2">
            <a href={group.whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-xs font-medium text-white hover:opacity-90">
              <FaWhatsapp className="size-4" /> Open the group <ExternalLink className="size-3" />
            </a>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(group.whatsappLink!).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#0a120b]/10 px-3 py-2 text-xs font-medium hover:bg-[#f7f5f0]"
            >
              {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />} Copy invite link
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

// ---------- Travelers ----------

function Members({ group }: { group: TravelGroup }) {
  // A personal WhatsApp message: the invite to the group when there is one
  const invite = group.whatsappLink
    ? `Hello! Here is the WhatsApp group for your ${group.name} trip (${groupDates(group)}): ${group.whatsappLink}`
    : `Hello! This is Acacia Safaris, about your ${group.name} trip (${groupDates(group)}).`;

  return (
    <Card>
      <CardHeader title="Travelers" subtitle={`${group.travelers} traveler${group.travelers === 1 ? "" : "s"} in ${group.members.length} booking${group.members.length === 1 ? "" : "s"}`} />
      <ul className="divide-y divide-[#0a120b]/[0.06] px-5 pb-3">
        {group.members.map((m) => {
          const wa = whatsappTo(m.phone, invite.replace("Hello!", `Hello ${m.name.split(" ")[0]}!`));
          return (
            <li key={m.id} className="flex items-center gap-3 py-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f7f5f0] text-xs font-semibold text-[#2E7D5B]">
                {m.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  {m.name}
                  <span className="text-xs font-normal text-[#0a120b]/45">
                    <Users className="mr-0.5 inline size-3" /> {m.travelers}
                  </span>
                  <StatusBadge status={m.status} />
                  {m.lang !== "en" && <Badge tone="gray" dot={false}>{LANG_NAMES[m.lang]}</Badge>}
                </p>
                <p className="truncate text-xs text-[#0a120b]/50">
                  {m.email}
                  {m.phone ? ` · ${m.phone}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer" title={group.whatsappLink ? "Send the group invite on WhatsApp" : "WhatsApp this traveler"} className="rounded-lg p-2 text-[#128C4A] hover:bg-[#25D366]/10">
                    <FaWhatsapp className="size-4" />
                  </a>
                )}
                <a href={`mailto:${m.email}`} title="Email this traveler" className="rounded-lg p-2 text-[#0a120b]/50 hover:bg-[#0a120b]/5">
                  <Mail className="size-4" />
                </a>
                {m.link && (
                  <a href={m.link} target="_blank" rel="noopener noreferrer" title="Their booking page" className="rounded-lg p-2 text-[#0a120b]/50 hover:bg-[#0a120b]/5">
                    <ExternalLink className="size-4" />
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
