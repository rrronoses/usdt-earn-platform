'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { useThemeLang } from '@/components/ThemeLangProvider';

type Plan = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  dailyEarn?: number;
  dailyYield?: number;
  isOneTime: boolean;
  active: boolean;
  badge?: string;
};

function dailyOf(p: { dailyEarn?: number; dailyYield?: number }) {
  const n = Number(p.dailyEarn ?? p.dailyYield ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export default function PlansPage() {
  const router = useRouter();
  const { t } = useThemeLang();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [owned, setOwned] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [depositBalance, setDepositBalance] = useState(0);

  function load() {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d: any) => {
        if (!d.ok) {
          router.push('/login');
          return;
        }
        setDepositBalance(Number(d.user.depositBalance) || 0);
        setPlans((d.catalog || []).filter((p: Plan) => p.active !== false));
        setOwned(
          (d.plans || []).filter(
            (p: any) => p.status === 'active' && new Date(p.expiryDate) > new Date()
          )
        );
      });
  }

  useEffect(() => {
    load();
  }, [router]);

  async function buy(planId: string) {
    setLoading(planId);
    setMsg('');
    try {
      const res = await fetch('/api/plans/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const d: any = await res.json();
      setMsg(d.message || (d.ok ? 'Plan purchased!' : 'Failed'));
      if (d.ok) load();
    } catch {
      setMsg('Network error');
    }
    setLoading(null);
  }

  const dailyFromOwned = owned.reduce((s, p) => s + dailyOf(p), 0);

  return (
    <div className="page-shell pb-28 relative">
      <div className="fixed inset-0 pointer-events-none mesh-bg" />
      <UserNav />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight">{t.plans}</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              Stack plans — claim each plan daily
            </p>
          </div>
          <div className="text-right rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2.5">
            <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Deposit
            </p>
            <p className="font-black text-emerald-500 text-lg leading-tight">{depositBalance.toFixed(2)}</p>
          </div>
        </div>

        {owned.length > 0 && (
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm">
            You have <strong>{owned.length}</strong> active plan{owned.length > 1 ? 's' : ''} · daily claim{' '}
            <strong className="text-emerald-500">{dailyFromOwned.toFixed(2)} USDT</strong>
          </div>
        )}

        <div className="panel-card p-3.5 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          Buy with deposit balance. Free Bronze is included on signup only (not extra deposit credit).
        </div>

        {msg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-center">{msg}</div>
        )}

        {plans.map((p) => {
          const daily = dailyOf(p);
          const days = Number(p.durationDays) || 0;
          const total = Number((daily * days).toFixed(2));
          const isBronze = p.isOneTime || p.id === 'bronze';
          const hasActive = owned.some((o) => o.planId === p.id);
          const featured = p.price === 25 || p.price === 60 || Boolean(p.badge);
          const canAfford = depositBalance >= Number(p.price);

          return (
            <div
              key={p.id}
              className={`rounded-[1.35rem] border p-5 transition panel-card ${
                featured ? 'border-emerald-400/45 shadow-xl shadow-emerald-500/10' : ''
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-xl">{p.name}</h2>
                    {featured && (
                      <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-extrabold">
                        {p.badge || (p.price === 60 ? 'Best value' : 'Popular')}
                      </span>
                    )}
                    {hasActive && (
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-600 border border-teal-500/30 font-bold">
                        Owned
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    {isBronze ? 'Free on signup · one-time' : 'Rebuy after this plan expires'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-3xl font-black text-emerald-500 leading-none">{p.price}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--muted)' }}>
                    USDT
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Days', value: String(days) },
                  { label: 'Daily claim', value: String(daily), accent: true },
                  { label: 'Max earn', value: String(total) },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="rounded-xl py-2.5 border"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                  >
                    <p className="text-[10px] uppercase" style={{ color: 'var(--muted)' }}>
                      {c.label}
                    </p>
                    <p className={`font-bold text-lg ${c.accent ? 'text-emerald-500' : ''}`}>{c.value}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => buy(p.id)}
                disabled={isBronze || hasActive || loading === p.id || (!canAfford && !isBronze)}
                className="mt-4 w-full py-3.5 rounded-xl font-extrabold transition disabled:opacity-40 active:scale-[0.98] btn-primary"
              >
                {isBronze
                  ? 'Included on signup'
                  : hasActive
                    ? 'Already active'
                    : loading === p.id
                      ? 'Processing…'
                      : !canAfford
                        ? `Need ${p.price} USDT deposit`
                        : `Buy ${p.name} · ${p.price} USDT`}
              </button>
            </div>
          );
        })}

        {plans.length === 0 && (
          <p className="text-center py-16" style={{ color: 'var(--muted)' }}>
            Loading plans…
          </p>
        )}

        {depositBalance < 10 && (
          <div className="panel-card p-4 text-center text-sm" style={{ color: 'var(--muted)' }}>
            Low deposit?{' '}
            <button type="button" onClick={() => router.push('/deposit')} className="text-emerald-500 font-semibold">
              Deposit USDT
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
