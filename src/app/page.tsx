'use client';

import Link from 'next/link';
import { useThemeLang, ThemeLangToggles } from '@/components/ThemeLangProvider';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface PlanShowcase {
  name: string;
  price: number;
  days: number;
  daily: number;
  total: number;
  note: string;
  badge: string | null;
  highlight: boolean;
}

const plans: PlanShowcase[] = [
  { name: 'Bronze', price: 3, days: 7, daily: 1, total: 7, note: 'Free on signup', badge: null, highlight: false },
  { name: 'Silver', price: 10, days: 28, daily: 1, total: 28, note: 'Rebuy after expire', badge: null, highlight: false },
  { name: 'Gold', price: 25, days: 28, daily: 2, total: 56, note: 'Popular choice', badge: 'Popular', highlight: true },
  { name: 'Gold Plus', price: 40, days: 28, daily: 5, total: 140, note: 'High daily yield', badge: null, highlight: false },
  { name: 'Platinum', price: 60, days: 28, daily: 7, total: 196, note: 'Maximum returns', badge: 'Best value', highlight: true },
];

const steps = [
  { n: '01', titleKey: 'Create free account' as const, desc: 'Sign up in seconds and receive 3 USDT + Bronze plan instantly.' },
  { n: '02', titleKey: 'Deposit USDT TRC-20' as const, desc: 'Send USDT on TRON. Auto-credit after on-chain confirmation.' },
  { n: '03', titleKey: 'Buy a yield plan' as const, desc: 'Choose a tier. Higher plans unlock bigger daily claims.' },
  { n: '04', titleKey: 'Claim every day' as const, desc: 'Claim each plan separately. Earnings go to withdrawal balance.' },
];

export default function HomePage() {
  const { t } = useThemeLang();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="absolute top-1/3 -left-32 w-[360px] h-[360px] rounded-full bg-teal-500/10 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[280px] h-[280px] rounded-full bg-cyan-500/10 blur-[90px]" />
      </div>

      <header className="relative z-50 border-b border-white/5 glass sticky top-0">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight shrink-0">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-lg shadow-lg shadow-emerald-500/30">
              ₮
            </span>
            <span>
              USDT<span className="text-emerald-400">Earn</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#plans" className="hover:text-white transition">
              {t.plans}
            </a>
            <Link href="/calculator" className="hover:text-white transition">
              Calculator
            </Link>
            <a href="#how" className="hover:text-white transition">
              How it works
            </a>
            <Link href="/faq" className="hover:text-white transition">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeLangToggles />
            <Link href="/login" className="text-sm text-slate-300 hover:text-white px-2 py-2 hidden xs:inline">
              {t.login}
            </Link>
            <Link
              href="/signup"
              className="px-3 sm:px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/25"
            >
              {t.getStarted.split('—')[0].trim()}
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 max-w-6xl mx-auto px-4 pt-16 sm:pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          USDT TRC-20 · Daily yield
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
          <span className="text-gradient">{t.heroTitle}</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">{t.heroSub}</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto min-w-[220px]">
              {t.getStarted}
            </Button>
          </Link>
          <a href="#plans">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto min-w-[160px]">
              {t.viewPlans}
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {[
            { k: '3 USDT', v: 'Signup bonus' },
            { k: '20%', v: 'Referral cut' },
            { k: 'Daily', v: 'Claim cycle' },
            { k: 'TRC-20', v: 'USDT network' },
          ].map((s) => (
            <div key={s.v} className="rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-4 card-hover">
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-400">{s.k}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="plans" className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">{t.plans}</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Clear prices. Daily claims. Higher tiers unlock more USDT every day.{' '}
            <Link href="/calculator" className="text-emerald-400 hover:underline">
              Try the calculator
            </Link>
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {plans.map((p) => {
            const roi = p.price > 0 ? Math.round((p.total / p.price) * 100) : 0;
            return (
              <div
                key={p.name}
                className={`relative rounded-3xl border p-6 card-hover ${
                  p.highlight
                    ? 'border-emerald-400/50 bg-gradient-to-b from-emerald-500/15 to-slate-900 glow-emerald'
                    : 'border-white/5 bg-slate-900/40'
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge tone="success">{p.badge}</Badge>
                  </span>
                )}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-xl">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{p.note}</p>
                  </div>
                  {p.price > 3 && <Badge tone="info">{roi}% cycle</Badge>}
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

      <section id="how" className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">How USDT Earn works</h2>
          <p className="text-slate-400">Four simple steps from signup to daily income</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-white/5 bg-slate-900/50 p-5 card-hover">
              <span className="text-3xl font-black text-emerald-500/40">{s.n}</span>
              <h3 className="font-bold text-lg mt-2">{s.titleKey}</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-900/80 to-teal-500/10 p-8 sm:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Built for daily earners</h2>
            <p className="text-slate-400">Everything you need in one clean dashboard</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { title: 'Per-plan claims', desc: 'Claim Bronze, Silver, Gold separately each day.' },
              { title: '20% referral', desc: 'Earn commission when friends buy paid plans.' },
              { title: 'TRC-20 deposits', desc: 'USDT on TRON with automated verification.' },
              { title: 'Fast withdrawals', desc: 'Request anytime. Admin review in 2–3 hours.' },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 rounded-2xl bg-black/20 border border-white/5 p-5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">◆</div>
                <div>
                  <h3 className="font-bold">{f.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 sm:p-12 glow-emerald">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to earn USDT?</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Join USDT Earn today. Free Bronze plan + 3 USDT bonus on signup.
          </p>
          <Link href="/signup">
            <Button size="lg">{t.signup}</Button>
          </Link>
          <p className="text-xs text-slate-500 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-400 hover:underline">
              {t.login}
            </Link>
          </p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-10 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 font-bold text-slate-300 mb-4">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-sm">₮</span>
          USDT<span className="text-emerald-400">Earn</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs mb-4">
          <Link href="/calculator" className="hover:text-emerald-400">Calculator</Link>
          <Link href="/faq" className="hover:text-emerald-400">FAQ</Link>
          <Link href="/support" className="hover:text-emerald-400">Support</Link>
          <Link href="/terms" className="hover:text-emerald-400">Terms</Link>
          <Link href="/privacy" className="hover:text-emerald-400">Privacy</Link>
        </div>
        <p className="text-xs text-slate-600">© {new Date().getFullYear()} USDT Earn</p>
      </footer>
    </div>
  );
}
