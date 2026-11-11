import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded,
  listUsers,
  getUser,
  saveUser,
  deleteUser,
  getUserPlans,
  getUserTransactions,
  saveTx,
  generateId,
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
    if (txType) {
      const t = txType.toLowerCase();
      txs = txs.filter((x) => {
        const xt = String(x.type).toLowerCase();
        if (t === 'earn') return xt === 'earn' || xt === 'yield';
        return xt === t;
      });
    }
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
    return NextResponse.json({ ok: true, message: 'User banned', user: { ...user, passwordHash: undefined } });
  }
  if (action === 'unban' && user) {
    user.status = 'active';
    await saveUser(kv, user);
    return NextResponse.json({ ok: true, message: 'User unbanned', user: { ...user, passwordHash: undefined } });
  }
  if (action === 'delete') {
    const removed = await deleteUser(kv, userId);
    return NextResponse.json({
      ok: true,
      message: removed ? 'User permanently deleted' : 'User key cleared',
    });
  }

  if (action === 'adjustBalance' && user) {
    const raw = Number(body.amount);
    if (!Number.isFinite(raw) || raw === 0) {
      return NextResponse.json({ ok: false, message: 'Enter a valid non-zero amount' }, { status: 400 });
    }

    const balanceType = body.balanceType === 'withdrawal' ? 'withdrawal' : 'deposit';
    // mode: add | subtract | auto (sign of amount)
    const modeRaw = String(body.mode || 'auto').toLowerCase();
    let signed: number;
    if (modeRaw === 'add' || modeRaw === 'plus' || modeRaw === '+') {
      signed = Math.abs(raw);
    } else if (modeRaw === 'subtract' || modeRaw === 'sub' || modeRaw === 'minus' || modeRaw === '-') {
      signed = -Math.abs(raw);
    } else {
      signed = raw; // positive = add, negative = subtract
    }

    const absAmt = Number(Math.abs(signed).toFixed(6));
    if (absAmt <= 0) {
      return NextResponse.json({ ok: false, message: 'Amount must be greater than 0' }, { status: 400 });
    }

    const before =
      balanceType === 'deposit'
        ? Number(user.depositBalance || 0)
        : Number(user.withdrawalBalance || 0);

    let after = Number((before + signed).toFixed(6));
    if (after < 0) {
      return NextResponse.json(
        {
          ok: false,
          message: `Cannot subtract ${absAmt} USDT — ${balanceType} balance is only ${before.toFixed(2)} USDT`,
        },
        { status: 400 }
      );
    }

    if (balanceType === 'deposit') {
      user.depositBalance = after;
    } else {
      user.withdrawalBalance = after;
    }

    await saveUser(kv, user);

    const isAdd = signed > 0;
    const now = new Date().toISOString();
    await saveTx(kv, {
      id: generateId('tx'),
      userId: user.id,
      type: isAdd ? 'admin_add' : 'admin_sub',
      amount: isAdd ? absAmt : -absAmt,
      status: 'completed',
      description: isAdd
        ? `Admin added ${absAmt} USDT (${balanceType})`
        : `Admin subtracted ${absAmt} USDT (${balanceType})`,
      timestamp: now,
    } as Transaction);

    return NextResponse.json({
      ok: true,
      message: isAdd
        ? `Added ${absAmt} USDT to ${balanceType} (${before.toFixed(2)} → ${after.toFixed(2)})`
        : `Subtracted ${absAmt} USDT from ${balanceType} (${before.toFixed(2)} → ${after.toFixed(2)})`,
      user: { ...user, passwordHash: undefined },
      before,
      after,
      balanceType,
    });
  }

  return NextResponse.json({ ok: false, message: 'Unknown action' }, { status: 400 });
}
