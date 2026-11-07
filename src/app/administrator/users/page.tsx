'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminNav';

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
  const [adj, setAdj] = useState({ amount: '', balanceType: 'deposit' as 'deposit' | 'withdrawal' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const d: any = await fetch(`/api/admin/users?filter=${filter}`).then((r) => r.json());
    if (d.ok) setUsers(d.users || []);
    else setMsg(d.message || 'Error');
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function openUser(id: string) {
    const d: any = await fetch(`/api/admin/users?userId=${id}&txType=${txType}`).then((r) => r.json());
    if (d.ok) setDetail(d);
  }

  async function act(action: string, userId: string, extra: Record<string, unknown> = {}) {
    const d: any = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, userId, ...extra }),
    }).then((r) => r.json());
    setMsg(d.message || (d.ok ? 'OK' : 'Failed'));
    if (d.ok) {
      load();
      if (detail?.user?.id === userId && action !== 'delete') openUser(userId);
      if (action === 'delete') setDetail(null);
    }
  }

  return (
    <AdminShell title="Users" subtitle="Manage accounts, balances, and bans">
      {msg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm">
          {msg}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', 'free', 'paid'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition ${
              filter === f
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'bg-slate-900 border border-white/10 text-slate-300 hover:border-emerald-500/30'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="self-center text-xs text-slate-500 ml-auto">{users.length} users</span>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/50 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-slate-400 text-left text-xs uppercase tracking-wider">
              <tr>
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
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading &&
                users.map((u) => (
                  <tr key={u.id} className="border-t border-white/5 hover:bg-white/[0.03] transition">
                    <td className="p-3">
                      <button className="text-left group" onClick={() => openUser(u.id)}>
                        <div className="font-semibold group-hover:text-emerald-400 transition">{u.username}</div>
                        <div className="text-xs text-slate-500 font-mono">{u.id}</div>
                        <div className="text-xs text-slate-600">{u.email}</div>
                      </button>
                    </td>
                    <td className="p-3 font-mono">{u.depositBalance.toFixed(2)}</td>
                    <td className="p-3 font-mono">{u.withdrawalBalance.toFixed(2)}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                          u.status === 'banned'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1.5">
                        {u.status === 'banned' ? (
                          <button
                            onClick={() => act('unban', u.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/90 text-xs font-semibold"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => act('ban', u.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-600/90 text-xs font-semibold"
                          >
                            Ban
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Remove user permanently?')) act('delete', u.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-red-700/90 text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No users in this filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-slate-900 p-5 space-y-4 shadow-xl shadow-emerald-500/5">
          <div className="flex justify-between items-start gap-3">
            <div>
              <h2 className="font-bold text-lg">{detail.user.username}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{detail.user.id}</p>
            </div>
            <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-white/5">
              Close
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-2 text-sm">
            {[
              ['Email', detail.user.email],
              ['Deposit', `${detail.user.depositBalance.toFixed(2)} USDT`],
              ['Withdraw', `${detail.user.withdrawalBalance.toFixed(2)} USDT`],
              ['Referral earn', `${(detail.user.referralEarnings || 0).toFixed(2)} USDT`],
              ['Status', detail.user.status],
              ['Joined', new Date(detail.user.createdAt).toLocaleDateString()],
            ].map(([k, v]) => (
              <div key={String(k)} className="rounded-xl bg-black/25 border border-white/5 p-3">
                <p className="text-[10px] uppercase text-slate-500 tracking-wide">{k}</p>
                <p className="font-medium mt-0.5 break-all">{v}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-end p-3 rounded-xl bg-black/20 border border-white/5">
            <div>
              <label className="text-[10px] uppercase text-slate-500">Amount ±</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={adj.amount}
                onChange={(e) => setAdj({ ...adj, amount: e.target.value })}
                className="block mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm w-28"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-slate-500">Balance</label>
              <select
                value={adj.balanceType}
                onChange={(e) => setAdj({ ...adj, balanceType: e.target.value as any })}
                className="block mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm"
              >
                <option value="deposit">deposit</option>
                <option value="withdrawal">withdrawal</option>
              </select>
            </div>
            <button
              onClick={() =>
                act('adjustBalance', detail.user.id, {
                  amount: parseFloat(adj.amount),
                  balanceType: adj.balanceType,
                })
              }
              className="btn-primary px-4 py-2 text-sm"
            >
              Apply ±USDT
            </button>
          </div>

          <div>
            <div className="flex flex-wrap gap-2 mb-2 items-center">
              <h3 className="font-semibold text-sm">Transaction history</h3>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value)}
                className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs"
              >
                <option value="">all types</option>
                {['deposit', 'withdrawal', 'yield', 'referral', 'plan_purchase', 'signup_bonus', 'admin_add', 'admin_sub'].map(
                  (t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  )
                )}
              </select>
              <button onClick={() => openUser(detail.user.id)} className="text-xs font-semibold text-emerald-400">
                Apply filter
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-white/5 rounded-xl border border-white/5 bg-black/20">
              {(detail.transactions || []).map((t: any) => (
                <div key={t.id} className="px-3 py-2 flex justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="truncate">{t.description}</p>
                    <p className="text-slate-500">
                      {t.type} · {t.status} · {new Date(t.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`font-mono shrink-0 ${t.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.amount}
                  </span>
                </div>
              ))}
              {(detail.transactions || []).length === 0 && (
                <p className="p-4 text-center text-slate-500">No transactions</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
