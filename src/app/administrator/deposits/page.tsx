'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Addr = { id: string; network: string; address: string; label?: string; active: boolean };

export default function AdminDepositsPage() {
  const [addresses, setAddresses] = useState<Addr[]>([]);
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('USDT TRC20');
  const [msg, setMsg] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editAddress, setEditAddress] = useState('');
  const [editLabel, setEditLabel] = useState('');

  async function load() {
    const d = await fetch('/api/admin/deposit-addresses').then((r) => r.json());
    if (d.ok) setAddresses(d.addresses || []);
    else setMsg(d.message || 'Login as admin');
  }

  useEffect(() => { load(); }, []);

  async function api(body: Record<string, unknown>) {
    const d = await fetch('/api/admin/deposit-addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.json());
    if (!d.ok) { setMsg(d.message || 'Error'); return; }
    setAddresses(d.addresses || []);
    setMsg('Saved');
    setTimeout(() => setMsg(''), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-4 h-14 flex items-center justify-between max-w-3xl mx-auto">
        <Link href="/administrator/dashboard" className="text-sm text-slate-400">← Admin</Link>
        <h1 className="font-bold">USDT TRC-20 Addresses</h1>
        <span className="w-12" />
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {msg && <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-300 text-sm text-center">{msg}</div>}
        <p className="text-sm text-slate-400">
          Manage platform receiving wallets. Only the <strong className="text-emerald-400">active</strong> address is shown to users. Network: USDT TRC-20.
        </p>
        <div className="space-y-3">
          {addresses.map((a) => (
            <div key={a.id} className={`rounded-xl border p-4 ${a.active ? 'border-emerald-500/40 bg-slate-900' : 'border-slate-800 bg-slate-900/50'}`}>
              {editId === a.id ? (
                <div className="space-y-2">
                  <input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm" placeholder="Label" />
                  <input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm font-mono" placeholder="T..." />
                  <div className="flex gap-2">
                    <button onClick={() => api({ action: 'update', id: a.id, address: editAddress, label: editLabel }).then(() => setEditId(null))} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-sm">Save</button>
                    <button onClick={() => setEditId(null)} className="px-3 py-1.5 rounded-lg bg-slate-700 text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800">TRC20</span>
                      {a.label || 'USDT TRC20'}
                      {a.active && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Active</span>}
                    </p>
                    <code className="text-xs text-slate-300 break-all block mt-1">{a.address}</code>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!a.active && <button onClick={() => api({ action: 'setActive', id: a.id })} className="px-3 py-1.5 rounded-lg bg-emerald-600/80 text-sm">Set Active</button>}
                    <button onClick={() => { setEditId(a.id); setEditAddress(a.address); setEditLabel(a.label || ''); }} className="px-3 py-1.5 rounded-lg bg-slate-700 text-sm">Edit</button>
                    <button onClick={() => { if (confirm('Remove?')) api({ action: 'remove', id: a.id }); }} className="px-3 py-1.5 rounded-lg bg-red-600/80 text-sm">Remove</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {addresses.length === 0 && <p className="text-center text-slate-500 py-6">No addresses yet. Add a USDT TRC-20 wallet below.</p>}
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <h2 className="font-semibold">Add USDT TRC-20 address</h2>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm" />
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="T... TRON wallet" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm font-mono" />
          <button onClick={() => { if (!address.trim()) { setMsg('Address required'); return; } api({ action: 'add', address: address.trim(), label, setActive: true }).then(() => setAddress('')); }} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 font-medium">
            Add & set active
          </button>
        </div>
      </main>
    </div>
  );
}
