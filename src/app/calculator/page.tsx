'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/PublicHeader';
import { useThemeLang } from '@/components/ThemeLangProvider';

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
  const { t } = useThemeLang();
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
    <div className="page-shell">
      <PublicHeader rightLink={{ href: '/signup', label: t.getStartedArrow }} />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{t.calcTitle}</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
            {t.calcSub}
          </p>
        </div>

        <div className="panel-card p-5 sm:p-6 space-y-5">
          <div>
            <label className="text-xs uppercase tracking-wide font-medium" style={{ color: 'var(--muted)' }}>
              {t.planLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlanId(p.id)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    planId === p.id
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : ''
                  }`}
                  style={planId === p.id ? undefined : { borderColor: 'var(--border)' }}
                >
                  <p className="font-bold text-sm">{p.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                    {p.price} USDT · {p.daily}/day
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide font-medium" style={{ color: 'var(--muted)' }}>
              {t.numberOfPlans}
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={qty}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="mt-2 input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="panel-card p-4">
              <p className="text-[11px] uppercase" style={{ color: 'var(--muted)' }}>
                {t.investment}
              </p>
              <p className="text-2xl font-black mt-1">{result.invest} USDT</p>
            </div>
            <div className="panel-card p-4">
              <p className="text-[11px] uppercase" style={{ color: 'var(--muted)' }}>
                {t.dailyClaimLabel}
              </p>
              <p className="text-2xl font-black text-emerald-500 mt-1">{result.daily} USDT</p>
            </div>
            <div className="panel-card p-4">
              <p className="text-[11px] uppercase" style={{ color: 'var(--muted)' }}>
                {t.cycleEarn} ({plan.days}d)
              </p>
              <p className="text-2xl font-black text-teal-500 mt-1">{result.totalEarn} USDT</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-[11px] text-emerald-600 uppercase">{t.roiLabel}</p>
              <p className="text-2xl font-black text-emerald-500 mt-1">{result.roi}%</p>
            </div>
          </div>

          <Link href="/signup" className="btn-primary block w-full text-center py-3.5">
            {t.startEarning}
          </Link>
        </div>
      </main>
    </div>
  );
}
