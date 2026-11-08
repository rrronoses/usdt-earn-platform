import Link from 'next/link';

const FAQS = [
  {
    q: 'How do I start?',
    a: 'Create a free account. You receive 3 USDT and a Bronze plan automatically. Claim daily earnings from the dashboard.',
  },
  {
    q: 'Which network is used for deposits?',
    a: 'Only USDT on TRON (TRC-20). Sending on another network may result in permanent loss.',
  },
  {
    q: 'How are deposits credited?',
    a: 'After you generate a deposit address and send the exact USDT amount, our system verifies the transfer on-chain and credits your deposit balance automatically.',
  },
  {
    q: 'How do claims work?',
    a: 'Each active plan can be claimed once every 24 hours. If you hold multiple plans, claim each plan separately.',
  },
  {
    q: 'What is the referral program?',
    a: 'Share your referral link. When a referred user buys a paid plan, you earn 20% commission to your withdrawal balance.',
  },
  {
    q: 'What is the minimum withdrawal?',
    a: 'The minimum is set by the administrator (default 25 USDT). Withdrawals are reviewed and typically processed within a few hours.',
  },
  {
    q: 'Can I buy the same plan more than once?',
    a: 'Bronze is granted once at signup. Paid plans can be purchased again after the previous one expires.',
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/5 sticky top-0 glass z-20">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold">USDT<span className="text-emerald-400">Earn</span></Link>
          <Link href="/support" className="text-sm text-emerald-400 font-semibold">Support</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black mb-2">FAQ</h1>
        <p className="text-slate-400 text-sm mb-8">Answers to common questions about USDT Earn.</p>
        <div className="space-y-3">
          {FAQS.map((item) => (
            <details key={item.q} className="group rounded-2xl border border-white/10 bg-slate-900/50 open:border-emerald-500/30">
              <summary className="cursor-pointer list-none px-5 py-4 font-semibold flex items-center justify-between gap-3">
                {item.q}
                <span className="text-slate-500 group-open:rotate-45 transition text-lg">+</span>
              </summary>
              <p className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </main>
    </div>
  );
}
