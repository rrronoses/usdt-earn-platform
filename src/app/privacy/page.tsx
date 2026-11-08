import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/5 sticky top-0 glass z-20">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold">
            USDT<span className="text-emerald-400">Earn</span>
          </Link>
          <Link href="/terms" className="text-sm text-slate-400 hover:text-white">
            Terms
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black mb-2">Privacy Policy</h1>
        <p className="text-slate-400 text-sm mb-8">Last updated: {new Date().toISOString().slice(0, 10)}</p>
        <div className="space-y-5 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">Information we store</h2>
            <p>
              Account data such as username, email, hashed password, balances, plan purchases,
              referral relationships, and transaction records related to platform activity.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">How we use data</h2>
            <p>
              Data is used to operate the service: authentication, deposits, claims, withdrawals,
              referrals, fraud prevention, and customer support.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">Blockchain data</h2>
            <p>
              Deposit verification uses public blockchain data (TRON TRC-20 transfers). On-chain
              transactions are inherently public.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">Cookies</h2>
            <p>
              Session cookies keep you logged in. Theme and language preferences may be stored in
              your browser (local storage).
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">Contact</h2>
            <p>
              Questions about privacy can be sent via the{' '}
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
