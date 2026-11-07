import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import { ensureSeeded } from '@/lib/kv';
import { verifyDepositWatch, verifyAllPendingDeposits } from '@/lib/deposit-engine';
import { getUserToken, getAdminToken, parseToken } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(req: Request) {
  const kv = getStorage();
  await ensureSeeded(kv);

  const body: any = await req.json().catch(() => ({}));
  const cronSecret = process.env.CRON_SECRET;
  const headerSecret = req.headers.get('x-cron-secret');
  const isCron = Boolean(cronSecret && headerSecret && headerSecret === cronSecret);
  const adminTok = getAdminToken();
  const userTok = getUserToken();
  const isAdmin = Boolean(adminTok && parseToken(adminTok)?.role === 'admin');
  const isUser = Boolean(userTok && parseToken(userTok)?.role === 'user');

  if (!isCron && !isAdmin && !isUser) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  if (body.all === true) {
    if (!isCron && !isAdmin) {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 });
    }
    const summary = await verifyAllPendingDeposits(kv);
    return NextResponse.json({ ok: true, ...summary });
  }

  const depositId = body.depositId ? String(body.depositId) : undefined;
  const address = body.address ? String(body.address) : undefined;
  if (!depositId && !address) {
    return NextResponse.json({ ok: false, message: 'depositId or address required' }, { status: 400 });
  }

  const result = await verifyDepositWatch(kv, { depositId, address });
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get('all') === '1') {
    const cronSecret = process.env.CRON_SECRET;
    const headerSecret = req.headers.get('x-cron-secret');
    if (cronSecret && headerSecret !== cronSecret) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
    }
    const kv = getStorage();
    await ensureSeeded(kv);
    const summary = await verifyAllPendingDeposits(kv);
    return NextResponse.json({ ok: true, ...summary });
  }
  return NextResponse.json({ ok: false, message: 'Use POST with depositId' }, { status: 400 });
}
