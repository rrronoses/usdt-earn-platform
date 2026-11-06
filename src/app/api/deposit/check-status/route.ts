import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded,
  getUser,
  getDeposit,
  getDepositWatchById,
  getUserTransactions,
} from '@/lib/kv';
import { verifyDepositWatch } from '@/lib/deposit-engine';
import { getUserToken, parseToken } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(req: Request) {
  const token = getUserToken();
  if (!token) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const parsed = parseToken(token);
  if (!parsed) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const depositId = url.searchParams.get('depositId');
  if (!depositId) {
    return NextResponse.json({ ok: false, message: 'depositId required' }, { status: 400 });
  }

  const kv = getStorage();
  await ensureSeeded(kv);

  const verify = await verifyDepositWatch(kv, { depositId });

  const dep = await getDeposit(kv, depositId);
  const watch = await getDepositWatchById(kv, depositId);
  const user = await getUser(kv, parsed.userId);

  if (dep && dep.userId !== parsed.userId) {
    return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    depositId,
    status: dep?.status || watch?.status || 'unknown',
    credited: verify.credited,
    matchedTxId: watch?.matchedTxId || verify.txId,
    creditedAmount: watch?.creditedAmount || verify.amount,
    balances: user
      ? {
          depositBalance: user.depositBalance,
          withdrawalBalance: user.withdrawalBalance,
          totalBalance: user.depositBalance + user.withdrawalBalance,
        }
      : null,
    reason: verify.reason,
  });
}
