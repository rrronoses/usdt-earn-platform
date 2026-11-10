import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded,
  getUserByEmail,
  getUserByUsername,
  getUser,
  saveUser,
  saveUserPlans,
  saveTx,
  generateUserId,
  generateId,
  addDaysISO,
  getAnalytics,
  saveAnalytics,
} from '@/lib/kv';
import { hashPassword, createToken, userCookieOptions } from '@/lib/auth';
import type { User, UserPlan, Transaction } from '@/types';

export const runtime = 'edge';

export async function POST(req: Request) {
  const body: any = await req.json().catch(() => ({}));
  const username = String(body.username || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const referralCode = String(body.referralCode || body.ref || '').trim();

  if (!username || username.length < 3) {
    return NextResponse.json({ ok: false, message: 'Username min 3 characters' }, { status: 400 });
  }
  if (!email || !email.includes('@')) {
    return NextResponse.json({ ok: false, message: 'Valid email required' }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ ok: false, message: 'Password min 6 characters' }, { status: 400 });
  }

  const kv = getStorage();
  await ensureSeeded(kv);

  if (await getUserByEmail(kv, email)) {
    return NextResponse.json({ ok: false, message: 'Email already registered' }, { status: 400 });
  }
  if (await getUserByUsername(kv, username)) {
    return NextResponse.json({ ok: false, message: 'Username taken' }, { status: 400 });
  }

  let referredBy: string | null = null;
  if (referralCode) {
    const ref = await getUser(kv, referralCode);
    if (ref) referredBy = ref.id;
  }

  const id = generateUserId();
  const now = new Date().toISOString();

  const user: User = {
    id,
    username,
    email,
    passwordHash: hashPassword(password),
    depositBalance: 0,
    withdrawalBalance: 0,
    todayEarnings: 0,
    lastClaimDate: null,
    referralCode: id,
    referredBy,
    referrals: [],
    referralEarnings: 0,
    status: 'active',
    createdAt: now,
    avatarSeed: username + id,
  };
  await saveUser(kv, user);

  if (referredBy) {
    const ref = await getUser(kv, referredBy);
    if (ref) {
      ref.referrals = [...(ref.referrals || []), id];
      await saveUser(kv, ref);
    }
  }

  // Free Bronze plan only (plan value, not cash balance)
  const bronze: UserPlan = {
    userPlanId: generateId('up'),
    planId: 'bronze',
    name: 'Bronze',
    price: 3,
    dailyEarn: 1,
    durationDays: 7,
    purchaseDate: now,
    expiryDate: addDaysISO(now, 7),
    lastClaimedAt: null,
    claimedDays: 0,
    status: 'active',
  };
  await saveUserPlans(kv, id, [bronze]);

  await saveTx(kv, {
    id: generateId('tx'),
    userId: id,
    type: 'signup_bonus',
    amount: 3,
    status: 'completed',
    description: 'Free Bronze plan assigned',
    timestamp: now,
  } as Transaction);

  const analytics = await getAnalytics(kv);
  analytics.totalUsers = (analytics.totalUsers || 0) + 1;
  await saveAnalytics(kv, analytics);

  const token = createToken(id, 'user');
  const res = NextResponse.json({
    ok: true,
    userId: id,
    message: 'Account created. Free Bronze plan assigned.',
  });
  res.cookies.set(userCookieOptions(token));
  return res;
}
