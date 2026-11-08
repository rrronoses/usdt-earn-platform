'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeLangToggles, useThemeLang } from './ThemeLangProvider';

const links = [
  { href: '/administrator/dashboard', label: 'Overview', icon: '▣' },
  { href: '/administrator/users', label: 'Users', icon: '◎' },
  { href: '/administrator/withdrawals', label: 'Withdrawals', icon: '↓' },
  { href: '/administrator/transactions', label: 'Transactions', icon: '⇄' },
  { href: '/administrator/plans', label: 'Plans', icon: '◈' },
  { href: '/administrator/deposits', label: 'Deposits', icon: '₮' },
  { href: '/administrator/settings', label: 'Settings', icon: '⚙' },
];

export function AdminNav() {
  const path = usePathname();
  const router = useRouter();
  const { t } = useThemeLang();

  return (
    <header className="sticky top-0 z-50 border-b glass" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="h-14 flex items-center justify-between gap-3">
          <Link href="/administrator/dashboard" className="flex items-center gap-2.5 shrink-0 group">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-violet-500/20 group-hover:scale-105 transition">
              A
            </span>
            <div className="hidden sm:block leading-tight">
              <p className="font-bold text-sm tracking-tight">
                USDT<span className="text-emerald-500">Earn</span>
              </p>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                Admin Console
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
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

        <nav className="flex gap-1 overflow-x-auto pb-2.5 -mx-1 px-1">
          {links.map((l) => {
            const active = path === l.href || path.startsWith(l.href + '/');
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                  active
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
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
    <div className="page-shell relative">
      <div className="fixed inset-0 pointer-events-none mesh-bg opacity-80" />
      <AdminNav />
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
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
