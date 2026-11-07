import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import { ensureSeeded, listPlans, savePlan, deletePlan, generateId } from '@/lib/kv';
import { getAdminToken, parseToken } from '@/lib/auth';
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
  const plans = await listPlans(kv);
  return NextResponse.json({ ok: true, plans });
}

export async function POST(req: Request) {
  if (!requireAdmin()) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const kv = getStorage();
  await ensureSeeded(kv);
  const body: any = await req.json().catch(() => ({}));
  const action = String(body.action || 'add');

  if (action === 'remove') {
    const id = String(body.id || '');
    if (!id) return NextResponse.json({ ok: false, message: 'id required' }, { status: 400 });
    await deletePlan(kv, id);
    return NextResponse.json({ ok: true, plans: await listPlans(kv), message: 'Removed' });
  }

  const p = body.plan || body;
  const plan: Plan = {
    id: String(p.id || generateId('plan')).replace(/\s+/g, '-').toLowerCase(),
    name: String(p.name || 'Plan'),
    price: Number(p.price || 0),
    durationDays: Number(p.durationDays || 28),
    dailyYield: Number(p.dailyYield || 0),
    isOneTime: Boolean(p.isOneTime),
    active: p.active !== false,
    color: String(p.color || 'from-emerald-500 to-teal-500'),
    badge: p.badge ? String(p.badge) : undefined,
  };
  if (!plan.name || plan.price < 0) {
    return NextResponse.json({ ok: false, message: 'Invalid plan' }, { status: 400 });
  }
  await savePlan(kv, plan);
  return NextResponse.json({ ok: true, plans: await listPlans(kv), message: 'Saved' });
}
