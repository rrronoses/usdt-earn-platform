import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded,
  listDepositAddresses,
  addDepositAddress,
  updateDepositAddress,
  removeDepositAddress,
} from '@/lib/kv';
import { getAdminToken, parseToken } from '@/lib/auth';

export const runtime = 'edge';

function requireAdmin() {
  const tok = getAdminToken();
  if (!tok) return null;
  const p = parseToken(tok);
  return p?.role === 'admin' ? p : null;
}

export async function GET() {
  if (!requireAdmin()) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  const kv = getStorage();
  await ensureSeeded(kv);
  const addresses = await listDepositAddresses(kv);
  return NextResponse.json({ ok: true, addresses });
}

export async function POST(req: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  const kv = getStorage();
  await ensureSeeded(kv);
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || 'add');

  if (action === 'add') {
    const address = String(body.address || '').trim();
    if (address.length < 20) {
      return NextResponse.json({ ok: false, message: 'Valid TRC-20 address required' }, { status: 400 });
    }
    if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) {
      return NextResponse.json(
        { ok: false, message: 'Address must be a TRON base58 address (starts with T)' },
        { status: 400 }
      );
    }
    const entry = await addDepositAddress(kv, address, body.label, body.setActive !== false);
    const addresses = await listDepositAddresses(kv);
    return NextResponse.json({ ok: true, entry, addresses });
  }

  if (action === 'update') {
    const id = String(body.id || '');
    if (!id) return NextResponse.json({ ok: false, message: 'id required' }, { status: 400 });
    if (body.address) {
      const address = String(body.address).trim();
      if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) {
        return NextResponse.json({ ok: false, message: 'Invalid TRON address' }, { status: 400 });
      }
    }
    const entry = await updateDepositAddress(kv, id, {
      address: body.address,
      label: body.label,
      active: body.active,
    });
    if (!entry) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
    const addresses = await listDepositAddresses(kv);
    return NextResponse.json({ ok: true, entry, addresses });
  }

  if (action === 'setActive') {
    const id = String(body.id || '');
    if (!id) return NextResponse.json({ ok: false, message: 'id required' }, { status: 400 });
    const entry = await updateDepositAddress(kv, id, { active: true });
    if (!entry) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
    const addresses = await listDepositAddresses(kv);
    return NextResponse.json({ ok: true, entry, addresses });
  }

  if (action === 'remove') {
    const id = String(body.id || '');
    if (!id) return NextResponse.json({ ok: false, message: 'id required' }, { status: 400 });
    const ok = await removeDepositAddress(kv, id);
    if (!ok) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
    const addresses = await listDepositAddresses(kv);
    return NextResponse.json({ ok: true, addresses });
  }

  return NextResponse.json({ ok: false, message: 'Unknown action' }, { status: 400 });
}
