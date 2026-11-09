'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { useThemeLang } from '@/components/ThemeLangProvider';

function sameUtcDay(a: string | null | undefined, b = new Date()) {
  if (!a) return false;
  const d = new Date(a);
  if (Number.isNaN(d.getTime())) return false;
  return (
    d.getUTCFullYear() === b.getUTCFullYear() &&
    d.getUTCMonth() === b.getUTCMonth() &&
    d.getUTCDate() === b.getUTCDate()
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useThemeLang();
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  /** Local override so button updates immediately after claim (KV lag safe) */
  const [claimedOverride, setClaimedOverride] = useState<Record<string, string>>({});

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

      // Always lock the button for this plan if claimed now or already claimed today
      if (d.ok || d.alreadyClaimed) {
        const at = d.lastClaimedAt || new Date().toISOString();
        setClaimedOverride((prev) => ({ ...prev, [userPlanId]: at }));
        setData((prev: any) => {
          if (!prev) return prev;
          const nextWithdrawal =
            d.withdrawalBalance !== undefined && d.withdrawalBalance !== null
              ? Number(d.withdrawalBalance)
              : Number(prev.user?.withdrawalBalance || 0);
          const nextToday =
            d.todayEarnings !== undefined && d.todayEarnings !== null
              ? Number(d.todayEarnings)
              : Number(prev.user?.todayEarnings || 0);
          const deposit = Number(prev.user?.depositBalance || 0);
          return {
            ...prev,
            user: prev.user
              ? {
                  ...prev.user,
                  withdrawalBalance: nextWithdrawal,
                  todayEarnings: nextToday,
                  totalBalance: deposit + nextWithdrawal,
                }
              : prev.user,
            plans: (prev.plans || []).map((p: any) =>
              p.userPlanId === userPlanId ? { ...p, lastClaimedAt: at } : p
            ),
          };
        });
        // Refresh from server shortly after (eventual consistency)
        setTimeout(() => loadMe(), 800);
      }
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

  function planClaimedToday(p: any) {
    const override = claimedOverride[p.userPlanId];
    return sameUtcDay(override || p.lastClaimedAt);
  }

  const claimableToday = activePlans.filter((p: any) => !planClaimedToday(p));
  const dailyPotential = claimableToday.reduce(
    (sum: number, p: any) => sum + (Number(p.dailyYield) || 0),
    0
  );

  return (
    <div className="page-shell pb-28 relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden mesh-bg" />
      <UserNav />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 relative z-10">
        <div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {t.welcome}
          </p>
          <h1 className="text-2xl font-black tracking-tight">{user.username}</h1>
        </div>

        {msg && (
          <div className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-sm text-center">
            {msg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: t.totalBalance, value: Number(user.totalBalance || 0).toFixed(2) },
            { label: t.deposit, value: Number(user.depositBalance || 0).toFixed(2) },
            { label: t.withdraw, value: Number(user.withdrawalBalance || 0).toFixed(2) },
            { label: t.today, value: Number(user.todayEarnings || 0).toFixed(2) },
          ].map((c) => (
            <div key={c.label} className="panel-card p-3.5">
              <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                {c.label}
              </p>
              <p className="text-xl font-black text-emerald-500 mt-1">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/deposit" className="btn-primary text-center py-3">
            {t.deposit}
          </Link>
          <Link href="/withdraw" className="btn-ghost text-center py-3">
            {t.withdraw}
          </Link>
        </div>

        <div>
          <h2 className="font-semibold mb-2">{t.activePlans}</h2>
          {activePlans.length === 0 ? (
            <div className="panel-card p-4 text-center text-sm" style={{ color: 'var(--muted)' }}>
              No active plans.{' '}
              <Link href="/plans" className="text-emerald-500 font-semibold">
                {t.buyPlan}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activePlans.map((p: any) => {
                const claimedToday = planClaimedToday(p);
                const isClaiming = claimingId === p.userPlanId;
                return (
                  <div key={p.userPlanId} className="panel-card p-4 space-y-3">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-bold text-lg">{p.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                          Daily {p.dailyYield} USDT · expires{' '}
                          {new Date(p.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-500 font-black text-xl">{p.dailyYield}</p>
                        <p className="text-[10px] uppercase" style={{ color: 'var(--muted)' }}>
                          / day
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => claimPlan(p.userPlanId, p.name)}
                      disabled={claimedToday || isClaiming}
                      className={`w-full py-3 rounded-xl font-bold transition disabled:opacity-60 disabled:cursor-not-allowed ${
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
          {claimableToday.length === 0 && activePlans.length > 0 && (
            <p className="text-xs text-center mt-2 text-emerald-600">
              All active plans claimed for today
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
