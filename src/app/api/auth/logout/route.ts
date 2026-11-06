import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('app_auth_token', '', { path: '/', maxAge: 0 });
  res.cookies.set('admin_auth_token', '', { path: '/', maxAge: 0 });
  return res;
}
