import type { Transaction } from '@/types';

/**
 * Remove ONLY the old double-row bug:
 *   pending "Withdrawal request" + later "Withdrawal approved/rejected" for the same request.
 *
 * Never hide a real new pending request just because the user had another
 * same-amount withdrawal approved earlier the same day.
 */
export function dedupeWithdrawalTransactions(txs: Transaction[]): Transaction[] {
  const withdrawals = txs.filter((t) => t.type === 'withdrawal');
  const others = txs.filter((t) => t.type !== 'withdrawal');

  const finals = withdrawals.filter(
    (t) => t.status === 'approved' || t.status === 'rejected' || t.status === 'completed'
  );

  const keptWithdrawals: Transaction[] = [];
  const seenIds = new Set<string>();

  for (const t of withdrawals) {
    if (seenIds.has(t.id)) continue;
    seenIds.add(t.id);

    if (t.status === 'pending') {
      const tTime = new Date(t.timestamp).getTime();
      const superseded = finals.some((f) => {
        if (f.id === t.id) return true;
        if (Math.abs(Number(f.amount) - Number(t.amount)) >= 0.000001) return false;
        const fTime = new Date(f.timestamp).getTime();
        // Final must come at or after the pending (approval of THIS request),
        // within 2 hours — not an older same-amount withdrawal from earlier.
        return fTime >= tTime - 30_000 && fTime <= tTime + 2 * 60 * 60 * 1000;
      });
      if (superseded) continue;
    }

    keptWithdrawals.push(t);
  }

  const merged = [...others, ...keptWithdrawals];
  merged.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  return merged;
}
