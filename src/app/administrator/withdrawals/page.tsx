'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminNav';
import { EmptyState, StatusBadge } from '@/components/admin/ui';

type WithdrawalRow = {
  id: string;
  username: string;
  amount: number;
  destinationAddress: string;
  requestedAt: string;
  status?: string;
};

export default function AdminWithdrawalsPage() {
  const [list, setList] = useState<WithdrawalRow[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const d = (await fetch('/api/admin/withdrawals').then((r) => r.json())) as {
      ok?: boolean;
      withdrawals?: WithdrawalRow[];
    };
    if (d.ok) setList(d.withdrawals || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function act(id: string, action: 'approve' | 'reject') {
    setBusy(id + action);
    const d = (await fetch('/api/admin/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    }).then((r) => r.json())) as { ok?: boolean; message?: string };
    setMsg(d.message || (d.ok ? action : 'Failed'));
    if (d.ok) load();
    setBusy(null);
  }

  return (
    <AdminShell
      title="Withdrawals"
      subtitle="Review and process pending USDT TRC-20 payouts"
      actions={
        <button onClick={load} className="btn-ghost text-xs px-3 py-1.5" type="button">
          Refresh
        </button>
      }
    >
      {msg && (
        <div className="mb-4 p-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 text-sm">
          {msg}
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState title="No pending withdrawals" hint="New requests appear here for approve / reject." />
      ) : (
        <div className="space-y-3">
          {list.map((w) => (
            <div
              key={w.id}
              className="rounded-2xl border p-5 flex flex-wrap justify-between gap-4"
              style={{
                borderColor: 'color-mix(in srgb, #f59e0b 25%, var(--border))',
                background: 'color-mix(in srgb, #f59e0b 6%, transparent)',
              }}
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-lg">
                    {w.amount} <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>USDT</span>
                  </p>
                  <StatusBadge status={w.status || 'pending'} />
                </div>
                <p className="text-sm font-medium">{w.username}</p>
                <code className="text-xs font-mono break-all block" style={{ color: 'var(--muted)' }}>
                  {w.destinationAddress}
                </code>
                <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  {new Date(w.requestedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 items-start">
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => act(w.id, 'approve')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold disabled:opacity-50"
                >
                  {busy === w.id + 'approve' ? '…' : 'Approve'}
                </button>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => act(w.id, 'reject')}
                  className="px-4 py-2 rounded-xl bg-red-600/90 text-white text-sm font-bold disabled:opacity-50"
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
