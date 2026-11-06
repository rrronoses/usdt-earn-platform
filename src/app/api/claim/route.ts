import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded, getUser, saveUser, getUserPlans, saveUserPlans,
  saveTx, generateId, isSameDay, getAnalytics, saveAnalytics,
} from '@/lib/kv';
import { getUserToken, parseToken } from '@/lib/auth';
import type { Transaction } from '@/types';

export const runtime = 'edge';

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
    return NextResponse.json({ ok: false, message: 'Already claimed today' }, { status: 400 });
  }

  let plans = await getUserPlans(kv, user.id);
  let total = 0;
  plans = plans.map((p) => {
    if (p.status !== 'active') return p;
    if (new Date(p.expiryDate) < new Date()) {
      return { ...p, status: 'expired' as const };
    }
    total += p.dailyYield;
    return { ...p, lastClaimedAt: now, claimedDays: p.claimedDays + 1 };
  });

  if (total <= 0) {
    await saveUserPlans(kv, user.id, plans);
    return NextResponse.json({ ok: false, message: 'No active plans to claim' }, { status: 400 });
  }

  user.withdrawalBalance = Number((user.withdrawalBalance + total).toFixed(6));
  user.todayEarnings = total;
  user.lastClaimDate = now;
  await saveUser(kv, user);
  await saveUserPlans(kv, user.id, plans);

  await saveTx(kv, {
    id: generateId('tx'),
    userId: user.id,
    type: 'yield',
    amount: total,
    status: 'completed',
    description: `Daily yield claim ${total} USDT`,
    timestamp: now,
  } as Transaction);

  const analytics = await getAnalytics(kv);
  analytics.totalYieldPaid = Number((analytics.totalYieldPaid + total).toFixed(6));
  await saveAnalytics(kv, analytics);

  return NextResponse.json({ ok: true, claimed: total, withdrawalBalance: user.withdrawalBalance });
}
