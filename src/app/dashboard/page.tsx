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
    if (d.ok) {
      const parts = (d.breakdown || [])
        .map((b: any) => `${b.name} +${b.dailyYield}`)
        .join(', ');
      setMsg(
        d.message ||
          `Claimed ${d.claimed} USDT from ${d.planCount || 1} plan(s)${parts ? ` (${parts})` : ''}`
      );
      loadMe();
    } else {
      setMsg(d.message || 'Claim failed');
    }
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
  const dailyPotential = activePlans.reduce(
    (sum: number, p: any) => sum + (Number(p.dailyYield) || 0),
    0
  );
  const alreadyClaimedToday =
    user.lastClaimDate &&
    new Date(user.lastClaimDate).toDateString() === new Date().toDateString();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28 relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 right-0 w-80 h-80 bg-emerald-500/20 blur-[110px] rounded-full" />
        <div className="absolute bottom-40 left-0 w-64 h-64 bg-teal-500/10 blur-[90px] rounded-full" />
      </div>
      <UserNav />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 relative z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Welcome back</p>
            <p className="font-bold text-lg truncate">{user.username}</p>
          </div>
          <Link
            href="/plans"
            className="shrink-0 text-xs font-bold px-3.5 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30"
          >
            Buy plan →
          </Link>
        </div>

        {msg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-sm text-center leading-relaxed">
            {msg}
          </div>
        )}

        {/* Balance hero */}
        <div className="rounded-[1.75rem] bg-gradient-to-br from-emerald-500/30 via-teal-600/15 to-slate-900 border border-emerald-400/30 p-5 shadow-xl shadow-emerald-500/15">
          <p className="text-sm text-slate-300">{t.totalBalance}</p>
          <p className="text-4xl font-black tracking-tight mt-1">
            {user.totalBalance.toFixed(2)}
            <span className="text-base font-semibold text-emerald-300 ml-1.5">USDT</span>
          </p>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: t.deposit, value: user.depositBalance },
              { label: t.withdraw, value: user.withdrawalBalance },
              { label: t.today, value: user.todayEarnings, plus: true },
            ].map((c) => (
              <div key={c.label} className="bg-black/30 rounded-2xl p-3 text-center border border-white/5">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">{c.label}</p>
                <p className={`font-bold text-sm mt-0.5 ${c.plus ? 'text-emerald-400' : ''}`}>
                  {c.plus ? '+' : ''}
                  {Number(c.value).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Multi-plan claim hint */}
          {activePlans.length > 0 && (
            <div className="mt-3 rounded-xl bg-black/25 border border-white/5 px-3 py-2 text-xs text-slate-300">
              Daily claim from <strong className="text-white">{activePlans.length}</strong> plan
              {activePlans.length > 1 ? 's' : ''}:{' '}
              <strong className="text-emerald-300">{dailyPotential.toFixed(2)} USDT</strong>
              {activePlans.length > 1 && (
                <span className="block text-slate-500 mt-0.5">
                  {activePlans.map((p: any) => `${p.name} ${p.dailyYield}`).join(' + ')}
                </span>
              )}
            </div>
          )}

          <button
            onClick={claim}
            disabled={claiming || alreadyClaimedToday || activePlans.length === 0}
            className="mt-4 w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-extrabold text-base shadow-lg shadow-emerald-500/30 disabled:opacity-45 disabled:shadow-none active:scale-[0.98] transition"
          >
            {claiming
              ? 'Claiming…'
              : alreadyClaimedToday
                ? 'Already claimed today'
                : activePlans.length === 0
                  ? 'Buy a plan to claim'
                  : `Claim ${dailyPotential.toFixed(2)} USDT (${activePlans.length} plan${activePlans.length > 1 ? 's' : ''})`}
          </button>
        </div>

        {/* Upsell if low deposit or few plans */}
        {(user.depositBalance >= 10 || activePlans.length < 2) && (
          <Link
            href="/plans"
            className="block rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 to-orange-500/5 p-4 hover:border-amber-400/40 transition"
          >
            <p className="font-bold text-amber-200 text-sm">Boost daily earnings</p>
            <p className="text-xs text-slate-400 mt-1">
              Stack multiple plans — claim combines all active yields in one tap.
            </p>
            <span className="inline-block mt-2 text-xs font-bold text-emerald-400">View plans →</span>
          </Link>
        )}

        {/* Deposit */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Deposit USDT</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
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
                className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 outline-none text-base"
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
                src={`https://api.qrserver.com/v1/create-qr-code/?size=168x168&data=${encodeURIComponent(depInfo.address)}`}
                alt="QR"
                className="mx-auto rounded-2xl bg-white p-2.5 shadow-lg"
              />
              <div className="flex gap-2 items-center bg-slate-950 rounded-xl p-3 border border-slate-800">
                <code className="text-xs break-all flex-1 font-mono">{depInfo.address}</code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(depInfo.address);
                    setMsg('Address copied');
                  }}
                  className="text-emerald-400 text-sm font-bold shrink-0 px-2"
                >
                  Copy
                </button>
              </div>
              {secondsLeft > 0 && (
                <p className="text-center font-mono text-2xl text-amber-400 tracking-widest">{mm}:{ss}</p>
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
            <h2 className="font-semibold">Active plans ({activePlans.length})</h2>
            <Link href="/plans" className="text-xs font-semibold text-emerald-400">
              + Add plan
            </Link>
          </div>
          {activePlans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
              <p className="text-slate-300 text-sm font-medium mb-1">No active plans</p>
              <p className="text-xs text-slate-500 mb-4">Buy Silver, Gold or Platinum to start earning daily</p>
              <Link
                href="/plans"
                className="inline-flex px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/25"
              >
                Browse plans
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {activePlans.map((p: any) => (
                <div
                  key={p.userPlanId || p.planId}
                  className="rounded-2xl border border-white/5 bg-slate-900/70 p-3.5 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      <span className="text-emerald-300 font-semibold">{p.dailyYield} USDT</span>/day · expires{' '}
                      {new Date(p.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                    active
                  </span>
                </div>
              ))}
              {activePlans.length === 1 && (
                <Link
                  href="/plans"
                  className="block text-center text-xs text-emerald-400 font-medium py-2 rounded-xl border border-dashed border-emerald-500/25 hover:bg-emerald-500/5"
                >
                  + Stack another plan to increase daily claim
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Recent txs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Recent activity</h2>
            <Link href="/account" className="text-xs text-emerald-400 font-medium">Full history</Link>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-900/50 divide-y divide-white/5 overflow-hidden">
            {(transactions || []).slice(0, 6).map((tx: any) => (
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
              <p className="p-4 text-center text-slate-500 text-sm">No activity yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
