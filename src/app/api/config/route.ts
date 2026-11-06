import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import { ensureSeeded, getConfig, listPlans } from '@/lib/kv';

export const runtime = 'edge';

export async function GET() {
  const kv = getStorage();
  await ensureSeeded(kv);
  const config = await getConfig(kv);
  const plans = await listPlans(kv);
  return NextResponse.json({
    ok: true,
    config: {
      minWithdrawalLimit: config.minWithdrawalLimit,
      depositNetwork: config.depositNetwork,
      depositExpiryMinutes: config.depositExpiryMinutes,
      withdrawalNote: config.withdrawalNote,
    },
    plans: plans.filter((p) => p.active),
  });
}
