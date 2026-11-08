'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { useThemeLang } from '@/components/ThemeLangProvider';

function sameDay(a: string | null | undefined, b = new Date()) {
  if (!a) return false;
  const d = new Date(a);
  return (
    d.getFullYear() === b.getFullYear() &&
    d.getMonth() === b.getMonth() &&
    d.getDate() === b.getDate()
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useThemeLang();
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [claimingId, setClaimingId] = useState<string | null>(null);

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
  }, [loadMe]);

  async function claimPlan(userPlanId: string, planName: string) {
    setClaimingId(userPlanId);
    setMsg('');
    try {
      const d: any = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPlanId }),
      }).then((r) => r.json());
      setMsg(d.message || (d.ok ? `Claimed ${d.claimed} USDT from ${planName}` : 'Claim failed'));
      if (d.ok) loadMe();
    } catch {
      setMsg('Network error');
    }
    setClaimingId(null);
  }

  if (!data) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { user, plans, transactions } = data;
  const activePlans = (plans || []).filter(
    (p: any) => p.status === 'active' && new Date(p.expiryDate) > new Date()
  );
  const claimableToday = activePlans.filter((p: any) => !sameDay(p.lastClaimedAt));
  const dailyPotential = claimableToday.reduce(
    (sum: number, p: any) => sum + (Number(p.dailyYield) || 0),
    0
  );

  return (
    <div className="page-shell pb-28 relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden mesh-bg" />
      <UserNav />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 relative z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {t.welcome}
            </p>
            <p className="font-bold text-lg truncate">{user.username}</p>
          </div>
          <Link
            href="/plans"
            className="shrink-0 text-xs font-bold px-3.5 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30"
          >
            {t.buyPlan} →
          </Link>
        </div>

        {msg && (
          <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-sm text-center">
            {msg}
          </div>
        )}

        <div className="rounded-[1.75rem] bg-gradient-to-br from-emerald-500/30 via-teal-600/15 to-transparent border border-emerald-400/30 p-5 shadow-xl shadow-emerald-500/15">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {t.totalBalance}
          </p>
          <p className="text-4xl font-black tracking-tight mt-1">
            {user.totalBalance.toFixed(2)}
            <span className="text-base font-semibold text-emerald-500 ml-1.5">USDT</span>
          </p>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: t.deposit, value: user.depositBalance },
              { label: t.withdraw, value: user.withdrawalBalance },
              { label: t.today, value: user.todayEarnings, plus: true },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl p-3 text-center panel-card">
                <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                  {c.label}
                </p>
                <p className={`font-bold text-sm mt-0.5 ${c.plus ? 'text-emerald-500' : ''}`}>
                  {c.plus ? '+' : ''}
                  {Number(c.value).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link href="/deposit" className="btn-primary text-center text-sm py-3">
            {t.deposit}
          </Link>
          <Link href="/withdraw" className="btn-ghost text-center text-sm py-3">
            {t.withdraw}
          </Link>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">{t.activePlans}</h2>
            <Link href="/plans" className="text-xs font-semibold text-emerald-500">
              + {t.buyPlan}
            </Link>
          </div>

          {activePlans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
              <p className="text-sm font-medium mb-1">No active plans</p>
              <Link href="/plans" className="inline-flex mt-2 px-5 py-2.5 rounded-xl btn-primary text-sm">
                Browse plans
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activePlans.map((p: any) => {
                const claimedToday = sameDay(p.lastClaimedAt);
                const isClaiming = claimingId === p.userPlanId;
                return (
                  <div key={p.userPlanId} className="panel-card p-4 space-y-3">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="font-bold text-lg">{p.name}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                          Expires {new Date(p.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-black text-emerald-500">+{p.dailyYield}</p>
                        <p className="text-[10px] uppercase" style={{ color: 'var(--muted)' }}>
                          USDT / day
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => claimPlan(p.userPlanId, p.name)}
                      disabled={claimedToday || isClaiming}
                      className={`w-full py-3 rounded-xl font-bold transition disabled:opacity-50 ${
                        claimedToday ? 'btn-ghost' : 'btn-primary'
                      }`}
                    >
                      {isClaiming
                        ? 'Claiming…'
                        : claimedToday
                          ? `✓ ${p.name} claimed today`
                          : `Claim ${p.dailyYield} USDT · ${p.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {claimableToday.length > 0 && (
            <p className="text-xs text-center mt-2" style={{ color: 'var(--muted)' }}>
              {claimableToday.length} ready · up to {dailyPotential.toFixed(2)} USDT
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">{t.recentActivity}</h2>
            <Link href="/history" className="text-xs text-emerald-500 font-medium">
              {t.fullHistory}
            </Link>
          </div>
          <div className="panel-card divide-y overflow-hidden">
            {(transactions || []).slice(0, 6).map((tx: any) => (
              <div key={tx.id} className="px-3.5 py-3 flex justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate">{tx.description}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                    {new Date(tx.timestamp).toLocaleString()} · {tx.status}
                  </p>
                </div>
                <span
                  className={`font-mono shrink-0 font-semibold ${
                    tx.amount >= 0 ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  {tx.amount >= 0 ? '+' : ''}
                  {Number(tx.amount).toFixed(2)}
                </span>
              </div>
            ))}
            {(transactions || []).length === 0 && (
              <p className="p-4 text-center text-sm" style={{ color: 'var(--muted)' }}>
                {t.noData}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
