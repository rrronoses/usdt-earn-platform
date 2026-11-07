import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded, getUserByEmail, saveUser, saveUserPlans, saveTx, getAnalytics, saveAnalytics,
  generateUserId, generateId, addDaysISO,
} from '@/lib/kv';
import { hashPassword, createToken, userCookieOptions } from '@/lib/auth';
import type { User, UserPlan, Transaction } from '@/types';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body: any = await req.json();
    const username = String(body.username || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const referralCode = body.referralCode ? String(body.referralCode).trim() : undefined;

    if (!username || username.length < 3) {
      return NextResponse.json({ ok: false, message: 'Username must be at least 3 characters' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ ok: false, message: 'Valid email required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ ok: false, message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const kv = getStorage();
    await ensureSeeded(kv);

    if (await getUserByEmail(kv, email)) {
      return NextResponse.json({ ok: false, message: 'Email already registered' }, { status: 400 });
    }

    let referredBy: string | null = null;
    if (referralCode) {
      const { getUser } = await import('@/lib/kv');
      const ref = await getUser(kv, referralCode);
      if (!ref) {
        return NextResponse.json({ ok: false, message: 'Invalid referral code' }, { status: 400 });
      }
      referredBy = ref.id;
    }

    const id = generateUserId();
    const now = new Date().toISOString();
    const user: User = {
      id,
      username,
      email,
      passwordHash: hashPassword(password),
      depositBalance: 3,
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
      const { getUser } = await import('@/lib/kv');
      const ref = await getUser(kv, referredBy);
      if (ref) {
        ref.referrals = [...ref.referrals, id];
        await saveUser(kv, ref);
      }
    }

    const bronze: UserPlan = {
      userPlanId: generateId('up'),
      planId: 'bronze',
      name: 'Bronze',
      price: 3,
      dailyYield: 1,
      durationDays: 7,
      purchaseDate: now,
      expiryDate: addDaysISO(now, 7),
      lastClaimedAt: null,
      claimedDays: 0,
      status: 'active',
    };
    await saveUserPlans(kv, id, [bronze]);

    const tx: Transaction = {
      id: generateId('tx'),
      userId: id,
      type: 'signup_bonus',
      amount: 3,
      status: 'completed',
      description: 'Welcome bonus + free Bronze plan',
      timestamp: now,
    };
    await saveTx(kv, tx);

    const analytics = await getAnalytics(kv);
    analytics.totalUsers += 1;
    await saveAnalytics(kv, analytics);

    const token = createToken(id, 'user');
    const res = NextResponse.json({
      ok: true,
      message: 'Account created! Free 3 USDT Bronze plan assigned.',
      user: { id, username, email },
    });
    res.cookies.set(userCookieOptions(token));
    return res;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Signup failed';
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}
