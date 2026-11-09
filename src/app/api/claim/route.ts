import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded,
  getUser,
  saveUser,
  getUserPlans,
  saveUserPlans,
  saveTx,
  generateId,
  isSameDay,
  getAnalytics,
  saveAnalytics,
} from '@/lib/kv';
import { getUserToken, parseToken } from '@/lib/auth';
import type { Transaction } from '@/types';

export const runtime = 'edge';

/** Paid plan ids eligible for referral commission on daily claims. */
function isPaidPlan(planId: string, planName: string, price: number): boolean {
  const id = (planId || '').toLowerCase();
  if (id === 'bronze') return false;
  // Free bronze is signup-only; never pay referral on its claims
  if (price > 0 && price <= 3 && id.includes('bronze')) return false;
  // Any non-bronze active claim from a purchased tier
  if (id === 'bronze' || planName.toLowerCase() === 'bronze') return false;
  return true;
}

/**
 * Claim daily earn for ONE purchased plan.
 * Body: { userPlanId: string }
 *
 * Referral: 20% of this claim goes to referrer ONLY when the claimed plan is a paid plan
 * (not free Bronze). No commission on deposits or plan purchases.
 */
export async function POST(req: NextRequest) {
  const token = getUserToken();
  if (!token) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const parsed = parseToken(token);
  if (!parsed) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const body: any = await req.json().catch(() => ({}));
  const userPlanId = String(body.userPlanId || '').trim();
  if (!userPlanId) {
    return NextResponse.json(
      { ok: false, message: 'Select a plan to claim (userPlanId required)' },
      { status: 400 }
    );
  }

  const kv = getStorage();
  await ensureSeeded(kv);
  const user = await getUser(kv, parsed.userId);
  if (!user) return NextResponse.json({ ok: false, message: 'User not found' }, { status: 404 });

  const now = new Date().toISOString();
  let plans = await getUserPlans(kv, user.id);

  plans = plans.map((p) => {
    if (p.status === 'active' && new Date(p.expiryDate) < new Date()) {
      return { ...p, status: 'expired' as const };
    }
    return p;
  });

  const idx = plans.findIndex((p) => p.userPlanId === userPlanId);
  if (idx < 0) {
    return NextResponse.json({ ok: false, message: 'Plan not found' }, { status: 404 });
  }

  const plan = plans[idx];
  if (plan.status !== 'active') {
    return NextResponse.json({ ok: false, message: 'This plan is expired' }, { status: 400 });
  }
  if (new Date(plan.expiryDate) < new Date()) {
    plans[idx] = { ...plan, status: 'expired' };
    await saveUserPlans(kv, user.id, plans);
    return NextResponse.json({ ok: false, message: 'This plan is expired' }, { status: 400 });
  }

  if (isSameDay(plan.lastClaimedAt, now)) {
    return NextResponse.json(
      { ok: false, message: `Already claimed ${plan.name} today. Come back tomorrow.` },
      { status: 400 }
    );
  }

  const amount = Number(plan.dailyYield) || 0;
  if (amount <= 0) {
    return NextResponse.json({ ok: false, message: 'Invalid plan earn amount' }, { status: 400 });
  }

  plans[idx] = {
    ...plan,
    lastClaimedAt: now,
    claimedDays: (plan.claimedDays || 0) + 1,
  };

  user.withdrawalBalance = Number((user.withdrawalBalance + amount).toFixed(6));
  if (isSameDay(user.lastClaimDate, now)) {
    user.todayEarnings = Number((user.todayEarnings + amount).toFixed(6));
  } else {
    user.todayEarnings = amount;
  }
  user.lastClaimDate = now;

  await saveUser(kv, user);
  await saveUserPlans(kv, user.id, plans);

  await saveTx(kv, {
    id: generateId('tx'),
    userId: user.id,
    type: 'yield',
    amount,
    status: 'completed',
    description: `Daily earn ${amount} USDT — ${plan.name}`,
    timestamp: now,
  } as Transaction);

  // 20% referral on paid-plan daily claims only (exclude free Bronze)
  let referralPaid = 0;
  const paid = isPaidPlan(plan.planId, plan.name, Number(plan.price) || 0);
  if (paid && user.referredBy) {
    const ref = await getUser(kv, user.referredBy);
    if (ref && ref.status !== 'banned') {
      const commission = Number((amount * 0.2).toFixed(6));
      if (commission > 0) {
        ref.withdrawalBalance = Number((ref.withdrawalBalance + commission).toFixed(6));
        ref.referralEarnings = Number(((ref.referralEarnings || 0) + commission).toFixed(6));
        await saveUser(kv, ref);
        await saveTx(kv, {
          id: generateId('tx'),
          userId: ref.id,
          type: 'referral',
          amount: commission,
          status: 'completed',
          description: `20% of ${user.username}'s ${plan.name} claim (${amount} USDT)`,
          timestamp: now,
          relatedUserId: user.id,
        } as Transaction);
        referralPaid = commission;
      }
    }
  }

  const analytics = await getAnalytics(kv);
  analytics.totalYieldPaid = Number((analytics.totalYieldPaid + amount).toFixed(6));
  await saveAnalytics(kv, analytics);

  return NextResponse.json({
    ok: true,
    claimed: amount,
    planName: plan.name,
    userPlanId: plan.userPlanId,
    withdrawalBalance: user.withdrawalBalance,
    referralPaid,
    message: `Claimed ${amount} USDT from ${plan.name}`,
  });
}
