'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function InvitationPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [earnings, setEarnings] = useState(0);
  const [referrals, setReferrals] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d: any) => {
        if (!d.ok) {
          router.push('/login');
          return;
        }
        setUserId(d.user.id);
        setEarnings(d.user.referralEarnings || 0);
        setReferrals(d.user.referrals || []);
      });
  }, [router]);

  const link =
    typeof window !== 'undefined'
      ? `${window.location.origin}/signup?ref=${userId}`
      : `/signup?ref=${userId}`;

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <header className="border-b border-slate-800 sticky top-0 bg-slate-950/90 backdrop-blur z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-slate-400 text-sm">← Dashboard</Link>
          <span className="font-bold">Invitation</span>
          <span className="w-16" />
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
          <p className="text-sm text-slate-300">Referral earnings (20% of paid plans)</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-1">{earnings.toFixed(2)} USDT</p>
          <p className="text-xs text-slate-400 mt-2">{referrals.length} referred users</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <p className="text-sm font-medium">Your referral link</p>
          <code className="text-xs break-all block bg-slate-950 p-3 rounded-lg">{link}</code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(link);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="w-full py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold"
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <p className="text-xs text-slate-500">
            Your user ID / referral code: <strong className="text-slate-300">{userId}</strong>
          </p>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Referrals</h2>
          {referrals.length === 0 ? (
            <p className="text-slate-500 text-sm">No referrals yet</p>
          ) : (
            <ul className="space-y-2">
              {referrals.map((id) => (
                <li key={id} className="rounded-lg border border-slate-800 px-3 py-2 text-sm font-mono">{id}</li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
