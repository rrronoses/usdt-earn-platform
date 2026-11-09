'use client';

import Link from 'next/link';
import { PublicHeader } from '@/components/PublicHeader';
import { useThemeLang } from '@/components/ThemeLangProvider';

export default function PrivacyPage() {
  const { t } = useThemeLang();

  return (
    <div className="page-shell">
      <PublicHeader rightLink={{ href: '/terms', label: t.terms }} />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black mb-2">Privacy Policy</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
          Last updated: {new Date().toISOString().slice(0, 10)}
        </p>
        <div className="space-y-5 text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
          <section className="panel-card p-5">
            <h2 className="text-lg font-bold mb-2">Information we store</h2>
            <p style={{ color: 'var(--muted)' }}>
              Account data such as username, email, hashed password, balances, plan purchases,
              referral relationships, and transaction records related to platform activity.
            </p>
          </section>
          <section className="panel-card p-5">
            <h2 className="text-lg font-bold mb-2">How we use data</h2>
            <p style={{ color: 'var(--muted)' }}>
              Data is used to operate the service: authentication, deposits, claims, withdrawals,
              referrals, fraud prevention, and customer support.
            </p>
          </section>
          <section className="panel-card p-5">
            <h2 className="text-lg font-bold mb-2">Blockchain data</h2>
            <p style={{ color: 'var(--muted)' }}>
              Deposit verification uses public blockchain data (TRON TRC-20 transfers). On-chain
              transactions are inherently public.
            </p>
          </section>
          <section className="panel-card p-5">
            <h2 className="text-lg font-bold mb-2">Cookies</h2>
            <p style={{ color: 'var(--muted)' }}>
              Session cookies keep you logged in. Theme and language preferences may be stored in
              your browser (local storage).
            </p>
          </section>
          <section className="panel-card p-5">
            <h2 className="text-lg font-bold mb-2">Contact</h2>
            <p style={{ color: 'var(--muted)' }}>
              Questions about privacy can be sent via the{' '}
              <Link href="/support" className="text-emerald-500 hover:underline">
                {t.support}
              </Link>{' '}
              page.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
