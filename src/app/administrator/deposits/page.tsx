'use client';

import { useEffect, useState } from 'react';
import { AdminNav } from '@/components/AdminNav';

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

  useEffect(() => {
    load();
  }, []);

  async function api(body: Record<string, unknown>) {
    const d = await fetch('/api/admin/deposit-addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.json());
    if (!d.ok) {
      setMsg(d.message || 'Error');
      return;
    }
    setAddresses(d.addresses || []);
    setMsg('Saved');
    setTimeout(() => setMsg(''), 2000);
  }

  const enabledCount = addresses.filter((a) => a.active).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AdminNav />
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="font-bold text-xl">USDT TRC-20 deposit addresses</h1>
          <p className="text-sm text-slate-400 mt-1">
            Add multiple wallets. Users receive a <strong className="text-emerald-400">random</strong> address from the{' '}
            <strong className="text-emerald-400">enabled</strong> pool on each new deposit. Currently enabled:{' '}
            <strong className="text-white">{enabledCount}</strong>
          </p>
        </div>

        {msg && <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-300 text-sm text-center">{msg}</div>}

        <div className="space-y-3">
          {addresses.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl border p-4 ${a.active ? 'border-emerald-500/40 bg-slate-900' : 'border-slate-800 bg-slate-900/40 opacity-80'}`}
            >
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
                    <p className="font-medium flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800">TRC20</span>
                      {a.label || 'USDT TRC20'}
                      {a.active ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">In random pool</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">Disabled</span>
                      )}
                    </p>
                    <code className="text-xs text-slate-300 break-all block mt-1">{a.address}</code>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {a.active ? (
                      <button onClick={() => api({ action: 'update', id: a.id, active: false })} className="px-3 py-1.5 rounded-lg bg-amber-700/80 text-sm">Disable</button>
                    ) : (
                      <button onClick={() => api({ action: 'update', id: a.id, active: true })} className="px-3 py-1.5 rounded-lg bg-emerald-600/80 text-sm">Enable in pool</button>
                    )}
                    <button onClick={() => { setEditId(a.id); setEditAddress(a.address); setEditLabel(a.label || ''); }} className="px-3 py-1.5 rounded-lg bg-slate-700 text-sm">Edit</button>
                    <button onClick={() => { if (confirm('Remove this address from the platform?')) api({ action: 'remove', id: a.id }); }} className="px-3 py-1.5 rounded-lg bg-red-600/80 text-sm">Remove</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {addresses.length === 0 && (
            <p className="text-center text-slate-500 py-6">No addresses yet. Add at least one USDT TRC-20 wallet below.</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <h2 className="font-semibold">Add USDT TRC-20 address</h2>
          <p className="text-xs text-slate-500">Must be a TRON address starting with T. New addresses join the random pool by default.</p>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (e.g. Wallet 1)" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm" />
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="T... TRON / USDT TRC-20 address" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm font-mono" />
          <button
            onClick={() => {
              if (!address.trim()) { setMsg('Address required'); return; }
              api({ action: 'add', address: address.trim(), label, setActive: true }).then(() => setAddress(''));
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 font-medium"
          >
            Add to random pool
          </button>
        </div>
      </main>
    </div>
  );
}
