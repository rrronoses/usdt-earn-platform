'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
      setMsg(d.message || (d.ok ? 'Purchased' : 'Failed'));
      if (d.ok) load();
    } catch {
      setMsg('Network error');
    }
    setLoading(null);
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 blur-[100px] rounded-full" />
      </div>
      <header className="border-b border-white/5 sticky top-0 bg-slate-950/90 backdrop-blur z-40 relative">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-slate-400 text-sm hover:text-white">← Dashboard</Link>
          <span className="font-bold">Plans</span>
          <span className="text-xs font-semibold text-emerald-400">{depositBalance.toFixed(2)} USDT</span>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6 space-y-4 relative">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-slate-300">
          Buy with <strong className="text-emerald-300">deposit balance</strong>. Daily claims unlock after purchase.
        </div>
        {msg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm text-center">{msg}</div>
        )}
        {plans.map((p) => {
          const total = p.dailyYield * p.durationDays;
          const isBronze = p.isOneTime && p.id === 'bronze';
          const isFeatured = p.badge === 'Best value' || p.name.toLowerCase().includes('platinum') || p.price === 25;
          return (
            <div
              key={p.id}
              className={`rounded-2xl border p-5 transition ${
                isFeatured
                  ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-slate-900/80 shadow-lg shadow-emerald-500/10'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-lg">{p.name}</h2>
                    {p.badge && (
                      <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isBronze ? 'Signup only' : 'Rebuy after expire'}
                  </p>
                </div>
                <p className="text-2xl font-extrabold text-emerald-400 shrink-0">
                  {p.price}
                  <span className="text-sm text-slate-400 font-medium"> USDT</span>
                </p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-black/30 py-2 px-1">
                  <p className="text-xs text-slate-500">Days</p>
                  <p className="font-bold">{p.durationDays}</p>
                </div>
                <div className="rounded-xl bg-black/30 py-2 px-1">
                  <p className="text-xs text-slate-500">Daily</p>
                  <p className="font-bold text-emerald-300">{p.dailyYield}</p>
                </div>
                <div className="rounded-xl bg-black/30 py-2 px-1">
                  <p className="text-xs text-slate-500">Max yield</p>
                  <p className="font-bold">{total}</p>
                </div>
              </div>
              <button
                onClick={() => buy(p.id)}
                disabled={isBronze || loading === p.id}
                className="mt-4 w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold disabled:opacity-40 hover:bg-emerald-400 transition"
              >
                {isBronze ? 'Included on signup' : loading === p.id ? 'Processing…' : `Buy ${p.name}`}
              </button>
            </div>
          );
        })}
        {plans.length === 0 && <p className="text-slate-500 text-center py-12">Loading plans…</p>}
      </main>
    </div>
  );
}
