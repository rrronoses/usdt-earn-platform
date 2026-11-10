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
import { planDailyEarn, analyticsEarnPaid } from '@/types';
import type { Transaction } from '@/types';

export const runtime = 'edge';

const CLAIM_COOLDOWN_MS = 24 * 60 * 60 * 1000;

function isPaidPlan(planId: string, planName: string): boolean {
  const id = (planId || '').toLowerCase();
  const name = (planName || '').toLowerCase();
  if (id === 'bronze' || name === 'bronze') return false;
  return true;
}

function msUntilNextClaim(lastClaimedAt: string | null | undefined): number {
  if (!lastClaimedAt) return 0;
  const last = new Date(lastClaimedAt).getTime();
  if (Number.isNaN(last)) return 0;
  return Math.max(0, CLAIM_COOLDOWN_MS - (Date.now() - last));
}

function formatRemaining(ms: number): string {
  const totalMin = Math.ceil(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

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
  const nowMs = Date.now();
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

  const remainingMs = msUntilNextClaim(plan.lastClaimedAt);
  if (remainingMs > 0) {
    const nextClaimAt = new Date(
      new Date(plan.lastClaimedAt as string).getTime() + CLAIM_COOLDOWN_MS
    ).toISOString();
    return NextResponse.json(
      {
        ok: false,
        alreadyClaimed: true,
        lastClaimedAt: plan.lastClaimedAt,
        nextClaimAt,
        remainingMs,
        userPlanId: plan.userPlanId,
        message: `Already claimed ${plan.name}. Next claim in ${formatRemaining(remainingMs)} (24h limit).`,
      },
      { status: 400 }
    );
  }

  const amount = planDailyEarn(plan);
  if (amount <= 0) {
    return NextResponse.json({ ok: false, message: 'Invalid plan earn amount' }, { status: 400 });
  }

  const updatedPlan = {
    ...plan,
    dailyEarn: amount,
    lastClaimedAt: now,
    claimedDays: (plan.claimedDays || 0) + 1,
  };
  plans[idx] = updatedPlan;

  user.withdrawalBalance = Number((user.withdrawalBalance + amount).toFixed(6));
  if (isSameDay(user.lastClaimDate, now)) {
    user.todayEarnings = Number((user.todayEarnings + amount).toFixed(6));
  } else {
    user.todayEarnings = amount;
  }
  user.lastClaimDate = now;

  await saveUserPlans(kv, user.id, plans);
  await saveUser(kv, user);

  await saveTx(kv, {
    id: generateId('tx'),
    userId: user.id,
    type: 'earn',
    amount,
    status: 'completed',
    description: `Daily earn ${amount} USDT — ${plan.name}`,
    timestamp: now,
  } as Transaction);

  let referralPaid = 0;
  if (isPaidPlan(plan.planId, plan.name) && user.referredBy) {
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
  const paid = analyticsEarnPaid(analytics) + amount;
  analytics.totalEarnPaid = Number(paid.toFixed(6));
  analytics.totalYieldPaid = analytics.totalEarnPaid; // keep legacy field in sync
  await saveAnalytics(kv, analytics);

  const nextClaimAt = new Date(nowMs + CLAIM_COOLDOWN_MS).toISOString();

  return NextResponse.json({
    ok: true,
    claimed: amount,
    planName: plan.name,
    userPlanId: plan.userPlanId,
    lastClaimedAt: now,
    nextClaimAt,
    withdrawalBalance: user.withdrawalBalance,
    todayEarnings: user.todayEarnings,
    referralPaid,
    message: `Claimed ${amount} USDT from ${plan.name}. Next claim after 24 hours.`,
  });
}
