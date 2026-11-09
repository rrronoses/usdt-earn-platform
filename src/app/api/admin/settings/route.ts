import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import { ensureSeeded, getConfig, saveConfig } from '@/lib/kv';
import { getAdminToken, parseToken } from '@/lib/auth';

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
  const cfg = await getConfig(kv);
  const { adminPasswordHash: _, ...safe } = cfg;
  return NextResponse.json({ ok: true, config: safe });
}

export async function POST(req: Request) {
  if (!requireAdmin()) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const kv = getStorage();
  await ensureSeeded(kv);
  const body: any = await req.json().catch(() => ({}));
  const cfg = await getConfig(kv);
  if (body.minWithdrawalLimit !== undefined) cfg.minWithdrawalLimit = Math.max(0, Number(body.minWithdrawalLimit));
  if (body.minDepositLimit !== undefined) cfg.minDepositLimit = Math.max(0, Number(body.minDepositLimit));
  if (body.maxDepositLimit !== undefined) cfg.maxDepositLimit = Math.max(cfg.minDepositLimit || 0, Number(body.maxDepositLimit));
  if (body.depositExpiryMinutes !== undefined) cfg.depositExpiryMinutes = Math.max(1, Number(body.depositExpiryMinutes));
  if (body.withdrawalNote !== undefined) cfg.withdrawalNote = String(body.withdrawalNote);
  if (body.supportTelegram !== undefined) cfg.supportTelegram = String(body.supportTelegram).trim();
  if (body.supportEmail !== undefined) cfg.supportEmail = String(body.supportEmail).trim();
  await saveConfig(kv, cfg);
  const { adminPasswordHash: _, ...safe } = cfg;
  return NextResponse.json({ ok: true, config: safe });
}
