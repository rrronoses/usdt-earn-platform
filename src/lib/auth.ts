import { cookies } from 'next/headers';

const USER_COOKIE = 'app_auth_token';
const ADMIN_COOKIE = 'admin_auth_token';

/** Simple token format: base64(userId:timestamp:role) — replace with jose JWT in production */
export function createToken(userId: string, role: 'user' | 'admin' = 'user'): string {
  const payload = `${userId}:${Date.now()}:${role}`;
  return Buffer.from(payload).toString('base64url');
}

export function parseToken(token: string): { userId: string; role: 'user' | 'admin' } | null {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const [userId, , role] = raw.split(':');
    if (!userId) return null;
    return { userId, role: role === 'admin' ? 'admin' : 'user' };
  } catch {
    return null;
  }
}

export function getUserToken(): string | undefined {
  return cookies().get(USER_COOKIE)?.value;
}

export function getAdminToken(): string | undefined {
  return cookies().get(ADMIN_COOKIE)?.value;
}

export function userCookieOptions(token: string) {
  return {
    name: USER_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  };
}

export function adminCookieOptions(token: string) {
  return {
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24,
  };
}

export { USER_COOKIE, ADMIN_COOKIE };

/** Lightweight password hash for demo — use bcrypt in production */
export function hashPassword(password: string): string {
  return Buffer.from(`h1:${password}`).toString('base64');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
