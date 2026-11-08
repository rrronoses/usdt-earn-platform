'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

interface CalcPlan {
  id: string;
  name: string;
  price: number;
  days: number;
  daily: number;
}

const PLANS: CalcPlan[] = [
  { id: 'bronze', name: 'Bronze', price: 3, days: 7, daily: 1 },
  { id: 'silver', name: 'Silver', price: 10, days: 28, daily: 1 },
  { id: 'gold', name: 'Gold', price: 25, days: 28, daily: 2 },
  { id: 'gold_plus', name: 'Gold Plus', price: 40, days: 28, daily: 5 },
  { id: 'platinum', name: 'Platinum', price: 60, days: 28, daily: 7 },
];

export default function CalculatorPage() {
  const [planId, setPlanId] = useState('gold');
  const [units, setUnits] = useState(1);

  const plan = PLANS.find((p) => p.id === planId) || PLANS[2];
  const qty = Math.max(1, Math.min(50, Math.floor(units) || 1));

  const result = useMemo(() => {
    const invest = plan.price * qty;
    const daily = plan.daily * qty;
    const totalEarn = plan.daily * plan.days * qty;
    const roi = invest > 0 ? Math.round((totalEarn / invest) * 100) : 0;
    return { invest, daily, totalEarn, roi };
  }, [plan, qty]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/5 sticky top-0 glass z-20">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold">
            USDT<span className="text-emerald-400">Earn</span>
          </Link>
          <Link href="/signup" className="text-sm text-emerald-400 font-semibold">
            Get started →
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Earn calculator</h1>
          <p className="text-slate-400 text-sm mt-2">
            Estimate daily and cycle earnings before you buy a plan.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 space-y-5">
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500 font-medium">Plan</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlanId(p.id)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    planId === p.id
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <p className="font-bold text-sm">{p.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {p.price} USDT · {p.daily}/day
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500 font-medium">
              Number of plans
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={qty}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] text-slate-500 uppercase">Investment</p>
              <p className="text-2xl font-black text-white mt-1">{result.invest} USDT</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] text-slate-500 uppercase">Daily claim</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{result.daily} USDT</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] text-slate-500 uppercase">Cycle earn ({plan.days}d)</p>
              <p className="text-2xl font-black text-teal-300 mt-1">{result.totalEarn} USDT</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-[11px] text-emerald-300/80 uppercase">ROI on plan price</p>
              <p className="text-2xl font-black text-emerald-300 mt-1">{result.roi}%</p>
            </div>
          </div>

          <Link
            href="/signup"
            className="block w-full text-center py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold"
          >
            Start earning — free 3 USDT
          </Link>
        </div>
      </main>
    </div>
  );
}
