import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
  premium = false,
}: {
  children: ReactNode;
  className?: string;
  premium?: boolean;
}) {
  return (
    <div
      className={`${
        premium
          ? 'rounded-[1.35rem] border border-emerald-500/25 bg-gradient-to-br from-emerald-500/15 via-slate-900/80 to-teal-900/20 shadow-xl shadow-emerald-500/10'
          : 'rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md'
      } ${className}`}
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
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
      <div>
        <h3 className="font-bold text-base sm:text-lg">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;
}
