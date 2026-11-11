import { cookies } from 'next/headers';

const USER_COOKIE = 'app_auth_token';
const ADMIN_COOKIE = 'admin_auth_token';

/**
 * HMAC-SHA256 signed session tokens (sync, Edge-safe pure JS).
 * Format: base64url(payload).base64url(signature)
 * payload = userId:timestamp:role
 *
 * Set AUTH_SECRET in Cloudflare Pages env (32+ random chars).
 * Unsigned legacy tokens are rejected.
 */
function getAuthSecret(): string {
  const fromEnv =
    (typeof process !== 'undefined' && process.env?.AUTH_SECRET) ||
    (typeof process !== 'undefined' && process.env?.JWT_SECRET) ||
    '';
  if (fromEnv && String(fromEnv).length >= 16) return String(fromEnv);
  return 'usdt-earn-dev-only-change-me';
}

/* ---- minimal HMAC-SHA256 (no external deps) ---- */
function rotr(x: number, n: number) {
  return (x >>> n) | (x << (32 - n));
}
function sha256(message: Uint8Array): Uint8Array {
  const K = new Uint32Array([
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
  ]);
  const bitLen = message.length * 8;
  const withOne = message.length + 1;
  let padLen = withOne % 64;
  padLen = padLen <= 56 ? 56 - padLen : 120 - padLen;
  const total = withOne + padLen + 8;
  const buf = new Uint8Array(total);
  buf.set(message);
  buf[message.length] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(total - 4, bitLen >>> 0, false);
  view.setUint32(total - 8, Math.floor(bitLen / 0x100000000), false);

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  const w = new Uint32Array(64);

  for (let i = 0; i < total; i += 64) {
    for (let j = 0; j < 16; j++) w[j] = view.getUint32(i + j * 4, false);
    for (let j = 16; j < 64; j++) {
      const s0 = rotr(w[j - 15], 7) ^ rotr(w[j - 15], 18) ^ (w[j - 15] >>> 3);
      const s1 = rotr(w[j - 2], 17) ^ rotr(w[j - 2], 19) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let j = 0; j < 64; j++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[j] + w[j]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }
  const out = new Uint8Array(32);
  const ov = new DataView(out.buffer);
  ov.setUint32(0, h0, false); ov.setUint32(4, h1, false); ov.setUint32(8, h2, false); ov.setUint32(12, h3, false);
  ov.setUint32(16, h4, false); ov.setUint32(20, h5, false); ov.setUint32(24, h6, false); ov.setUint32(28, h7, false);
  return out;
}

function hmacSha256(keyStr: string, msgStr: string): Uint8Array {
  const enc = new TextEncoder();
  let key = enc.encode(keyStr);
  if (key.length > 64) key = sha256(key);
  const k = new Uint8Array(64);
  k.set(key);
  const opad = new Uint8Array(64);
  const ipad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    opad[i] = k[i] ^ 0x5c;
    ipad[i] = k[i] ^ 0x36;
  }
  const inner = new Uint8Array(64 + enc.encode(msgStr).length);
  inner.set(ipad);
  inner.set(enc.encode(msgStr), 64);
  const innerHash = sha256(inner);
  const outer = new Uint8Array(64 + 32);
  outer.set(opad);
  outer.set(innerHash, 64);
  return sha256(outer);
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64UrlToString(s: string): string {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return atob(b64);
}

function signBody(body: string): string {
  return toBase64Url(hmacSha256(getAuthSecret(), body));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/** Create signed session token (sync). */
export function createToken(userId: string, role: 'user' | 'admin' = 'user'): string {
  const payload = `${userId}:${Date.now()}:${role}`;
  const body = toBase64Url(new TextEncoder().encode(payload));
  const sig = signBody(body);
  return `${body}.${sig}`;
}

/** Verify signed token; rejects unsigned/forged tokens. */
export function parseToken(
  token: string | undefined | null
): { userId: string; role: 'user' | 'admin' } | null {
  if (!token) return null;
  try {
    if (!token.includes('.')) return null; // reject legacy unsigned
    const [body, sig] = token.split('.');
    if (!body || !sig) return null;
    const expected = signBody(body);
    if (!timingSafeEqual(expected, sig)) return null;
    const raw = fromBase64UrlToString(body);
    // body was utf8 bytes as binary string from encode — decode properly
    const bytes = new Uint8Array(body.length); // wrong path for utf8
    // Prefer decoding via TextDecoder on base64 bytes
    const pad = body.length % 4 === 0 ? '' : '='.repeat(4 - (body.length % 4));
    const b64 = body.replace(/-/g, '+').replace(/_/g, '/') + pad;
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    const decoded = new TextDecoder().decode(arr);
    const [userId, tsStr, role] = decoded.split(':');
    if (!userId) return null;
    const ts = Number(tsStr);
    if (Number.isFinite(ts)) {
      const maxAge = role === 'admin' ? 86400000 : 30 * 86400000;
      if (Date.now() - ts > maxAge) return null;
    }
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

/** Demo password hash — upgrade to bcrypt/argon2 for high-security deployments */
export function hashPassword(password: string): string {
  return Buffer.from(`h1:${password}`).toString('base64');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
