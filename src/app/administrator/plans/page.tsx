'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminNav';
import { AdminPanel } from '@/components/admin/ui';

const empty = {
  id: '',
  name: '',
  price: 10,
  durationDays: 28,
  dailyEarn: 1,
  isOneTime: false,
  active: true,
  color: 'from-emerald-500 to-teal-500',
  badge: '',
};

function dailyOf(p: { dailyEarn?: number; dailyYield?: number }) {
  return Number(p.dailyEarn ?? p.dailyYield ?? 0) || 0;
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [form, setForm] = useState({ ...empty });
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState('');

  async function load() {
    const d: any = await fetch('/api/admin/plans').then((r) => r.json());
    if (d.ok) setPlans(d.plans || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    const action = editing ? 'update' : 'add';
    const d: any = await fetch('/api/admin/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, plan: form }),
    }).then((r) => r.json());
    setMsg(d.message || (d.ok ? 'Saved' : 'Failed'));
    if (d.ok) {
      setPlans(d.plans);
      setForm({ ...empty });
      setEditing(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove plan?')) return;
    const d: any = await fetch('/api/admin/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', id }),
    }).then((r) => r.json());
    if (d.ok) setPlans(d.plans);
  }

  return (
    <AdminShell title="Plans" subtitle="Earn tiers shown in the user panel">
      {msg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-300 text-sm">
          {msg}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        {plans.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border p-4"
            style={{
              borderColor: p.active
                ? 'color-mix(in srgb, #10b981 35%, var(--border))'
                : 'var(--border)',
              opacity: p.active ? 1 : 0.7,
            }}
          >
            <div className="flex justify-between gap-2">
              <div>
                <p className="font-bold text-lg">{p.name}</p>
                <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                  {p.id}
                </p>
              </div>
              <p className="text-2xl font-black text-emerald-500">{p.price}</p>
            </div>
            <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
              {p.durationDays}d · <strong className="text-emerald-500">{dailyOf(p)}</strong>/day ·{' '}
              {p.isOneTime ? 'one-time' : 'rebuy'} · {p.active ? 'live' : 'off'}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => {
                  setForm({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    durationDays: p.durationDays,
                    dailyEarn: dailyOf(p),
                    isOneTime: !!p.isOneTime,
                    active: p.active !== false,
                    color: p.color || empty.color,
                    badge: p.badge || '',
                  });
                  setEditing(true);
                }}
                className="btn-ghost px-3 py-1.5 text-xs"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <AdminPanel className="p-5 grid sm:grid-cols-2 gap-3">
        <h2 className="sm:col-span-2 font-bold text-lg">{editing ? 'Edit plan' : 'Add plan'}</h2>
        {!editing && (
          <input
            placeholder="id (slug)"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            className="input-field"
          />
        )}
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Days"
          value={form.durationDays}
          onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Daily earn (USDT)"
          value={form.dailyEarn}
          onChange={(e) => setForm({ ...form, dailyEarn: Number(e.target.value) })}
          className="input-field"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isOneTime}
            onChange={(e) => setForm({ ...form, isOneTime: e.target.checked })}
          />{' '}
          One-time
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />{' '}
          Active
        </label>
        <div className="sm:col-span-2 flex gap-2 pt-1">
          <button type="button" onClick={save} className="btn-primary px-6 py-2.5">
            {editing ? 'Update' : 'Add plan'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setForm({ ...empty });
              }}
              className="btn-ghost px-5 py-2.5"
            >
              Cancel
            </button>
          )}
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
