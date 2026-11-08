'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SupportPage() {
  const [copied, setCopied] = useState(false);
  // Replace with your real support channel
  const telegram = 'https://t.me/';
  const email = 'support@usdtearn.pages.dev';

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/5 sticky top-0 glass z-20">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold">
            USDT<span className="text-emerald-400">Earn</span>
          </Link>
          <Link href="/faq" className="text-sm text-emerald-400 font-semibold">
            FAQ
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-black">Support</h1>
          <p className="text-slate-400 text-sm mt-2">
            Need help with deposits, withdrawals, or your account? Reach us through the channels below.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <a
            href={telegram}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-5 hover:bg-sky-500/15 transition"
          >
            <p className="text-2xl mb-2">✈️</p>
            <p className="font-bold">Telegram</p>
            <p className="text-sm text-slate-400 mt-1">Fastest response for live issues</p>
          </a>
          <button
            type="button"
            onClick={copyEmail}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-left hover:border-emerald-500/30 transition"
          >
            <p className="text-2xl mb-2">✉️</p>
            <p className="font-bold">Email</p>
            <p className="text-sm text-emerald-400 mt-1 break-all">{email}</p>
            <p className="text-xs text-slate-500 mt-2">{copied ? 'Copied!' : 'Tap to copy'}</p>
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 text-sm text-slate-400 space-y-2">
          <p className="font-semibold text-white">Before contacting support</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Confirm you sent USDT on the TRC-20 (TRON) network only.</li>
            <li>Keep your deposit transaction hash ready.</li>
            <li>Check the FAQ for claim and referral rules.</li>
          </ul>
          <Link href="/faq" className="inline-block text-emerald-400 hover:underline mt-2">
            Open FAQ →
          </Link>
        </div>
      </main>
    </div>
  );
}
