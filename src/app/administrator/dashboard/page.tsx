'use client';
import Link from 'next/link';
import { AdminNav } from '@/components/AdminNav';

const cards = [
  { href: '/administrator/users', title: 'Users', desc: 'Filter free/paid, ban, ±USDT, delete, full history' },
  { href: '/administrator/withdrawals', title: 'Withdrawals', desc: 'Approve or reject pending withdrawals' },
  { href: '/administrator/transactions', title: 'Transactions', desc: 'Filter by type, status, user id' },
  { href: '/administrator/plans', title: 'Plans', desc: 'Add, edit, remove investment tiers' },
  { href: '/administrator/deposits', title: 'Deposit addresses', desc: 'Multi USDT TRC-20 wallets, set active' },
  { href: '/administrator/settings', title: 'Settings', desc: 'Min withdrawal, deposit min/max limits' },
];

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AdminNav />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mb-8">
          KV <strong className="text-emerald-400">USDTSTORAGE</strong> · Auto USDT TRC-20 via TronGrid
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {cards.map((c) => (
            <Link key={c.href} href={c.href} className="rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-emerald-500/40 transition">
              <h2 className="font-semibold mb-1">{c.title}</h2>
              <p className="text-sm text-slate-400">{c.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
