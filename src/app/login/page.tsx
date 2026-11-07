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
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/20 blur-[100px] rounded-full" />
      <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-teal-500/15 blur-[90px] rounded-full" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-emerald-500/30">
              ₮
            </div>
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Login to <span className="text-emerald-400 font-semibold">USDT Earn</span></p>
        </div>
        <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur p-6 space-y-4 shadow-xl">
          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 outline-none transition" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold disabled:opacity-60 shadow-lg shadow-emerald-500/20">
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-400 mt-6">
          No account? <Link href="/signup" className="text-emerald-400 font-medium hover:underline">Sign up & get 3 USDT</Link>
        </p>
        <p className="text-center mt-2"><Link href="/" className="text-slate-500 text-sm hover:text-slate-300">← Home</Link></p>
      </div>
    </div>
  );
}
