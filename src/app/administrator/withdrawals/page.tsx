'use client';
import { useEffect, useState } from 'react';
import { AdminNav } from '@/components/AdminNav';

export default function AdminWithdrawalsPage() {
  const [list, setList] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  async function load() {
    const d: any = await fetch('/api/admin/withdrawals').then((r) => r.json());
    if (d.ok) setList(d.withdrawals || []);
  }
  useEffect(() => { load(); }, []);

  async function act(id: string, action: 'approve' | 'reject') {
    const d: any = await fetch('/api/admin/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    }).then((r) => r.json());
    setMsg(d.message || (d.ok ? action : 'Failed'));
    if (d.ok) load();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AdminNav />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-xl font-bold">Pending withdrawals</h1>
        {msg && <p className="text-sm text-emerald-400">{msg}</p>}
        {list.length === 0 && <p className="text-slate-500">No pending requests</p>}
        <div className="space-y-3">
          {list.map((w) => (
            <div key={w.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex flex-wrap justify-between gap-3">
              <div className="text-sm">
                <p className="font-medium">{w.username} · {w.amount} USDT</p>
                <p className="text-xs text-slate-400 font-mono break-all">{w.destinationAddress}</p>
                <p className="text-xs text-slate-500 mt-1">{new Date(w.requestedAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => act(w.id, 'approve')} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-sm">Approve</button>
                <button onClick={() => act(w.id, 'reject')} className="px-3 py-1.5 rounded-lg bg-red-700 text-sm">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
