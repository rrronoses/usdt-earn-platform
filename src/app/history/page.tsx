'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { useThemeLang } from '@/components/ThemeLangProvider';
import { txTypeLabel } from '@/lib/labels';

type Tx = {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  timestamp: string;
};

export default function HistoryPage() {
  const router = useRouter();
  const { t } = useThemeLang();
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [txFilter, setTxFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d: any) => {
        if (!d.ok) {
          router.push('/login');
          return;
        }
        setTransactions(d.transactions || []);
        setLoading(false);
      });
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredTxs = txFilter
    ? transactions.filter((tx) => tx.type === txFilter)
    : transactions;

  return (
    <div className="page-shell pb-28 relative">
      <div className="fixed inset-0 pointer-events-none mesh-bg" />
      <UserNav />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 relative z-10">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black">{t.fullHistory}</h1>
          <Link href="/account" className="text-sm text-emerald-500 font-semibold">
            ← {t.account}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={txFilter}
            onChange={(e) => setTxFilter(e.target.value)}
            className="text-sm px-3 py-2 rounded-xl border input-field"
          >
            <option value="">All types</option>
            {[
              'deposit',
              'withdrawal',
              'yield',
              'referral',
              'plan_purchase',
              'signup_bonus',
              'admin_add',
              'admin_sub',
            ].map((type) => (
              <option key={type} value={type}>
                {txTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        <div className="panel-card overflow-hidden">
          {loading ? (
            <p className="p-6 text-center" style={{ color: 'var(--muted)' }}>
              {t.loading}
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filteredTxs.map((tx) => (
                <div key={tx.id} className="px-4 py-3 flex justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{tx.description}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                      {txTypeLabel(tx.type)} · {tx.status} ·{' '}
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
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
              {filteredTxs.length === 0 && (
                <p className="p-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
                  {t.noData}
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
