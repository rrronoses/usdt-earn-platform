'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    username: string;
    email: string;
    depositBalance: number;
    withdrawalBalance: number;
    avatarSeed: string;
  } | null>(null);
  const [minW, setMinW] = useState(25);
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [msg, setMsg] = useState('');
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d: any) => {
        if (!d.ok) {
          router.push('/login');
          return;
        }
        setUser(d.user);
        setMinW(d.config?.minWithdrawalLimit ?? 25);
        setNote(d.config?.withdrawalNote || '');
      });
  }, [router]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.avatarSeed || user.username)}`;

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <header className="border-b border-slate-800 sticky top-0 bg-slate-950/90 backdrop-blur z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-slate-400 text-sm">← Dashboard</Link>
          <span className="font-bold">Account</span>
          <button onClick={logout} className="text-red-400 text-sm">Logout</button>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {msg && <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-300 text-sm text-center">{msg}</div>}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 flex items-center gap-4">
          <img src={avatar} alt="" className="w-16 h-16 rounded-2xl bg-slate-800" />
          <div>
            <p className="font-bold text-lg">{user.username}</p>
            <p className="text-sm text-slate-400">{user.email}</p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              ID: <code className="text-emerald-400">{user.id}</code>
              <button type="button" onClick={() => navigator.clipboard.writeText(user.id)} className="text-slate-400">Copy</button>
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
          <h2 className="font-semibold">Withdraw USDT (TRC-20)</h2>
          <p className="text-sm text-slate-400">Available: <strong className="text-white">{user.withdrawalBalance.toFixed(2)} USDT</strong></p>
          <p className="text-xs text-slate-500">Min: {minW} USDT. {note}</p>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700" />
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your USDT TRC-20 address" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-sm" />
          <button
            onClick={() => setMsg('Submit withdrawal via /api/withdraw (admin approval 2–3 hours).')}
            className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold"
          >
            Request withdraw
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
          <h2 className="font-semibold">Change password</h2>
          <input type="password" value={curPass} onChange={(e) => setCurPass(e.target.value)} placeholder="Current password" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700" />
          <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="New password (min 6)" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700" />
          <button onClick={() => setMsg('Password change endpoint: extend /api/account/password')} className="w-full py-2 rounded-xl bg-slate-700 font-medium">
            Update password
          </button>
        </div>
      </main>
    </div>
  );
}
