import Link from 'next/link';

const plans = [
  {
    name: 'Bronze',
    price: 3,
    days: 7,
    daily: 1,
    total: 7,
    note: 'Free on signup',
    accent: 'from-amber-600/30 to-amber-900/10',
    ring: 'border-amber-500/30',
    badge: null as string | null,
    highlight: false,
  },
  {
    name: 'Silver',
    price: 10,
    days: 28,
    daily: 1,
    total: 28,
    note: 'Rebuy after expire',
    accent: 'from-slate-400/20 to-slate-800/10',
    ring: 'border-slate-500/40',
    badge: null,
    highlight: false,
  },
  {
    name: 'Gold',
    price: 25,
    days: 28,
    daily: 2,
    total: 56,
    note: 'Popular choice',
    accent: 'from-yellow-500/25 to-amber-900/10',
    ring: 'border-yellow-500/50',
    badge: 'Popular',
    highlight: true,
  },
  {
    name: 'Gold Plus',
    price: 40,
    days: 28,
    daily: 5,
    total: 140,
    note: 'High daily yield',
    accent: 'from-orange-500/25 to-orange-900/10',
    ring: 'border-orange-500/40',
    badge: null,
    highlight: false,
  },
  {
    name: 'Platinum',
    price: 60,
    days: 28,
    daily: 7,
    total: 196,
    note: 'Maximum returns',
    accent: 'from-emerald-500/30 to-cyan-900/20',
    ring: 'border-emerald-400/60',
    badge: 'Best value',
    highlight: true,
  },
];

const steps = [
  { n: '01', title: 'Create free account', desc: 'Sign up in seconds and receive 3 USDT + Bronze plan instantly.' },
  { n: '02', title: 'Deposit USDT TRC-20', desc: 'Send USDT on TRON. Auto-credit after on-chain confirmation.' },
  { n: '03', title: 'Buy a yield plan', desc: 'Choose a tier. Higher plans unlock bigger daily claims.' },
  { n: '04', title: 'Claim every day', desc: 'Tap claim once per day. Earnings go to your withdrawal balance.' },
];

const features = [
  { title: 'Daily claims', desc: 'Unlock yield every 24 hours from active plans.' },
  { title: '20% referral', desc: 'Earn commission when friends buy paid plans.' },
  { title: 'TRC-20 deposits', desc: 'USDT on TRON with automated verification.' },
  { title: 'Fast withdrawals', desc: 'Request anytime. Admin review in 2–3 hours.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="absolute top-1/3 -left-32 w-[360px] h-[360px] rounded-full bg-teal-500/10 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[280px] h-[280px] rounded-full bg-cyan-500/10 blur-[90px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/5 glass sticky top-0">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-lg shadow-lg shadow-emerald-500/30">
              ₮
            </span>
            <span>
              USDT<span className="text-emerald-400">Earn</span>
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-300">
            <a href="#plans" className="hover:text-white transition">Plans</a>
            <a href="#how" className="hover:text-white transition">How it works</a>
            <a href="#features" className="hover:text-white transition">Features</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="text-sm text-slate-300 hover:text-white px-3 py-2">
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/25"
            >
              Get 3 USDT Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pt-16 sm:pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live on Cloudflare · USDT TRC-20
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
          Earn USDT
          <br />
          <span className="text-gradient">every single day</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          Choose a plan, claim daily yield, and grow with 20% referral commissions.
          Start free — no deposit required for your first Bronze plan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12">
          <Link
            href="/signup"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-lg shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition"
          >
            Start free — 3 USDT bonus
          </Link>
          <a
            href="#plans"
            className="px-8 py-4 rounded-2xl border border-slate-600/80 font-semibold text-lg hover:border-emerald-500/50 hover:bg-white/5 transition"
          >
            View plans
          </a>
        </div>

        {/* Trust strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {[
            { k: '3 USDT', v: 'Signup bonus' },
            { k: '20%', v: 'Referral cut' },
            { k: 'Daily', v: 'Claim cycle' },
            { k: 'TRC-20', v: 'USDT network' },
          ].map((s) => (
            <div key={s.v} className="rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-4">
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-400">{s.k}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Choose your yield plan</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Clear prices. Daily claims. Higher tiers unlock more USDT every day.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {plans.map((p) => {
            const roi = p.price > 0 ? Math.round((p.total / p.price) * 100) : 0;
            return (
              <div
                key={p.name}
                className={`relative rounded-3xl border bg-gradient-to-b ${p.accent} ${p.ring} p-6 card-hover ${
                  p.highlight ? 'lg:scale-[1.02] glow-emerald border-emerald-400/50' : 'border-white/5 bg-slate-900/40'
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold shadow-lg">
                    {p.badge}
                  </span>
                )}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-xl">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{p.note}</p>
                  </div>
                  {p.price > 3 && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-lg bg-white/5 text-emerald-300 border border-white/10">
                      {roi}% cycle
                    </span>
                  )}
                </div>
                <p className="mt-5 text-4xl font-black tracking-tight">
                  {p.price}
                  <span className="text-sm font-semibold text-slate-400 ml-1">USDT</span>
                </p>
                <ul className="mt-5 space-y-2.5 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span>
                    {p.days} days duration
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span>
                    <strong className="text-emerald-300">{p.daily} USDT</strong> daily claim
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span>
                    Up to <strong className="text-white">{p.total} USDT</strong> total yield
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className={`mt-6 block w-full text-center py-3 rounded-xl font-bold transition ${
                    p.highlight
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/30'
                      : 'bg-white/10 hover:bg-white/15 border border-white/10'
                  }`}
                >
                  {p.price === 3 ? 'Claim free plan' : 'Get this plan'}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">How USDT Earn works</h2>
          <p className="text-slate-400">Four simple steps from signup to daily income</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-white/5 bg-slate-900/50 p-5 card-hover">
              <span className="text-3xl font-black text-emerald-500/40">{s.n}</span>
              <h3 className="font-bold text-lg mt-2">{s.title}</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-900/80 to-teal-500/10 p-8 sm:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Built for daily earners</h2>
            <p className="text-slate-400">Everything you need in one clean dashboard</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4 rounded-2xl bg-black/20 border border-white/5 p-5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                  ◆
                </div>
                <div>
                  <h3 className="font-bold">{f.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 sm:p-12 glow-emerald">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to earn USDT?</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Join USDT Earn today. Free Bronze plan + 3 USDT bonus on signup — no card needed.
          </p>
          <Link
            href="/signup"
            className="inline-flex px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-lg shadow-xl shadow-emerald-500/30 hover:scale-[1.02] transition"
          >
            Create free account
          </Link>
          <p className="text-xs text-slate-500 mt-4">Already have an account? <Link href="/login" className="text-emerald-400 hover:underline">Login</Link></p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-10 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 font-bold text-slate-300 mb-2">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-sm">₮</span>
          USDT<span className="text-emerald-400">Earn</span>
        </div>
        <p className="text-xs text-slate-600">© {new Date().getFullYear()} USDT Earn · usdtearn.pages.dev</p>
      </footer>
    </div>
  );
}
