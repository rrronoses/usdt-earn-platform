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
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || 'add');

  if (action === 'remove') {
    const id = String(body.id || '');
    if (!id) return NextResponse.json({ ok: false, message: 'id required' }, { status: 400 });
    await deletePlan(kv, id);
    const plans = await listPlans(kv);
    return NextResponse.json({ ok: true, plans });
  }

  const p = body.plan || body;
  if (action === 'add') {
    const plan: Plan = {
      id: String(p.id || generateId('plan')).replace(/\s+/g, '-').toLowerCase(),
      name: String(p.name || 'Plan'),
      price: Number(p.price) || 0,
      durationDays: Number(p.durationDays) || 7,
      dailyYield: Number(p.dailyYield) || 0,
      isOneTime: Boolean(p.isOneTime),
      active: p.active !== false,
      color: String(p.color || 'from-emerald-500 to-teal-500'),
      badge: p.badge ? String(p.badge) : undefined,
    };
    await savePlan(kv, plan);
    return NextResponse.json({ ok: true, plans: await listPlans(kv), plan });
  }

  if (action === 'update') {
    const id = String(p.id || body.id || '');
    if (!id) return NextResponse.json({ ok: false, message: 'id required' }, { status: 400 });
    const existing = (await listPlans(kv)).find((x) => x.id === id);
    if (!existing) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
    const plan: Plan = {
      ...existing,
      name: p.name !== undefined ? String(p.name) : existing.name,
      price: p.price !== undefined ? Number(p.price) : existing.price,
      durationDays: p.durationDays !== undefined ? Number(p.durationDays) : existing.durationDays,
      dailyYield: p.dailyYield !== undefined ? Number(p.dailyYield) : existing.dailyYield,
      isOneTime: p.isOneTime !== undefined ? Boolean(p.isOneTime) : existing.isOneTime,
      active: p.active !== undefined ? Boolean(p.active) : existing.active,
      color: p.color !== undefined ? String(p.color) : existing.color,
      badge: p.badge !== undefined ? (p.badge ? String(p.badge) : undefined) : existing.badge,
    };
    await savePlan(kv, plan);
    return NextResponse.json({ ok: true, plans: await listPlans(kv), plan });
  }

  return NextResponse.json({ ok: false, message: 'Unknown action' }, { status: 400 });
}
