'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { useThemeLang } from '@/components/ThemeLangProvider';
import { txTypeLabel } from '@/lib/labels';

type Tx = {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  timestamp: string;
};

export default function AccountPage() {
  const router = useRouter();
  const { t } = useThemeLang();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [minW, setMinW] = useState(25);
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [msg, setMsg] = useState('');
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [txFilter, setTxFilter] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d: any) => {
        if (!d.ok) {
          router.push('/login');
          return;
        }
        setUser(d.user);
        setTransactions(d.transactions || []);
        setMinW(d.config?.minWithdrawalLimit ?? 25);
        setNote(
          d.config?.withdrawalNote ||
            'Withdrawal is received in 2-3 hours after admin approval.'
        );
      });
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  async function requestWithdraw() {
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), address }),
      });
      const d: any = await res.json();
      setMsg(d.message || (d.ok ? 'Withdrawal submitted' : 'Failed'));
      if (d.ok) {
        setAmount('');
        setAddress('');
        load();
      }
    } catch {
      setMsg('Network error');
    }
    setBusy(false);
  }

  function changePassword() {
    if (newPass.length < 6) {
      setMsg('New password must be at least 6 characters');\n      return;
    }
    setMsg('Password change will be available after security module is enabled.');
    setCurPass('');
    setNewPass('');
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
    user.avatarSeed || user.username
  )}`;

  const withdrawals = transactions.filter((tx) => tx.type === 'withdrawal');
  const filteredTxs = txFilter
    ? transactions.filter((tx) => tx.type === txFilter)
    : transactions;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/10 blur-[90px] rounded-full" />
      </div>
      <UserNav />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 relative z-10">
        {msg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm text-center">
            {msg}
          </div>
        )}

        <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 to-slate-950 p-5 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar}
            alt=""
            className="w-16 h-16 rounded-2xl bg-slate-800 ring-2 ring-emerald-500/30"
          />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-lg truncate">{user.username}</p>
            <p className="text-sm text-slate-400 truncate">{user.email}</p>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-2 flex-wrap">
              <span>
                ID: <code className="text-emerald-400 font-mono">{user.id}</code>
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(user.id);
                  setMsg('User ID copied');
                }}
                className="text-emerald-400 font-medium"
              >
                Copy
              </button>
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 space-y-3">
          <h2 className="font-semibold text-lg">{t.withdraw}</h2>
          <div className="rounded-xl bg-black/30 border border-white/5 p-3 flex justify-between text-sm">
            <span className="text-slate-400">Available</span>
            <span className="font-bold text-emerald-400">
              {user.withdrawalBalance.toFixed(2)} USDT
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Minimum: <strong className="text-slate-300">{minW} USDT</strong>. {note}
          </p>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 outline-none"
          />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Your USDT TRC-20 address (T...)"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm focus:border-emerald-500 outline-none"
          />
          <button
            onClick={requestWithdraw}
            disabled={busy}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold disabled:opacity-60 shadow-lg shadow-emerald-500/20"
          >
            {busy ? 'Submitting...' : 'Request withdraw'}
          </button>
        </div>

        <div className="rounded-2xl border border-white/5 bg-slate-900/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h2 className="font-semibold">Withdrawal history</h2>
          </div>
          {withdrawals.length === 0 ? (
            <p className="p-4 text-sm text-slate-500 text-center">No withdrawals yet</p>
          ) : (
            <div className="divide-y divide-white/5 max-h-48 overflow-y-auto">
              {withdrawals.map((tx) => (
                <div key={tx.id} className="px-4 py-2.5 flex justify-between text-sm gap-2">
                  <div>
                    <p className="font-medium">{tx.amount} USDT</p>
                    <p className="text-[11px] text-slate-500">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold capitalize self-center ${
                      tx.status === 'approved' || tx.status === 'completed'
                        ? 'text-emerald-400'
                        : tx.status === 'rejected'
                          ? 'text-red-400'
                          : 'text-amber-400'
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/5 bg-slate-900/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">{t.transactions}</h2>
            <select
              value={txFilter}
              onChange={(e) => setTxFilter(e.target.value)}
              className="text-xs px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700"
            >
              <option value="">All types</option>
              {[
                'deposit',
                'withdrawal',
                'yield',
                'referral',
                'plan_purchase',
                'signup_bonus',
                'admin_add',
                'admin_sub',
              ].map((type) => (
                <option key={type} value={type}>
                  {txTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>
          <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
            {filteredTxs.map((tx) => (
              <div key={tx.id} className="px-4 py-2.5 flex justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate">{tx.description}</p>
                  <p className="text-[11px] text-slate-500">
                    {txTypeLabel(tx.type)} · {tx.status} ·{' '}
                    {new Date(tx.timestamp).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`font-mono shrink-0 ${
                    tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {tx.amount >= 0 ? '+' : ''}
                  {Number(tx.amount).toFixed(2)}
                </span>
              </div>
            ))}
            {filteredTxs.length === 0 && (
              <p className="p-4 text-center text-slate-500 text-sm">No transactions</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 space-y-3">
          <h2 className="font-semibold">Change password</h2>
          <input
            type="password"
            value={curPass}
            onChange={(e) => setCurPass(e.target.value)}
            placeholder="Current password"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 outline-none focus:border-emerald-500"
          />
          <input
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            placeholder="New password (min 6)"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 outline-none focus:border-emerald-500"
          />
          <button
            onClick={changePassword}
            className="w-full py-2.5 rounded-xl bg-slate-700 font-medium hover:bg-slate-600 transition"
          >
            Update password
          </button>
        </div>

        <button
          onClick={logout}
          className="w-full py-3 rounded-2xl border border-red-500/40 text-red-400 font-semibold hover:bg-red-500/10 transition"
        >
          {t.logout}
        </button>
      </main>
    </div>
  );
}
