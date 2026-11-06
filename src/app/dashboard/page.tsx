'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [depAmount, setDepAmount] = useState('');
  const [depInfo, setDepInfo] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const pollRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const loadMe = useCallback(() => {
    return fetch('/api/me').then((r) => r.json()).then((d) => {
      if (!d.ok) { router.push('/login'); return null; }
      setData(d); return d;
    }).catch(() => null);
  }, [router]);

  useEffect(() => {
    loadMe();
    return () => { if (pollRef.current) clearInterval(pollRef.current); if (timerRef.current) clearInterval(timerRef.current); };
  }, [loadMe]);

  function stopPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    pollRef.current = null; timerRef.current = null;
  }

  function startPolling(depositId: string) {
    stopPolling();
    setSecondsLeft(240);
    timerRef.current = setInterval(() => setSecondsLeft((s) => (s <= 1 ? (stopPolling(), 0) : s - 1)), 1000);
    pollRef.current = setInterval(async () => {
      try {
        const d = await fetch(`/api/deposit/check-status?depositId=${encodeURIComponent(depositId)}`).then((r) => r.json());
        if (d.ok && (d.credited || d.status === 'approved' || d.status === 'completed')) {
          stopPolling();
          setMsg(`Deposit confirmed! +${Number(d.creditedAmount || 0).toFixed(2)} USDT`);
          setDepInfo(null);
          loadMe();
        }
      } catch {}
    }, 10000);
  }

  async function startDeposit() {
    const amount = parseFloat(depAmount);
    if (!amount || amount <= 0) { setMsg('Enter valid amount'); return; }
    const d = await fetch('/api/deposit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount }) }).then((r) => r.json());
    if (!d.ok) {
      setMsg(d.message || 'Failed');
      if (d.depositId && d.address) { setDepInfo({ address: d.address, amount: d.amount || amount, depositId: d.depositId }); startPolling(d.depositId); }
      return;
    }
    setDepInfo({ address: d.address, amount: d.amount, depositId: d.depositId });
    setMsg('Send exact USDT on TRC-20 only.');
    startPolling(d.depositId);
  }

  async function claim() {
    const d = await fetch('/api/claim', { method: 'POST' }).then((r) => r.json());
    setMsg(d.message || (d.ok ? `Claimed ${d.claimed} USDT` : 'Claim failed'));
    if (d.ok) loadMe();
  }

  if (!data) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  const { user, plans, transactions } = data;
  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <header className="border-b border-slate-800 sticky top-0 bg-slate-950/90 backdrop-blur z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between text-sm">
          <span className="font-bold text-base">USDT Yield</span>
          <div className="flex gap-3">
            <Link href="/plans" className="text-slate-400 hover:text-white">Plans</Link>
            <Link href="/invitation" className="text-slate-400 hover:text-white">Invite</Link>
            <Link href="/account" className="text-slate-400 hover:text-white">Account</Link>
          </div>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {msg && <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm text-center">{msg}</div>}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600/30 to-teal-700/20 border border-emerald-500/30 p-5">
          <p className="text-sm text-slate-300">Total Balance</p>
          <p className="text-3xl font-extrabold">{user.totalBalance.toFixed(2)} <span className="text-lg text-emerald-300">USDT</span></p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-slate-900/40 rounded-xl p-3 text-center"><p className="text-xs text-slate-400">Deposit</p><p className="font-bold text-sm">{user.depositBalance.toFixed(2)}</p></div>
            <div className="bg-slate-900/40 rounded-xl p-3 text-center"><p className="text-xs text-slate-400">Withdraw</p><p className="font-bold text-sm">{user.withdrawalBalance.toFixed(2)}</p></div>
            <div className="bg-slate-900/40 rounded-xl p-3 text-center"><p className="text-xs text-slate-400">Today</p><p className="font-bold text-sm text-emerald-400">+{user.todayEarnings.toFixed(2)}</p></div>
          </div>
          <button onClick={claim} className="mt-4 w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold">Claim daily earnings</button>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
          <h2 className="font-semibold">Deposit USDT (TRC-20)</h2>
          {!depInfo ? (
            <>
              <input type="number" min="1" step="0.01" value={depAmount} onChange={(e) => setDepAmount(e.target.value)} placeholder="Amount" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700" />
              <button onClick={startDeposit} className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold">Generate address</button>
            </>
          ) : (
            <>
              <p className="text-sm text-amber-200">Send exactly <strong>{depInfo.amount} USDT</strong> on <strong>TRC-20</strong></p>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(depInfo.address)}`} alt="QR" className="mx-auto rounded-lg bg-white p-2" />
              <div className="flex gap-2 items-center bg-slate-950 rounded-lg p-2">
                <code className="text-xs break-all flex-1">{depInfo.address}</code>
                <button type="button" onClick={() => navigator.clipboard.writeText(depInfo.address)} className="text-emerald-400 text-sm shrink-0">Copy</button>
              </div>
              {secondsLeft > 0 && <p className="text-center font-mono text-amber-400 text-lg">{mm}:{ss}</p>}
              <button type="button" onClick={async () => {
                const d = await fetch('/api/deposit/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ depositId: depInfo.depositId }) }).then((r) => r.json());
                if (d.credited) { stopPolling(); setMsg(`Credited ${d.amount} USDT`); setDepInfo(null); loadMe(); }
                else setMsg(d.reason || 'Not confirmed yet');
              }} className="w-full py-2 rounded-lg bg-slate-700 text-sm">Check chain now</button>
            </>
          )}
        </div>
        <div>
          <h2 className="font-semibold mb-2">Active plans</h2>
          {(plans || []).length === 0 ? <p className="text-slate-500 text-sm">No plans — <Link href="/plans" className="text-emerald-400">browse</Link></p> : (
            <div className="space-y-2">{(plans || []).map((p: any, i: number) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 flex justify-between">
                <div><p className="font-medium">{p.name}</p><p className="text-xs text-slate-400">{p.dailyYield}/day · {p.status}</p></div>
                <span className="text-xs text-emerald-400">{p.status}</span>
              </div>
            ))}</div>
          )}
        </div>
        <div>
          <h2 className="font-semibold mb-2">Recent transactions</h2>
          <div className="rounded-xl border border-slate-800 divide-y divide-slate-800">
            {(transactions || []).slice(0, 8).map((t: any) => (
              <div key={t.id} className="px-3 py-2 flex justify-between text-sm">
                <div><p>{t.description}</p><p className="text-xs text-slate-500">{new Date(t.timestamp).toLocaleString()} · {t.status}</p></div>
                <span className={t.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}>{t.amount >= 0 ? '+' : ''}{t.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
