'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { useThemeLang } from '@/components/ThemeLangProvider';

export default function AccountPage() {
  const router = useRouter();
  const { t } = useThemeLang();
  const [user, setUser] = useState<any>(null);
  const [msg, setMsg] = useState('');

  const load = useCallback(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d: any) => {
        if (!d.ok) {
          router.push('/login');
          return;
        }
        setUser(d.user);
      });
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (!user) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
    user.avatarSeed || user.username
  )}`;

  const links = [
    { href: '/deposit', title: t.deposit, desc: 'USDT TRC-20 · QR · auto credit', icon: '↓' },
    { href: '/withdraw', title: t.withdraw, desc: 'Request payout + history', icon: '↑' },
    { href: '/history', title: t.fullHistory, desc: 'All transactions filter', icon: '⇄' },
    { href: '/password', title: t.changePassword, desc: 'Update login password', icon: '⛨' },
    { href: '/invitation', title: t.invite, desc: '20% referral · share link', icon: '↗' },
  ];

  return (
    <div className="page-shell pb-28 relative">
      <div className="fixed inset-0 pointer-events-none mesh-bg" />
      <UserNav />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 relative z-10">
        {msg && (
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-sm text-center">
            {msg}
          </div>
        )}

        <div className="panel-card p-5 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar}
            alt=""
            className="w-16 h-16 rounded-2xl ring-2 ring-emerald-500/30"
          />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-lg truncate">{user.username}</p>
            <p className="text-sm truncate" style={{ color: 'var(--muted)' }}>
              {user.email}
            </p>
            <p className="text-xs mt-1.5 flex items-center gap-2 flex-wrap" style={{ color: 'var(--muted)' }}>
              <span>
                ID: <code className="text-emerald-500 font-mono">{user.id}</code>
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(user.id);
                  setMsg('User ID copied');
                }}
                className="text-emerald-500 font-medium"
              >
                Copy
              </button>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="panel-card p-3">
            <p className="text-[10px] uppercase" style={{ color: 'var(--muted)' }}>
              {t.deposit}
            </p>
            <p className="font-bold text-emerald-500">{Number(user.depositBalance).toFixed(2)}</p>
          </div>
          <div className="panel-card p-3">
            <p className="text-[10px] uppercase" style={{ color: 'var(--muted)' }}>
              {t.withdraw}
            </p>
            <p className="font-bold text-emerald-500">{Number(user.withdrawalBalance).toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="panel-card p-4 flex items-center gap-3 hover:border-emerald-500/40 transition"
            >
              <span className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-lg">
                {l.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{l.title}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {l.desc}
                </p>
              </div>
              <span style={{ color: 'var(--muted)' }}>→</span>
            </Link>
          ))}
        </div>

        <button
          onClick={logout}
          className="w-full py-3 rounded-2xl border border-red-500/40 text-red-500 font-semibold hover:bg-red-500/10 transition"
        >
          {t.logout}
        </button>
      </main>
    </div>
  );
}
