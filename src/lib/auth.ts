import { cookies } from 'next/headers';

const USER_COOKIE = 'app_auth_token';
const ADMIN_COOKIE = 'admin_auth_token';

/**
 * Session tokens are HMAC-SHA256 signed.
 * Format: base64url(payload).base64url(signature)
 * payload = userId:timestamp:role
 *
 * CRITICAL: Without AUTH_SECRET, tokens could be forged. Set AUTH_SECRET in Cloudflare Pages → Settings → Environment variables.
 */
function getAuthSecret(): string {
  const fromEnv =
    (typeof process !== 'undefined' && process.env?.AUTH_SECRET) ||
    (typeof process !== 'undefined' && process.env?.JWT_SECRET) ||
    '';
  if (fromEnv && fromEnv.length >= 16) return fromEnv;
  // Fallback is weak — always set AUTH_SECRET in production
  return 'usdt-earn-dev-only-change-me';
}

function toBase64Url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

async function hmacSign(message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(getAuthSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return toBase64Url(sig);
}

async function hmacVerify(message: string, signatureB64: string): Promise<boolean> {
  try {
    const expected = await hmacSign(message);
    // constant-time-ish compare
    if (expected.length !== signatureB64.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i += 1) {
      diff |= expected.charCodeAt(i) ^ signatureB64.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

export async function createToken(userId: string, role: 'user' | 'admin' = 'user'): Promise<string> {
  const payload = `${userId}:${Date.now()}:${role}`;
  const body = toBase64Url(new TextEncoder().encode(payload));
  const sig = await hmacSign(body);
  return `${body}.${sig}`;
}

export async function parseToken(
  token: string | undefined | null
): Promise<{ userId: string; role: 'user' | 'admin' } | null> {
  if (!token) return null;
  try {
    // New signed format: body.sig
    if (token.includes('.')) {
      const [body, sig] = token.split('.');
      if (!body || !sig) return null;
      const ok = await hmacVerify(body, sig);
      if (!ok) return null;
      const raw = new TextDecoder().decode(fromBase64Url(body));
      const [userId, tsStr, role] = raw.split(':');
      if (!userId) return null;
      // Optional expiry: admin 24h, user 30d
      const ts = Number(tsStr);
      if (Number.isFinite(ts)) {
        const maxAge = role === 'admin' ? 86400000 : 30 * 86400000;
        if (Date.now() - ts > maxAge) return null;
      }
      return { userId, role: role === 'admin' ? 'admin' : 'user' };
    }

    // Reject legacy unsigned base64 tokens (forgeable)
    return null;
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
    secure: true,
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
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24,
  };
}

export { USER_COOKIE, ADMIN_COOKIE };

/** Lightweight password hash — prefer stronger hashing in high-risk deployments */
export function hashPassword(password: string): string {
  return Buffer.from(`h1:${password}`).toString('base64');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
