"use client";

// The cancellation policy with the real dates of one trip (lib/cancellation.ts),
// in the visitor's language. "compact" is the one-line version for the booking pop-up.
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarX2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cancellationSchedule } from "@/lib/cancellation";
import { tripDate } from "@/lib/dates";

export default function CancellationPolicy({ startDate, compact = false }: { startDate: string; compact?: boolean }) {
  const t = useTranslations("Cancel");
  const locale = useLocale();
  // "Today" read once, when the page opens
  const [today] = useState(() => new Date());
  const rows = cancellationSchedule(startDate, today);
  const day = (d: Date) => tripDate(d, "long", locale);

  if (compact) {
    const now = rows.find((r) => r.current);
    return (
      <p className="flex items-start gap-2 text-xs text-[#0a120b]/55 leading-relaxed">
        <CalendarX2 size={14} className="shrink-0 mt-px text-[#1F5A42]" />
        <span>
          {now && now.charge === 0 && now.until
            ? t("freeUntil", { date: day(now.until) })
            : t("ifNow", { percent: now?.charge ?? 100 })}{" "}
          <Link href="/terms" target="_blank" className="underline underline-offset-2 hover:text-[#0a120b]">
            {t("fullPolicy")}
          </Link>
        </span>
      </p>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      <ul className="divide-y divide-[#0a120b]/[0.06] rounded-xl border border-[#0a120b]/10">
        {rows.map((r) => (
          <li key={r.charge} className={`flex items-start justify-between gap-3 px-3.5 py-2.5 ${r.current ? "bg-[#c5a86d]/[0.08]" : ""}`}>
            <span className="text-[#0a120b]/60 shrink-0">
              {r.from && r.until
                ? t("between", { from: day(r.from), until: day(r.until) })
                : r.until
                  ? t("until", { date: day(r.until) })
                  : r.from
                    ? t("fromDate", { date: day(r.from) })
                    : t("fromToday")}
            </span>
            <span className={`text-right ${r.charge === 0 ? "text-emerald-700" : "text-[#0a120b]"} font-medium`}>
              {r.charge === 0 ? t("free") : r.charge === 100 ? t("all") : t("charge", { percent: r.charge })}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-[#0a120b]/50 leading-relaxed">
        {t("permits")} {t("how")}
      </p>
    </div>
  );
}
