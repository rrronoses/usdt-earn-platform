'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { useThemeLang } from '@/components/ThemeLangProvider';

type Tx = {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  timestamp: string;
  address?: string;
};

function shortAddr(addr?: string) {
  if (!addr) return '';
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

/** Keep all pending; drop only superseded pending when a later final exists for same request window. */
function uniqueWithdrawals(list: Tx[]): Tx[] {
  const withdrawals = list.filter((tx) => tx.type === 'withdrawal');
  const finals = withdrawals.filter(
    (t) => t.status === 'approved' || t.status === 'rejected' || t.status === 'completed'
  );
  const seen = new Set<string>();
  const out: Tx[] = [];

  for (const tx of withdrawals) {
    if (seen.has(tx.id)) continue;
    seen.add(tx.id);

    if (tx.status === 'pending') {
      const tTime = new Date(tx.timestamp).getTime();
      const superseded = finals.some((f) => {
        if (f.id === tx.id) return true;
        if (Math.abs(Number(f.amount) - Number(tx.amount)) >= 0.000001) return false;
        const fTime = new Date(f.timestamp).getTime();
        return fTime >= tTime - 30_000 && fTime <= tTime + 2 * 60 * 60 * 1000;
      });
      if (superseded) continue;
    }
    out.push(tx);
  }

  return out.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

export default function WithdrawPage() {
  const router = useRouter();
  const { t } = useThemeLang();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [minW, setMinW] = useState(25);
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d: any) => {
        if (!d.ok) {
          router.push('/login');
          return;
        }
        setUser(d.user);
        setTransactions(d.transactions || []);
        setMinW(d.config?.minWithdrawalLimit ?? 25);
        setNote(
          d.config?.withdrawalNote ||
            'Withdrawal is received in 2-3 hours after admin approval.'
        );
      });
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function requestWithdraw() {
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), address }),
      });
      const d: any = await res.json();
      setMsg(d.message || (d.ok ? 'Withdrawal submitted' : 'Failed'));
      if (d.ok) {
        setAmount('');
        setAddress('');
        load();
      }
    } catch {
      setMsg('Network error');
    }
    setBusy(false);
  }

  const withdrawals = useMemo(() => uniqueWithdrawals(transactions), [transactions]);

  if (!user) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-shell pb-28 relative">
      <div className="fixed inset-0 pointer-events-none mesh-bg" />
      <UserNav />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">{t.withdraw}</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              TRC-20 payout
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
            Available to withdraw
          </p>
          <p className="text-3xl font-black text-emerald-500 mt-1">
            {Number(user.withdrawalBalance).toFixed(2)}{' '}
            <span className="text-sm font-semibold">USDT</span>
          </p>
        </div>

        <div className="note-box space-y-2">
          <p className="font-bold text-amber-600">{t.withdrawNotes}</p>
          <ul className="list-disc pl-4 space-y-1.5" style={{ color: 'var(--muted)' }}>
            <li>
              Minimum withdrawal: <strong>{minW} USDT</strong>
            </li>
            <li>Payouts are sent to a <strong>USDT TRC-20</strong> address only.</li>
            <li>Double-check your address (T…). Wrong address = funds lost.</li>
            <li>{note}</li>
            <li>Admin must approve each request before funds leave the platform.</li>
            <li>Withdrawal balance comes from daily claims + referral earnings.</li>
          </ul>
        </div>

        <div className="panel-card p-4 space-y-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Amount (min ${minW})`}
            className="input-field"
          />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Your USDT TRC-20 address (T...)"
            className="input-field font-mono text-sm"
          />
          <button
            type="button"
            onClick={requestWithdraw}
            disabled={busy}
            className="btn-primary w-full disabled:opacity-60"
          >
            {busy ? 'Submitting…' : 'Request withdraw'}
          </button>
        </div>

        <div className="panel-card overflow-hidden">
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-semibold">Withdrawal history</h2>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Pending → Approved or Rejected after admin review
            </p>
          </div>
          {withdrawals.length === 0 ? (
            <p className="p-4 text-sm text-center" style={{ color: 'var(--muted)' }}>
              {t.noData}
            </p>
          ) : (
            <div className="divide-y max-h-80 overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
              {withdrawals.map((tx) => (
                <div key={tx.id} className="px-4 py-3 flex justify-between text-sm gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{tx.amount} USDT</p>
                    {tx.address && (
                      <p
                        className="text-[11px] font-mono break-all mt-0.5"
                        style={{ color: 'var(--muted)' }}
                        title={tx.address}
                      >
                        TRC-20: {shortAddr(tx.address)}
                      </p>
                    )}
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold capitalize self-center shrink-0 ${
                      tx.status === 'approved' || tx.status === 'completed'
                        ? 'text-emerald-500'
                        : tx.status === 'rejected'
                          ? 'text-red-500'
                          : 'text-amber-500'
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
