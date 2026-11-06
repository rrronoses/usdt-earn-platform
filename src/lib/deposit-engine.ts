/**
 * Automated USDT TRC-20 deposit verification engine.
 * Polls TronGrid, enforces idempotency via processed_tx:{txId}, credits depositBalance.
 */

import type { KVNamespace } from './kv';
import {
  getUser,
  saveUser,
  saveTx,
  saveDeposit,
  getDeposit,
  getDepositWatchByAddress,
  getDepositWatchById,
  saveDepositWatch,
  isTxProcessed,
  markTxProcessed,
  generateId,
  getAnalytics,
  saveAnalytics,
} from './kv';
import {
  fetchUsdtTrc20Transfers,
  matchDepositTransfers,
  resolveNetwork,
} from './tron';
import type { DepositRequest, DepositWatch, Transaction } from '@/types';

export interface VerifyResult {
  credited: boolean;
  reason?: string;
  txId?: string;
  amount?: number;
  userId?: string;
  depositId?: string;
}

export async function verifyDepositWatch(
  kv: KVNamespace,
  opts: { address?: string; depositId?: string }
): Promise<VerifyResult> {
  let watch: DepositWatch | null = null;
  if (opts.depositId) {
    watch = await getDepositWatchById(kv, opts.depositId);
  } else if (opts.address) {
    watch = await getDepositWatchByAddress(kv, opts.address);
  }
  if (!watch) {
    return { credited: false, reason: 'No active deposit watch' };
  }
  if (watch.status !== 'pending') {
    return { credited: false, reason: `Watch status is ${watch.status}`, depositId: watch.depositId };
  }

  const createdAtMs = new Date(watch.createdAt).getTime();
  let transfers;
  try {
    transfers = await fetchUsdtTrc20Transfers({
      address: watch.address,
      onlyConfirmed: true,
      limit: 50,
      minTimestamp: createdAtMs > 0 ? createdAtMs - 60_000 : undefined,
      network: resolveNetwork(),
    });
  } catch (e) {
    return {
      credited: false,
      reason: e instanceof Error ? e.message : 'TronGrid error',
      depositId: watch.depositId,
    };
  }

  const matches = matchDepositTransfers(transfers, {
    address: watch.address,
    expectedAmount: watch.expectedAmount,
    createdAtMs,
  });

  if (matches.length === 0) {
    return { credited: false, reason: 'No matching confirmed USDT TRC-20 transfer yet', depositId: watch.depositId };
  }

  matches.sort((a, b) => a.blockTimestamp - b.blockTimestamp);
  const match = matches[0];

  if (await isTxProcessed(kv, match.transactionId)) {
    if (watch.status === 'pending') {
      watch.status = 'completed';
      watch.matchedTxId = match.transactionId;
      await saveDepositWatch(kv, watch);
    }
    return {
      credited: false,
      reason: 'Transaction already processed (idempotent skip)',
      txId: match.transactionId,
      depositId: watch.depositId,
    };
  }

  const user = await getUser(kv, watch.userId);
  if (!user) {
    return { credited: false, reason: 'User not found', depositId: watch.depositId };
  }

  const creditAmount = match.amount;
  user.depositBalance = Number((user.depositBalance + creditAmount).toFixed(6));
  await saveUser(kv, user);

  await markTxProcessed(kv, match.transactionId, {
    userId: user.id,
    amount: creditAmount,
    depositId: watch.depositId,
  });

  watch.status = 'completed';
  watch.matchedTxId = match.transactionId;
  watch.creditedAmount = creditAmount;
  await saveDepositWatch(kv, watch);

  const dep = await getDeposit(kv, watch.depositId);
  if (dep) {
    const updated: DepositRequest = {
      ...dep,
      status: 'approved',
      processedAt: new Date().toISOString(),
      txHash: match.transactionId,
      note: `Auto-verified on-chain USDT TRC-20`,
    };
    await saveDeposit(kv, updated);
  }

  const ledger: Transaction = {
    id: generateId('tx'),
    userId: user.id,
    type: 'deposit',
    amount: creditAmount,
    status: 'completed',
    description: `USDT TRC-20 deposit confirmed (${match.transactionId.slice(0, 12)}…)`,
    timestamp: new Date().toISOString(),
    txHash: match.transactionId,
    address: watch.address,
  };
  await saveTx(kv, ledger);

  const analytics = await getAnalytics(kv);
  analytics.totalDeposits = Number((analytics.totalDeposits + creditAmount).toFixed(6));
  await saveAnalytics(kv, analytics);

  return {
    credited: true,
    txId: match.transactionId,
    amount: creditAmount,
    userId: user.id,
    depositId: watch.depositId,
  };
}

export async function verifyAllPendingDeposits(kv: KVNamespace): Promise<{
  checked: number;
  credited: number;
  results: VerifyResult[];
}> {
  const { listPendingDeposits } = await import('./kv');
  const pending = await listPendingDeposits(kv);
  const results: VerifyResult[] = [];
  let credited = 0;

  for (const dep of pending) {
    const r = await verifyDepositWatch(kv, { depositId: dep.id });
    results.push(r);
    if (r.credited) credited += 1;
  }

  return { checked: pending.length, credited, results };
}
