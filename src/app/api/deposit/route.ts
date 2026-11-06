import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded,
  getUser,
  getActiveDepositAddress,
  saveDeposit,
  saveTx,
  saveDepositWatch,
  getDepositWatchByAddress,
  generateId,
} from '@/lib/kv';
import { getUserToken, parseToken } from '@/lib/auth';
import type { DepositRequest, DepositWatch, Transaction } from '@/types';

export const runtime = 'edge';

export async function POST(req: Request) {
  const token = getUserToken();
  if (!token) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const parsed = parseToken(token);
  if (!parsed) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const amount = Number(body.amount);
  if (!amount || amount <= 0) {
    return NextResponse.json({ ok: false, message: 'Invalid amount' }, { status: 400 });
  }

  const kv = getStorage();
  await ensureSeeded(kv);
  const user = await getUser(kv, parsed.userId);
  if (!user) return NextResponse.json({ ok: false, message: 'User not found' }, { status: 404 });
  if (user.status === 'banned') {
    return NextResponse.json({ ok: false, message: 'Account banned' }, { status: 403 });
  }

  const addr = await getActiveDepositAddress(kv);
  if (!addr?.address) {
    return NextResponse.json(
      { ok: false, message: 'No USDT TRC-20 deposit address configured. Contact admin.' },
      { status: 400 }
    );
  }

  const existingWatch = await getDepositWatchByAddress(kv, addr.address);
  if (existingWatch && existingWatch.status === 'pending' && existingWatch.userId === user.id) {
    return NextResponse.json({
      ok: false,
      message: 'You already have a pending deposit. Send funds or wait for confirmation.',
      depositId: existingWatch.depositId,
      address: existingWatch.address,
      network: 'TRC20',
      amount: existingWatch.expectedAmount,
    });
  }

  const id = generateId('dep');
  const now = new Date().toISOString();

  const dep: DepositRequest = {
    id,
    userId: user.id,
    username: user.username,
    amount,
    address: addr.address,
    network: 'TRC20',
    status: 'pending',
    createdAt: now,
  };
  await saveDeposit(kv, dep);

  const watch: DepositWatch = {
    depositId: id,
    userId: user.id,
    address: addr.address,
    expectedAmount: amount,
    createdAt: now,
    status: 'pending',
  };
  await saveDepositWatch(kv, watch);

  const tx: Transaction = {
    id,
    userId: user.id,
    type: 'deposit',
    amount,
    status: 'pending',
    description: `Deposit request ${amount} USDT (TRC20)`,
    timestamp: now,
    address: addr.address,
  };
  await saveTx(kv, tx);

  return NextResponse.json({
    ok: true,
    depositId: id,
    address: addr.address,
    network: 'TRC20',
    contract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    amount,
    message: 'Send exact USDT TRC-20 to the address. Balance credits automatically after on-chain confirmation.',
  });
}
