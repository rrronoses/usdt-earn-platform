import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded,
  getUser,
  saveUser,
  getUserPlans,
  saveUserPlans,
  listPlans,
  saveTx,
  generateId,
  addDaysISO,
} from '@/lib/kv';
import { getUserToken, parseToken } from '@/lib/auth';
import { planDailyEarn } from '@/types';
import type { UserPlan, Transaction } from '@/types';

export const runtime = 'edge';

export async function POST(req: Request) {
  const token = getUserToken();
  if (!token) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const parsed = parseToken(token);
  if (!parsed || parsed.role !== 'user') {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body: any = await req.json().catch(() => ({}));
  const planId = String(body.planId || '');
  if (!planId) return NextResponse.json({ ok: false, message: 'planId required' }, { status: 400 });

  const kv = getStorage();
  await ensureSeeded(kv);
  const user = await getUser(kv, parsed.userId);
  if (!user) return NextResponse.json({ ok: false, message: 'User not found' }, { status: 404 });
  if (user.status === 'banned') {
    return NextResponse.json({ ok: false, message: 'Account banned' }, { status: 403 });
  }

  const catalog = await listPlans(kv);
  const plan = catalog.find((p) => p.id === planId && p.active);
  if (!plan) return NextResponse.json({ ok: false, message: 'Plan not found' }, { status: 404 });

  const owned = await getUserPlans(kv, user.id);
  if (plan.isOneTime && owned.some((p) => p.planId === plan.id && p.status === 'active')) {
    return NextResponse.json({ ok: false, message: 'This one-time plan is already owned' }, { status: 400 });
  }

  const price = Number(plan.price) || 0;
  if (user.depositBalance < price) {
    return NextResponse.json({ ok: false, message: 'Insufficient deposit balance' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const daily = planDailyEarn(plan);

  user.depositBalance = Number((user.depositBalance - price).toFixed(6));
  await saveUser(kv, user);

  const userPlan: UserPlan = {
    userPlanId: generateId('up'),
    planId: plan.id,
    name: plan.name,
    price: plan.price,
    dailyEarn: daily,
    durationDays: plan.durationDays,
    purchaseDate: now,
    expiryDate: addDaysISO(now, plan.durationDays),
    lastClaimedAt: null,
    claimedDays: 0,
    status: 'active',
  };
  owned.push(userPlan);
  await saveUserPlans(kv, user.id, owned);

  await saveTx(kv, {
    id: generateId('tx'),
    userId: user.id,
    type: 'plan_purchase',
    amount: price,
    status: 'completed',
    description: `Purchased ${plan.name} plan`,
    timestamp: now,
  } as Transaction);

  return NextResponse.json({
    ok: true,
    userPlan,
    depositBalance: user.depositBalance,
    message: `Purchased ${plan.name}`,
  });
}
