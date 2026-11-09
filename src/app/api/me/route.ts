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

  // Build per-referral breakdown: username + commission earned from that user
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
      withdrawalNote: config.withdrawalNote,
    },
    catalog,
  });
}
