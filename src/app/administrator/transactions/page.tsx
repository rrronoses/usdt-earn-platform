'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminNav';

export default function AdminTxPage() {
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [userId, setUserId] = useState('');
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const q = new URLSearchParams();
    if (type) q.set('type', type);
    if (status) q.set('status', status);
    if (userId) q.set('userId', userId);
    const d: any = await fetch(`/api/admin/transactions?${q}`).then((r) => r.json());
    if (d.ok) setTxs(d.transactions || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <AdminShell title="Transactions" subtitle="Full ledger across all users">
      <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-2xl border border-white/10 bg-slate-900/50">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm"
        >
          <option value="">All types</option>
          {['deposit', 'withdrawal', 'yield', 'referral', 'plan_purchase', 'signup_bonus', 'admin_add', 'admin_sub'].map(
            (t) => (
              <option key={t} value={t}>
                {t}
              </option>
            )
          )}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm"
        >
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
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono"
        />
        <button onClick={load} className="btn-primary px-4 py-2 text-sm">
          Filter
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/40 divide-y divide-white/5 max-h-[70vh] overflow-y-auto">
        {loading && <p className="p-8 text-center text-slate-500">Loading…</p>}
        {!loading &&
          txs.map((t) => (
            <div key={t.id} className="px-4 py-3 text-sm flex justify-between gap-3 hover:bg-white/[0.03]">
              <div className="min-w-0">
                <p className="font-medium truncate">{t.description}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  <span className="font-mono">{t.userId}</span> · {t.type} · {t.status} ·{' '}
                  {new Date(t.timestamp).toLocaleString()}
                </p>
              </div>
              <span
                className={`font-mono font-semibold shrink-0 ${
                  t.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {t.amount >= 0 ? '+' : ''}
                {t.amount}
              </span>
            </div>
          ))}
        {!loading && txs.length === 0 && (
          <p className="p-8 text-center text-slate-500 text-sm">No transactions match filters</p>
        )}
      </div>
    </AdminShell>
  );
}
