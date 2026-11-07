import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import { ensureSeeded, getUser, getUserPlans, getUserTransactions, getConfig, listPlans } from '@/lib/kv';
import { getUserToken, parseToken } from '@/lib/auth';

export const runtime = 'edge';

export async function GET() {
  const token = getUserToken();
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const parsed = parseToken(token);
  if (!parsed || parsed.role !== 'user') return NextResponse.json({ ok: false }, { status: 401 });

  const kv = getStorage();
  await ensureSeeded(kv);
  const user = await getUser(kv, parsed.userId);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const plans = await getUserPlans(kv, user.id);
  const transactions = await getUserTransactions(kv, user.id, 100);
  const config = await getConfig(kv);
  const catalog = await listPlans(kv);

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      depositBalance: user.depositBalance,
      withdrawalBalance: user.withdrawalBalance,
      totalBalance: user.depositBalance + user.withdrawalBalance,
      todayEarnings: user.todayEarnings,
      referralCode: user.referralCode,
      referralEarnings: user.referralEarnings,
      referrals: user.referrals,
      status: user.status,
      createdAt: user.createdAt,
      avatarSeed: user.avatarSeed,
      lastClaimDate: user.lastClaimDate,
    },
    plans,
    transactions,
    config: {
      minWithdrawalLimit: config.minWithdrawalLimit,
      minDepositLimit: config.minDepositLimit,
      maxDepositLimit: config.maxDepositLimit,
      depositAddress: config.depositAddress,
      depositNetwork: config.depositNetwork,
      depositExpiryMinutes: config.depositExpiryMinutes,
      withdrawalNote: config.withdrawalNote,
    },
    catalog,
  });
}
