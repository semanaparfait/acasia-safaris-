"use client";

// The money side of one booking: total, paid, balance due, every payment received,
// and a form to record a new one. The Unpaid / Deposit / Paid label follows from the payments.
import { useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Plus, Trash2, Wallet } from "lucide-react";
import { Button, ConfirmDialog, inputClass } from "../components/ui";
import { balanceOf, depositOf, money, moneyState, paidOf } from "@/lib/helpers";
import { PAYMENT_METHODS, type Booking, type PaymentMethod } from "@/lib/types";
import { useBookingsStore, type BookingChanges } from "@/store/bookingsStore";

const today = () => new Date().toISOString().slice(0, 10);
// Payment days are stored as dates: show them without a time-zone shift
export const payDay = (d: string) => format(new Date(`${d.slice(0, 10)}T00:00`), "d MMM yyyy");

export default function PaymentsPanel({
  booking: b,
  update,
}: {
  booking: Booking;
  update: (id: string, changes: BookingChanges, message: string) => Promise<void>;
}) {
  const addPayment = useBookingsStore((s) => s.addPayment);
  const removePayment = useBookingsStore((s) => s.removePayment);

  const paid = paidOf(b);
  const balance = balanceOf(b);
  const state = moneyState(b);
  const deposit = depositOf(b.amount);
  const percent = b.amount > 0 ? Math.min(100, Math.round((paid / b.amount) * 100)) : 0;
  const payments = b.payments ?? [];

  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ amount: "", method: "Bank transfer" as PaymentMethod, paidAt: today(), reference: "", note: "" });

  const openForm = () => {
    setForm({ amount: balance > 0 ? String(paid < deposit ? deposit - paid : balance) : "", method: "Bank transfer", paidAt: today(), reference: "", note: "" });
    setAdding(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount < 1) return toast.error("Enter the amount received");
    setSaving(true);
    try {
      await addPayment(b.id, {
        amount,
        method: form.method,
        paidAt: form.paidAt || undefined,
        reference: form.reference || undefined,
        note: form.note || undefined,
      });
      toast.success(`${money(amount)} recorded`);
      setAdding(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Removing a payment or refunding asks first
  const [confirm, setConfirm] = useState<{ title: string; message: string; label: string; run: () => void } | null>(null);

  const remove = async (paymentId: string) => {
    try {
      await removePayment(b.id, paymentId);
      toast.success("Payment removed");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <section className="space-y-4">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#0a120b]/45">
        <Wallet className="size-3.5" /> Money
      </p>

      {/* Total / Paid / Balance due */}
      <div className="grid grid-cols-3 gap-2">
        <Tile label="Total price" value={b.amount > 0 ? money(b.amount) : "To quote"} />
        <Tile label="Paid" value={money(paid)} />
        <Tile
          label={state === "overdue" ? "Balance due · trip soon" : "Balance due"}
          value={state === "settled" ? "Paid in full" : money(balance)}
          tone={state === "overdue" ? "red" : state === "settled" ? "green" : undefined}
        />
      </div>

      {b.amount > 0 && (
        <div>
          <div className="h-2 rounded-full bg-[#0a120b]/[0.06] overflow-hidden">
            <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${percent}%` }} />
          </div>
          <div className="flex justify-between text-xs text-[#0a120b]/50 mt-1.5">
            <span>{percent}% paid</span>
            <span>
              Deposit (50%) {money(deposit)}:{" "}
              {paid >= deposit ? <span className="text-emerald-700 font-medium">received</span> : <span className="text-red-700 font-medium">{money(deposit - paid)} missing</span>}
            </span>
          </div>
        </div>
      )}

      {/* Price breakdown */}
      <div className="rounded-xl bg-[#f7f5f0] p-4 space-y-2 text-sm">
        {b.guests && b.guests.length > 0 && (
          <div className="space-y-1 pb-2 border-b border-[#0a120b]/10">
            {b.guests.map((g) => (
              <div key={g.label} className="flex justify-between text-[#0a120b]/65">
                <span>{g.count} × {g.label} ({money(g.price)})</span>
                <span className="tabular-nums">{money(g.count * g.price)}</span>
              </div>
            ))}
          </div>
        )}
        {b.listAmount > 0 && b.amount !== b.listAmount && (
          <div className="flex justify-between text-[#0a120b]/55"><span>Full price</span><span className="tabular-nums line-through">{money(b.listAmount)}</span></div>
        )}
        {b.floorAmount != null && (
          <div className="flex justify-between text-[#0a120b]/55"><span>Lowest you accept</span><span className="tabular-nums">{money(b.floorAmount)}</span></div>
        )}
        <label className="flex items-center justify-between gap-3">
          <span className="text-[#0a120b]/55">{b.status === "Confirmed" || b.status === "Completed" ? "Agreed price" : "Total price"} (USD)</span>
          <input
            key={`${b.id}-${b.amount}`}
            type="number"
            min={0}
            defaultValue={b.amount || ""}
            placeholder="Set once agreed"
            onBlur={(e) => {
              const amount = Number(e.target.value);
              if (amount !== b.amount) update(b.id, { amount }, "Price updated");
            }}
            className={`${inputClass} !w-36 !py-1.5 text-right font-semibold`}
          />
        </label>
      </div>

      {/* Payments received */}
      <div className="rounded-xl border border-[#0a120b]/10 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#f7f5f0]/60 border-b border-[#0a120b]/[0.06]">
          <p className="text-sm font-medium">Payments received</p>
          {!adding && (
            <button onClick={openForm} className="inline-flex items-center gap-1 text-xs font-medium text-[#2E7D5B] hover:underline cursor-pointer">
              <Plus className="size-3.5" /> Record payment
            </button>
          )}
        </div>

        {payments.length === 0 && !adding && <p className="px-4 py-4 text-sm text-[#0a120b]/50">No money received yet.</p>}

        {payments.length > 0 && (
          <ul className="divide-y divide-[#0a120b]/[0.05]">
            {payments.map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-3 px-4 py-3 text-sm group">
                <div className="min-w-0">
                  <p className="font-medium">{p.method}</p>
                  <p className="text-xs text-[#0a120b]/50">
                    {payDay(p.paidAt)}
                    {p.reference && <> · Ref <span className="font-mono">{p.reference}</span></>}
                    {" "}· by {p.recordedBy}
                  </p>
                  {p.note && <p className="text-xs text-[#0a120b]/65 mt-0.5">{p.note}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="font-semibold tabular-nums text-emerald-700">+{money(p.amount)}</span>
                  <button
                    onClick={() =>
                      setConfirm({
                        title: "Remove payment",
                        message: `Remove the ${p.method.toLowerCase()} payment of ${money(p.amount)} from ${payDay(p.paidAt)}? Do this only for a payment entered by mistake.`,
                        label: "Remove",
                        run: () => remove(p.id),
                      })
                    }
                    title="Remove (entered by mistake)"
                    className="p-1 rounded-md text-[#0a120b]/30 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {adding && (
          <form onSubmit={save} className="p-4 space-y-3 border-t border-[#0a120b]/[0.06] bg-[#fbfaf7]">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="block text-xs text-[#0a120b]/50 mb-1.5">Amount (USD)</span>
                <input type="number" min={1} required autoFocus value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} />
              </label>
              <label className="text-sm">
                <span className="block text-xs text-[#0a120b]/50 mb-1.5">Method</span>
                <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as PaymentMethod })} className={inputClass}>
                  {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </label>
            </div>
            {balance > 0 && (
              <div className="flex flex-wrap gap-2 text-xs">
                {paid < deposit && (
                  <QuickAmount onClick={() => setForm({ ...form, amount: String(deposit - paid) })}>Deposit {money(deposit - paid)}</QuickAmount>
                )}
                <QuickAmount onClick={() => setForm({ ...form, amount: String(balance) })}>Full balance {money(balance)}</QuickAmount>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="block text-xs text-[#0a120b]/50 mb-1.5">Received on</span>
                <input type="date" max={today()} value={form.paidAt} onChange={(e) => setForm({ ...form, paidAt: e.target.value })} className={inputClass} />
              </label>
              <label className="text-sm">
                <span className="block text-xs text-[#0a120b]/50 mb-1.5">Reference (optional)</span>
                <input value={form.reference} maxLength={200} placeholder="Transaction / receipt no." onChange={(e) => setForm({ ...form, reference: e.target.value })} className={inputClass} />
              </label>
            </div>
            <label className="block text-sm">
              <span className="block text-xs text-[#0a120b]/50 mb-1.5">Note (optional)</span>
              <input value={form.note} maxLength={1000} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputClass} />
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save payment"}</Button>
            </div>
          </form>
        )}
      </div>

      {(paid > 0 || b.payment === "Refunded") && (
        <div className="flex justify-end">
          {b.payment === "Refunded" ? (
            <button onClick={() => update(b.id, { payment: "Unpaid" }, "Refund taken back")} className="text-xs text-[#0a120b]/50 hover:text-[#0a120b] hover:underline cursor-pointer">
              Undo refund
            </button>
          ) : (
            <button
              onClick={() =>
                setConfirm({
                  title: "Mark as refunded",
                  message: `Mark ${b.customer}'s booking as refunded? Its balance will no longer count as money owed.`,
                  label: "Mark as refunded",
                  run: () => update(b.id, { payment: "Refunded" }, "Marked as refunded"),
                })
              }
              className="text-xs text-[#0a120b]/50 hover:text-red-700 hover:underline cursor-pointer"
            >
              Mark as refunded
            </button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm?.run()}
        title={confirm?.title ?? ""}
        message={confirm?.message ?? ""}
        confirmLabel={confirm?.label}
      />
    </section>
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone?: "green" | "red" }) {
  const color = tone === "green" ? "text-emerald-700" : tone === "red" ? "text-red-700" : "text-[#0a120b]";
  return (
    <div className="rounded-xl border border-[#0a120b]/10 px-3 py-2.5">
      <p className="text-[11px] text-[#0a120b]/50">{label}</p>
      <p className={`text-base font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function QuickAmount({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full border border-[#0a120b]/10 bg-white px-2.5 py-1 hover:border-[#c5a86d] cursor-pointer">
      {children}
    </button>
  );
}
