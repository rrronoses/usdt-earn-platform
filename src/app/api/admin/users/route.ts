import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded, listUsers, getUser, saveUser, getUserPlans, getUserTransactions,
  saveTx, generateId,
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

export async function GET(req: Request) {
  if (!requireAdmin()) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const kv = getStorage();
  await ensureSeeded(kv);
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  const filter = url.searchParams.get('filter') || 'all';
  const txType = url.searchParams.get('txType') || '';

  if (userId) {
    const user = await getUser(kv, userId);
    if (!user) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
    const plans = await getUserPlans(kv, userId);
    let txs = await getUserTransactions(kv, userId, 200);
    if (txType) txs = txs.filter((t) => t.type === txType);
    const { passwordHash: _, ...safe } = user;
    return NextResponse.json({ ok: true, user: safe, plans, transactions: txs });
  }

  let users = await listUsers(kv);
  if (filter === 'free' || filter === 'paid') {
    const out = [];
    for (const u of users) {
      const plans = await getUserPlans(kv, u.id);
      const paid = plans.some((p) => p.price > 3 && p.status === 'active');
      if (filter === 'paid' && paid) out.push(u);
      if (filter === 'free' && !paid) out.push(u);
    }
    users = out;
  }

  const list = users.map(({ passwordHash: _, ...u }) => u);
  return NextResponse.json({ ok: true, users: list });
}

export async function POST(req: Request) {
  if (!requireAdmin()) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const kv = getStorage();
  await ensureSeeded(kv);
  const body: any = await req.json().catch(() => ({}));
  const action = String(body.action || '');
  const userId = String(body.userId || '');
  if (!userId) return NextResponse.json({ ok: false, message: 'userId required' }, { status: 400 });

  const user = await getUser(kv, userId);
  if (!user && action !== 'delete') {
    return NextResponse.json({ ok: false, message: 'User not found' }, { status: 404 });
  }

  if (action === 'ban' && user) {
    user.status = 'banned';
    await saveUser(kv, user);
    return NextResponse.json({ ok: true, user: { ...user, passwordHash: undefined } });
  }
  if (action === 'unban' && user) {
    user.status = 'active';
    await saveUser(kv, user);
    return NextResponse.json({ ok: true, user: { ...user, passwordHash: undefined } });
  }
  if (action === 'delete') {
    if (user) {
      user.status = 'banned';
      user.depositBalance = 0;
      user.withdrawalBalance = 0;
      user.email = `deleted_${user.id}@removed.local`;
      await saveUser(kv, user);
    }
    return NextResponse.json({ ok: true, message: 'User removed' });
  }
  if (action === 'adjustBalance' && user) {
    const amount = Number(body.amount);
    const balanceType = body.balanceType === 'withdrawal' ? 'withdrawal' : 'deposit';
    if (!Number.isFinite(amount) || amount === 0) {
      return NextResponse.json({ ok: false, message: 'Invalid amount' }, { status: 400 });
    }
    if (balanceType === 'deposit') {
      user.depositBalance = Number((user.depositBalance + amount).toFixed(6));
      if (user.depositBalance < 0) user.depositBalance = 0;
    } else {
      user.withdrawalBalance = Number((user.withdrawalBalance + amount).toFixed(6));
      if (user.withdrawalBalance < 0) user.withdrawalBalance = 0;
    }
    await saveUser(kv, user);
    const now = new Date().toISOString();
    await saveTx(kv, {
      id: generateId('tx'),
      userId: user.id,
      type: amount > 0 ? 'admin_add' : 'admin_sub',
      amount: Math.abs(amount),
      status: 'completed',
      description: `Admin ${amount > 0 ? 'added' : 'subtracted'} ${Math.abs(amount)} USDT (${balanceType})`,
      timestamp: now,
    } as Transaction);
    return NextResponse.json({ ok: true, user: { ...user, passwordHash: undefined } });
  }

  return NextResponse.json({ ok: false, message: 'Unknown action' }, { status: 400 });
}
