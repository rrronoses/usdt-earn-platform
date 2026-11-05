import { useState } from 'react';
import { useApp } from '../context/AppContext';

type Props = { onNavigate: (r: any) => void };

export default function Login({ onNavigate }: Props) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (!res.ok) setError(res.message);
    else onNavigate('user');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-dark-900 to-slate-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold text-white text-2xl mx-auto mb-4">₮</div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-slate-400 mt-1">Login to your USDTEarn account</p>
        </div>
        <form onSubmit={handle} className="rounded-2xl bg-slate-800/70 border border-slate-700/60 p-6 space-y-4">
          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" placeholder="you@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-dark-900 font-bold transition">
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-slate-400 text-sm mt-6">
          Don't have an account?{' '}
          <button onClick={() => onNavigate('signup')} className="text-emerald-400 font-medium hover:underline">Sign up</button>
        </p>
        <p className="text-center mt-4">
          <button onClick={() => onNavigate('landing')} className="text-slate-500 text-sm hover:text-slate-300">← Back to home</button>
        </p>
      </div>
    </div>
  );
}
