import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded, getUser, saveUser, getConfig, saveWithdrawal, saveTx, generateId,
} from '@/lib/kv';
import { getUserToken, parseToken } from '@/lib/auth';
import type { WithdrawalRequest, Transaction } from '@/types';

export const runtime = 'edge';

export async function POST(req: Request) {
  const token = getUserToken();
  if (!token) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const parsed = parseToken(token);
  if (!parsed) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const amount = Number(body.amount);
  const destinationAddress = String(body.address || body.destinationAddress || '').trim();

  if (!amount || amount <= 0) {
    return NextResponse.json({ ok: false, message: 'Invalid amount' }, { status: 400 });
  }
  if (!destinationAddress || destinationAddress.length < 20) {
    return NextResponse.json({ ok: false, message: 'Valid USDT TRC-20 address required' }, { status: 400 });
  }

  const kv = getStorage();
  await ensureSeeded(kv);
  const config = await getConfig(kv);
  if (amount < config.minWithdrawalLimit) {
    return NextResponse.json(
      { ok: false, message: `Minimum withdrawal is ${config.minWithdrawalLimit} USDT` },
      { status: 400 }
    );
  }

  const user = await getUser(kv, parsed.userId);
  if (!user) return NextResponse.json({ ok: false, message: 'User not found' }, { status: 404 });
  if (user.withdrawalBalance < amount) {
    return NextResponse.json({ ok: false, message: 'Insufficient withdrawal balance' }, { status: 400 });
  }

  const now = new Date().toISOString();
  user.withdrawalBalance = Number((user.withdrawalBalance - amount).toFixed(6));
  await saveUser(kv, user);

  const w: WithdrawalRequest = {
    id: generateId('wd'),
    userId: user.id,
    username: user.username,
    amount,
    destinationAddress,
    status: 'pending',
    requestedAt: now,
  };
  await saveWithdrawal(kv, w);

  await saveTx(kv, {
    id: w.id,
    userId: user.id,
    type: 'withdrawal',
    amount,
    status: 'pending',
    description: `Withdrawal request ${amount} USDT`,
    timestamp: now,
    address: destinationAddress,
  } as Transaction);

  return NextResponse.json({
    ok: true,
    message: config.withdrawalNote || 'Withdrawal submitted for admin review (2–3 hours).',
    withdrawalId: w.id,
    withdrawalBalance: user.withdrawalBalance,
  });
}
