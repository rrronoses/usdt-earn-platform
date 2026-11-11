'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/AdminNav';
import { AdminPanel, StatusBadge, EmptyState } from '@/components/admin/ui';
import { txTypeLabel } from '@/lib/labels';

type User = {
  id: string;
  username: string;
  email: string;
  depositBalance: number;
  withdrawalBalance: number;
  status: string;
  createdAt: string;
  referralEarnings: number;
};

export default function AdminUsersPage() {
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [detail, setDetail] = useState<any>(null);
  const [txType, setTxType] = useState('');
  const [adj, setAdj] = useState({
    amount: '',
    balanceType: 'deposit' as 'deposit' | 'withdrawal',
    mode: 'add' as 'add' | 'subtract',
  });
  const [msg, setMsg] = useState('');
  const [msgErr, setMsgErr] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const d: any = await fetch(`/api/admin/users?filter=${filter}`).then((r) => r.json());
    if (d.ok) setUsers(d.users || []);
    else {
      setMsg(d.message || 'Error');
      setMsgErr(true);
    }
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function openUser(id: string) {
    const q = txType ? `&txType=${encodeURIComponent(txType)}` : '';
    const d: any = await fetch(`/api/admin/users?userId=${id}${q}`).then((r) => r.json());
    if (d.ok) setDetail(d);
  }

  async function act(action: string, userId: string, extra: Record<string, unknown> = {}) {
    setBusy(true);
    const d: any = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, userId, ...extra }),
    }).then((r) => r.json());
    setMsg(d.message || (d.ok ? 'OK' : 'Failed'));
    setMsgErr(!d.ok);
    if (d.ok) {
      load();
      if (detail?.user?.id === userId && action !== 'delete') openUser(userId);
      if (action === 'delete') setDetail(null);
      if (action === 'adjustBalance') setAdj((a) => ({ ...a, amount: '' }));
    }
    setBusy(false);
  }

  const currentBal = useMemo(() => {
    if (!detail?.user) return 0;
    return adj.balanceType === 'deposit'
      ? Number(detail.user.depositBalance || 0)
      : Number(detail.user.withdrawalBalance || 0);
  }, [detail, adj.balanceType]);

  const amountNum = Number(adj.amount);
  const validAmt = Number.isFinite(amountNum) && amountNum > 0;
  const previewAfter = validAmt
    ? adj.mode === 'add'
      ? currentBal + amountNum
      : currentBal - amountNum
    : null;
  const wouldGoNegative = previewAfter !== null && previewAfter < 0;

  return (
    <AdminShell
      title="Users"
      subtitle="Accounts · balances · bans · transaction history"
      actions={
        <button type="button" onClick={load} className="btn-ghost text-xs px-3 py-1.5">
          Refresh
        </button>
      }
    >
      {msg && (
        <div
          className={`mb-4 p-3 rounded-xl border text-sm ${
            msgErr
              ? 'bg-red-500/10 border-red-500/30 text-red-500'
              : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-300'
          }`}
        >
          {msg}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {(['all', 'free', 'paid'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition ${
              filter === f ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="text-xs ml-auto" style={{ color: 'var(--muted)' }}>
          {users.length} users
        </span>
      </div>

      <AdminPanel className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: 'color-mix(in srgb, var(--border) 40%, transparent)' }}>
              <tr className="text-left text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                <th className="p-3 font-medium">User</th>
                <th className="p-3 font-medium">Deposit</th>
                <th className="p-3 font-medium">Withdraw</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center" style={{ color: 'var(--muted)' }}>
                    Loading…
                  </td>
                </tr>
              )}
              {!loading &&
                users.map((u) => (
                  <tr key={u.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-3">
                      <button type="button" className="text-left group" onClick={() => openUser(u.id)}>
                        <div className="font-semibold group-hover:text-emerald-500 transition">{u.username}</div>
                        <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                          {u.id}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--muted)' }}>
                          {u.email}
                        </div>
                      </button>
                    </td>
                    <td className="p-3 font-mono">{Number(u.depositBalance).toFixed(2)}</td>
                    <td className="p-3 font-mono">{Number(u.withdrawalBalance).toFixed(2)}</td>
                    <td className="p-3">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => openUser(u.id)}
                          className="px-2.5 py-1 rounded-lg border text-xs font-semibold"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          Open
                        </button>
                        {u.status === 'banned' ? (
                          <button
                            type="button"
                            onClick={() => act('unban', u.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => act('ban', u.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-semibold"
                          >
                            Ban
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Remove user permanently?')) act('delete', u.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8">
                    <EmptyState title="No users" hint="Try another filter." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      {detail && (
        <AdminPanel className="p-5 space-y-4 border-emerald-500/30">
          <div className="flex justify-between items-start gap-3">
            <div>
              <h2 className="font-bold text-lg">{detail.user.username}</h2>
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--muted)' }}>
                {detail.user.id}
              </p>
            </div>
            <button type="button" onClick={() => setDetail(null)} className="btn-ghost text-sm px-3 py-1">
              Close
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-2 text-sm">
            {[
              ['Email', detail.user.email],
              ['Deposit', `${Number(detail.user.depositBalance).toFixed(2)} USDT`],
              ['Withdraw', `${Number(detail.user.withdrawalBalance).toFixed(2)} USDT`],
              ['Referral earn', `${Number(detail.user.referralEarnings || 0).toFixed(2)} USDT`],
              ['Status', detail.user.status],
              ['Joined', new Date(detail.user.createdAt).toLocaleDateString()],
            ].map(([k, v]) => (
              <div key={String(k)} className="rounded-xl border p-3" style={{ borderColor: 'var(--border)' }}>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                  {k}
                </p>
                <p className="font-medium mt-0.5 break-all">{v}</p>
              </div>
            ))}
          </div>

          {/* Add / Subtract USDT */}
          <div className="rounded-2xl border p-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-sm">Adjust balance</h3>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Current {adj.balanceType}:{' '}
                <strong className="text-emerald-500 font-mono">{currentBal.toFixed(2)} USDT</strong>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAdj((a) => ({ ...a, mode: 'add' }))}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                  adj.mode === 'add'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                    : 'btn-ghost'
                }`}
              >
                + Add
              </button>
              <button
                type="button"
                onClick={() => setAdj((a) => ({ ...a, mode: 'subtract' }))}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                  adj.mode === 'subtract'
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/25'
                    : 'btn-ghost'
                }`}
              >
                − Subtract
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-[10px] uppercase font-semibold" style={{ color: 'var(--muted)' }}>
                  Amount (USDT)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="e.g. 10"
                  value={adj.amount}
                  onChange={(e) => setAdj({ ...adj, amount: e.target.value })}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-semibold" style={{ color: 'var(--muted)' }}>
                  Balance type
                </label>
                <select
                  value={adj.balanceType}
                  onChange={(e) =>
                    setAdj({ ...adj, balanceType: e.target.value as 'deposit' | 'withdrawal' })
                  }
                  className="input-field mt-1"
                >
                  <option value="deposit">Deposit (buy plans)</option>
                  <option value="withdrawal">Withdrawal (cash out)</option>
                </select>
              </div>
              <button
                type="button"
                disabled={busy || !validAmt || wouldGoNegative}
                onClick={() => {
                  if (!validAmt) {
                    setMsg('Enter a positive amount');
                    setMsgErr(true);
                    return;
                  }
                  if (wouldGoNegative) {
                    setMsg(`Cannot subtract more than ${currentBal.toFixed(2)} USDT`);
                    setMsgErr(true);
                    return;
                  }
                  const label =
                    adj.mode === 'add'
                      ? `Add ${amountNum} USDT to ${adj.balanceType}?`
                      : `Subtract ${amountNum} USDT from ${adj.balanceType}?`;
                  if (!confirm(label)) return;
                  act('adjustBalance', detail.user.id, {
                    amount: amountNum,
                    balanceType: adj.balanceType,
                    mode: adj.mode,
                  });
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40 ${
                  adj.mode === 'add'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-red-600 text-white'
                }`}
              >
                {busy
                  ? 'Saving…'
                  : adj.mode === 'add'
                    ? `Add ${validAmt ? amountNum : ''} USDT`
                    : `Subtract ${validAmt ? amountNum : ''} USDT`}
              </button>
            </div>

            {validAmt && (
              <p
                className={`text-xs font-medium ${
                  wouldGoNegative ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {wouldGoNegative
                  ? `Not enough balance — only ${currentBal.toFixed(2)} USDT available`
                  : `Preview: ${currentBal.toFixed(2)} → ${previewAfter!.toFixed(2)} USDT (${adj.balanceType})`}
              </p>
            )}
          </div>

          <div>
            <div className="flex flex-wrap gap-2 mb-2 items-center">
              <h3 className="font-semibold text-sm">Transaction history</h3>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value)}
                className="input-field !w-auto text-xs py-1"
              >
                <option value="">all types</option>
                {[
                  'deposit',
                  'withdrawal',
                  'earn',
                  'referral',
                  'plan_purchase',
                  'signup_bonus',
                  'admin_add',
                  'admin_sub',
                ].map((t) => (
                  <option key={t} value={t}>
                    {txTypeLabel(t)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => openUser(detail.user.id)}
                className="text-xs font-semibold text-emerald-500"
              >
                Apply filter
              </button>
            </div>
            <div
              className="max-h-64 overflow-y-auto divide-y rounded-xl border"
              style={{ borderColor: 'var(--border)' }}
            >
              {(detail.transactions || []).map((t: any) => (
                <div
                  key={t.id}
                  className="px-3 py-2 flex justify-between gap-2 text-xs"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="min-w-0">
                    <p className="truncate">{t.description}</p>
                    <p style={{ color: 'var(--muted)' }}>
                      {txTypeLabel(t.type)} · {t.status} · {new Date(t.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`font-mono shrink-0 ${
                      Number(t.amount) >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {Number(t.amount) >= 0 ? '+' : ''}
                    {Number(t.amount).toFixed(2)}
                  </span>
                </div>
              ))}
              {(detail.transactions || []).length === 0 && (
                <p className="p-4 text-center" style={{ color: 'var(--muted)' }}>
                  No transactions
                </p>
              )}
            </div>
          </div>
        </AdminPanel>
      )}
    </AdminShell>
  );
}
