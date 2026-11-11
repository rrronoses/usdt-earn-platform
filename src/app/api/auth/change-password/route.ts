import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import { ensureSeeded, getUser, saveUser } from '@/lib/kv';
import { getUserToken, parseToken, hashPassword, verifyPassword } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(req: Request) {
  const token = getUserToken();
  if (!token) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const parsed = parseToken(token);
  if (!parsed || parsed.role !== 'user') {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body: any = await req.json().catch(() => ({}));
  const currentPassword = String(body.currentPassword || body.curPass || '');
  const newPassword = String(body.newPassword || body.newPass || '');

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { ok: false, message: 'Current and new password required' },
      { status: 400 }
    );
  }
  if (newPassword.length < 6) {
    return NextResponse.json(
      { ok: false, message: 'New password must be at least 6 characters' },
      { status: 400 }
    );
  }

  const kv = getStorage();
  await ensureSeeded(kv);
  const user = await getUser(kv, parsed.userId);
  if (!user) return NextResponse.json({ ok: false, message: 'User not found' }, { status: 404 });

  const passOk =
    verifyPassword(currentPassword, user.passwordHash) ||
    user.passwordHash === currentPassword ||
    hashPassword(currentPassword) === user.passwordHash;

  if (!passOk) {
    return NextResponse.json({ ok: false, message: 'Current password is incorrect' }, { status: 400 });
  }

  user.passwordHash = hashPassword(newPassword);
  await saveUser(kv, user);

  return NextResponse.json({ ok: true, message: 'Password updated successfully' });
}
