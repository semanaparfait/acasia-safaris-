// The "Balance due" of a booking in the admin tables: calm by default,
// red only when money is missing and the trip is close.
import { CheckCircle2 } from "lucide-react";
import { balanceOf, money, moneyState } from "@/lib/helpers";
import type { Booking } from "@/lib/types";

export default function BalanceCell({ booking }: { booking: Booking }) {
  const state = moneyState(booking);
  if (state === "cancelled") return <span className="text-[#0a120b]/30">—</span>;
  if (state === "refunded") return <span className="text-xs text-[#0a120b]/45">Refunded</span>;
  if (state === "quote") return <span className="text-xs text-[#0a120b]/45 whitespace-nowrap">Awaiting price</span>;
  if (state === "settled")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="size-3.5" /> Paid in full
      </span>
    );
  return (
    <span className={`font-semibold tabular-nums whitespace-nowrap ${state === "overdue" ? "text-red-700" : "text-[#0a120b]"}`}>
      {money(balanceOf(booking))}
      {state === "overdue" && <span className="block text-[10px] font-medium uppercase tracking-wider">Due soon</span>}
    </span>
  );
}
