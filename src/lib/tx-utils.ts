import type { Transaction } from '@/types';

function statusRank(status: string): number {
  if (status === 'approved' || status === 'rejected' || status === 'completed') return 2;
  if (status === 'pending') return 0;
  return 1;
}

/**
 * Collapse duplicate withdrawal rows created by the old approve flow
 * (pending request + separate approved row).
 * Keeps the final status row when amount + day match.
 */
export function dedupeWithdrawalTransactions(txs: Transaction[]): Transaction[] {
  const others: Transaction[] = [];
  const withdrawalBuckets = new Map<string, Transaction>();

  for (const tx of txs) {
    if (tx.type !== 'withdrawal') {
      others.push(tx);
      continue;
    }
    const day = (tx.timestamp || '').slice(0, 10);
    const amountKey = Number(tx.amount).toFixed(6);
    const key = `${tx.userId || ''}|${amountKey}|${day}`;
    const existing = withdrawalBuckets.get(key);
    if (!existing) {
      withdrawalBuckets.set(key, tx);
      continue;
    }
    const rNew = statusRank(tx.status);
    const rOld = statusRank(existing.status);
    if (rNew > rOld) {
      withdrawalBuckets.set(key, tx);
    } else if (rNew === rOld) {
      // Prefer newer timestamp / approved description
      if (new Date(tx.timestamp).getTime() >= new Date(existing.timestamp).getTime()) {
        withdrawalBuckets.set(key, tx);
      }
    }
  }

  const merged = [...others, ...Array.from(withdrawalBuckets.values())];
  merged.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  return merged;
}
