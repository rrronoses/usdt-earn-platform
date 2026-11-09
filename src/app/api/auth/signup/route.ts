import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded,
  getUserByEmail,
  getUserByUsername,
  saveUser,
  saveUserPlans,
  saveTx,
  getAnalytics,
  saveAnalytics,
  generateUserId,
  generateId,
  addDaysISO,
  getUser,
} from '@/lib/kv';
import { hashPassword, createToken, userCookieOptions } from '@/lib/auth';
import type { User, UserPlan, Transaction } from '@/types';
import { signupSchema } from '@/lib/schemas';
import { parseJson, jsonOk, jsonError, withSecurityHeaders } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { log } from '@/lib/logger';

export const runtime = 'edge';

export async function POST(req: Request) {
  const parsedBody = await parseJson(req, signupSchema);
  if (!parsedBody.ok) return withSecurityHeaders(parsedBody.response);

  const { username, password } = parsedBody.data;
  const email = parsedBody.data.email.trim().toLowerCase();
  const referralCode = parsedBody.data.referralCode?.trim();

  const kv = getStorage();
  await ensureSeeded(kv);

  const rl = await rateLimit(kv, `signup:${email}`, { limit: 5, windowSec: 3600 });
  if (!rl.allowed) {
    return withSecurityHeaders(
      jsonError('RATE_LIMITED', `Too many signups. Retry in ${rl.retryAfterSec}s`)
    );
  }

  try {
    if (await getUserByEmail(kv, email)) {
      return withSecurityHeaders(jsonError('CONFLICT', 'Email already registered'));
    }
    if (await getUserByUsername(kv, username)) {
      return withSecurityHeaders(jsonError('CONFLICT', 'Username already taken'));
    }

    let referredBy: string | null = null;
    if (referralCode) {
      const ref = await getUser(kv, referralCode);
      if (!ref) {
        return withSecurityHeaders(jsonError('BAD_REQUEST', 'Invalid referral code'));
      }
      referredBy = ref.id;
    }

    const id = generateUserId();
    const now = new Date().toISOString();

    // Signup reward = free Bronze plan only (price 3 USDT applied as plan).
    // Do NOT also credit 3 USDT deposit balance.
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
      amount: 0,
      status: 'completed',
      description: 'Free Bronze plan on signup (7 days · 1 USDT/day)',
      timestamp: now,
    };
    await saveTx(kv, tx);

    const analytics = await getAnalytics(kv);
    analytics.totalUsers += 1;
    await saveAnalytics(kv, analytics);

    const token = createToken(id, 'user');
    const res = jsonOk({
      message: 'Account created! Free Bronze plan assigned.',
      user: { id, username, email },
    });
    res.cookies.set(userCookieOptions(token));
    log.info('auth.signup.ok', { userId: id });
    return withSecurityHeaders(res);
  } catch (e) {
    log.error('auth.signup.error', { message: e instanceof Error ? e.message : 'unknown' });
    return withSecurityHeaders(jsonError('INTERNAL', 'Signup failed'));
  }
}
