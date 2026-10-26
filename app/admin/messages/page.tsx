"use client";

import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import toast from "react-hot-toast";
import { Star, Trash2, Reply, Inbox, MailOpen, Send, ArrowLeft } from "lucide-react";
import { useAdmin } from "../components/AdminStore";
import { Avatar, Badge, Button, Card, EmptyState, PageHeader, SearchInput, Tabs, inputClass } from "../components/ui";

type Filter = "all" | "unread" | "starred";

export default function MessagesPage() {
  const { messages, setMessages } = useAdmin();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(messages[0]?.id ?? null);
  const [reply, setReply] = useState("");

  const list = messages.filter(
    (m) =>
      (filter === "all" || (filter === "unread" ? !m.read : m.starred)) &&
      (m.name + m.subject + m.body).toLowerCase().includes(query.toLowerCase())
  );
  const active = messages.find((m) => m.id === activeId);

  const open = (id: string) => {
    setActiveId(id);
    setReply("");
    setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  const toggleStar = (id: string) => setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m)));

  const remove = (id: string) => {
    setMessages((ms) => ms.filter((m) => m.id !== id));
    setActiveId(null);
    toast.success("Message deleted");
  };

  const send = () => {
    toast.success(`Reply sent to ${active?.name}`);
    setReply("");
  };

  return (
    <>
      <PageHeader title="Messages" subtitle="Enquiries from the contact form, booking requests and WhatsApp." />

      <Card className="overflow-hidden grid grid-cols-1 lg:grid-cols-[380px_1fr] min-h-[620px]">
        {/* List */}
        <div className={`border-r border-[#0a120b]/[0.06] flex flex-col ${active ? "hidden lg:flex" : "flex"}`}>
          <div className="p-4 space-y-3 border-b border-[#0a120b]/[0.06]">
            <SearchInput value={query} onChange={setQuery} placeholder="Search messages…" />
            <Tabs
              value={filter}
              onChange={setFilter}
              tabs={[
                { value: "all", label: "All", count: messages.length },
                { value: "unread", label: "Unread", count: messages.filter((m) => !m.read).length },
                { value: "starred", label: "Starred", count: messages.filter((m) => m.starred).length },
              ]}
            />
          </div>
          {list.length === 0 ? (
            <EmptyState title="Nothing here" text="No messages match this view." />
          ) : (
            <ul className="flex-1 overflow-y-auto divide-y divide-[#0a120b]/[0.05]">
              {list.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => open(m.id)}
                    className={`w-full text-left flex gap-3 px-4 py-3.5 transition-colors cursor-pointer ${
                      activeId === m.id ? "bg-[#2E7D5B]/[0.07]" : "hover:bg-[#f7f5f0]"
                    }`}
                  >
                    <Avatar name={m.name} size={38} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${m.read ? "text-[#0a120b]/75" : "font-semibold"}`}>{m.name}</p>
                        <span className="text-[11px] text-[#0a120b]/40 shrink-0">{formatDistanceToNow(new Date(m.receivedAt), { addSuffix: false })}</span>
                      </div>
                      <p className={`text-sm truncate ${m.read ? "text-[#0a120b]/60" : "text-[#0a120b]"}`}>{m.subject}</p>
                      <p className="text-xs text-[#0a120b]/45 truncate mt-0.5">{m.body}</p>
                    </div>
                    {!m.read && <span className="mt-2 size-2 rounded-full bg-[#2E7D5B] shrink-0" aria-label="Unread" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Reader */}
        <div className={`flex-col ${active ? "flex" : "hidden lg:flex"}`}>
          {active ? (
            <>
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-[#0a120b]/[0.06]">
                <button onClick={() => setActiveId(null)} className="lg:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-[#0a120b]/5" aria-label="Back">
                  <ArrowLeft className="size-4" />
                </button>
                <Badge tone="gold" dot={false}>{active.source}</Badge>
                <div className="flex gap-1 ml-auto">
                  <button onClick={() => toggleStar(active.id)} className="p-2 rounded-lg hover:bg-[#0a120b]/5 cursor-pointer" aria-label="Star">
                    <Star className={`size-4 ${active.starred ? "fill-[#c5a86d] text-[#c5a86d]" : "text-[#0a120b]/50"}`} />
                  </button>
                  <button
                    onClick={() => setMessages((ms) => ms.map((m) => (m.id === active.id ? { ...m, read: false } : m)))}
                    className="p-2 rounded-lg hover:bg-[#0a120b]/5 cursor-pointer"
                    aria-label="Mark as unread"
                  >
                    <MailOpen className="size-4 text-[#0a120b]/50" />
                  </button>
                  <button onClick={() => remove(active.id)} className="p-2 rounded-lg hover:bg-red-50 cursor-pointer" aria-label="Delete">
                    <Trash2 className="size-4 text-[#0a120b]/50 hover:text-red-600" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <h2 className="text-xl font-semibold">{active.subject}</h2>
                <div className="flex items-center gap-3 mt-4">
                  <Avatar name={active.name} size={40} />
                  <div>
                    <p className="text-sm font-medium">{active.name}</p>
                    <p className="text-xs text-[#0a120b]/50">{active.email}</p>
                  </div>
                  <span className="ml-auto text-xs text-[#0a120b]/45">{format(new Date(active.receivedAt), "d MMM yyyy, HH:mm")}</span>
                </div>
                <p className="mt-6 text-[15px] leading-relaxed text-[#0a120b]/80 whitespace-pre-line">{active.body}</p>
              </div>

              <div className="p-4 border-t border-[#0a120b]/[0.06] bg-[#f7f5f0]/50">
                <div className="flex items-center gap-2 text-xs text-[#0a120b]/50 mb-2">
                  <Reply className="size-3.5" /> Reply to {active.email}
                </div>
                <textarea rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write your reply…" className={inputClass} />
                <div className="flex justify-end mt-2">
                  <Button disabled={!reply.trim()} onClick={send}><Send className="size-4" /> Send reply</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <span className="size-14 rounded-2xl bg-[#2E7D5B]/10 text-[#2E7D5B] flex items-center justify-center mb-4">
                <Inbox className="size-6" />
              </span>
              <p className="font-medium">Select a message</p>
              <p className="text-sm text-[#0a120b]/50 mt-1">Choose a conversation from the list to read it.</p>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
