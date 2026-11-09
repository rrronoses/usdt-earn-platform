'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PublicHeader } from '@/components/PublicHeader';
import { useThemeLang } from '@/components/ThemeLangProvider';

export default function SupportPage() {
  const { t } = useThemeLang();
  const [copied, setCopied] = useState(false);
  const [telegram, setTelegram] = useState('https://t.me/');
  const [email, setEmail] = useState('support@usdtearn.pages.dev');

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((d: any) => {
        if (d.ok && d.config) {
          if (d.config.supportTelegram) setTelegram(d.config.supportTelegram);
          if (d.config.supportEmail) setEmail(d.config.supportEmail);
        }
      })
      .catch(() => {});
  }, []);

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
    <div className="page-shell">
      <PublicHeader rightLink={{ href: '/faq', label: t.faq }} />
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-black">{t.support}</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
            Need help with deposits, withdrawals, or your account? Reach us through the channels below.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <a
            href={telegram || '#'}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-5 hover:bg-sky-500/15 transition"
          >
            <p className="text-2xl mb-2">✈️</p>
            <p className="font-bold">Telegram</p>
            <p className="text-sm mt-1 break-all" style={{ color: 'var(--muted)' }}>
              {telegram || 'Not configured'}
            </p>
          </a>
          <button
            type="button"
            onClick={copyEmail}
            className="panel-card p-5 text-left hover:border-emerald-500/30 transition"
          >
            <p className="text-2xl mb-2">✉️</p>
            <p className="font-bold">Email</p>
            <p className="text-sm text-emerald-500 mt-1 break-all">{email || 'Not configured'}</p>
            <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
              {copied ? 'Copied!' : 'Tap to copy'}
            </p>
          </button>
        </div>

        <div className="panel-card p-5 text-sm space-y-2">
          <p className="font-semibold">Before contacting support</p>
          <ul className="list-disc pl-5 space-y-1" style={{ color: 'var(--muted)' }}>
            <li>Confirm you sent USDT on the TRC-20 (TRON) network only.</li>
            <li>Keep your deposit transaction hash ready.</li>
            <li>Check the FAQ for claim and referral rules.</li>
          </ul>
          <Link href="/faq" className="inline-block text-emerald-500 hover:underline mt-2">
            Open FAQ →
          </Link>
        </div>
      </main>
    </div>
  );
}
