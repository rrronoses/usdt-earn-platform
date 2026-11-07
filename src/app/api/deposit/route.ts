import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded,
  getUser,
  pickRandomDepositAddress,
  getConfig,
  saveDeposit,
  saveTx,
  saveDepositWatch,
  listPendingDeposits,
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

  const body: any = await req.json().catch(() => ({}));
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

  const cfg = await getConfig(kv);
  const minD = Number(cfg.minDepositLimit ?? 1);
  const maxD = Number(cfg.maxDepositLimit ?? 10000);
  if (amount < minD) {
    return NextResponse.json({ ok: false, message: `Minimum deposit is ${minD} USDT` }, { status: 400 });
  }
  if (amount > maxD) {
    return NextResponse.json({ ok: false, message: `Maximum deposit is ${maxD} USDT` }, { status: 400 });
  }

  const pending = await listPendingDeposits(kv);
  const mine = pending.find((d) => d.userId === user.id && d.status === 'pending');
  if (mine) {
    return NextResponse.json({
      ok: false,
      message: 'You already have a pending deposit. Send funds or wait for confirmation.',
      depositId: mine.id,
      address: mine.address,
      network: 'TRC20',
      amount: mine.amount,
    });
  }

  const addr = await pickRandomDepositAddress(kv);
  if (!addr?.address) {
    return NextResponse.json(
      { ok: false, message: 'No USDT TRC-20 deposit address configured. Contact admin.' },
      { status: 400 }
    );
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
    message:
      'Send exact USDT TRC-20 to this address (randomly assigned from admin pool). Balance credits after on-chain confirmation.',
  });
}
