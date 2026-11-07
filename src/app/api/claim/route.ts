import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded, getUser, saveUser, getUserPlans, saveUserPlans,
  saveTx, generateId, isSameDay, getAnalytics, saveAnalytics,
} from '@/lib/kv';
import { getUserToken, parseToken } from '@/lib/auth';
import type { Transaction } from '@/types';

export const runtime = 'edge';

/** Claim daily yield from ALL active (non-expired) plans in one action. */
export async function POST() {
  const token = getUserToken();
  if (!token) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const parsed = parseToken(token);
  if (!parsed) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const kv = getStorage();
  await ensureSeeded(kv);
  const user = await getUser(kv, parsed.userId);
  if (!user) return NextResponse.json({ ok: false, message: 'User not found' }, { status: 404 });

  const now = new Date().toISOString();
  if (isSameDay(user.lastClaimDate, now)) {
    return NextResponse.json({ ok: false, message: 'Already claimed today. Come back tomorrow.' }, { status: 400 });
  }

  let plans = await getUserPlans(kv, user.id);
  let total = 0;
  const breakdown: { name: string; dailyYield: number }[] = [];

  plans = plans.map((p) => {
    if (p.status !== 'active') return p;
    if (new Date(p.expiryDate) < new Date()) {
      return { ...p, status: 'expired' as const };
    }
    // Sum every active plan (e.g. Bronze + Silver both pay)
    total += Number(p.dailyYield) || 0;
    breakdown.push({ name: p.name, dailyYield: p.dailyYield });
    return {
      ...p,
      lastClaimedAt: now,
      claimedDays: (p.claimedDays || 0) + 1,
    };
  });

  if (total <= 0) {
    await saveUserPlans(kv, user.id, plans);
    return NextResponse.json({ ok: false, message: 'No active plans to claim. Buy a plan first.' }, { status: 400 });
  }

  total = Number(total.toFixed(6));
  user.withdrawalBalance = Number((user.withdrawalBalance + total).toFixed(6));
  user.todayEarnings = total;
  user.lastClaimDate = now;
  await saveUser(kv, user);
  await saveUserPlans(kv, user.id, plans);

  const planNames = breakdown.map((b) => b.name).join(' + ');
  await saveTx(kv, {
    id: generateId('tx'),
    userId: user.id,
    type: 'yield',
    amount: total,
    status: 'completed',
    description: `Daily yield ${total} USDT from ${breakdown.length} plan(s): ${planNames}`,
    timestamp: now,
  } as Transaction);

  const analytics = await getAnalytics(kv);
  analytics.totalYieldPaid = Number((analytics.totalYieldPaid + total).toFixed(6));
  await saveAnalytics(kv, analytics);

  return NextResponse.json({
    ok: true,
    claimed: total,
    planCount: breakdown.length,
    breakdown,
    withdrawalBalance: user.withdrawalBalance,
    message: `Claimed ${total} USDT from ${breakdown.length} plan(s)`,
  });
}
