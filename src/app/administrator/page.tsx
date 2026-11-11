'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useThemeLang } from '@/components/ThemeLangProvider';
import { AuthTogglesBar } from '@/components/PublicHeader';

export default function AdminLoginPage() {
  const router = useRouter();
  const { t } = useThemeLang();
  const [username, setUsername] = useState('');
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
        body: JSON.stringify({ username, password, asAdmin: true }),
      });
      const data: any = await res.json();
      if (!data.ok) {
        setError(data.message || 'Invalid credentials');
        setLoading(false);
        return;
      }
      router.push('/administrator/dashboard');
    } catch {
      setError('Network error');
      setLoading(false);
    }
  }

  return (
    <div className="page-shell flex items-center justify-center px-4 relative overflow-hidden mesh-bg">
      <AuthTogglesBar />
      <div className="absolute -top-40 right-0 w-[420px] h-[420px] bg-violet-500/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 left-0 w-[360px] h-[360px] bg-emerald-500/15 blur-[110px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 via-emerald-500 to-teal-400 items-center justify-center text-lg font-black text-white shadow-2xl shadow-violet-500/30 mb-4">
            UE
          </div>
          <h1 className="text-2xl font-black tracking-tight">SaaS Admin</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            USDT Earn · Control center
          </p>
        </div>

        <form onSubmit={onSubmit} className="panel-card p-6 space-y-4 shadow-xl">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              {t.username}
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="admin"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              {t.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? t.signingIn : t.enterDashboard}
          </button>
        </form>

        <p className="text-center mt-5">
          <Link href="/" className="text-sm hover:text-emerald-500 transition" style={{ color: 'var(--muted)' }}>
            {t.backToSite}
          </Link>
        </p>
      </div>
    </div>
  );
}
