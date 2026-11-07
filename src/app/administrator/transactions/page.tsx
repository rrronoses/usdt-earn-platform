'use client';
import { useEffect, useState } from 'react';
import { AdminNav } from '@/components/AdminNav';

export default function AdminTxPage() {
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [userId, setUserId] = useState('');
  const [txs, setTxs] = useState<any[]>([]);

  async function load() {
    const q = new URLSearchParams();
    if (type) q.set('type', type);
    if (status) q.set('status', status);
    if (userId) q.set('userId', userId);
    const d: any = await fetch(`/api/admin/transactions?${q}`).then((r) => r.json());
    if (d.ok) setTxs(d.transactions || []);
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AdminNav />
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-xl font-bold">All transactions</h1>
        <div className="flex flex-wrap gap-2">
          <select value={type} onChange={(e) => setType(e.target.value)} className="px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-sm">
            <option value="">All types</option>
            {['deposit','withdrawal','yield','referral','plan_purchase','signup_bonus','admin_add','admin_sub'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-sm">
            <option value="">All status</option>
            {['pending','completed','approved','rejected'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" className="px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-sm" />
          <button onClick={load} className="px-3 py-1.5 rounded bg-emerald-600 text-sm">Filter</button>
        </div>
        <div className="rounded-xl border border-slate-800 divide-y divide-slate-800 max-h-[70vh] overflow-y-auto">
          {txs.map((t) => (
            <div key={t.id} className="px-3 py-2 text-sm flex justify-between gap-2">
              <div>
                <p>{t.description}</p>
                <p className="text-xs text-slate-500">{t.userId} · {t.type} · {t.status} · {new Date(t.timestamp).toLocaleString()}</p>
              </div>
              <span className="font-mono">{t.amount}</span>
            </div>
          ))}
          {txs.length === 0 && <p className="p-4 text-slate-500 text-sm">No transactions</p>}
        </div>
      </main>
    </div>
  );
}
