"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";

export const inputClass =
  "w-full bg-white border border-[#0a120b]/10 rounded-lg px-3.5 py-2.5 text-sm text-[#0a120b] placeholder:text-[#0a120b]/35 outline-none focus:border-[#c5a86d] focus:ring-4 focus:ring-[#c5a86d]/15 transition-all";
export const labelClass =
  "block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0a120b]/55 mb-1.5";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0a120b]">{title}</h1>
        {subtitle && <p className="text-sm text-[#0a120b]/55 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#0a120b]/[0.06] shadow-[0_1px_2px_rgba(10,18,11,0.04),0_8px_24px_-12px_rgba(10,18,11,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
      <div>
        <h2 className="text-[15px] font-semibold text-[#0a120b]">{title}</h2>
        {subtitle && <p className="text-xs text-[#0a120b]/50 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

type Variant = "primary" | "secondary" | "ghost" | "danger";
const variants: Record<Variant, string> = {
  primary: "bg-[#12231a] text-white hover:bg-[#1F5A42] shadow-sm",
  secondary: "bg-white text-[#0a120b] border border-[#0a120b]/10 hover:border-[#c5a86d] hover:text-[#1F5A42]",
  ghost: "text-[#0a120b]/70 hover:bg-[#0a120b]/5",
  danger: "bg-[#E53935] text-white hover:bg-[#c62f2b]",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

const tones = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/15",
  red: "bg-red-50 text-red-700 ring-red-600/15",
  gray: "bg-gray-100 text-gray-600 ring-gray-500/15",
  gold: "bg-[#c5a86d]/12 text-[#8a6d2f] ring-[#c5a86d]/30",
};
export type Tone = keyof typeof tones;

export const statusTone: Record<string, Tone> = {
  Pending: "amber",
  Confirmed: "green",
  Completed: "blue",
  Cancelled: "red",
  Unpaid: "amber",
  Deposit: "blue",
  Paid: "green",
  Refunded: "gray",
  Published: "green",
  Hidden: "gray",
  Active: "green",
  "On leave": "amber",
  Inactive: "gray",
  Draft: "gray",
};

export function Badge({ children, tone = "gray", dot = true }: { children: React.ReactNode; tone?: Tone; dot?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${tones[tone]}`}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTone[status] ?? "gray"}>{status}</Badge>;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#0a120b]/35" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} pl-9`}
      />
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 p-1 bg-[#0a120b]/[0.04] rounded-xl overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`relative px-3.5 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            value === t.value ? "text-[#0a120b] font-medium" : "text-[#0a120b]/55 hover:text-[#0a120b]"
          }`}
        >
          {value === t.value && (
            <motion.span
              layoutId={`tab-${tabs.map((x) => x.value).join("")}`}
              className="absolute inset-0 bg-white rounded-lg shadow-sm"
              transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            />
          )}
          <span className="relative flex items-center gap-1.5">
            {t.label}
            {t.count !== undefined && (
              <span className="text-[11px] text-[#0a120b]/40 tabular-nums">{t.count}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[#0a120b]/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full ${size === "lg" ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#0a120b]/[0.06]">
              <h3 className="text-base font-semibold text-[#0a120b]">{title}</h3>
              <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-[#0a120b]/50 hover:bg-[#0a120b]/5 cursor-pointer">
                <X className="size-4" />
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto">{children}</div>
            {footer && (
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#0a120b]/[0.06] bg-[#f7f5f0]/60 rounded-b-2xl">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>Delete</Button>
        </>
      }
    >
      <p className="text-sm text-[#0a120b]/65">{message}</p>
    </Modal>
  );
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  const hues = ["#2E7D5B", "#1F5A42", "#B8944D", "#4C9A79", "#8a6d2f", "#12231a"];
  const bg = hues[name.length % hues.length];
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-white font-semibold shrink-0"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="py-16 text-center">
      <p className="text-sm font-medium text-[#0a120b]">{title}</p>
      {text && <p className="text-sm text-[#0a120b]/50 mt-1">{text}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${checked ? "bg-[#2E7D5B]" : "bg-[#0a120b]/15"}`}
    >
      <span className={`inline-block size-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`} />
    </button>
  );
}
