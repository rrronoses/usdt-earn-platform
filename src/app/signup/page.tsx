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
        body: JSON.stringify({
          username,
          email,
          password,
          referralCode: referralCode || undefined,
        }),
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden mesh-bg">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/25 blur-[120px] rounded-full animate-pulse-soft" />
      <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-teal-500/20 blur-[100px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold text-white text-3xl shadow-2xl shadow-emerald-500/40 animate-float">
              ₮
            </div>
          </Link>
          <h1 className="text-2xl font-black tracking-tight">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Get <span className="text-emerald-400 font-bold">3 USDT free</span> on{' '}
            <span className="text-gradient font-semibold">USDT Earn</span>
          </p>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          {['3 USDT bonus', 'Daily claims', '20% referral'].map((label) => (
            <div
              key={label}
              className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 py-2.5 text-center text-[11px] font-semibold text-emerald-300"
            >
              {label}
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="card-premium p-6 space-y-3.5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5 font-medium">Username</label>
            <input
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="yourname"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5 font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5 font-medium">Password (min 6)</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5 font-medium">
              Referral code <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="input-field font-mono"
              placeholder="8-digit user id"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-1">
            {loading ? 'Creating…' : 'Sign Up & Get 3 USDT'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-400 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 mesh-bg" />}>
      <SignupForm />
    </Suspense>
  );
}
