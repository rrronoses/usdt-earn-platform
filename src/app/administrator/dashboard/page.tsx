'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/AdminNav';
import { AdminKpi, AdminPanel, Sparkline, StatusBadge } from '@/components/admin/ui';

type Metrics = {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  paidUsers: number;
  pendingWithdrawals: number;
  pendingDeposits: number;
  totalDepositsVolume: number;
  totalWithdrawalsVolume: number;
  totalEarnPaid?: number;
  totalYieldPaid?: number;
  tvlDepositBalance: number;
  tvlWithdrawalBalance: number;
  platformTvl: number;
  depositAddressesEnabled: number;
  depositAddressesTotal: number;
  plansActive: number;
  storageBackend: string;
  workerHealth: string;
  trends?: {
    days: string[];
    deposits: number[];
    earnPaid?: number[];
    yieldPaid?: number[];
  };
};

const modules = [
  {
    href: '/administrator/users',
    title: 'Users',
    desc: 'Filter free/paid · ban · ±USDT · full history',
    icon: '◎',
  },
  {
    href: '/administrator/deposit-queue',
    title: 'Deposit queue',
    desc: 'Manual approve / reject pending TRC-20 deposits',
    icon: '↑',
  },
  {
    href: '/administrator/withdrawals',
    title: 'Withdrawals',
    desc: 'Approve or reject pending TRC-20 payouts',
    icon: '↓',
  },
  {
    href: '/administrator/transactions',
    title: 'Ledger',
    desc: 'Global transactions with type & status filters',
    icon: '⇄',
  },
  {
    href: '/administrator/plans',
    title: 'Plans',
    desc: 'Create, edit, and retire earn tiers',
    icon: '◈',
  },
  {
    href: '/administrator/deposits',
    title: 'Wallets',
    desc: 'Multi TRC-20 pool · random assignment',
    icon: '₮',
  },
  {
    href: '/administrator/settings',
    title: 'Settings',
    desc: 'Limits · poll interval · Telegram support',
    icon: '⚙',
  },
];

export default function AdminDashboardPage() {
  const [m, setM] = useState<Metrics | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = (await fetch('/api/admin/metrics').then((r) => r.json())) as {
        ok?: boolean;
        metrics?: Metrics;
        message?: string;
      };
      if (d.ok && d.metrics) {
        setM(d.metrics);
        setErr('');
      } else {
        setErr(d.message || 'Failed to load metrics');
      }
    } catch {
      setErr('Network error');
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  const fmt = (n: number) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const earnTotal = Number(m?.totalEarnPaid ?? m?.totalYieldPaid ?? 0);
  const earnTrend = m?.trends?.earnPaid || m?.trends?.yieldPaid || [];

  return (
    <AdminShell
      title="Overview"
      subtitle="Platform health · TVL · queues · 7-day trends"
      actions={
        <button onClick={load} className="btn-ghost text-xs px-3 py-1.5" type="button">
          Refresh
        </button>
      }
    >
      {err && (
        <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm">{err}</div>
      )}

      {loading && !m ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl animate-pulse border"
              style={{ borderColor: 'var(--border)', background: 'var(--border)' }}
            />
          ))}
        </div>
      ) : m ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <AdminKpi label="Platform TVL" value={`${fmt(m.platformTvl)}`} hint="Deposit + withdraw balances" accent="emerald" />
            <AdminKpi label="Deposit volume" value={`${fmt(m.totalDepositsVolume)}`} hint="All-time credited deposits" accent="cyan" />
            <AdminKpi label="Earn paid" value={`${fmt(earnTotal)}`} hint="Daily claims settled" accent="violet" />
            <AdminKpi label="Active users" value={m.activeUsers} hint={`${m.totalUsers} total · ${m.paidUsers} paid`} accent="sky" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <AdminKpi label="Pending withdrawals" value={m.pendingWithdrawals} accent="amber" />
            <Link href="/administrator/deposit-queue" className="block">
              <AdminKpi label="Pending deposits" value={m.pendingDeposits} hint="Tap to review queue" accent="amber" />
            </Link>
            <AdminKpi label="Deposit wallets" value={`${m.depositAddressesEnabled}/${m.depositAddressesTotal}`} accent="cyan" />
            <AdminKpi label="Active plans" value={m.plansActive} accent="emerald" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mb-8">
            <AdminPanel className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    Deposits · 7 days
                  </p>
                  <p className="text-lg font-bold mt-0.5">Volume trend</p>
                </div>
                <StatusBadge status={m.workerHealth === 'ok' ? 'active' : 'pending'} />
              </div>
              <Sparkline data={m.trends?.deposits || []} color="#06b6d4" height={56} />
              <div className="flex justify-between text-[10px] mt-2" style={{ color: 'var(--muted)' }}>
                <span>{m.trends?.days?.[0]?.slice(5) || '—'}</span>
                <span>{m.trends?.days?.[m.trends.days.length - 1]?.slice(5) || '—'}</span>
              </div>
            </AdminPanel>
            <AdminPanel className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    Earn · 7 days
                  </p>
                  <p className="text-lg font-bold mt-0.5">Payout trend</p>
                </div>
                <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                  {m.storageBackend}
                </span>
              </div>
              <Sparkline data={earnTrend} color="#10b981" height={56} />
              <div className="flex justify-between text-[10px] mt-2" style={{ color: 'var(--muted)' }}>
                <span>{m.trends?.days?.[0]?.slice(5) || '—'}</span>
                <span>{m.trends?.days?.[m.trends.days.length - 1]?.slice(5) || '—'}</span>
              </div>
            </AdminPanel>
          </div>
        </>
      ) : null}

      <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
        Modules
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-lg"
            style={{ borderColor: 'var(--border)', background: 'var(--card, transparent)' }}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-2xl opacity-80">{mod.icon}</span>
              <span className="text-sm opacity-50 group-hover:text-emerald-500 group-hover:opacity-100 transition">→</span>
            </div>
            <h3 className="font-bold text-lg mt-3">{mod.title}</h3>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--muted)' }}>
              {mod.desc}
            </p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
