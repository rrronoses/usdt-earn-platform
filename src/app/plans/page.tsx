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
  const [depositBalance, setDepositBalance] = useState(0);

  useEffect(() => {
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
  }, [router]);

  async function buy(planId: string) {
    setMsg('Purchase uses deposit balance. Wire /api/plans/buy for full purchase + 20% referral.');
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <header className="border-b border-slate-800 sticky top-0 bg-slate-950/90 backdrop-blur z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-slate-400 text-sm">← Dashboard</Link>
          <span className="font-bold">Plans</span>
          <span className="text-xs text-emerald-400">{depositBalance.toFixed(2)} USDT</span>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {msg && <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">{msg}</div>}
        {plans.map((p) => (
          <div key={p.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-bold text-lg">{p.name}</h2>
                {p.badge && <span className="text-xs text-emerald-400">{p.badge}</span>}
              </div>
              <p className="text-2xl font-extrabold text-emerald-400">{p.price} <span className="text-sm text-slate-400">USDT</span></p>
            </div>
            <ul className="mt-3 text-sm text-slate-300 space-y-1">
              <li>• {p.durationDays} days</li>
              <li>• {p.dailyYield} USDT daily claim</li>
              <li>• {p.isOneTime ? 'One-time' : 'Rebuy after expire'}</li>
            </ul>
            <button
              onClick={() => buy(p.id)}
              disabled={p.isOneTime && p.id === 'bronze'}
              className="mt-4 w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold disabled:opacity-40"
            >
              {p.isOneTime && p.id === 'bronze' ? 'Signup bonus' : 'Buy Plan'}
            </button>
          </div>
        ))}
        {plans.length === 0 && <p className="text-slate-500 text-center">Loading plans…</p>}
      </main>
    </div>
  );
}
