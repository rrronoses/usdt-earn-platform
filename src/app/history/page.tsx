'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { useThemeLang } from '@/components/ThemeLangProvider';
import { txTypeLabel } from '@/lib/labels';

function shortAddr(addr?: string) {
  if (!addr) return '';
  if (addr.length <= 18) return addr;
  return `${addr.slice(0, 10)}…${addr.slice(-6)}`;
}

export default function HistoryPage() {
  const router = useRouter();
  const { t } = useThemeLang();
  const [txs, setTxs] = useState<any[]>([]);
  const [filter, setFilter] = useState('');

  const load = useCallback(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d: any) => {
        if (!d.ok) {
          router.push('/login');
          return;
        }
        setTxs(d.transactions || []);
      });
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = txs.filter((tx) => {
    if (!filter) return true;
    if (filter === 'earn') return tx.type === 'earn' || tx.type === 'yield';
    return tx.type === filter;
  });

  return (
    <div className="page-shell pb-28 relative">
      <div className="fixed inset-0 pointer-events-none mesh-bg" />
      <UserNav />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black">{t.fullHistory}</h1>
          <Link href="/account" className="text-sm text-emerald-500 font-semibold">
            ← {t.account}
          </Link>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field"
        >
          <option value="">All types</option>
          {['deposit', 'withdrawal', 'earn', 'referral', 'plan_purchase', 'signup_bonus'].map((tpe) => (
            <option key={tpe} value={tpe}>
              {txTypeLabel(tpe)}
            </option>
          ))}
        </select>

        <div className="panel-card divide-y overflow-hidden">
          {filtered.map((tx) => (
            <div key={tx.id} className="px-3.5 py-3 flex justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate">{tx.description}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                  {new Date(tx.timestamp).toLocaleString()} · {txTypeLabel(tx.type)} · {tx.status}
                </p>
                {tx.address && (
                  <p className="text-[11px] font-mono mt-0.5 break-all" style={{ color: 'var(--muted)' }} title={tx.address}>
                    TRC-20: {shortAddr(tx.address)}
                  </p>
                )}
              </div>
              <span
                className={`font-mono shrink-0 font-semibold ${
                  tx.amount >= 0 ? 'text-emerald-500' : 'text-red-500'
                }`}
              >
                {tx.amount >= 0 ? '+' : ''}
                {Number(tx.amount).toFixed(2)}
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="p-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
              {t.noData}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
