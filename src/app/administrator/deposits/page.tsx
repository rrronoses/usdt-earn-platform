'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminNav';
import { AdminPanel, EmptyState } from '@/components/admin/ui';

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
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-300 text-sm text-center">
          {msg}
        </div>
      )}

      <div className="space-y-3 mb-8">
        {addresses.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl border p-4 transition"
            style={{
              borderColor: a.active
                ? 'color-mix(in srgb, #10b981 40%, var(--border))'
                : 'var(--border)',
              opacity: a.active ? 1 : 0.8,
            }}
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
                    type="button"
                    onClick={() =>
                      api({ action: 'update', id: a.id, address: editAddress, label: editLabel }).then(() =>
                        setEditId(null)
                      )
                    }
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Save
                  </button>
                  <button type="button" onClick={() => setEditId(null)} className="btn-ghost px-4 py-2 text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                      TRC20
                    </span>
                    {a.label || 'USDT TRC20'}
                    {a.active ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        In pool
                      </span>
                    ) : (
                      <span
                        className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border"
                        style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                      >
                        Disabled
                      </span>
                    )}
                  </p>
                  <code className="text-xs break-all block mt-2 font-mono" style={{ color: 'var(--muted)' }}>
                    {a.address}
                  </code>
                </div>
                <div className="flex flex-wrap gap-2">
                  {a.active ? (
                    <button
                      type="button"
                      onClick={() => api({ action: 'update', id: a.id, active: false })}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-sm font-semibold"
                    >
                      Disable
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => api({ action: 'update', id: a.id, active: true })}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
                    >
                      Enable
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(a.id);
                      setEditAddress(a.address);
                      setEditLabel(a.label || '');
                    }}
                    className="btn-ghost px-3 py-1.5 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Remove this address?')) api({ action: 'remove', id: a.id });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-sm font-semibold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {addresses.length === 0 && (
          <EmptyState title="No addresses yet" hint="Add a USDT TRC-20 wallet below." />
        )}
      </div>

      <AdminPanel className="p-5 space-y-3 max-w-xl">
        <h2 className="font-bold">Add USDT TRC-20 address</h2>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          TRON address starting with T. Joins the random pool when active.
        </p>
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
          type="button"
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
      </AdminPanel>
    </AdminShell>
  );
}
