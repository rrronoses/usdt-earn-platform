import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import { ensureSeeded } from '@/lib/kv';
import {
  listDepositAddresses,
  addDepositAddress,
  updateDepositAddress,
  removeDepositAddress,
  setActiveDepositAddress,
} from '@/lib/kv-deposit';
import { getAdminToken, parseToken } from '@/lib/auth';
import { isValidTronAddress, normalizeTronAddress } from '@/lib/tron';

export const runtime = 'edge';

function requireAdmin() {
  const token = getAdminToken();
  const parsed = parseToken(token);
  return parsed?.role === 'admin';
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
  const body: any = await req.json().catch(() => ({}));
  const action = String(body.action || 'add');

  try {
    if (action === 'add') {
      const address = normalizeTronAddress(String(body.address || ''));
      const label = body.label ? String(body.label) : 'USDT TRC20';
      const setActive = body.setActive !== false;
      if (!address) {
        return NextResponse.json({ ok: false, message: 'Address required' }, { status: 400 });
      }
      if (!isValidTronAddress(address)) {
        return NextResponse.json(
          {
            ok: false,
            message:
              'Invalid TRON/TRC-20 address. Must start with T and be 34 characters (base58).',
          },
          { status: 400 }
        );
      }
      const list = await addDepositAddress(kv, {
        network: 'TRC20',
        address,
        label,
        active: setActive,
      });
      if (setActive) {
        const added = list.find((a) => a.address === address) || list[list.length - 1];
        if (added) await setActiveDepositAddress(kv, added.id);
      }
      return NextResponse.json({ ok: true, addresses: await listDepositAddresses(kv) });
    }

    if (action === 'update') {
      const id = String(body.id || '');
      if (!id) return NextResponse.json({ ok: false, message: 'id required' }, { status: 400 });
      const patch: Record<string, unknown> = {};
      if (body.address !== undefined) {
        const address = normalizeTronAddress(String(body.address));
        if (!isValidTronAddress(address)) {
          return NextResponse.json({ ok: false, message: 'Invalid TRON/TRC-20 address' }, { status: 400 });
        }
        patch.address = address;
      }
      if (body.label !== undefined) patch.label = String(body.label);
      if (body.active !== undefined) patch.active = Boolean(body.active);
      if (body.network !== undefined) patch.network = 'TRC20';
      await updateDepositAddress(kv, id, patch as any);
      return NextResponse.json({ ok: true, addresses: await listDepositAddresses(kv) });
    }

    if (action === 'remove') {
      const id = String(body.id || '');
      if (!id) return NextResponse.json({ ok: false, message: 'id required' }, { status: 400 });
      await removeDepositAddress(kv, id);
      return NextResponse.json({ ok: true, addresses: await listDepositAddresses(kv) });
    }

    if (action === 'setActive') {
      const id = String(body.id || '');
      if (!id) return NextResponse.json({ ok: false, message: 'id required' }, { status: 400 });
      await setActiveDepositAddress(kv, id);
      return NextResponse.json({ ok: true, addresses: await listDepositAddresses(kv) });
    }

    return NextResponse.json({ ok: false, message: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : 'Failed' },
      { status: 400 }
    );
  }
}
