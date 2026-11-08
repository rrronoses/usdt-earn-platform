'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/AdminNav';

const modules = [
  {
    href: '/administrator/users',
    title: 'Users',
    desc: 'Filter free/paid, ban, balance adjust, full history',
    icon: '◎',
    accent: 'from-sky-500/20 to-blue-900/10 border-sky-500/30',
  },
  {
    href: '/administrator/withdrawals',
    title: 'Withdrawals',
    desc: 'Approve or reject pending payouts',
    icon: '↓',
    accent: 'from-amber-500/20 to-orange-900/10 border-amber-500/30',
  },
  {
    href: '/administrator/transactions',
    title: 'Transactions',
    desc: 'Global ledger with type & status filters',
    icon: '⇄',
    accent: 'from-violet-500/20 to-purple-900/10 border-violet-500/30',
  },
  {
    href: '/administrator/plans',
    title: 'Plans',
    desc: 'Create, edit, and retire earn tiers',
    icon: '◈',
    accent: 'from-emerald-500/20 to-teal-900/10 border-emerald-500/30',
  },
  {
    href: '/administrator/deposits',
    title: 'Deposit pool',
    desc: 'Multi TRC-20 addresses · random assignment',
    icon: '₮',
    accent: 'from-cyan-500/20 to-slate-900/10 border-cyan-500/30',
  },
  {
    href: '/administrator/settings',
    title: 'Settings',
    desc: 'Limits, notes, deposit windows',
    icon: '⚙',
    accent: 'from-slate-500/20 to-slate-900/10 border-slate-500/30',
  },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    paid: 0,
    pendingW: 0,
    addresses: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users?filter=all').then((r) => r.json()),
      fetch('/api/admin/users?filter=paid').then((r) => r.json()),
      fetch('/api/admin/withdrawals').then((r) => r.json()),
      fetch('/api/admin/deposit-addresses').then((r) => r.json()),
    ])
      .then(([all, paid, w, addr]: any[]) => {
        setStats({
          users: all.ok ? (all.users || []).length : 0,
          paid: paid.ok ? (paid.users || []).length : 0,
          pendingW: w.ok ? (w.withdrawals || []).length : 0,
          addresses: addr.ok ? (addr.addresses || []).filter((a: any) => a.active).length : 0,
        });
      })
      .catch(() => {});
  }, []);

  const kpi = [
    { label: 'Total users', value: stats.users, tone: 'text-sky-400' },
    { label: 'Paid users', value: stats.paid, tone: 'text-emerald-400' },
    { label: 'Pending withdrawals', value: stats.pendingW, tone: 'text-amber-400' },
    { label: 'Active deposit wallets', value: stats.addresses, tone: 'text-cyan-400' },
  ];

  return (
    <AdminShell title="Overview" subtitle="USDTSTORAGE · TronGrid TRC-20 · Edge runtime">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {kpi.map((k) => (
          <div key={k.label} className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur p-4 sm:p-5">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{k.label}</p>
            <p className={`text-2xl sm:text-3xl font-black mt-1 ${k.tone}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Modules</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`group rounded-2xl border bg-gradient-to-br ${m.accent} p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30`}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-2xl opacity-80">{m.icon}</span>
              <span className="text-slate-500 group-hover:text-emerald-400 transition text-sm">→</span>
            </div>
            <h3 className="font-bold text-lg mt-3">{m.title}</h3>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">{m.desc}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
