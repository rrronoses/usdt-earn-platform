import { getStorage } from '@/lib/memory-kv';
import {
  ensureSeeded,
  listUsers,
  listPendingWithdrawals,
  listPendingDeposits,
  getAnalytics,
  listDepositAddresses,
  listPlans,
} from '@/lib/kv';
import { requireAdmin } from '@/lib/admin-guard';
import { jsonOk, jsonError, withSecurityHeaders } from '@/lib/http';
import { log } from '@/lib/logger';
import { isUsingRealKV } from '@/lib/memory-kv';

export const runtime = 'edge';

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
          workerHealth: 'ok',
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
