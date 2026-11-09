'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { useThemeLang } from '@/components/ThemeLangProvider';

type ReferralRow = {
  userId: string;
  username: string;
  commissionEarned: number;
};

export default function InvitationPage() {
  const router = useRouter();
  const { t } = useThemeLang();
  const [userId, setUserId] = useState('');
  const [earnings, setEarnings] = useState(0);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
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
        setEarnings(Number(d.user.referralEarnings || 0));

        if (Array.isArray(d.user.referralList) && d.user.referralList.length) {
          setReferrals(
            d.user.referralList.map((r: any) => ({
              userId: String(r.userId || ''),
              username: String(r.username || 'User'),
              commissionEarned: Number(r.commissionEarned || 0),
            }))
          );
        } else {
          const ids: string[] = d.user.referrals || [];
          setReferrals(
            ids.map((id) => ({
              userId: id,
              username: `User ${String(id).slice(0, 6)}`,
              commissionEarned: 0,
            }))
          );
        }
      });
  }, [router]);

  const link = `${origin}/signup?ref=${userId}`;

  return (
    <div className="page-shell pb-24 relative">
      <div className="fixed inset-0 pointer-events-none mesh-bg" />
      <UserNav />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 relative z-10">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-extrabold">{t.invite} · 20%</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Earn 20% of your friends&apos; daily claims from paid plans
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-transparent p-6 text-center">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {t.referralEarnings}
          </p>
          <p className="text-4xl font-black text-emerald-500 mt-1">{earnings.toFixed(2)}</p>
          <p className="text-sm text-emerald-600">USDT</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full panel-card text-sm">
            <span style={{ color: 'var(--muted)' }}>Referrals</span>
            <span className="font-bold">{referrals.length}</span>
          </div>
        </div>

        <div className="panel-card p-4 text-sm space-y-2" style={{ color: 'var(--muted)' }}>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>
            How referral works
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-emerald-500">20%</strong> of each daily claim from{' '}
              <strong>paid plans</strong> (Silver, Gold, Platinum…)
            </li>
            <li>Free Bronze plan claims do <strong>not</strong> pay commission</li>
            <li>Deposits and plan purchase price do <strong>not</strong> pay commission</li>
          </ul>
        </div>

        <div className="panel-card p-4 space-y-3">
          <p className="text-sm font-semibold">{t.copyLink}</p>
          <code
            className="text-xs break-all block p-3 rounded-xl font-mono border"
            style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          >
            {userId ? link : '…'}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(link);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            disabled={!userId}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {copied ? 'Copied!' : t.copyLink}
          </button>
          <div className="flex items-center justify-between text-xs pt-1" style={{ color: 'var(--muted)' }}>
            <span>
              Your referral code:{' '}
              <strong className="text-emerald-500 font-mono">{userId || '—'}</strong>
            </span>
            <button
              type="button"
              onClick={() => userId && navigator.clipboard.writeText(userId)}
              className="text-emerald-500 font-medium"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="panel-card overflow-hidden">
          <div
            className="px-4 py-3 border-b flex items-center justify-between gap-2"
            style={{ borderColor: 'var(--border)' }}
          >
            <h2 className="font-semibold">Referred users</h2>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              Commission earned
            </span>
          </div>
          {referrals.length === 0 ? (
            <p className="p-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
              Share your link — referrals appear here when they sign up.
            </p>
          ) : (
            <ul className="divide-y max-h-80 overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
              {referrals.map((row, i) => (
                <li
                  key={row.userId || i}
                  className="px-4 py-3 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: 'var(--border)', color: 'var(--text)' }}
                    >
                      {(row.username || '?').slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{row.username}</p>
                      <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                        #{i + 1}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-emerald-500">
                      +{Number(row.commissionEarned || 0).toFixed(2)}
                    </p>
                    <p className="text-[10px] uppercase" style={{ color: 'var(--muted)' }}>
                      USDT
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
