"use client";

// /admin/groups  ->  travelers going on the same trip at the same time, formed automatically from
// the bookings: a special trip, a group departure, or the same package / destination on the same day.
// Open a group to email everyone at once or add its WhatsApp group link.
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, MessageCircle, Users } from "lucide-react";
import { api } from "@/lib/api";
import type { TravelGroup } from "@/lib/types";
import { Card, EmptyState, PageHeader, SearchInput, Tabs } from "../components/ui";
import { GROUP_TYPES, groupDates, groupHref, whenText } from "./parts";

export default function GroupsPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [groups, setGroups] = useState<TravelGroup[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    api<TravelGroup[]>(`/groups${tab === "past" ? "?past=1" : ""}`, { admin: true })
      .then((list) => !cancelled && (setGroups(list), setError("")))
      .catch((err: Error) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const q = query.toLowerCase();
  const list = (groups ?? []).filter(
    (g) => !q || (g.name + (g.place ?? "") + g.members.map((m) => m.name).join(" ")).toLowerCase().includes(q),
  );

  return (
    <>
      <PageHeader
        title="Travel groups"
        subtitle="Travelers on the same trip at the same time, grouped automatically. Email them all at once, or share a WhatsApp group."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={tab}
          onChange={(v) => {
            setGroups(null);
            setTab(v);
          }}
          tabs={[
            { value: "upcoming", label: "Upcoming & on the trip" },
            { value: "past", label: "Past (6 months)" },
          ]}
        />
        <SearchInput value={query} onChange={setQuery} placeholder="Search a trip, place or traveler…" className="sm:w-80" />
      </div>

      {error && <Card className="mb-5 p-5 text-sm text-red-700">Could not load the groups: {error}</Card>}

      {!groups && !error ? (
        <Card><EmptyState title="Loading groups…" /></Card>
      ) : list.length === 0 ? (
        <Card>
          <EmptyState
            title={tab === "upcoming" ? "No upcoming group" : "No group in the last 6 months"}
            text={query ? "Nothing matches your search." : "A group appears as soon as someone books a trip, a departure, or a package / destination with dates."}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {list.map((g) => {
            const type = GROUP_TYPES[g.type];
            const Icon = type.icon;
            return (
              <Link key={g.key} href={groupHref(g.key)}>
                <Card className="group flex h-full items-start gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#12231a] text-[#c5a86d]">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8a6d2f]">{type.label}</p>
                    <h3 className="mt-0.5 truncate font-semibold">{g.name}</h3>
                    <p className="mt-0.5 text-sm text-[#0a120b]/60">
                      {groupDates(g)} <span className="text-[#0a120b]/40">· {whenText(g)}</span>
                      {g.place ? <span className="text-[#0a120b]/40"> · {g.place}</span> : null}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f7f5f0] px-2.5 py-1">
                        <Users className="size-3.5 text-[#2E7D5B]" /> {g.travelers} traveler{g.travelers === 1 ? "" : "s"} · {g.members.length} booking{g.members.length === 1 ? "" : "s"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${g.whatsappLink ? "bg-[#25D366]/12 text-[#128C4A]" : "bg-[#f7f5f0] text-[#0a120b]/45"}`}
                      >
                        <MessageCircle className="size-3.5" /> {g.whatsappLink ? "WhatsApp group linked" : "No WhatsApp group"}
                      </span>
                      {g.messageCount > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c5a86d]/12 px-2.5 py-1 text-[#8a6d2f]">
                          <Mail className="size-3.5" /> {g.messageCount} message{g.messageCount === 1 ? "" : "s"} sent
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-[#0a120b]/30 transition-transform group-hover:translate-x-1 group-hover:text-[#2E7D5B]" />
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
