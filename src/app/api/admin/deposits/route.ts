import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded,
  listPendingDeposits,
  getDeposit,
  saveDeposit,
  getUser,
  saveUser,
  saveTx,
  generateId,
  getAnalytics,
  saveAnalytics,
  getUserTransactions,
  getJSON,
  putJSON,
  keys,
} from '@/lib/kv';
import { getDepositWatchById, clearDepositWatch, markTxProcessed } from '@/lib/kv-deposit';
import { getAdminToken, parseToken } from '@/lib/auth';
import type { Transaction, DepositRequest } from '@/types';

export const runtime = 'edge';

function requireAdmin() {
  const tok = getAdminToken();
  if (!tok) return null;
  const p = parseToken(tok);
  return p?.role === 'admin' ? p : null;
}

async function patchMatchingDepositTx(
  kv: Parameters<typeof getUserTransactions>[0],
  dep: DepositRequest,
  status: 'completed' | 'rejected',
  note?: string
) {
  const txs = await getUserTransactions(kv, dep.userId, 100);
  const match = txs.find(
    (t) =>
      t.type === 'deposit' &&
      t.status === 'pending' &&
      (t.id.includes(dep.id) ||
        Math.abs(Number(t.amount) - Number(dep.amount)) < 0.000001 ||
        (t.address && dep.address && t.address === dep.address))
  );
  if (match) {
    match.status = status;
    if (note) match.description = `${match.description} · ${note}`;
    if (status === 'completed') {
      match.description = `Deposit confirmed ${dep.amount} USDT (manual admin)`;
    }
    await putJSON(kv, keys.tx(match.id), match);
    return match.id;
  }
  return null;
}

export async function GET() {
  if (!requireAdmin()) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const kv = getStorage();
  await ensureSeeded(kv);
  const deposits = await listPendingDeposits(kv);
  // Newest first
  deposits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json({ ok: true, deposits, count: deposits.length });
}

export async function POST(req: Request) {
  if (!requireAdmin()) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const kv = getStorage();
  await ensureSeeded(kv);
  const body: any = await req.json().catch(() => ({}));
  const id = String(body.id || body.depositId || '');
  const action = String(body.action || '').toLowerCase();
  const txHash = body.txHash ? String(body.txHash).trim() : '';
  const note = body.note ? String(body.note).trim() : '';

  if (!id) return NextResponse.json({ ok: false, message: 'Deposit id required' }, { status: 400 });

  const dep = await getDeposit(kv, id);
  if (!dep) return NextResponse.json({ ok: false, message: 'Deposit not found' }, { status: 404 });
  if (dep.status !== 'pending') {
    return NextResponse.json({ ok: false, message: `Already ${dep.status}` }, { status: 400 });
  }

  const now = new Date().toISOString();

  if (action === 'approve') {
    const user = await getUser(kv, dep.userId);
    if (!user) {
      return NextResponse.json({ ok: false, message: 'User not found for this deposit' }, { status: 404 });
    }

    const amount = Number(dep.amount) || 0;
    if (amount <= 0) {
      return NextResponse.json({ ok: false, message: 'Invalid deposit amount' }, { status: 400 });
    }

    // Credit deposit balance
    user.depositBalance = Number((Number(user.depositBalance || 0) + amount).toFixed(6));
    await saveUser(kv, user);

    dep.status = 'approved';
    dep.processedAt = now;
    if (txHash) dep.txHash = txHash;
    if (note) dep.note = note;
    await saveDeposit(kv, dep);

    // Clear watch so auto-engine won't try again
    try {
      const watch = await getDepositWatchById(kv, dep.id);
      if (watch) {
        await clearDepositWatch(kv, { ...watch, status: 'completed' });
      }
    } catch {
      /* non-fatal */
    }

    // Idempotency marker for manual credit
    const manualKey = `manual:${dep.id}`;
    try {
      await markTxProcessed(kv, manualKey, {
        userId: user.id,
        amount,
        depositId: dep.id,
      });
    } catch {
      /* non-fatal */
    }

    await patchMatchingDepositTx(kv, dep, 'completed', note || 'admin approved');

    // Ledger entry for clarity
    await saveTx(kv, {
      id: generateId('tx'),
      userId: user.id,
      type: 'deposit',
      amount,
      status: 'completed',
      description: txHash
        ? `Deposit approved ${amount} USDT (admin · ${txHash.slice(0, 12)}…)`
        : `Deposit approved ${amount} USDT (admin manual)`,
      timestamp: now,
      address: dep.address,
      txHash: txHash || undefined,
    } as Transaction);

    const analytics = await getAnalytics(kv);
    analytics.totalDeposits = Number((Number(analytics.totalDeposits || 0) + amount).toFixed(6));
    await saveAnalytics(kv, analytics);

    return NextResponse.json({
      ok: true,
      message: `Approved — credited ${amount} USDT deposit to ${user.username}`,
      deposit: dep,
      depositBalance: user.depositBalance,
    });
  }

  if (action === 'reject') {
    dep.status = 'rejected';
    dep.processedAt = now;
    if (note) dep.note = note;
    await saveDeposit(kv, dep);

    try {
      const watch = await getDepositWatchById(kv, dep.id);
      if (watch) {
        await clearDepositWatch(kv, { ...watch, status: 'cancelled' });
      }
    } catch {
      /* non-fatal */
    }

    await patchMatchingDepositTx(kv, dep, 'rejected', note || 'admin rejected');

    await saveTx(kv, {
      id: generateId('tx'),
      userId: dep.userId,
      type: 'deposit',
      amount: Number(dep.amount) || 0,
      status: 'rejected',
      description: note
        ? `Deposit rejected (${note})`
        : `Deposit rejected ${dep.amount} USDT (admin)`,
      timestamp: now,
      address: dep.address,
    } as Transaction);

    return NextResponse.json({
      ok: true,
      message: 'Deposit rejected — no balance credited',
      deposit: dep,
    });
  }

  return NextResponse.json({ ok: false, message: 'Unknown action — use approve or reject' }, { status: 400 });
}
