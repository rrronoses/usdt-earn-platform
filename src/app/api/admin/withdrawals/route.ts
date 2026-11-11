import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded,
  listPendingWithdrawals,
  getWithdrawal,
  saveWithdrawal,
  getUser,
  saveUser,
  saveTx,
  getJSON,
  putJSON,
  keys,
  getAnalytics,
  saveAnalytics,
} from '@/lib/kv';
import { getAdminToken, parseToken } from '@/lib/auth';
import type { Transaction } from '@/types';

export const runtime = 'edge';

function requireAdmin() {
  const tok = getAdminToken();
  if (!tok) return null;
  const p = parseToken(tok);
  return p?.role === 'admin' ? p : null;
}

/** Update matching withdrawal ledger rows in place (pending → approved/rejected). */
async function finalizeWithdrawalTxs(
  kv: Parameters<typeof getJSON>[0],
  wId: string,
  userId: string,
  amount: number,
  status: 'approved' | 'rejected',
  description: string,
  address?: string
) {
  const now = new Date().toISOString();
  const idx = (await getJSON<string[]>(kv, keys.userTxIndex(userId))) || [];
  const ids = new Set<string>([wId, ...idx.slice(0, 80)]);
  let updated = 0;

  for (const tid of Array.from(ids)) {
    const candidate = await getJSON<Transaction>(kv, keys.tx(tid));
    if (!candidate) continue;
    if (candidate.type !== 'withdrawal') continue;
    if (Math.abs(Number(candidate.amount) - amount) >= 0.000001) continue;

    if (candidate.status === 'pending' || candidate.id === wId) {
      candidate.status = status;
      candidate.description = description;
      candidate.timestamp = now;
      if (address) candidate.address = address;
      await putJSON(kv, keys.tx(candidate.id), candidate);
      updated += 1;
    }
  }

  if (updated === 0) {
    await saveTx(kv, {
      id: wId,
      userId,
      type: 'withdrawal',
      amount,
      status,
      description,
      timestamp: now,
      address,
    } as Transaction);
  }
}

export async function GET() {
  if (!requireAdmin()) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const kv = getStorage();
  await ensureSeeded(kv);
  const withdrawals = await listPendingWithdrawals(kv);
  return NextResponse.json({ ok: true, withdrawals });
}

export async function POST(req: Request) {
  if (!requireAdmin()) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const kv = getStorage();
  await ensureSeeded(kv);
  const body: any = await req.json().catch(() => ({}));
  const id = String(body.id || '');
  const action = String(body.action || '').toLowerCase();
  const w = await getWithdrawal(kv, id);
  if (!w) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
  if (w.status !== 'pending') {
    return NextResponse.json({ ok: false, message: 'Already processed' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const addr = w.destinationAddress;

  if (action === 'approve') {
    w.status = 'approved';
    w.processedAt = now;
    await saveWithdrawal(kv, w);

    await finalizeWithdrawalTxs(
      kv,
      w.id,
      w.userId,
      w.amount,
      'approved',
      `Withdrawal approved ${w.amount} USDT → ${addr}`,
      addr
    );

    try {
      const analytics = await getAnalytics(kv);
      analytics.totalWithdrawals = Number(
        (Number(analytics.totalWithdrawals || 0) + Number(w.amount)).toFixed(6)
      );
      await saveAnalytics(kv, analytics);
    } catch {
      /* non-fatal */
    }

    return NextResponse.json({ ok: true, message: 'Approved' });
  }

  if (action === 'reject') {
    w.status = 'rejected';
    w.processedAt = now;
    await saveWithdrawal(kv, w);

    const user = await getUser(kv, w.userId);
    if (user) {
      user.withdrawalBalance = Number((user.withdrawalBalance + w.amount).toFixed(6));
      await saveUser(kv, user);
    }

    await finalizeWithdrawalTxs(
      kv,
      w.id,
      w.userId,
      w.amount,
      'rejected',
      `Withdrawal rejected ${w.amount} USDT → ${addr} (refunded)`,
      addr
    );

    return NextResponse.json({ ok: true, message: 'Rejected and refunded' });
  }

  return NextResponse.json({ ok: false, message: 'Unknown action' }, { status: 400 });
}
