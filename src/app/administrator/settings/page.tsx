'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminNav';

export default function AdminSettingsPage() {
  const [cfg, setCfg] = useState({
    minWithdrawalLimit: 25,
    minDepositLimit: 1,
    maxDepositLimit: 10000,
    depositExpiryMinutes: 30,
    withdrawalNote: '',
    supportTelegram: '',
    supportEmail: '',
  });
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d: any) => {
        if (d.ok && d.config) setCfg((c) => ({ ...c, ...d.config }));
      });
  }, []);

  async function save() {
    setSaving(true);
    const d: any = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    }).then((r) => r.json());
    setMsg(d.ok ? 'Settings saved successfully' : d.message || 'Failed');
    setSaving(false);
  }

  const fields: { key: 'minWithdrawalLimit' | 'minDepositLimit' | 'maxDepositLimit' | 'depositExpiryMinutes'; label: string }[] = [
    { key: 'minWithdrawalLimit', label: 'Min withdrawal (USDT)' },
    { key: 'minDepositLimit', label: 'Min deposit (USDT)' },
    { key: 'maxDepositLimit', label: 'Max deposit (USDT)' },
    { key: 'depositExpiryMinutes', label: 'Deposit expiry (minutes)' },
  ];

  return (
    <AdminShell title="Settings" subtitle="Platform limits, support contacts, and notes">
      {msg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-sm">
          {msg}
        </div>
      )}

      <div className="max-w-lg space-y-4 panel-card p-5 sm:p-6">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              {f.label}
            </span>
            <input
              type="number"
              value={cfg[f.key] as number}
              onChange={(e) => setCfg({ ...cfg, [f.key]: Number(e.target.value) })}
              className="input-field mt-1.5"
            />
          </label>
        ))}

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
            Support Telegram link
          </span>
          <input
            type="url"
            value={cfg.supportTelegram}
            onChange={(e) => setCfg({ ...cfg, supportTelegram: e.target.value })}
            placeholder="https://t.me/your_channel"
            className="input-field mt-1.5"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
            Support email
          </span>
          <input
            type="email"
            value={cfg.supportEmail}
            onChange={(e) => setCfg({ ...cfg, supportEmail: e.target.value })}
            placeholder="support@example.com"
            className="input-field mt-1.5"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
            Withdrawal note
          </span>
          <textarea
            value={cfg.withdrawalNote}
            onChange={(e) => setCfg({ ...cfg, withdrawalNote: e.target.value })}
            className="input-field mt-1.5 min-h-[100px] resize-y"
          />
        </label>

        <button onClick={save} disabled={saving} className="btn-primary w-full py-3.5">
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </AdminShell>
  );
}
