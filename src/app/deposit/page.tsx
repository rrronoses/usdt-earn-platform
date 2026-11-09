'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { useThemeLang } from '@/components/ThemeLangProvider';

export default function DepositPage() {
  const router = useRouter();
  const { t } = useThemeLang();
  const [user, setUser] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [depAmount, setDepAmount] = useState('');
  const [depInfo, setDepInfo] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMe = useCallback(() => {
    return fetch('/api/me')
      .then((r) => r.json())
      .then((d: any) => {
        if (!d.ok) {
          router.push('/login');
          return null;
        }
        setUser(d.user);
        setConfig(d.config || null);
        return d;
      })
      .catch(() => null);
  }, [router]);

  useEffect(() => {
    loadMe();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loadMe]);

  function stopPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    pollRef.current = null;
    timerRef.current = null;
  }

  function startPolling(depositId: string) {
    stopPolling();
    setSecondsLeft(240);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          stopPolling();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    pollRef.current = setInterval(async () => {
      try {
        const d: any = await fetch(
          `/api/deposit/check-status?depositId=${encodeURIComponent(depositId)}`
        ).then((r) => r.json());
        if (d.ok && (d.credited || d.status === 'approved' || d.status === 'completed')) {
          stopPolling();
          setMsg(`Deposit confirmed! +${Number(d.creditedAmount || 0).toFixed(2)} USDT`);
          setDepInfo(null);
          loadMe();
        }
      } catch {
        /* ignore */
      }
    }, 10000);
  }

  async function startDeposit() {
    const amount = parseFloat(depAmount);
    if (!amount || amount <= 0) {
      setMsg('Enter a valid amount');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const d: any = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      }).then((r) => r.json());

      if (!d.ok) {
        setMsg(d.message || 'Failed');
        // Still show address if API returned one (resume edge cases)
        if (d.depositId && d.address) {
          setDepInfo({ address: d.address, amount: d.amount || amount, depositId: d.depositId });
          startPolling(d.depositId);
        }
        return;
      }

      if (!d.address) {
        setMsg(d.message || 'No deposit address returned. Ask admin to enable a TRC-20 wallet.');
        return;
      }

      setDepInfo({ address: d.address, amount: d.amount || amount, depositId: d.depositId });
      setMsg(
        d.resume
          ? 'Pending deposit resumed. Send the exact amount to the address below.'
          : 'Send exact USDT on TRC-20 only to the address below.'
      );
      startPolling(d.depositId);
    } catch {
      setMsg('Network error');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const minD = config?.minDepositLimit ?? 1;
  const maxD = config?.maxDepositLimit;

  return (
    <div className="page-shell pb-28 relative">
      <div className="fixed inset-0 pointer-events-none mesh-bg" />
      <UserNav />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">{t.deposit}</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              USDT TRC-20 only
            </p>
          </div>
          <Link href="/account" className="text-sm text-emerald-500 font-semibold">
            ← {t.account}
          </Link>
        </div>

        {msg && (
          <div className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-sm text-center">
            {msg}
          </div>
        )}

        <div className="panel-card p-4">
          <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
            Deposit balance
          </p>
          <p className="text-3xl font-black text-emerald-500 mt-1">
            {Number(user.depositBalance).toFixed(2)}{' '}
            <span className="text-sm font-semibold">USDT</span>
          </p>
        </div>

        <div className="note-box space-y-2">
          <p className="font-bold text-amber-600 dark:text-amber-300">{t.depositNotes}</p>
          <ul className="list-disc pl-4 space-y-1.5" style={{ color: 'var(--muted)' }}>
            <li>
              Only send <strong>USDT on TRON (TRC-20)</strong>. Other networks = permanent loss.
            </li>
            <li>Send the <strong>exact amount</strong> shown after you generate an address.</li>
            <li>
              Limits:{' '}
              <strong>
                min {minD} USDT{maxD ? ` · max ${maxD} USDT` : ''}
              </strong>
            </li>
            <li>After sending, wait for on-chain confirmation (usually 1–3 minutes).</li>
            <li>
              Use the 4:00 timer window, or tap <strong>Check chain now</strong>.
            </li>
            <li>Deposit balance is used to buy plans (not the same as withdrawal balance).</li>
          </ul>
        </div>

        <div className="panel-card p-4 space-y-3">
          {!depInfo ? (
            <>
              <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                Amount (USDT)
              </label>
              <input
                type="number"
                min={minD}
                step="0.01"
                value={depAmount}
                onChange={(e) => setDepAmount(e.target.value)}
                placeholder={`Min ${minD}`}
                className="input-field"
              />
              <button onClick={startDeposit} disabled={loading} className="btn-primary w-full">
                {loading ? 'Please wait…' : t.generateAddress}
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-center">
                Send exactly <strong className="text-emerald-500">{depInfo.amount} USDT</strong> on{' '}
                <strong>TRC-20</strong>
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=168x168&data=${encodeURIComponent(
                  depInfo.address
                )}`}
                alt="QR"
                className="mx-auto rounded-2xl bg-white p-2.5 shadow-lg"
              />
              <div
                className="flex gap-2 items-center rounded-xl p-3 border"
                style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
              >
                <code className="text-xs break-all flex-1 font-mono">{depInfo.address}</code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(depInfo.address);
                    setMsg('Address copied');
                  }}
                  className="text-emerald-500 text-sm font-bold shrink-0 px-2"
                >
                  Copy
                </button>
              </div>
              {secondsLeft > 0 && (
                <p className="text-center font-mono text-2xl text-amber-500 tracking-widest">
                  {mm}:{ss}
                </p>
              )}
              <button
                type="button"
                onClick={async () => {
                  const d: any = await fetch('/api/deposit/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ depositId: depInfo.depositId }),
                  }).then((r) => r.json());
                  if (d.credited) {
                    stopPolling();
                    setMsg(`Credited ${d.amount} USDT`);
                    setDepInfo(null);
                    loadMe();
                  } else setMsg(d.reason || 'Not confirmed on-chain yet');
                }}
                className="btn-ghost w-full text-sm"
              >
                {t.checkChain}
              </button>
              <button
                type="button"
                onClick={() => {
                  stopPolling();
                  setDepInfo(null);
                }}
                className="w-full text-sm py-2"
                style={{ color: 'var(--muted)' }}
              >
                Cancel / new amount
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
