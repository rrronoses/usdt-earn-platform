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

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d: any) => {
        if (!d.ok) router.push('/login');
        else setReady(true);
      });
  }, [router]);

  function submit() {
    if (newPass.length < 6) {
      setMsg('Password too short (min 6)');
      return;
    }
    if (newPass !== confirm) {
      setMsg('New passwords do not match');
      return;
    }
    if (!curPass) {
      setMsg('Enter current password');
      return;
    }
    setMsg('Password change will be available after security module is enabled.');
    setCurPass('');
    setNewPass('');
    setConfirm('');
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
          <div className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-sm text-center">
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
          />
          <input
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            placeholder="New password (min 6)"
            className="input-field"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            className="input-field"
          />
          <button onClick={submit} className="btn-primary w-full">
            Update password
          </button>
        </div>
      </main>
    </div>
  );
}
