'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { useThemeLang } from '@/components/ThemeLangProvider';

export default function PasswordPage() {
  const router = useRouter();
  const { t } = useThemeLang();
  const [ready, setReady] = useState(false);
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d: any) => {
        if (!d.ok) router.push('/login');
        else setReady(true);
      });
  }, [router]);

  async function submit() {
    setMsg('');
    setErr(false);
    if (newPass.length < 6) {
      setMsg('Password too short (min 6)');
      setErr(true);
      return;
    }
    if (newPass !== confirm) {
      setMsg('New passwords do not match');
      setErr(true);
      return;
    }
    if (!curPass) {
      setMsg('Enter current password');
      setErr(true);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: curPass, newPassword: newPass }),
      });
      const d: any = await res.json();
      setMsg(d.message || (d.ok ? 'Password updated' : 'Failed'));
      setErr(!d.ok);
      if (d.ok) {
        setCurPass('');
        setNewPass('');
        setConfirm('');
      }
    } catch {
      setMsg('Network error');
      setErr(true);
    }
    setBusy(false);
  }

  if (!ready) {
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
          <h1 className="text-2xl font-black">{t.changePassword}</h1>
          <Link href="/account" className="text-sm text-emerald-500 font-semibold">
            ← {t.account}
          </Link>
        </div>

        {msg && (
          <div
            className={`p-3 rounded-2xl border text-sm text-center ${
              err
                ? 'border-red-500/30 bg-red-500/10 text-red-500'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
            }`}
          >
            {msg}
          </div>
        )}

        <div className="note-box">
          Use a strong password (6+ characters). Never share your login with anyone.
        </div>

        <div className="panel-card p-4 space-y-3">
          <input
            type="password"
            value={curPass}
            onChange={(e) => setCurPass(e.target.value)}
            placeholder="Current password"
            className="input-field"
            autoComplete="current-password"
          />
          <input
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            placeholder="New password (min 6)"
            className="input-field"
            autoComplete="new-password"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            className="input-field"
            autoComplete="new-password"
          />
          <button type="button" onClick={submit} disabled={busy} className="btn-primary w-full disabled:opacity-50">
            {busy ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </main>
    </div>
  );
}
