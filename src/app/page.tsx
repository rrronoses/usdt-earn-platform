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
  noteKey: 'freeOnSignup' | 'rebuyAfter' | 'popularChoice' | 'highDaily' | 'maxReturns';
  badgeKey: 'popular' | 'bestValue' | null;
  highlight: boolean;
}

const plans: PlanShowcase[] = [
  { name: 'Bronze', price: 3, days: 7, daily: 1, total: 7, noteKey: 'freeOnSignup', badgeKey: null, highlight: false },
  { name: 'Silver', price: 10, days: 28, daily: 1, total: 28, noteKey: 'rebuyAfter', badgeKey: null, highlight: false },
  { name: 'Gold', price: 25, days: 28, daily: 2, total: 56, noteKey: 'popularChoice', badgeKey: 'popular', highlight: true },
  { name: 'Gold Plus', price: 40, days: 28, daily: 5, total: 140, noteKey: 'highDaily', badgeKey: null, highlight: false },
  { name: 'Platinum', price: 60, days: 28, daily: 7, total: 196, noteKey: 'maxReturns', badgeKey: 'bestValue', highlight: true },
];

export default function HomePage() {
  const { t } = useThemeLang();

  const steps = [
    { n: '01', title: t.step1Title, desc: t.step1Desc },
    { n: '02', title: t.step2Title, desc: t.step2Desc },
    { n: '03', title: t.step3Title, desc: t.step3Desc },
    { n: '04', title: t.step4Title, desc: t.step4Desc },
  ];

  const features = [
    { title: t.feat1Title, desc: t.feat1Desc },
    { title: t.feat2Title, desc: t.feat2Desc },
    { title: t.feat3Title, desc: t.feat3Desc },
    { title: t.feat4Title, desc: t.feat4Desc },
  ];

  const stats = [
    { k: '3 USDT', v: t.signupBonus },
    { k: '20%', v: t.referralCut },
    { k: 'Daily', v: t.claimCycle },
    { k: 'TRC-20', v: t.usdtNetwork },
  ];

  return (
    <div className="page-shell overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden mesh-bg" />

      <header
        className="relative z-50 border-b glass sticky top-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight shrink-0">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-lg shadow-lg shadow-emerald-500/30">
              ₮
            </span>
            <span>
              USDT<span className="text-emerald-500">Earn</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm" style={{ color: 'var(--muted)' }}>
            <a href="#plans" className="hover:text-emerald-500 transition">
              {t.plans}
            </a>
            <Link href="/calculator" className="hover:text-emerald-500 transition">
              {t.calculator}
            </Link>
            <a href="#how" className="hover:text-emerald-500 transition">
              {t.howItWorks}
            </a>
            <Link href="/faq" className="hover:text-emerald-500 transition">
              {t.faq}
            </Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeLangToggles />
            <Link
              href="/login"
              className="text-sm px-2 py-2 hidden sm:inline"
              style={{ color: 'var(--muted)' }}
            >
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {t.networkBadge}
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
          <span className="text-gradient">{t.heroTitle}</span>
        </h1>
        <p className="text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color: 'var(--muted)' }}>
          {t.heroSub}
        </p>
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
          {stats.map((s) => (
            <div key={s.v} className="rounded-2xl panel-card px-3 py-4 card-hover">
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-500">{s.k}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                {s.v}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="plans" className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">{t.plans}</h2>
          <p className="max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
            {t.plansSub}{' '}
            <Link href="/calculator" className="text-emerald-500 hover:underline">
              {t.tryCalculator}
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
                    ? 'border-emerald-400/50 bg-gradient-to-b from-emerald-500/15 to-transparent glow-emerald'
                    : 'panel-card'
                }`}
              >
                {p.badgeKey && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge tone="success">{t[p.badgeKey]}</Badge>
                  </span>
                )}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-xl">{p.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                      {t[p.noteKey]}
                    </p>
                  </div>
                  {p.price > 3 && <Badge tone="info">{roi}% cycle</Badge>}
                </div>
                <p className="mt-5 text-4xl font-black tracking-tight">
                  {p.price}
                  <span className="text-sm font-semibold ml-1" style={{ color: 'var(--muted)' }}>
                    USDT
                  </span>
                </p>
                <ul className="mt-5 space-y-2.5 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs">
                      ✓
                    </span>
                    {p.days} {t.daysDuration}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs">
                      ✓
                    </span>
                    <strong className="text-emerald-500">{p.daily} USDT</strong> {t.dailyClaim}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs">
                      ✓
                    </span>
                    Up to <strong>{p.total} USDT</strong> {t.totalEarn}
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className={`mt-6 block w-full text-center py-3 rounded-xl font-bold transition ${
                    p.highlight
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/30'
                      : 'btn-ghost'
                  }`}
                >
                  {p.price === 3 ? t.claimFreePlan : t.getThisPlan}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section id="how" className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">{t.howTitle}</h2>
          <p style={{ color: 'var(--muted)' }}>{t.howSub}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl panel-card p-5 card-hover">
              <span className="text-3xl font-black text-emerald-500/40">{s.n}</span>
              <h3 className="font-bold text-lg mt-2">{s.title}</h3>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--muted)' }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 p-8 sm:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">{t.featuresTitle}</h2>
            <p style={{ color: 'var(--muted)' }}>{t.featuresSub}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4 rounded-2xl panel-card p-5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold shrink-0">
                  ◆
                </div>
                <div>
                  <h3 className="font-bold">{f.title}</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="rounded-3xl panel-card p-8 sm:p-12 glow-emerald">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">{t.ctaTitle}</h2>
          <p className="mb-8 max-w-md mx-auto" style={{ color: 'var(--muted)' }}>
            {t.ctaSub}
          </p>
          <Link href="/signup">
            <Button size="lg">{t.signup}</Button>
          </Link>
          <p className="text-xs mt-4" style={{ color: 'var(--muted)' }}>
            {t.alreadyAccount}{' '}
            <Link href="/login" className="text-emerald-500 hover:underline">
              {t.login}
            </Link>
          </p>
        </div>
      </section>

      <footer
        className="relative z-10 border-t py-10 text-center text-sm"
        style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
      >
        <div className="flex items-center justify-center gap-2 font-bold mb-4">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-sm">
            ₮
          </span>
          USDT<span className="text-emerald-500">Earn</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs mb-4">
          <Link href="/calculator" className="hover:text-emerald-500">
            {t.calculator}
          </Link>
          <Link href="/faq" className="hover:text-emerald-500">
            {t.faq}
          </Link>
          <Link href="/support" className="hover:text-emerald-500">
            {t.support}
          </Link>
          <Link href="/terms" className="hover:text-emerald-500">
            {t.terms}
          </Link>
          <Link href="/privacy" className="hover:text-emerald-500">
            {t.privacy}
          </Link>
        </div>
        <p className="text-xs">© {new Date().getFullYear()} USDT Earn</p>
      </footer>
    </div>
  );
}
