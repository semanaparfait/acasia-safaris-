"use client";

import { useEffect, useRef, useState } from "react";

const INK = "#0a120b";
const SERIES = "#2E7D5B";

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function niceMax(v: number) {
  if (v <= 0) return 1; // no data yet: keep the scale valid
  const pow = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / pow) * pow;
}

/** Single-series area chart with a hover crosshair + tooltip. */
export function AreaChart({
  data,
  height = 260,
  format = (n: number) => n.toLocaleString(),
}: {
  data: { label: string; value: number }[];
  height?: number;
  format?: (n: number) => string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const pad = { top: 16, right: 12, bottom: 28, left: 48 };
  const w = Math.max(width - pad.left - pad.right, 0);
  const h = height - pad.top - pad.bottom;
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const x = (i: number) => (data.length > 1 ? (i / (data.length - 1)) * w : 0);
  const y = (v: number) => h - (v / max) * h;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);

  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${h} L0,${h} Z`;

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - rect.left) / rect.width) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label="Revenue over the last 12 months">
          <defs>
            <linearGradient id="area-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={SERIES} stopOpacity={0.22} />
              <stop offset="100%" stopColor={SERIES} stopOpacity={0} />
            </linearGradient>
          </defs>
          <g transform={`translate(${pad.left},${pad.top})`}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={0} x2={w} y1={y(t)} y2={y(t)} stroke={INK} strokeOpacity={t === 0 ? 0.15 : 0.06} />
                <text x={-10} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill={INK} fillOpacity={0.45}>
                  {format(t)}
                </text>
              </g>
            ))}
            {data.map((d, i) => (
              <text key={d.label} x={x(i)} y={h + 18} textAnchor="middle" fontSize={11} fill={INK} fillOpacity={hover === i ? 0.85 : 0.45}>
                {d.label}
              </text>
            ))}
            <path d={area} fill="url(#area-fill)" />
            <path d={line} fill="none" stroke={SERIES} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {hover !== null && (
              <>
                <line x1={x(hover)} x2={x(hover)} y1={0} y2={h} stroke={INK} strokeOpacity={0.2} strokeDasharray="3 3" />
                <circle cx={x(hover)} cy={y(data[hover].value)} r={5} fill={SERIES} stroke="#fff" strokeWidth={2} />
              </>
            )}
            <rect
              width={w}
              height={h}
              fill="transparent"
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
            />
          </g>
        </svg>
      )}
      {hover !== null && width > 0 && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-[#0a120b] px-3 py-2 text-white shadow-lg"
          style={{ left: pad.left + x(hover), top: pad.top + y(data[hover].value) - 12 }}
        >
          <p className="text-[11px] text-white/55">{data[hover].label}</p>
          <p className="text-sm font-semibold tabular-nums">{format(data[hover].value)}</p>
        </div>
      )}
    </div>
  );
}

/** Horizontal bar list – magnitude by category, labelled directly. */
export function BarList({
  data,
  format = (n: number) => n.toLocaleString(),
}: {
  data: { label: string; value: number; sub?: string }[];
  format?: (n: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value)) || 1; // avoid dividing by 0
  return (
    <ul className="space-y-3.5">
      {data.map((d) => (
        <li key={d.label} className="group" title={`${d.label}: ${format(d.value)}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm mb-1.5">
            <span className="truncate text-[#0a120b]/80">{d.label}</span>
            <span className="tabular-nums font-medium text-[#0a120b]">{format(d.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-[#0a120b]/[0.05] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#2E7D5B] group-hover:bg-[#1F5A42] transition-all duration-700"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Tiny trend line for stat tiles. */
export function Sparkline({ values, width = 96, height = 32 }: { values: number[]; width?: number; height?: number }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * width},${height - 2 - ((v - min) / (max - min || 1)) * (height - 4)}`)
    .join(" ");
  return (
    <svg width={width} height={height} aria-hidden>
      <polyline points={pts} fill="none" stroke={SERIES} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
