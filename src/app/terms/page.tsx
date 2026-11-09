'use client';

import Link from 'next/link';
import { PublicHeader } from '@/components/PublicHeader';
import { useThemeLang } from '@/components/ThemeLangProvider';

export default function TermsPage() {
  const { t } = useThemeLang();

  return (
    <div className="page-shell">
      <PublicHeader rightLink={{ href: '/privacy', label: t.privacy }} />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black mb-6">Terms of Service</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          Last updated: {new Date().toISOString().slice(0, 10)}
        </p>
        <div className="space-y-5 text-sm leading-relaxed">
          {[
            {
              h: '1. Acceptance',
              p: 'By creating an account or using USDT Earn, you agree to these Terms. If you do not agree, do not use the platform.',
            },
            {
              h: '2. Eligibility',
              p: 'You must be legally allowed to use cryptocurrency services in your jurisdiction. You are responsible for compliance with local laws.',
            },
            {
              h: '3. Deposits & network risk',
              p: 'Deposits are accepted in USDT TRC-20 only. Sending assets on an unsupported network or to an incorrect address may result in irreversible loss. Always verify the deposit address shown in your dashboard.',
            },
            {
              h: '4. Plans & earnings',
              p: 'Investment plans and daily claim amounts are described in the application. Earnings are not guaranteed bank interest; plan parameters may be updated by the operator. Claims are subject to plan status and claim windows. Signup includes a free Bronze plan only (not extra deposit balance).',
            },
            {
              h: '5. Withdrawals',
              p: 'Withdrawals are subject to minimum limits and administrative review. Processing times are estimates and may vary. Fraudulent activity may result in delayed or rejected withdrawals.',
            },
            {
              h: '6. Accounts',
              p: 'You are responsible for safeguarding your credentials. The operator may suspend accounts that violate these Terms or abuse the platform.',
            },
            {
              h: '7. Limitation of liability',
              p: 'The platform is provided as-is. To the maximum extent permitted by law, the operator is not liable for indirect losses, blockchain network failures, or user error when sending funds.',
            },
          ].map((s) => (
            <section key={s.h} className="panel-card p-5">
              <h2 className="text-lg font-bold mb-2">{s.h}</h2>
              <p style={{ color: 'var(--muted)' }}>{s.p}</p>
            </section>
          ))}
          <section className="panel-card p-5">
            <h2 className="text-lg font-bold mb-2">8. Contact</h2>
            <p style={{ color: 'var(--muted)' }}>
              For support, visit the{' '}
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
