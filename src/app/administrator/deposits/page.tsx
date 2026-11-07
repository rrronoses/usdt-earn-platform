'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminNav';

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
    const d: any = await fetch('/api/admin/deposit-addresses').then((r) => r.json());
    if (d.ok) setAddresses(d.addresses || []);
    else setMsg(d.message || 'Login as admin');
  }

  useEffect(() => {
    load();
  }, []);

  async function api(body: Record<string, unknown>) {
    const d: any = await fetch('/api/admin/deposit-addresses', {
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
    <AdminShell
      title="Deposit pool"
      subtitle={`${enabledCount} wallet(s) enabled for random TRC-20 assignment`}
    >
      {msg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm text-center">
          {msg}
        </div>
      )}

      <div className="space-y-3 mb-8">
        {addresses.map((a) => (
          <div
            key={a.id}
            className={`rounded-2xl border p-4 transition ${
              a.active
                ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-slate-900'
                : 'border-white/5 bg-slate-900/40 opacity-80'
            }`}
          >
            {editId === a.id ? (
              <div className="space-y-2">
                <input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="input-field"
                  placeholder="Label"
                />
                <input
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="input-field font-mono"
                  placeholder="T..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      api({ action: 'update', id: a.id, address: editAddress, label: editLabel }).then(() =>
                        setEditId(null)
                      )
                    }
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Save
                  </button>
                  <button onClick={() => setEditId(null)} className="btn-ghost px-4 py-2 text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold flex items-center gap-2 flex-wrap">
                    <span className="chip border-cyan-500/30 bg-cyan-500/10 text-cyan-300">TRC20</span>
                    {a.label || 'USDT TRC20'}
                    {a.active ? (
                      <span className="chip border-emerald-500/30 bg-emerald-500/10 text-emerald-400">In pool</span>
                    ) : (
                      <span className="chip border-slate-600 bg-slate-800 text-slate-400">Disabled</span>
                    )}
                  </p>
                  <code className="text-xs text-slate-300 break-all block mt-2 font-mono">{a.address}</code>
                </div>
                <div className="flex flex-wrap gap-2">
                  {a.active ? (
                    <button
                      onClick={() => api({ action: 'update', id: a.id, active: false })}
                      className="px-3 py-1.5 rounded-xl bg-amber-600/90 text-sm font-semibold"
                    >
                      Disable
                    </button>
                  ) : (
                    <button
                      onClick={() => api({ action: 'update', id: a.id, active: true })}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-sm font-semibold"
                    >
                      Enable
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditId(a.id);
                      setEditAddress(a.address);
                      setEditLabel(a.label || '');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-700 text-sm font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Remove this address?')) api({ action: 'remove', id: a.id });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-700/90 text-sm font-semibold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {addresses.length === 0 && (
          <p className="text-center text-slate-500 py-8">No addresses yet. Add a USDT TRC-20 wallet below.</p>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 space-y-3 max-w-xl">
        <h2 className="font-bold">Add USDT TRC-20 address</h2>
        <p className="text-xs text-slate-500">TRON address starting with T. Joins the random pool when active.</p>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g. Wallet 1)"
          className="input-field"
        />
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="T... TRON / USDT TRC-20"
          className="input-field font-mono"
        />
        <button
          onClick={() => {
            if (!address.trim()) {
              setMsg('Address required');
              return;
            }
            api({ action: 'add', address: address.trim(), label, setActive: true }).then(() => setAddress(''));
          }}
          className="btn-primary w-full sm:w-auto px-6"
        >
          Add to random pool
        </button>
      </div>
    </AdminShell>
  );
}
