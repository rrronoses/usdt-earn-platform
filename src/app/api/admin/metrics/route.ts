import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded,
  listUsers,
  listPendingWithdrawals,
  listPendingDeposits,
  getAnalytics,
  listPlans,
  listDepositAddresses,
  getUserTransactions,
} from '@/lib/kv';
import { getAdminToken, parseToken } from '@/lib/auth';
import { analyticsEarnPaid, planDailyEarn } from '@/types';
import { isEarnTxType } from '@/lib/labels';

export const runtime = 'edge';

export async function GET() {
  const tok = getAdminToken();
  if (!tok || parseToken(tok)?.role !== 'admin') {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const kv = getStorage();
  await ensureSeeded(kv);

  const users = await listUsers(kv, 500);
  const pendingW = await listPendingWithdrawals(kv);
  const pendingD = await listPendingDeposits(kv);
  const analytics = await getAnalytics(kv);
  const plans = await listPlans(kv);
  const addresses = await listDepositAddresses(kv);

  let tvlDeposit = 0;
  let tvlWithdraw = 0;
  let paidUsers = 0;
  let activeUsers = 0;
  let bannedUsers = 0;

  for (const u of users) {
    tvlDeposit += Number(u.depositBalance) || 0;
    tvlWithdraw += Number(u.withdrawalBalance) || 0;
    if (u.status === 'banned') bannedUsers += 1;
    else activeUsers += 1;
  }

  // rough paid users from analytics or count non-bronze plan holders would need plans — use analytics
  paidUsers = Number(analytics.paidUsersCount) || 0;

  // 7-day trends from sampling recent user txs (lightweight)
  const days: string[] = [];
  const deposits: number[] = [];
  const earnPaid: number[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
    deposits.push(0);
    earnPaid.push(0);
  }
  const dayIndex = new Map(days.map((d, i) => [d, i]));

  for (const u of users.slice(0, 80)) {
    const txs = await getUserTransactions(kv, u.id, 40);
    for (const tx of txs) {
      const day = String(tx.timestamp || '').slice(0, 10);
      const idx = dayIndex.get(day);
      if (idx === undefined) continue;
      if (tx.type === 'deposit' && tx.status === 'completed') {
        deposits[idx] += Number(tx.amount) || 0;
      }
      if (isEarnTxType(tx.type) && tx.status === 'completed') {
        earnPaid[idx] += Number(tx.amount) || 0;
      }
    }
  }

  const totalEarn = analyticsEarnPaid(analytics);

  return NextResponse.json({
    ok: true,
    metrics: {
      totalUsers: users.length,
      activeUsers,
      bannedUsers,
      paidUsers,
      pendingWithdrawals: pendingW.length,
      pendingDeposits: pendingD.length,
      totalDepositsVolume: analytics.totalDeposits,
      totalWithdrawalsVolume: analytics.totalWithdrawals,
      totalEarnPaid: totalEarn,
      totalYieldPaid: totalEarn, // alias for older admin UI
      tvlDepositBalance: Number(tvlDeposit.toFixed(6)),
      tvlWithdrawalBalance: Number(tvlWithdraw.toFixed(6)),
      platformTvl: Number((tvlDeposit + tvlWithdraw).toFixed(6)),
      depositAddressesEnabled: addresses.filter((a) => a.active).length,
      depositAddressesTotal: addresses.length,
      plansActive: plans.filter((p) => p.active).length,
      storageBackend: 'USDTSTORAGE',
      workerHealth: 'ok',
      trends: {
        days,
        deposits,
        earnPaid,
        yieldPaid: earnPaid,
      },
    },
  });
}
