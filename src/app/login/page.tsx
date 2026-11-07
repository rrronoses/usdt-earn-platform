'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data: any = await res.json();
      if (!data.ok) {
        setError(data.message || 'Login failed');
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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden mesh-bg">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/25 blur-[120px] rounded-full animate-pulse-soft" />
      <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-teal-500/20 blur-[100px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold text-white text-3xl shadow-2xl shadow-emerald-500/40 animate-float">
              ₮
            </div>
          </Link>
          <h1 className="text-2xl font-black tracking-tight">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Login to <span className="text-gradient font-semibold">USDT Earn</span>
          </p>
        </div>

        <form onSubmit={onSubmit} className="card-premium p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
          )}
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
            <label className="block text-sm text-slate-300 mb-1.5 font-medium">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          No account?{' '}
          <Link href="/signup" className="text-emerald-400 font-semibold hover:underline">
            Sign up & get 3 USDT
          </Link>
        </p>
        <p className="text-center mt-3">
          <Link href="/" className="text-slate-500 text-sm hover:text-slate-300 transition">
            ← Home
          </Link>
        </p>
      </div>
    </div>
  );
}
