import { getStorage } from '@/lib/memory-kv';
import { ensureSeeded, getUserByLogin, getConfig, saveUser } from '@/lib/kv';
import {
  verifyPassword,
  createToken,
  userCookieOptions,
  adminCookieOptions,
  hashPassword,
} from '@/lib/auth';
import { loginSchema } from '@/lib/schemas';
import { parseJson, jsonOk, jsonError, withSecurityHeaders } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { log } from '@/lib/logger';

export const runtime = 'edge';

/** Admin credentials: Cloudflare Pages env vars first, then system config, then defaults. */
function resolveAdminCredentials(cfg: { adminUsername?: string; adminPasswordHash?: string }) {
  const envUser = (process.env.ADMIN_USERNAME || '').trim();
  const envPass = process.env.ADMIN_PASSWORD || '';

  const username = envUser || cfg.adminUsername || 'admin';
  const passwordPlain = envPass || (cfg.adminPasswordHash || 'admin1234');

  return { username, passwordPlain, fromEnv: Boolean(envUser || envPass) };
}

export async function POST(req: Request) {
  const parsedBody = await parseJson(req, loginSchema);
  if (!parsedBody.ok) return withSecurityHeaders(parsedBody.response);

  const { password, asAdmin } = parsedBody.data;
  const login = String(
    parsedBody.data.login || parsedBody.data.email || parsedBody.data.username || ''
  ).trim();

  const kv = getStorage();
  await ensureSeeded(kv);

  const rlKey = `login:${(login || 'unknown').toLowerCase()}`;
  const rl = await rateLimit(kv, rlKey, { limit: 20, windowSec: 300 });
  if (!rl.allowed) {
    log.warn('auth.login.rate_limited', { login });
    return withSecurityHeaders(
      jsonError('RATE_LIMITED', `Too many attempts. Retry in ${rl.retryAfterSec}s`)
    );
  }

  try {
    if (asAdmin) {
      const cfg = await getConfig(kv);
      const username = String(parsedBody.data.username || login || '').trim();
      const creds = resolveAdminCredentials(cfg);

      const userMatch = username.toLowerCase() === creds.username.toLowerCase();
      const passMatch =
        password === creds.passwordPlain ||
        verifyPassword(password, creds.passwordPlain) ||
        hashPassword(password) === creds.passwordPlain;

      // Built-in default when env is not set
      const defaultOk =
        !process.env.ADMIN_PASSWORD &&
        username.toLowerCase() === 'admin' &&
        (password === 'admin1234' || password === 'admin123');

      if (!(userMatch && passMatch) && !defaultOk) {
        log.warn('auth.admin.fail', { username });
        return withSecurityHeaders(jsonError('UNAUTHORIZED', 'Invalid admin credentials'));
      }

      const token = createToken('admin', 'admin');
      const res = jsonOk({ role: 'admin' as const });
      res.cookies.set(adminCookieOptions(token));
      log.info('auth.admin.ok', { username, fromEnv: creds.fromEnv });
      return withSecurityHeaders(res);
    }

    if (!login || !password) {
      return withSecurityHeaders(
        jsonError('BAD_REQUEST', 'Email/username and password required')
      );
    }

    const user = await getUserByLogin(kv, login);
    if (!user) {
      return withSecurityHeaders(jsonError('UNAUTHORIZED', 'Invalid email/username or password'));
    }

    const passOk =
      verifyPassword(password, user.passwordHash) ||
      user.passwordHash === password ||
      hashPassword(password) === user.passwordHash;

    if (!passOk) {
      log.warn('auth.user.fail', { login });
      return withSecurityHeaders(jsonError('UNAUTHORIZED', 'Invalid email/username or password'));
    }

    if (user.status === 'banned') {
      return withSecurityHeaders(jsonError('FORBIDDEN', 'Account is banned'));
    }

    try {
      await saveUser(kv, user);
    } catch {
      /* index repair non-fatal */
    }

    const token = createToken(user.id, 'user');
    const res = jsonOk({
      user: { id: user.id, username: user.username, email: user.email },
    });
    res.cookies.set(userCookieOptions(token));
    log.info('auth.user.ok', { userId: user.id });
    return withSecurityHeaders(res);
  } catch (e) {
    log.error('auth.login.error', { message: e instanceof Error ? e.message : 'unknown' });
    return withSecurityHeaders(jsonError('INTERNAL', 'Login failed'));
  }
}
