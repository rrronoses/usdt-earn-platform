'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminNav';

export default function AdminWithdrawalsPage() {
  const [list, setList] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const d: any = await fetch('/api/admin/withdrawals').then((r) => r.json());
    if (d.ok) setList(d.withdrawals || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function act(id: string, action: 'approve' | 'reject') {
    setBusy(id + action);
    const d: any = await fetch('/api/admin/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    }).then((r) => r.json());
    setMsg(d.message || (d.ok ? action : 'Failed'));
    if (d.ok) load();
    setBusy(null);
  }

  return (
    <AdminShell
      title="Withdrawals"
      subtitle="Review and process pending USDT TRC-20 payouts"
      actions={
        <button onClick={load} className="btn-ghost text-xs px-3 py-1.5">
          Refresh
        </button>
      }
    >
      {msg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm">
          {msg}
        </div>
      )}

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-slate-500">
          No pending withdrawal requests
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((w) => (
            <div
              key={w.id}
              className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-slate-900/80 p-5 flex flex-wrap justify-between gap-4"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <p className="font-bold text-lg">
                  {w.amount} <span className="text-sm text-slate-400 font-semibold">USDT</span>
                </p>
                <p className="text-sm text-slate-300">{w.username}</p>
                <code className="text-xs text-slate-400 font-mono break-all block">{w.destinationAddress}</code>
                <p className="text-[11px] text-slate-500">{new Date(w.requestedAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 items-start">
                <button
                  disabled={busy !== null}
                  onClick={() => act(w.id, 'approve')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold disabled:opacity-50"
                >
                  {busy === w.id + 'approve' ? '…' : 'Approve'}
                </button>
                <button
                  disabled={busy !== null}
                  onClick={() => act(w.id, 'reject')}
                  className="px-4 py-2 rounded-xl bg-red-600/90 text-sm font-bold disabled:opacity-50"
                >
                  {busy === w.id + 'reject' ? '…' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
