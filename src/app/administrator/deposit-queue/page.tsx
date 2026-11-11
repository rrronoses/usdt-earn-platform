'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminNav';
import { EmptyState, StatusBadge } from '@/components/admin/ui';

type DepositRow = {
  id: string;
  userId: string;
  username: string;
  amount: number;
  address: string;
  network: string;
  status: string;
  createdAt: string;
  txHash?: string;
  note?: string;
};

export default function AdminDepositQueuePage() {
  const [list, setList] = useState<DepositRow[]>([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [txHashMap, setTxHashMap] = useState<Record<string, string>>({});

  async function load() {
    const d = (await fetch('/api/admin/deposits').then((r) => r.json())) as {
      ok?: boolean;
      deposits?: DepositRow[];
      message?: string;
    };
    if (d.ok) setList(d.deposits || []);
    else {
      setMsg(d.message || 'Failed to load');
      setErr(true);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function act(id: string, action: 'approve' | 'reject') {
    const label =
      action === 'approve'
        ? 'Approve and credit this deposit to the user?'
        : 'Reject this deposit? User will not be credited.';
    if (!confirm(label)) return;

    setBusy(id + action);
    const d = (await fetch('/api/admin/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        action,
        txHash: txHashMap[id] || undefined,
      }),
    }).then((r) => r.json())) as { ok?: boolean; message?: string };

    setMsg(d.message || (d.ok ? action : 'Failed'));
    setErr(!d.ok);
    if (d.ok) load();
    setBusy(null);
  }

  return (
    <AdminShell
      title="Deposit queue"
      subtitle="Manually approve or reject pending USDT TRC-20 deposits when auto-verify is late or fails"
      actions={
        <button type="button" onClick={load} className="btn-ghost text-xs px-3 py-1.5">
          Refresh
        </button>
      }
    >
      {msg && (
        <div
          className={`mb-4 p-3 rounded-xl border text-sm ${
            err
              ? 'bg-red-500/10 border-red-500/30 text-red-500'
              : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-300'
          }`}
        >
          {msg}
        </div>
      )}

      <div
        className="mb-5 rounded-xl border p-4 text-sm space-y-1"
        style={{ borderColor: 'var(--border)' }}
      >
        <p className="font-semibold">How to use</p>
        <ul className="list-disc pl-5 space-y-0.5" style={{ color: 'var(--muted)' }}>
          <li>Check Tronscan / wallet for the user&apos;s transfer to the shown address.</li>
          <li>
            <strong className="text-emerald-500">Approve</strong> credits the amount to the user&apos;s{' '}
            <strong>deposit</strong> balance (can buy plans).
          </li>
          <li>
            <strong className="text-red-500">Reject</strong> closes the request with no credit.
          </li>
          <li>Optional: paste TxID before approve for your records.</li>
        </ul>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="No pending deposits"
          hint="New user deposit requests appear here until confirmed on-chain or handled manually."
        />
      ) : (
        <div className="space-y-3">
          {list.map((d) => (
            <div
              key={d.id}
              className="rounded-2xl border p-5 flex flex-wrap justify-between gap-4"
              style={{
                borderColor: 'color-mix(in srgb, #f59e0b 30%, var(--border))',
                background: 'color-mix(in srgb, #f59e0b 6%, transparent)',
              }}
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-lg">
                    {Number(d.amount).toFixed(2)}{' '}
                    <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                      USDT
                    </span>
                  </p>
                  <StatusBadge status={d.status || 'pending'} />
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                    {d.network || 'TRC20'}
                  </span>
                </div>
                <p className="text-sm font-medium">
                  {d.username}{' '}
                  <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
                    ({d.userId})
                  </span>
                </p>
                <code className="text-xs font-mono break-all block" style={{ color: 'var(--muted)' }}>
                  → {d.address}
                </code>
                <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  Requested {new Date(d.createdAt).toLocaleString()} · id {d.id}
                </p>
                <input
                  value={txHashMap[d.id] || ''}
                  onChange={(e) => setTxHashMap((m) => ({ ...m, [d.id]: e.target.value }))}
                  placeholder="Optional TxID / hash"
                  className="input-field mt-2 max-w-md text-xs font-mono"
                />
              </div>
              <div className="flex gap-2 items-start">
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => act(d.id, 'approve')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold disabled:opacity-50"
                >
                  {busy === d.id + 'approve' ? '…' : 'Approve'}
                </button>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => act(d.id, 'reject')}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold disabled:opacity-50"
                >
                  {busy === d.id + 'reject' ? '…' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
