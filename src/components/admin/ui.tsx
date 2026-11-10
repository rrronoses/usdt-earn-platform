'use client';

import type { ReactNode } from 'react';

export function AdminPanel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border overflow-hidden ${className}`}
      style={{
        borderColor: 'var(--border)',
        background: 'color-mix(in srgb, var(--card, var(--bg)) 92%, transparent)',
      }}
    >
      {children}
    </div>
  );
}

export function AdminKpi({
  label,
  value,
  hint,
  accent = 'emerald',
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: 'emerald' | 'sky' | 'amber' | 'violet' | 'cyan' | 'rose';
}) {
  const tone: Record<string, string> = {
    emerald: 'text-emerald-500',
    sky: 'text-sky-500',
    amber: 'text-amber-500',
    violet: 'text-violet-500',
    cyan: 'text-cyan-500',
    rose: 'text-rose-500',
  };
  return (
    <div
      className="rounded-2xl border p-4 sm:p-5 transition hover:shadow-lg"
      style={{ borderColor: 'var(--border)', background: 'var(--card, transparent)' }}
    >
      <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--muted)' }}>
        {label}
      </p>
      <p className={`text-2xl sm:text-3xl font-black mt-1.5 tabular-nums ${tone[accent]}`}>{value}</p>
      {hint && (
        <p className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function StatusBadge({
  status,
}: {
  status: string;
}) {
  const s = status.toLowerCase();
  let cls = 'border-[var(--border)] text-[var(--muted)]';
  if (s === 'active' || s === 'completed' || s === 'approved' || s === 'confirmed') {
    cls = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
  } else if (s === 'pending') {
    cls = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
  } else if (s === 'banned' || s === 'rejected' || s === 'failed') {
    cls = 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30';
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border capitalize ${cls}`}>
      {status}
    </span>
  );
}

/** Pure SVG sparkline — no chart library */
export function Sparkline({
  data,
  color = '#10b981',
  height = 48,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  if (!data.length) {
    return <div style={{ height }} className="opacity-40 text-xs flex items-center" style-color="var(--muted)">No data</div>;
  }
  const w = 160;
  const max = Math.max(...data, 0.0001);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * w;
      const y = height - ((v - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');
  const area = `0,${height} ${pts} ${w},${height}`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      <polygon points={area} fill={color} opacity={0.12} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div
      className="rounded-2xl border border-dashed p-10 sm:p-14 text-center"
      style={{ borderColor: 'var(--border)' }}
    >
      <p className="font-semibold">{title}</p>
      {hint && (
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <AdminPanel>
      <div className="overflow-x-auto">{children}</div>
    </AdminPanel>
  );
}
