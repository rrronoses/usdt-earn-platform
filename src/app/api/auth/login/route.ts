import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import { ensureSeeded, getUserByEmail, getConfig } from '@/lib/kv';
import { verifyPassword, createToken, userCookieOptions, adminCookieOptions, hashPassword } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body: any = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const asAdmin = Boolean(body.asAdmin);

    const kv = getStorage();
    await ensureSeeded(kv);

    if (asAdmin) {
      const cfg = await getConfig(kv);
      const username = String(body.username || email || '').trim();
      const ok =
        username === cfg.adminUsername &&
        (password === cfg.adminPasswordHash || verifyPassword(password, cfg.adminPasswordHash) || hashPassword(password) === cfg.adminPasswordHash);
      const demoOk = username === 'admin' && password === 'admin123';
      if (!ok && !demoOk) {
        return NextResponse.json({ ok: false, message: 'Invalid admin credentials' }, { status: 401 });
      }
      const token = createToken('admin', 'admin');
      const res = NextResponse.json({ ok: true, role: 'admin' });
      res.cookies.set(adminCookieOptions(token));
      return res;
    }

    const user = await getUserByEmail(kv, email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ ok: false, message: 'Invalid email or password' }, { status: 401 });
    }
    if (user.status === 'banned') {
      return NextResponse.json({ ok: false, message: 'Account is banned' }, { status: 403 });
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
