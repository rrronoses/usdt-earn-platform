'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { useThemeLang } from '@/components/ThemeLangProvider';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useThemeLang();
  const [data, setData] = useState<any>(null);
  const [depAmount, setDepAmount] = useState('');
  const [depInfo, setDepInfo] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMe = useCallback(() => {
    return fetch('/api/me')
      .then((r) => r.json())
      .then((d: any) => {
        if (!d.ok) {
          router.push('/login');
          return null;
        }
        setData(d);
        return d;
      })
      .catch(() => null);
  }, [router]);

  useEffect(() => {
    loadMe();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loadMe]);

  function stopPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    pollRef.current = null;
    timerRef.current = null;
  }

  function startPolling(depositId: string) {
    stopPolling();
    setSecondsLeft(240);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          stopPolling();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    pollRef.current = setInterval(async () => {
      try {
        const d: any = await fetch(
          `/api/deposit/check-status?depositId=${encodeURIComponent(depositId)}`
        ).then((r) => r.json());
        if (d.ok && (d.credited || d.status === 'approved' || d.status === 'completed')) {
          stopPolling();
          setMsg(`Deposit confirmed! +${Number(d.creditedAmount || 0).toFixed(2)} USDT`);
          setDepInfo(null);
          loadMe();
        }
      } catch {}
    }, 10000);
  }

  async function startDeposit() {
    const amount = parseFloat(depAmount);
    if (!amount || amount <= 0) {
      setMsg('Enter a valid amount');
      return;
    }
    const d: any = await fetch('/api/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    }).then((r) => r.json());
    if (!d.ok) {
      setMsg(d.message || 'Failed');
      if (d.depositId && d.address) {
        setDepInfo({ address: d.address, amount: d.amount || amount, depositId: d.depositId });
        startPolling(d.depositId);
      }
      return;
    }
    setDepInfo({ address: d.address, amount: d.amount, depositId: d.depositId });
    setMsg('Send exact USDT on TRC-20 only.');
    startPolling(d.depositId);
  }

  async function claim() {
    setClaiming(true);
    const d: any = await fetch('/api/claim', { method: 'POST' }).then((r) => r.json());
    setMsg(d.message || (d.ok ? `Claimed ${d.claimed} USDT` : 'Claim failed'));
    if (d.ok) loadMe();
    setClaiming(false);
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { user, plans, transactions } = data;
  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const activePlans = (plans || []).filter(
    (p: any) => p.status === 'active' && new Date(p.expiryDate) > new Date()
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 right-0 w-72 h-72 bg-emerald-500/15 blur-[100px] rounded-full" />
      </div>
      <UserNav />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Welcome back</p>
            <p className="font-bold text-lg">{user.username}</p>
          </div>
          <Link
            href="/plans"
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
          >
            Buy plan →
          </Link>
        </div>

        {msg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm text-center">
            {msg}
          </div>
        )}

        {/* Balances */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-600/25 via-teal-700/15 to-slate-900 border border-emerald-500/30 p-5 shadow-lg shadow-emerald-500/10">
          <p className="text-sm text-slate-300">{t.totalBalance}</p>
          <p className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
            {user.totalBalance.toFixed(2)}
            <span className="text-base font-semibold text-emerald-300 ml-1.5">USDT</span>
          </p>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-black/25 rounded-2xl p-3 text-center border border-white/5">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">{t.deposit}</p>
              <p className="font-bold text-sm mt-0.5">{user.depositBalance.toFixed(2)}</p>
            </div>
            <div className="bg-black/25 rounded-2xl p-3 text-center border border-white/5">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">{t.withdraw}</p>
              <p className="font-bold text-sm mt-0.5">{user.withdrawalBalance.toFixed(2)}</p>
            </div>
            <div className="bg-black/25 rounded-2xl p-3 text-center border border-white/5">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">{t.today}</p>
              <p className="font-bold text-sm mt-0.5 text-emerald-400">+{user.todayEarnings.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={claim}
            disabled={claiming}
            className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 disabled:opacity-60"
          >
            {claiming ? 'Claiming…' : t.claim}
          </button>
        </div>

        {/* Deposit */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Deposit USDT (TRC-20)</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              TRC-20 only
            </span>
          </div>
          {!depInfo ? (
            <>
              <input
                type="number"
                min="1"
                step="0.01"
                value={depAmount}
                onChange={(e) => setDepAmount(e.target.value)}
                placeholder="Amount in USDT"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 outline-none"
              />
              <button
                onClick={startDeposit}
                className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition"
              >
                Generate deposit address
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-amber-200 text-center">
                Send exactly <strong>{depInfo.amount} USDT</strong> on <strong>TRC-20</strong>
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(depInfo.address)}`}
                alt="QR"
                className="mx-auto rounded-xl bg-white p-2"
              />
              <div className="flex gap-2 items-center bg-slate-950 rounded-xl p-3 border border-slate-800">
                <code className="text-xs break-all flex-1 font-mono">{depInfo.address}</code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(depInfo.address);
                    setMsg('Address copied');
                  }}
                  className="text-emerald-400 text-sm font-semibold shrink-0"
                >
                  Copy
                </button>
              </div>
              {secondsLeft > 0 && (
                <p className="text-center font-mono text-2xl text-amber-400 tracking-widest">
                  {mm}:{ss}
                </p>
              )}
              <button
                type="button"
                onClick={async () => {
                  const d: any = await fetch('/api/deposit/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ depositId: depInfo.depositId }),
                  }).then((r) => r.json());
                  if (d.credited) {
                    stopPolling();
                    setMsg(`Credited ${d.amount} USDT`);
                    setDepInfo(null);
                    loadMe();
                  } else setMsg(d.reason || 'Not confirmed on-chain yet');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-700 text-sm font-medium hover:bg-slate-600"
              >
                Check chain now
              </button>
            </div>
          )}
        </div>

        {/* Active plans */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Active plans</h2>
            <Link href="/plans" className="text-xs text-emerald-400">View all</Link>
          </div>
          {activePlans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-center">
              <p className="text-slate-500 text-sm mb-3">No active plans yet</p>
              <Link
                href="/plans"
                className="inline-flex px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold"
              >
                Browse plans
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {activePlans.map((p: any) => (
                <div
                  key={p.userPlanId || p.planId}
                  className="rounded-2xl border border-white/5 bg-slate-900/60 p-3.5 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {p.dailyYield} USDT/day · expires {new Date(p.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent txs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Recent transactions</h2>
            <Link href="/account" className="text-xs text-emerald-400">Full history</Link>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 divide-y divide-white/5 overflow-hidden">
            {(transactions || []).slice(0, 8).map((tx: any) => (
              <div key={tx.id} className="px-3.5 py-3 flex justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate">{tx.description}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {new Date(tx.timestamp).toLocaleString()} · {tx.status}
                  </p>
                </div>
                <span
                  className={`font-mono shrink-0 font-semibold ${
                    tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {tx.amount >= 0 ? '+' : ''}
                  {Number(tx.amount).toFixed(2)}
                </span>
              </div>
            ))}
            {(transactions || []).length === 0 && (
              <p className="p-4 text-center text-slate-500 text-sm">No transactions yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
