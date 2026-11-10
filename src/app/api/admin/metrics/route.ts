import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded,
  listUsers,
  listPendingWithdrawals,
  listPendingDeposits,
  getAnalytics,
  listDepositAddresses,
  listPlans,
  getUserTransactions,
} from '@/lib/kv';
import { requireAdmin } from '@/lib/admin-guard';
import { jsonOk, jsonError, withSecurityHeaders } from '@/lib/http';
import { log } from '@/lib/logger';
import { isUsingRealKV } from '@/lib/memory-kv';
import type { Transaction } from '@/types';

export const runtime = 'edge';

function dayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function lastNDays(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export async function GET() {
  const guard = requireAdmin();
  if (!guard.ok) return withSecurityHeaders(guard.response);

  try {
    const kv = getStorage();
    await ensureSeeded(kv);

    const [users, pendingW, pendingD, analytics, addresses, plans] = await Promise.all([
      listUsers(kv, 500),
      listPendingWithdrawals(kv),
      listPendingDeposits(kv),
      getAnalytics(kv),
      listDepositAddresses(kv),
      listPlans(kv),
    ]);

    // Sample recent txs for trend charts (bounded)
    const sampleUsers = users.slice(0, 80);
    const txs: Transaction[] = [];
    for (const u of sampleUsers) {
      const ut = await getUserTransactions(kv, u.id, 40);
      txs.push(...ut);
    }

    const days = lastNDays(7);
    const depositByDay: Record<string, number> = {};
    const yieldByDay: Record<string, number> = {};
    for (const k of days) {
      depositByDay[k] = 0;
      yieldByDay[k] = 0;
    }
    for (const t of txs) {
      const k = dayKey(t.timestamp);
      if (!k || !(k in depositByDay)) continue;
      if (t.type === 'deposit' && (t.status === 'completed' || t.status === 'approved')) {
        depositByDay[k] += Number(t.amount) || 0;
      }
      if (t.type === 'yield' && t.status === 'completed') {
        yieldByDay[k] += Number(t.amount) || 0;
      }
    }

    const activeUsers = users.filter((u) => u.status === 'active').length;
    const bannedUsers = users.filter((u) => u.status === 'banned').length;
    const tvlDeposit = users.reduce((s, u) => s + (u.depositBalance || 0), 0);
    const tvlWithdraw = users.reduce((s, u) => s + (u.withdrawalBalance || 0), 0);
    const enabledAddresses = addresses.filter((a) => a.active).length;

    log.info('admin.metrics', { users: users.length, pendingDeposits: pendingD.length });

    return withSecurityHeaders(
      jsonOk({
        metrics: {
          totalUsers: users.length,
          activeUsers,
          bannedUsers,
          paidUsers: analytics.paidUsersCount,
          pendingWithdrawals: pendingW.length,
          pendingDeposits: pendingD.length,
          totalDepositsVolume: analytics.totalDeposits,
          totalWithdrawalsVolume: analytics.totalWithdrawals,
          totalYieldPaid: analytics.totalYieldPaid,
          tvlDepositBalance: Number(tvlDeposit.toFixed(6)),
          tvlWithdrawalBalance: Number(tvlWithdraw.toFixed(6)),
          platformTvl: Number((tvlDeposit + tvlWithdraw).toFixed(6)),
          depositAddressesEnabled: enabledAddresses,
          depositAddressesTotal: addresses.length,
          plansActive: plans.filter((p) => p.active).length,
          storageBackend: isUsingRealKV() ? 'cloudflare-kv' : 'memory-fallback',
          workerHealth: 'ok' as const,
          trends: {
            days,
            deposits: days.map((d) => Number((depositByDay[d] || 0).toFixed(4))),
            yieldPaid: days.map((d) => Number((yieldByDay[d] || 0).toFixed(4))),
          },
        },
      })
    );
  } catch (e) {
    log.error('admin.metrics.error', {
      message: e instanceof Error ? e.message : 'unknown',
    });
    return withSecurityHeaders(jsonError('INTERNAL', 'Failed to load metrics'));
  }
}
