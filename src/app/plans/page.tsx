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
  dailyYield: number;
  isOneTime: boolean;
  active: boolean;
  badge?: string;
};

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
        setDepositBalance(d.user.depositBalance);
        setPlans((d.catalog || []).filter((p: Plan) => p.active));
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

  const dailyFromOwned = owned.reduce((s, p) => s + (Number(p.dailyYield) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28 relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 blur-[110px] rounded-full" />
        <div className="absolute bottom-32 left-0 w-56 h-56 bg-teal-500/10 blur-[80px] rounded-full" />
      </div>
      <UserNav />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight">{t.plans}</h1>
            <p className="text-xs text-slate-500 mt-1">Stack plans — claim each plan daily</p>
          </div>
          <div className="text-right rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2.5">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Deposit</p>
            <p className="font-black text-emerald-400 text-lg leading-tight">{depositBalance.toFixed(2)}</p>
          </div>
        </div>

        {owned.length > 0 && (
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm">
            <p className="text-slate-300">
              You have <strong className="text-white">{owned.length}</strong> active plan
              {owned.length > 1 ? 's' : ''} · daily claim{' '}
              <strong className="text-emerald-300">{dailyFromOwned.toFixed(2)} USDT</strong>
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-3.5 text-sm text-slate-300 leading-relaxed">
          Buy with deposit balance. Claim each active plan separately every day.
        </div>

        {msg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm text-center">{msg}</div>
        )}

        {plans.map((p) => {
          const total = p.dailyYield * p.durationDays;
          const isBronze = p.isOneTime || p.id === 'bronze';
          const hasActive = owned.some((o) => o.planId === p.id);
          const featured = p.price === 25 || p.price === 60 || (p.badge && p.badge.length > 0);
          const canAfford = depositBalance >= p.price;

          return (
            <div
              key={p.id}
              className={`rounded-[1.35rem] border p-5 transition ${
                featured
                  ? 'border-emerald-400/45 bg-gradient-to-b from-emerald-500/15 via-slate-900/90 to-slate-950 shadow-xl shadow-emerald-500/15'
                  : 'border-white/5 bg-slate-900/70'
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
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">Owned</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {isBronze ? 'Free on signup · one-time' : 'Rebuy after this plan expires'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-3xl font-black text-emerald-400 leading-none">{p.price}</p>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">USDT</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-black/35 border border-white/5 py-2.5">
                  <p className="text-[10px] text-slate-500 uppercase">Days</p>
                  <p className="font-bold text-lg">{p.durationDays}</p>
                </div>
                <div className="rounded-xl bg-black/35 border border-white/5 py-2.5">
                  <p className="text-[10px] text-slate-500 uppercase">Daily claim</p>
                  <p className="font-bold text-lg text-emerald-300">{p.dailyYield}</p>
                </div>
                <div className="rounded-xl bg-black/35 border border-white/5 py-2.5">
                  <p className="text-[10px] text-slate-500 uppercase">Max earn</p>
                  <p className="font-bold text-lg">{total}</p>
                </div>
              </div>

              <button
                onClick={() => buy(p.id)}
                disabled={isBronze || hasActive || loading === p.id || (!canAfford && !isBronze)}
                className={`mt-4 w-full py-3.5 rounded-xl font-extrabold transition disabled:opacity-40 active:scale-[0.98] ${
                  featured && !isBronze && !hasActive
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                }`}
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

        {plans.length === 0 && <p className="text-slate-500 text-center py-16">Loading plans…</p>}

        {depositBalance < 10 && (
          <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-4 text-center text-sm text-slate-400">
            Low deposit?{' '}
            <button type="button" onClick={() => router.push('/dashboard')} className="text-emerald-400 font-semibold">
              Deposit USDT on dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
