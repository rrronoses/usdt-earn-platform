'use client';

import Link from 'next/link';
import { ThemeLangToggles, useThemeLang } from './ThemeLangProvider';

export function PublicHeader({
  rightLink,
}: {
  rightLink?: { href: string; label: string };
}) {
  const { t } = useThemeLang();

  return (
    <header
      className="border-b sticky top-0 z-40 glass"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold shrink-0">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-sm">
            ₮
          </span>
          <span>
            USDT<span className="text-emerald-500">Earn</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm" style={{ color: 'var(--muted)' }}>
          <Link href="/#plans" className="hover:text-emerald-500 transition">
            {t.plans}
          </Link>
          <Link href="/calculator" className="hover:text-emerald-500 transition">
            {t.calculator}
          </Link>
          <Link href="/#how" className="hover:text-emerald-500 transition">
            {t.howItWorks}
          </Link>
          <Link href="/faq" className="hover:text-emerald-500 transition">
            {t.faq}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeLangToggles />
          {rightLink ? (
            <Link href={rightLink.href} className="text-sm font-semibold text-emerald-500">
              {rightLink.label}
            </Link>
          ) : (
            <Link
              href="/signup"
              className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-sm font-bold"
            >
              {t.signup}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

/** Floating toggles for auth pages (login/signup/admin) */
export function AuthTogglesBar() {
  return (
    <div className="absolute top-4 right-4 z-50">
      <ThemeLangToggles />
    </div>
  );
}
