"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Mail, Phone, Download, ArrowUpDown } from "lucide-react";
import { customersFromBookings, money } from "@/lib/helpers";
import { useBookingsStore } from "@/store/bookingsStore";
import { Avatar, Button, Card, EmptyState, PageHeader, SearchInput } from "../components/ui";

type SortKey = "name" | "trips" | "spent" | "joined";

export default function CustomersPage() {
  // Customers are worked out from the bookings (one per email address)
  const bookings = useBookingsStore((s) => s.bookings);
  const customers = useMemo(() => customersFromBookings(bookings), [bookings]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "spent", dir: -1 });

  const list = useMemo(() => {
    const q = query.toLowerCase();
    return customers
      .filter((c) => [c.name, c.email, c.country].some((f) => f.toLowerCase().includes(q)))
      .sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        return (typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv))) * sort.dir;
      });
  }, [customers, query, sort]);

  const exportCsv = () => {
    const header = "name,email,phone,country,trips,spent,first booking";
    const rows = list.map((c) => [`"${c.name}"`, c.email, c.phone ?? "", `"${c.country}"`, c.trips, c.spent, c.joined.slice(0, 10)].join(","));
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "customers.csv";
    a.click();
  };

  const sortBy = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 }));
  const totalSpent = customers.reduce((s, c) => s + c.spent, 0);
  const countries = new Set(customers.map((c) => c.country)).size;

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Everyone who has booked with Acacia Safaris (worked out from bookings)."
        actions={<Button variant="secondary" onClick={exportCsv}><Download className="size-4" /> Export</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <p className="text-xs text-[#0a120b]/50">Total customers</p>
          <p className="text-2xl font-semibold mt-1 tabular-nums">{customers.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-[#0a120b]/50">Lifetime value</p>
          <p className="text-2xl font-semibold mt-1 tabular-nums">{money(totalSpent)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-[#0a120b]/50">Countries</p>
          <p className="text-2xl font-semibold mt-1 tabular-nums">{countries}</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-[#0a120b]/[0.06]">
          <p className="text-sm font-medium">All customers</p>
          <SearchInput value={query} onChange={setQuery} placeholder="Search customers…" className="w-full sm:w-72" />
        </div>
        {list.length === 0 ? (
          <EmptyState
            title={customers.length === 0 ? "No customers yet" : "No customers match your search"}
            text={customers.length === 0 ? "Everyone who books on the website appears here." : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-[#0a120b]/45 bg-[#f7f5f0]/60 border-b border-[#0a120b]/[0.06]">
                  <Th sort={sort} onSort={sortBy} k="name" label="Customer" />
                  <th className="px-5 py-3 font-medium uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-3 font-medium uppercase tracking-wider">Country</th>
                  <Th sort={sort} onSort={sortBy} k="trips" label="Trips" right />
                  <Th sort={sort} onSort={sortBy} k="spent" label="Total spent" right />
                  <Th sort={sort} onSort={sortBy} k="joined" label="Joined" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0a120b]/[0.05]">
                {list.map((c) => (
                  <tr key={c.email} className="hover:bg-[#f7f5f0]/70">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} size={36} />
                        <div>
                          <p className="font-medium">{c.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#0a120b]/65">
                      <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 hover:text-[#2E7D5B]"><Mail className="size-3.5" /> {c.email}</a>
                      {c.phone && <p className="flex items-center gap-1.5 text-xs mt-0.5"><Phone className="size-3.5" /> {c.phone}</p>}
                    </td>
                    <td className="px-5 py-3 text-[#0a120b]/70 whitespace-nowrap">{c.country}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{c.trips}</td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums">{money(c.spent)}</td>
                    <td className="px-5 py-3 text-[#0a120b]/65 whitespace-nowrap">{format(new Date(c.joined), "d MMM yyyy")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

function Th({
  k,
  label,
  right,
  sort,
  onSort,
}: {
  k: SortKey;
  label: string;
  right?: boolean;
  sort: { key: SortKey };
  onSort: (k: SortKey) => void;
}) {
  return (
    <th className={`px-5 py-3 font-medium ${right ? "text-right" : ""}`}>
      <button onClick={() => onSort(k)} className={`inline-flex items-center gap-1 uppercase tracking-wider cursor-pointer hover:text-[#0a120b] ${sort.key === k ? "text-[#0a120b]" : ""}`}>
        {label} <ArrowUpDown className="size-3" />
      </button>
    </th>
  );
}
