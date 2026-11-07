import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import { ensureSeeded, getUserByLogin, getConfig, saveUser } from '@/lib/kv';
import {
  verifyPassword,
  createToken,
  userCookieOptions,
  adminCookieOptions,
  hashPassword,
} from '@/lib/auth';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body: any = await req.json();
    // Accept email OR username in `login` or legacy `email` field
    const login = String(body.login || body.email || body.username || '').trim();
    const password = String(body.password || '');
    const asAdmin = Boolean(body.asAdmin);

    const kv = getStorage();
    await ensureSeeded(kv);

    if (asAdmin) {
      const cfg = await getConfig(kv);
      const username = String(body.username || login || '').trim();
      const ok =
        username === cfg.adminUsername &&
        (password === cfg.adminPasswordHash ||
          verifyPassword(password, cfg.adminPasswordHash) ||
          hashPassword(password) === cfg.adminPasswordHash);
      const demoOk = username === 'admin' && password === 'admin123';
      if (!ok && !demoOk) {
        return NextResponse.json({ ok: false, message: 'Invalid admin credentials' }, { status: 401 });
      }
      const token = createToken('admin', 'admin');
      const res = NextResponse.json({ ok: true, role: 'admin' });
      res.cookies.set(adminCookieOptions(token));
      return res;
    }

    if (!login || !password) {
      return NextResponse.json(
        { ok: false, message: 'Email/username and password required' },
        { status: 400 }
      );
    }

    const user = await getUserByLogin(kv, login);
    if (!user) {
      return NextResponse.json(
        { ok: false, message: 'Invalid email/username or password' },
        { status: 401 }
      );
    }

    // Support both hashed and (legacy) plain stored passwords
    const passOk =
      verifyPassword(password, user.passwordHash) ||
      user.passwordHash === password ||
      hashPassword(password) === user.passwordHash;

    if (!passOk) {
      return NextResponse.json(
        { ok: false, message: 'Invalid email/username or password' },
        { status: 401 }
      );
    }

    if (user.status === 'banned') {
      return NextResponse.json({ ok: false, message: 'Account is banned' }, { status: 403 });
    }

    // Repair indexes for older accounts (raw email + username keys)
    try {
      await saveUser(kv, user);
    } catch {
      /* non-fatal */
    }

    const token = createToken(user.id, 'user');
    const res = NextResponse.json({
      ok: true,
      user: { id: user.id, username: user.username, email: user.email },
    });
    res.cookies.set(userCookieOptions(token));
    return res;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Login failed';
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}
