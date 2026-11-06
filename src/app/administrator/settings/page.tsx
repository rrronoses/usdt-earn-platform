'use client';
import { useEffect, useState } from 'react';
import { AdminNav } from '@/components/AdminNav';

export default function AdminSettingsPage() {
  const [cfg, setCfg] = useState({
    minWithdrawalLimit: 25,
    minDepositLimit: 1,
    maxDepositLimit: 10000,
    depositExpiryMinutes: 30,
    withdrawalNote: '',
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings').then((r) => r.json()).then((d) => {
      if (d.ok && d.config) setCfg((c) => ({ ...c, ...d.config }));
    });
  }, []);

  async function save() {
    const d = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    }).then((r) => r.json());
    setMsg(d.ok ? 'Settings saved' : (d.message || 'Failed'));
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AdminNav />
      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <h1 className="text-xl font-bold">Platform settings</h1>
        {msg && <p className="text-sm text-emerald-400">{msg}</p>}
        <label className="block text-sm">Min withdrawal (USDT)
          <input type="number" value={cfg.minWithdrawalLimit} onChange={(e) => setCfg({ ...cfg, minWithdrawalLimit: Number(e.target.value) })} className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700" />
        </label>
        <label className="block text-sm">Min deposit (USDT)
          <input type="number" value={cfg.minDepositLimit} onChange={(e) => setCfg({ ...cfg, minDepositLimit: Number(e.target.value) })} className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700" />
        </label>
        <label className="block text-sm">Max deposit (USDT)
          <input type="number" value={cfg.maxDepositLimit} onChange={(e) => setCfg({ ...cfg, maxDepositLimit: Number(e.target.value) })} className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700" />
        </label>
        <label className="block text-sm">Deposit expiry (minutes)
          <input type="number" value={cfg.depositExpiryMinutes} onChange={(e) => setCfg({ ...cfg, depositExpiryMinutes: Number(e.target.value) })} className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700" />
        </label>
        <label className="block text-sm">Withdrawal note
          <textarea value={cfg.withdrawalNote} onChange={(e) => setCfg({ ...cfg, withdrawalNote: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 min-h-[80px]" />
        </label>
        <button onClick={save} className="w-full py-2.5 rounded-xl bg-emerald-600 font-bold">Save settings</button>
      </main>
    </div>
  );
}
