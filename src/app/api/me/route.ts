import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded,
  getUser,
  getUserPlans,
  getUserTransactions,
  getConfig,
  listPlans,
} from '@/lib/kv';
import { getUserToken, parseToken } from '@/lib/auth';
import { planDailyEarn } from '@/types';
import { dedupeWithdrawalTransactions } from '@/lib/tx-utils';

export const runtime = 'edge';

export async function GET() {
  const token = getUserToken();
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const parsed = await parseToken(token);
  if (!parsed || parsed.role !== 'user') return NextResponse.json({ ok: false }, { status: 401 });

  const kv = getStorage();
  await ensureSeeded(kv);
  const user = await getUser(kv, parsed.userId);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const plansRaw = await getUserPlans(kv, user.id);
  const plans = plansRaw.map((p) => ({
    ...p,
    dailyEarn: planDailyEarn(p),
  }));
  const transactionsRaw = await getUserTransactions(kv, user.id, 100);
  const transactions = dedupeWithdrawalTransactions(transactionsRaw);
  const config = await getConfig(kv);
  const catalogRaw = await listPlans(kv);
  const catalog = catalogRaw.map((p) => ({
    ...p,
    dailyEarn: planDailyEarn(p),
    dailyYield: planDailyEarn(p),
  }));

  const referralIds = Array.isArray(user.referrals) ? user.referrals : [];
  const commissionByRelated: Record<string, number> = {};
  for (const tx of transactions) {
    if (tx.type !== 'referral' || !tx.relatedUserId) continue;
    const rid = String(tx.relatedUserId);
    commissionByRelated[rid] = Number(
      ((commissionByRelated[rid] || 0) + (Number(tx.amount) || 0)).toFixed(6)
    );
  }

  const referralList: {
    userId: string;
    username: string;
    commissionEarned: number;
  }[] = [];

  for (const rid of referralIds) {
    const refUser = await getUser(kv, rid);
    referralList.push({
      userId: rid,
      username: refUser?.username || `User ${rid.slice(0, 6)}`,
      commissionEarned: commissionByRelated[rid] || 0,
    });
  }

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
      referralList,
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
      depositPollSeconds: config.depositPollSeconds ?? 60,
      withdrawalNote: config.withdrawalNote,
      supportTelegram: config.supportTelegram || '',
      supportEmail: config.supportEmail || '',
    },
    catalog,
  });
}
