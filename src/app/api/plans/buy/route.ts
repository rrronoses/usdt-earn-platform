import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded, getUser, saveUser, listPlans, getUserPlans, saveUserPlans,
  saveTx, generateId, addDaysISO, getAnalytics, saveAnalytics,
} from '@/lib/kv';
import { getUserToken, parseToken } from '@/lib/auth';
import type { UserPlan, Transaction } from '@/types';

export const runtime = 'edge';

export async function POST(req: Request) {
  const token = getUserToken();
  if (!token) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const parsed = parseToken(token);
  if (!parsed) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const body: any = await req.json().catch(() => ({}));
  const planId = String(body.planId || '');
  if (!planId) return NextResponse.json({ ok: false, message: 'planId required' }, { status: 400 });

  const kv = getStorage();
  await ensureSeeded(kv);
  const user = await getUser(kv, parsed.userId);
  if (!user || user.status === 'banned') {
    return NextResponse.json({ ok: false, message: 'User unavailable' }, { status: 403 });
  }

  const plans = await listPlans(kv);
  const plan = plans.find((p) => p.id === planId && p.active);
  if (!plan) return NextResponse.json({ ok: false, message: 'Plan not found' }, { status: 404 });
  if (plan.isOneTime && plan.id === 'bronze') {
    return NextResponse.json({ ok: false, message: 'Bronze is signup-only' }, { status: 400 });
  }

  const existing = await getUserPlans(kv, user.id);
  const activeSame = existing.find(
    (up) => up.planId === plan.id && up.status === 'active' && new Date(up.expiryDate) > new Date()
  );
  if (activeSame) {
    return NextResponse.json({ ok: false, message: 'Active plan exists; wait until expiry to rebuy' }, { status: 400 });
  }

  if (user.depositBalance < plan.price) {
    return NextResponse.json({ ok: false, message: 'Insufficient deposit balance' }, { status: 400 });
  }

  const now = new Date().toISOString();
  user.depositBalance = Number((user.depositBalance - plan.price).toFixed(6));
  await saveUser(kv, user);

  const up: UserPlan = {
    userPlanId: generateId('up'),
    planId: plan.id,
    name: plan.name,
    price: plan.price,
    dailyYield: plan.dailyYield,
    durationDays: plan.durationDays,
    purchaseDate: now,
    expiryDate: addDaysISO(now, plan.durationDays),
    lastClaimedAt: null,
    claimedDays: 0,
    status: 'active',
  };
  await saveUserPlans(kv, user.id, [...existing, up]);

  await saveTx(kv, {
    id: generateId('tx'),
    userId: user.id,
    type: 'plan_purchase',
    amount: plan.price,
    status: 'completed',
    description: `Purchased ${plan.name} plan`,
    timestamp: now,
  } as Transaction);

  if (user.referredBy && plan.price > 3) {
    const ref = await getUser(kv, user.referredBy);
    if (ref) {
      const commission = Number((plan.price * 0.2).toFixed(6));
      ref.withdrawalBalance = Number((ref.withdrawalBalance + commission).toFixed(6));
      ref.referralEarnings = Number((ref.referralEarnings + commission).toFixed(6));
      await saveUser(kv, ref);
      await saveTx(kv, {
        id: generateId('tx'),
        userId: ref.id,
        type: 'referral',
        amount: commission,
        status: 'completed',
        description: `Referral commission from ${user.username}`,
        timestamp: now,
        relatedUserId: user.id,
      } as Transaction);
    }
  }

  const analytics = await getAnalytics(kv);
  analytics.paidUsersCount += 1;
  await saveAnalytics(kv, analytics);

  return NextResponse.json({ ok: true, message: `Purchased ${plan.name}`, plan: up });
}
