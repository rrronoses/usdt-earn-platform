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
      {/* Top bar */}
      <header className="border-b border-white/5 sticky top-0 z-40 glass bg-slate-950/80 dark:bg-slate-950/80 light:bg-white/80">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-sm shadow-md shadow-emerald-500/30">
              ₮
            </span>
            <span className="hidden xs:inline">
              USDT<span className="text-emerald-400">Earn</span>
            </span>
          </Link>
          <ThemeLangToggles />
        </div>
      </header>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-slate-950/95 backdrop-blur-lg pb-safe">
        <div className="max-w-lg mx-auto grid grid-cols-4">
          {tabs.map((tab) => {
            const active = path === tab.href || path.startsWith(tab.href + '/');
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition ${
                  active ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className={`text-lg leading-none ${active ? 'scale-110' : ''} transition-transform`}>{tab.icon}</span>
                <span>{t[tab.labelKey]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
