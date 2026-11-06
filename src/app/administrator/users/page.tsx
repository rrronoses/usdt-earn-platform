'use client';
import { useEffect, useState } from 'react';
import { AdminNav } from '@/components/AdminNav';

type User = {
  id: string; username: string; email: string;
  depositBalance: number; withdrawalBalance: number;
  status: string; createdAt: string; referralEarnings: number;
};

export default function AdminUsersPage() {
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [detail, setDetail] = useState<any>(null);
  const [txType, setTxType] = useState('');
  const [adj, setAdj] = useState({ amount: '', balanceType: 'deposit' as 'deposit' | 'withdrawal' });
  const [msg, setMsg] = useState('');

  async function load() {
    const d = await fetch(`/api/admin/users?filter=${filter}`).then((r) => r.json());
    if (d.ok) setUsers(d.users || []);
    else setMsg(d.message || 'Error');
  }
  useEffect(() => { load(); }, [filter]);

  async function openUser(id: string) {
    const d = await fetch(`/api/admin/users?userId=${id}&txType=${txType}`).then((r) => r.json());
    if (d.ok) setDetail(d);
  }

  async function act(action: string, userId: string, extra: Record<string, unknown> = {}) {
    const d = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, userId, ...extra }),
    }).then((r) => r.json());
    setMsg(d.message || (d.ok ? 'OK' : 'Failed'));
    if (d.ok) { load(); if (detail?.user?.id === userId) openUser(userId); }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AdminNav />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-xl font-bold">Users</h1>
        {msg && <p className="text-sm text-emerald-400">{msg}</p>}
        <div className="flex gap-2">
          {(['all', 'free', 'paid'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm capitalize ${filter === f ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}>{f}</button>
          ))}
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-slate-400 text-left">
              <tr><th className="p-2">User</th><th className="p-2">Deposit</th><th className="p-2">Withdraw</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-800">
                  <td className="p-2">
                    <button className="text-left hover:text-emerald-400" onClick={() => openUser(u.id)}>
                      <div className="font-medium">{u.username}</div>
                      <div className="text-xs text-slate-500">{u.id} · {u.email}</div>
                    </button>
                  </td>
                  <td className="p-2">{u.depositBalance.toFixed(2)}</td>
                  <td className="p-2">{u.withdrawalBalance.toFixed(2)}</td>
                  <td className="p-2"><span className={u.status === 'banned' ? 'text-red-400' : 'text-emerald-400'}>{u.status}</span></td>
                  <td className="p-2 space-x-1">
                    {u.status === 'banned'
                      ? <button onClick={() => act('unban', u.id)} className="px-2 py-1 rounded bg-emerald-700 text-xs">Unban</button>
                      : <button onClick={() => act('ban', u.id)} className="px-2 py-1 rounded bg-amber-700 text-xs">Ban</button>}
                    <button onClick={() => { if (confirm('Remove user?')) act('delete', u.id); }} className="px-2 py-1 rounded bg-red-800 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {detail && (
          <div className="rounded-xl border border-emerald-500/30 bg-slate-900 p-4 space-y-4">
            <div className="flex justify-between">
              <h2 className="font-bold">User detail · {detail.user.username}</h2>
              <button onClick={() => setDetail(null)} className="text-slate-400 text-sm">Close</button>
            </div>
            <div className="grid sm:grid-cols-3 gap-2 text-sm">
              <div>ID: <code>{detail.user.id}</code></div>
              <div>Email: {detail.user.email}</div>
              <div>Referral: {detail.user.referralEarnings?.toFixed(2)} USDT</div>
              <div>Deposit: {detail.user.depositBalance.toFixed(2)}</div>
              <div>Withdraw: {detail.user.withdrawalBalance.toFixed(2)}</div>
              <div>Status: {detail.user.status}</div>
            </div>
            <div className="flex flex-wrap gap-2 items-end">
              <input type="number" step="0.01" placeholder="± amount" value={adj.amount} onChange={(e) => setAdj({ ...adj, amount: e.target.value })} className="px-2 py-1.5 rounded bg-slate-950 border border-slate-700 text-sm w-28" />
              <select value={adj.balanceType} onChange={(e) => setAdj({ ...adj, balanceType: e.target.value as any })} className="px-2 py-1.5 rounded bg-slate-950 border border-slate-700 text-sm">
                <option value="deposit">deposit</option>
                <option value="withdrawal">withdrawal</option>
              </select>
              <button onClick={() => act('adjustBalance', detail.user.id, { amount: parseFloat(adj.amount), balanceType: adj.balanceType })} className="px-3 py-1.5 rounded bg-emerald-600 text-sm">Apply ±USDT</button>
            </div>
            <div>
              <div className="flex gap-2 mb-2 items-center">
                <h3 className="font-semibold text-sm">Transactions</h3>
                <select value={txType} onChange={(e) => setTxType(e.target.value)} className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs">
                  <option value="">all types</option>
                  {['deposit','withdrawal','yield','referral','plan_purchase','signup_bonus','admin_add','admin_sub'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={() => openUser(detail.user.id)} className="text-xs text-emerald-400">Filter</button>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-800 text-xs">
                {(detail.transactions || []).map((t: any) => (
                  <div key={t.id} className="py-1.5 flex justify-between gap-2">
                    <span>{t.description} <span className="text-slate-500">{t.type} · {t.status}</span></span>
                    <span>{t.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
