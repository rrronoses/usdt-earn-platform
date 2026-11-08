import type { ReactNode } from 'react';

export function StatCard({
  label,
  value,
  hint,
  tone = 'default',
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'emerald' | 'amber' | 'sky' | 'violet';
  icon?: ReactNode;
}) {
  const valueColor =
    tone === 'emerald'
      ? 'text-emerald-400'
      : tone === 'amber'
        ? 'text-amber-400'
        : tone === 'sky'
          ? 'text-sky-400'
          : tone === 'violet'
            ? 'text-violet-400'
            : 'text-white';

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{label}</p>
        {icon && <span className="text-slate-500">{icon}</span>}
      </div>
      <p className={`text-2xl sm:text-3xl font-black mt-1 tabular-nums ${valueColor}`}>{value}</p>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}
