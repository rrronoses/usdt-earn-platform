import Link from 'next/link';

const plans = [
  { name: 'Bronze', price: 3, days: 7, daily: 1, note: 'One-time · Free on signup' },
  { name: 'Silver', price: 10, days: 28, daily: 1, note: 'Rebuy after expire' },
  { name: 'Gold', price: 25, days: 28, daily: 2, note: 'Rebuy after expire' },
  { name: 'Gold Plus', price: 40, days: 28, daily: 5, note: 'Rebuy after expire' },
  { name: 'Platinum', price: 60, days: 28, daily: 7, note: 'Best value' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white">₮</span>
            USDT<span className="text-emerald-400">Yield</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-300 hover:text-white">Login</Link>
            <Link href="/signup" className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-sm font-semibold hover:bg-emerald-400">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Cloudflare Edge · USDTSTORAGE KV
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
          Invest USDT.<br />
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Earn Daily.</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
          Edge-deployed yield platform with tiered plans, 20% referral commissions, and admin-verified TRC20 deposits.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-lg shadow-lg shadow-emerald-500/20">
            Start with Free 3 USDT
          </Link>
          <Link href="/login" className="px-8 py-4 rounded-2xl border border-slate-600 font-semibold text-lg hover:border-emerald-500/50">
            Login to Dashboard
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-center mb-8">Investment Tiers</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div key={p.name} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-3xl font-extrabold text-emerald-400 mt-2">
                {p.price} <span className="text-sm font-medium text-slate-400">USDT</span>
              </p>
              <ul className="mt-4 space-y-1 text-sm text-slate-300">
                <li>• {p.days} days duration</li>
                <li>• {p.daily} USDT daily claim</li>
                <li>• {p.note}</li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        Next.js App Router · Cloudflare Pages · KV USDTSTORAGE
      </footer>
    </div>
  );
}
