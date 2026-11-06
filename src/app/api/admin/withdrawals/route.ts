import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded, listPendingWithdrawals, getWithdrawal, saveWithdrawal,
  getUser, saveUser, saveTx, getAnalytics, saveAnalytics, generateId,
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

export async function GET() {
  if (!requireAdmin()) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const kv = getStorage();
  await ensureSeeded(kv);
  const pending = await listPendingWithdrawals(kv);
  return NextResponse.json({ ok: true, withdrawals: pending });
}

export async function POST(req: Request) {
  if (!requireAdmin()) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const kv = getStorage();
  await ensureSeeded(kv);
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || '');
  const action = String(body.action || '');
  const w = await getWithdrawal(kv, id);
  if (!w) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
  if (w.status !== 'pending') {
    return NextResponse.json({ ok: false, message: 'Already processed' }, { status: 400 });
  }
  const now = new Date().toISOString();
  if (action === 'approve') {
    w.status = 'approved';
    w.processedAt = now;
    await saveWithdrawal(kv, w);
    await saveTx(kv, {
      id: generateId('tx'),
      userId: w.userId,
      type: 'withdrawal',
      amount: w.amount,
      status: 'approved',
      description: `Withdrawal approved ${w.amount} USDT → ${w.destinationAddress}`,
      timestamp: now,
      address: w.destinationAddress,
    } as Transaction);
    const analytics = await getAnalytics(kv);
    analytics.totalWithdrawals = Number((analytics.totalWithdrawals + w.amount).toFixed(6));
    await saveAnalytics(kv, analytics);
    return NextResponse.json({ ok: true, withdrawal: w });
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
    await saveTx(kv, {
      id: generateId('tx'),
      userId: w.userId,
      type: 'withdrawal',
      amount: w.amount,
      status: 'rejected',
      description: `Withdrawal rejected — refunded ${w.amount} USDT`,
      timestamp: now,
      address: w.destinationAddress,
    } as Transaction);
    return NextResponse.json({ ok: true, withdrawal: w });
  }
  return NextResponse.json({ ok: false, message: 'Unknown action' }, { status: 400 });
}
