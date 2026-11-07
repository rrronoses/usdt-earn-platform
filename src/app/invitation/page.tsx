'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/UserNav';

export default function InvitationPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [earnings, setEarnings] = useState(0);
  const [referrals, setReferrals] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
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

  const link = `${origin}/signup?ref=${userId}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-72 h-72 bg-emerald-500/15 blur-[100px] rounded-full" />
      </div>
      <UserNav />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 relative z-10">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-extrabold">Invite & earn 20%</h1>
          <p className="text-sm text-slate-400 mt-1">Commission on every paid plan your friends buy</p>
        </div>

        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-teal-900/20 p-6 text-center shadow-lg shadow-emerald-500/10">
          <p className="text-sm text-slate-300">Referral earnings</p>
          <p className="text-4xl font-black text-emerald-400 mt-1">{earnings.toFixed(2)}</p>
          <p className="text-sm text-emerald-300/80">USDT</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/30 border border-white/10 text-sm">
            <span className="text-slate-400">Referrals</span>
            <span className="font-bold text-white">{referrals.length}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 space-y-3">
          <p className="text-sm font-semibold">Your referral link</p>
          <code className="text-xs break-all block bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-slate-300">
            {userId ? link : '…'}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(link);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            disabled={!userId}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {copied ? 'Copied!' : 'Copy referral link'}
          </button>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              User ID / code:{' '}
              <strong className="text-emerald-400 font-mono">{userId || '—'}</strong>
            </span>
            <button
              type="button"
              onClick={() => userId && navigator.clipboard.writeText(userId)}
              className="text-emerald-400 font-medium"
            >
              Copy ID
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-slate-900/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h2 className="font-semibold">Referred users</h2>
          </div>
          {referrals.length === 0 ? (
            <p className="p-6 text-center text-slate-500 text-sm">
              Share your link — referrals appear here when they sign up.
            </p>
          ) : (
            <ul className="divide-y divide-white/5 max-h-64 overflow-y-auto">
              {referrals.map((id, i) => (
                <li key={id} className="px-4 py-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500">#{i + 1}</span>
                  <code className="font-mono text-emerald-300">{id}</code>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
