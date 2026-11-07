'use client';
import { useEffect, useState } from 'react';
import { AdminNav } from '@/components/AdminNav';

const empty = { id: '', name: '', price: 10, durationDays: 28, dailyYield: 1, isOneTime: false, active: true, color: 'from-emerald-500 to-teal-500', badge: '' };

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [form, setForm] = useState({ ...empty });
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState('');

  async function load() {
    const d: any = await fetch('/api/admin/plans').then((r) => r.json());
    if (d.ok) setPlans(d.plans || []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    const action = editing ? 'update' : 'add';
    const d: any = await fetch('/api/admin/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, plan: form }),
    }).then((r) => r.json());
    setMsg(d.message || (d.ok ? 'Saved' : 'Failed'));
    if (d.ok) { setPlans(d.plans); setForm({ ...empty }); setEditing(false); }
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AdminNav />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-xl font-bold">Plans CRUD</h1>
        {msg && <p className="text-sm text-emerald-400">{msg}</p>}
        <div className="space-y-2">
          {plans.map((p) => (
            <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-900 p-3 flex flex-wrap justify-between gap-2 text-sm">
              <div>
                <p className="font-medium">{p.name} <span className="text-slate-500">({p.id})</span></p>
                <p className="text-xs text-slate-400">{p.price} USDT · {p.durationDays}d · {p.dailyYield}/day · {p.isOneTime ? 'one-time' : 'rebuy'} · {p.active ? 'active' : 'off'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setForm({ ...p, badge: p.badge || '' }); setEditing(true); }} className="px-2 py-1 rounded bg-slate-700 text-xs">Edit</button>
                <button onClick={() => remove(p.id)} className="px-2 py-1 rounded bg-red-800 text-xs">Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 grid sm:grid-cols-2 gap-3 text-sm">
          <h2 className="sm:col-span-2 font-semibold">{editing ? 'Edit plan' : 'Add plan'}</h2>
          {!editing && <input placeholder="id (slug)" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} className="px-2 py-1.5 rounded bg-slate-950 border border-slate-700" />}
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-2 py-1.5 rounded bg-slate-950 border border-slate-700" />
          <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="px-2 py-1.5 rounded bg-slate-950 border border-slate-700" />
          <input type="number" placeholder="Days" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })} className="px-2 py-1.5 rounded bg-slate-950 border border-slate-700" />
          <input type="number" placeholder="Daily yield" value={form.dailyYield} onChange={(e) => setForm({ ...form, dailyYield: Number(e.target.value) })} className="px-2 py-1.5 rounded bg-slate-950 border border-slate-700" />
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isOneTime} onChange={(e) => setForm({ ...form, isOneTime: e.target.checked })} /> One-time</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
          <div className="sm:col-span-2 flex gap-2">
            <button onClick={save} className="px-4 py-2 rounded-xl bg-emerald-600 font-medium">{editing ? 'Update' : 'Add'}</button>
            {editing && <button onClick={() => { setEditing(false); setForm({ ...empty }); }} className="px-4 py-2 rounded-xl bg-slate-700">Cancel</button>}
          </div>
        </div>
      </main>
    </div>
  );
}
