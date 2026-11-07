'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeLangToggles } from './ThemeLangProvider';

const links = [
  { href: '/administrator/dashboard', label: 'Dashboard' },
  { href: '/administrator/users', label: 'Users' },
  { href: '/administrator/withdrawals', label: 'Withdrawals' },
  { href: '/administrator/transactions', label: 'Transactions' },
  { href: '/administrator/plans', label: 'Plans' },
  { href: '/administrator/deposits', label: 'Deposits' },
  { href: '/administrator/settings', label: 'Settings' },
];

export function AdminNav() {
  const path = usePathname();
  const router = useRouter();
  return (
    <header className="border-b border-white/5 bg-slate-950/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 py-2.5 flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2 mr-2">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold">₮</span>
          <span className="font-bold text-sm hidden sm:inline">USDT<span className="text-emerald-400">Earn</span> Admin</span>
        </div>
        <div className="flex flex-wrap gap-1 text-xs sm:text-sm flex-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                path === l.href
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ThemeLangToggles />
          <button
            type="button"
            className="text-xs text-red-400 px-2 py-1 hover:bg-red-500/10 rounded-lg"
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/administrator');
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
