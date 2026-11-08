import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/5 sticky top-0 glass z-20">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold">
            USDT<span className="text-emerald-400">Earn</span>
          </Link>
          <Link href="/privacy" className="text-sm text-slate-400 hover:text-white">
            Privacy
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-10 prose prose-invert prose-sm">
        <h1 className="text-3xl font-black mb-6">Terms of Service</h1>
        <p className="text-slate-400 text-sm mb-6">Last updated: {new Date().toISOString().slice(0, 10)}</p>
        <div className="space-y-5 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Acceptance</h2>
            <p>
              By creating an account or using USDT Earn, you agree to these Terms. If you do not agree,
              do not use the platform.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Eligibility</h2>
            <p>
              You must be legally allowed to use cryptocurrency services in your jurisdiction. You are
              responsible for compliance with local laws.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Deposits & network risk</h2>
            <p>
              Deposits are accepted in USDT TRC-20 only. Sending assets on an unsupported network or to
              an incorrect address may result in irreversible loss. Always verify the deposit address
              shown in your dashboard.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. Plans & yields</h2>
            <p>
              Investment plans and daily claim amounts are described in the application. Yields are not
              guaranteed bank interest; plan parameters may be updated by the operator. Claims are
              subject to plan status and claim windows.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. Withdrawals</h2>
            <p>
              Withdrawals are subject to minimum limits and administrative review. Processing times are
              estimates and may vary. Fraudulent activity may result in delayed or rejected withdrawals.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">6. Accounts</h2>
            <p>
              You are responsible for safeguarding your credentials. The operator may suspend accounts
              that violate these Terms or abuse the platform.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">7. Limitation of liability</h2>
            <p>
              The platform is provided as-is. To the maximum extent permitted by law, the operator is
              not liable for indirect losses, blockchain network failures, or user error when sending
              funds.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">8. Contact</h2>
            <p>
              For support, visit the{' '}
              <Link href="/support" className="text-emerald-400 hover:underline">
                Support
              </Link>{' '}
              page.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
