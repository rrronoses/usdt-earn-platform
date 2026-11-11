import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import { ensureSeeded, listPlans, savePlan, deletePlan, generateId } from '@/lib/kv';
import { getAdminToken, parseToken } from '@/lib/auth';
import { planDailyEarn } from '@/types';
import type { Plan } from '@/types';

export const runtime = 'edge';

function requireAdmin() {
  const tok = getAdminToken();
  if (!tok) return null;
  const p = parseToken(tok);
  return p?.role === 'admin' ? p : null;
}

export async function GET() {
  if (!requireAdmin()) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const kv = getStorage();
  await ensureSeeded(kv);
  const plans = (await listPlans(kv)).map((p) => ({
    ...p,
    dailyEarn: planDailyEarn(p),
  }));
  return NextResponse.json({ ok: true, plans });
}

export async function POST(req: Request) {
  if (!requireAdmin()) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const kv = getStorage();
  await ensureSeeded(kv);
  const body: any = await req.json().catch(() => ({}));
  const action = String(body.action || 'save');

  if (action === 'delete' || action === 'remove') {
    const id = String(body.id || body.plan?.id || '');
    if (!id) return NextResponse.json({ ok: false, message: 'id required' }, { status: 400 });
    await deletePlan(kv, id);
    const plans = (await listPlans(kv)).map((p) => ({ ...p, dailyEarn: planDailyEarn(p) }));
    return NextResponse.json({ ok: true, plans, message: 'Plan removed' });
  }

  const p = body.plan || body;
  const id = String(p.id || generateId('plan'));
  const daily = Number(p.dailyEarn ?? p.dailyYield ?? 0) || 0;
  const plan: Plan = {
    id,
    name: String(p.name || 'Plan'),
    price: Number(p.price || 0),
    durationDays: Number(p.durationDays || 28),
    dailyEarn: daily,
    isOneTime: Boolean(p.isOneTime),
    active: p.active !== false,
    color: String(p.color || 'from-emerald-500 to-teal-500'),
    badge: p.badge ? String(p.badge) : undefined,
  };
  await savePlan(kv, plan);
  const plans = (await listPlans(kv)).map((x) => ({ ...x, dailyEarn: planDailyEarn(x) }));
  return NextResponse.json({
    ok: true,
    plans,
    message: action === 'update' ? 'Plan updated' : 'Plan saved',
  });
}
