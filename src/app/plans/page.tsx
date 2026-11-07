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
      setMsg(d.message || (d.ok ? 'Purchased successfully!' : 'Failed'));
      if (d.ok) load();
    } catch {
      setMsg('Network error');
    }
    setLoading(null);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 blur-[100px] rounded-full" />
      </div>
      <UserNav />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold">{t.plans}</h1>
            <p className="text-xs text-slate-500 mt-0.5">Pay from deposit balance</p>
          </div>
          <div className="text-right rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2">
            <p className="text-[10px] text-slate-400 uppercase">Deposit</p>
            <p className="font-bold text-emerald-400">{depositBalance.toFixed(2)} USDT</p>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-sm text-slate-300">
          Higher tiers = more daily claims. Paid buys pay <strong className="text-emerald-300">20%</strong> to your
          referrer.
        </div>

        {msg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm text-center">
            {msg}
          </div>
        )}

        {plans.map((p) => {
          const total = p.dailyYield * p.durationDays;
          const isBronze = p.isOneTime || p.id === 'bronze';
          const featured =
            p.badge === 'Best value' ||
            p.name.toLowerCase().includes('platinum') ||
            p.price === 25 ||
            p.price === 60;

          return (
            <div
              key={p.id}
              className={`rounded-3xl border p-5 transition ${
                featured
                  ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-slate-900/90 shadow-lg shadow-emerald-500/10'
                  : 'border-white/5 bg-slate-900/60'
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-lg">{p.name}</h2>
                    {p.badge && (
                      <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold">
                        {p.badge}
                      </span>
                    )}
                    {featured && !p.badge && (
                      <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isBronze ? 'Signup-only · not rebuyable' : 'Rebuy after expiration'}
                  </p>
                </div>
                <p className="text-2xl font-black text-emerald-400 shrink-0">
                  {p.price}
                  <span className="text-sm text-slate-400 font-semibold"> USDT</span>
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-black/30 border border-white/5 py-2.5 px-1">
                  <p className="text-[10px] text-slate-500 uppercase">Days</p>
                  <p className="font-bold">{p.durationDays}</p>
                </div>
                <div className="rounded-xl bg-black/30 border border-white/5 py-2.5 px-1">
                  <p className="text-[10px] text-slate-500 uppercase">Daily</p>
                  <p className="font-bold text-emerald-300">{p.dailyYield}</p>
                </div>
                <div className="rounded-xl bg-black/30 border border-white/5 py-2.5 px-1">
                  <p className="text-[10px] text-slate-500 uppercase">Max yield</p>
                  <p className="font-bold">{total}</p>
                </div>
              </div>

              <button
                onClick={() => buy(p.id)}
                disabled={isBronze || loading === p.id}
                className={`mt-4 w-full py-3 rounded-xl font-bold transition disabled:opacity-40 ${
                  featured
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                }`}
              >
                {isBronze
                  ? 'Included on signup'
                  : loading === p.id
                    ? 'Processing…'
                    : `Buy ${p.name} · ${p.price} USDT`}
              </button>
            </div>
          );
        })}

        {plans.length === 0 && (
          <p className="text-slate-500 text-center py-16">Loading plans…</p>
        )}
      </main>
    </div>
  );
}
