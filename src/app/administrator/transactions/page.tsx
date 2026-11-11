'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminNav';
import { AdminTable, EmptyState, StatusBadge } from '@/components/admin/ui';
import { txTypeLabel } from '@/lib/labels';

type TxRow = {
  id: string;
  userId: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  timestamp: string;
  txHash?: string;
  address?: string;
};

function shortAddr(addr?: string) {
  if (!addr) return '—';
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function AdminTxPage() {
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [userId, setUserId] = useState('');
  const [txs, setTxs] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const q = new URLSearchParams();
    if (type) q.set('type', type);
    if (status) q.set('status', status);
    if (userId) q.set('userId', userId);
    const d = (await fetch(`/api/admin/transactions?${q}`).then((r) => r.json())) as {
      ok?: boolean;
      transactions?: TxRow[];
    };
    if (d.ok) setTxs(d.transactions || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminShell
      title="Ledger"
      subtitle="Full transaction history across all users"
      actions={
        <button type="button" onClick={load} className="btn-ghost text-xs px-3 py-1.5">
          Refresh
        </button>
      }
    >
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={type} onChange={(e) => setType(e.target.value)} className="input-field !w-auto text-sm py-2">
          <option value="">All types</option>
          {['deposit', 'withdrawal', 'earn', 'referral', 'plan_purchase', 'signup_bonus', 'admin_add', 'admin_sub'].map(
            (t) => (
              <option key={t} value={t}>
                {txTypeLabel(t)}
              </option>
            )
          )}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field !w-auto text-sm py-2">
          <option value="">All status</option>
          {['pending', 'completed', 'approved', 'rejected'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID"
          className="input-field !w-36 text-sm py-2 font-mono"
        />
        <button type="button" onClick={load} className="btn-primary text-sm px-4 py-2">
          Apply
        </button>
      </div>

      <AdminTable>
        <table className="w-full text-sm">
          <thead style={{ background: 'color-mix(in srgb, var(--border) 40%, transparent)' }}>
            <tr className="text-left text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              <th className="p-3 font-medium">When</th>
              <th className="p-3 font-medium">User</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Amount</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">TRC-20 address</th>
              <th className="p-3 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="p-8 text-center" style={{ color: 'var(--muted)' }}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading &&
              txs.map((t) => (
                <tr key={t.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-3 text-xs whitespace-nowrap" style={{ color: 'var(--muted)' }}>
                    {new Date(t.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 font-mono text-xs">{t.userId}</td>
                  <td className="p-3 text-xs font-semibold">{txTypeLabel(t.type)}</td>
                  <td
                    className={`p-3 font-mono font-semibold ${
                      t.amount >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {t.amount >= 0 ? '+' : ''}
                    {Number(t.amount).toFixed(2)}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="p-3 text-xs font-mono" title={t.address || ''}>
                    {t.type === 'withdrawal' || t.type === 'deposit' ? shortAddr(t.address) : '—'}
                  </td>
                  <td className="p-3 text-xs max-w-[200px] truncate" title={t.description}>
                    {t.description}
                  </td>
                </tr>
              ))}
            {!loading && txs.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8">
                  <EmptyState title="No transactions" hint="Try clearing filters." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminTable>
    </AdminShell>
  );
}
