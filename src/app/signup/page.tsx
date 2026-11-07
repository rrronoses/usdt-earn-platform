'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState(params.get('ref') || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, referralCode: referralCode || undefined }),
      });
      const data: any = await res.json();
      if (!data.ok) {
        setError(data.message || 'Signup failed');
        setLoading(false);
        return;
      }
      router.push('/dashboard');
    } catch {
      setError('Network error');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950 py-12 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/20 blur-[100px] rounded-full" />
      <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-teal-500/15 blur-[90px] rounded-full" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-emerald-500/30">₮</div>
          </Link>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">
            Get <span className="text-emerald-400 font-semibold">3 USDT free</span> + Bronze plan on <span className="text-emerald-400 font-semibold">USDT Earn</span>
          </p>
        </div>
        <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
          {['3 USDT bonus', 'Daily claims', '20% referral'].map((t) => (
            <div key={t} className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 py-2 text-emerald-300 font-medium">{t}</div>
          ))}
        </div>
        <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur p-6 space-y-4 shadow-xl">
          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Username</label>
            <input required minLength={3} value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Password (min 6)</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Referral code <span className="text-slate-500">(optional)</span></label>
            <input value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 outline-none transition" placeholder="8-digit user id" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold disabled:opacity-60 shadow-lg shadow-emerald-500/20">
            {loading ? 'Creating…' : 'Sign Up & Get 3 USDT'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account? <Link href="/login" className="text-emerald-400 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <SignupForm />
    </Suspense>
  );
}
