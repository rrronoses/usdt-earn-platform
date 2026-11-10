'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeLangToggles, useThemeLang } from './ThemeLangProvider';

const links = [
  { href: '/administrator/dashboard', label: 'Overview', icon: '▣' },
  { href: '/administrator/users', label: 'Users', icon: '◎' },
  { href: '/administrator/withdrawals', label: 'Withdrawals', icon: '↓' },
  { href: '/administrator/transactions', label: 'Ledger', icon: '⇄' },
  { href: '/administrator/plans', label: 'Plans', icon: '◈' },
  { href: '/administrator/deposits', label: 'Wallets', icon: '₮' },
  { href: '/administrator/settings', label: 'Settings', icon: '⚙' },
];

export function AdminNav() {
  const path = usePathname();
  const router = useRouter();
  const { t } = useThemeLang();

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        borderColor: 'var(--border)',
        background: 'color-mix(in srgb, var(--bg) 88%, transparent)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-5">
        <div className="h-14 flex items-center justify-between gap-3">
          <Link href="/administrator/dashboard" className="flex items-center gap-2.5 shrink-0 group">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-violet-500/25 group-hover:scale-105 transition">
              UE
            </span>
            <div className="hidden sm:block leading-tight">
              <p className="font-bold text-sm tracking-tight">
                USDT<span className="text-emerald-500">Earn</span>
              </p>
              <p className="text-[10px] uppercase tracking-[0.16em] font-medium" style={{ color: 'var(--muted)' }}>
                SaaS Console
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <span
              className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
            <ThemeLangToggles />
            <button
              type="button"
              className="text-xs font-medium text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/administrator');
              }}
            >
              {t.logout}
            </button>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto pb-2.5 -mx-1 px-1 scrollbar-none">
          {links.map((l) => {
            const active = path === l.href || path.startsWith(l.href + '/');
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                  active
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/25'
                    : 'hover:bg-white/5'
                }`}
                style={active ? undefined : { color: 'var(--muted)' }}
              >
                <span className="opacity-80">{l.icon}</span>
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function AdminShell({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-shell relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none mesh-bg opacity-70" />
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.35]"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(139,92,246,0.18), transparent), radial-gradient(ellipse 60% 40% at 90% 10%, rgba(16,185,129,0.12), transparent)',
        }}
      />
      <AdminNav />
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-5 py-6 sm:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-1"
              style={{ color: 'var(--muted)' }}
            >
              Control center
            </p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm mt-1.5 max-w-xl" style={{ color: 'var(--muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
        {children}
      </main>
    </div>
  );
}
