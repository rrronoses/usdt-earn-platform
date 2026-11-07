'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, asAdmin: true }),
    });
    const data: any = await res.json();
    if (!data.ok) {
      setError(data.message || 'Invalid credentials');
      return;
    }
    router.push('/administrator/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-center mb-6">Administrator</h1>
        <form onSubmit={onSubmit} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700" />
          <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 font-semibold">Login</button>
        </form>
        <p className="text-center text-xs text-slate-600 mt-4">Default: admin / admin123</p>
      </div>
    </div>
  );
}
