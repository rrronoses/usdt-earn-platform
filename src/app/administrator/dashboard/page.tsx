import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mb-8">
          KV binding <strong className="text-emerald-400">USDTSTORAGE</strong> · Automated USDT TRC-20 deposits via
          TronGrid
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/administrator/deposits"
            className="rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-emerald-500/40 transition"
          >
            <h2 className="font-semibold mb-2">USDT TRC-20 deposit addresses</h2>
            <p className="text-sm text-slate-400">Add, edit, remove, and set active receiving wallets (multiple supported).</p>
          </Link>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="font-semibold mb-2">Auto verification</h2>
            <p className="text-sm text-slate-400">
              <code className="text-emerald-400">/api/deposit/verify</code> polls TronGrid for confirmed TRC-20
              transfers, uses processed_tx for idempotency, credits depositBalance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
