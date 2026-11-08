'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeLangToggles, useThemeLang } from './ThemeLangProvider';

const tabs = [
  { href: '/dashboard', labelKey: 'dashboard' as const, icon: '⌂' },
  { href: '/plans', labelKey: 'plans' as const, icon: '◈' },
  { href: '/invitation', labelKey: 'invite' as const, icon: '↗' },
  { href: '/account', labelKey: 'account' as const, icon: '◉' },
];

export function UserNav() {
  const path = usePathname();
  const { t } = useThemeLang();

  return (
    <>
      <header className="border-b sticky top-0 z-40 glass" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold group">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-sm shadow-lg shadow-emerald-500/40 group-hover:scale-105 transition">
              ₮
            </span>
            <span className="tracking-tight">
              USDT<span className="text-gradient">Earn</span>
            </span>
          </Link>
          <ThemeLangToggles />
        </div>
      </header>

      <nav
        className="fixed bottom-0 inset-x-0 z-50 border-t glass safe-bottom"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="max-w-lg mx-auto grid grid-cols-4 px-1">
          {tabs.map((tab) => {
            const active = path === tab.href || path.startsWith(tab.href + '/');
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors ${
                  active ? 'text-emerald-500' : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
                )}
                <span className={`text-xl leading-none ${active ? 'scale-110' : ''}`}>{tab.icon}</span>
                <span>{t[tab.labelKey]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
