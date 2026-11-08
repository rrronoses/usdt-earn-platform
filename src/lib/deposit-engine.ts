/**
 * Automated USDT TRC-20 deposit verification engine (USDTSTORAGE).
 *
 * Safety model:
 * 1. Match confirmed TronGrid TRC-20 transfers to pending DepositRequest records
 * 2. Prefer exact amount match; support multi-user shared deposit addresses
 * 3. Idempotency via processed_tx:{txId} — never credit the same chain tx twice
 * 4. Short-lived processing lock processed_tx:{txId}:lock to reduce race windows
 */

import type { KVNamespace } from './kv';
import {
  getUser,
  saveUser,
  saveTx,
  saveDeposit,
  getDeposit,
  getDepositWatchById,
  saveDepositWatch,
  isTxProcessed,
  markTxProcessed,
  generateId,
  getAnalytics,
  saveAnalytics,
  listPendingDeposits,
} from './kv';
import {
  fetchUsdtTrc20Transfers,
  matchDepositTransfers,
  resolveNetwork,
  type Trc20Transfer,
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

async function acquireTxLock(kv: KVNamespace, txId: string): Promise<boolean> {
  const lockKey = `processed_tx:${txId}:lock`;
  const existing = await kv.get(lockKey);
  if (existing) return false;
  await kv.put(lockKey, String(Date.now()), { expirationTtl: 60 });
  return true;
}

async function creditDeposit(
  kv: KVNamespace,
  dep: DepositRequest,
  match: Trc20Transfer
): Promise<VerifyResult> {
  if (await isTxProcessed(kv, match.transactionId)) {
    return {
      credited: false,
      reason: 'Transaction already processed (idempotent skip)',
      txId: match.transactionId,
      depositId: dep.id,
    };
  }

  const locked = await acquireTxLock(kv, match.transactionId);
  if (!locked) {
    return {
      credited: false,
      reason: 'Transaction is being processed by another worker',
      txId: match.transactionId,
      depositId: dep.id,
    };
  }

  if (await isTxProcessed(kv, match.transactionId)) {
    return {
      credited: false,
      reason: 'Transaction already processed (idempotent skip)',
      txId: match.transactionId,
      depositId: dep.id,
    };
  }

  const user = await getUser(kv, dep.userId);
  if (!user) {
    return { credited: false, reason: 'User not found', depositId: dep.id };
  }

  const creditAmount = Number(match.amount.toFixed(6));

  await markTxProcessed(kv, match.transactionId, {
    userId: user.id,
    amount: creditAmount,
    depositId: dep.id,
  });

  user.depositBalance = Number((user.depositBalance + creditAmount).toFixed(6));
  await saveUser(kv, user);

  const now = new Date().toISOString();
  const updated: DepositRequest = {
    ...dep,
    status: 'approved',
    processedAt: now,
    txHash: match.transactionId,
    note: 'Auto-verified on-chain USDT TRC-20',
  };
  await saveDeposit(kv, updated);

  const watch = await getDepositWatchById(kv, dep.id);
  if (watch) {
    const next: DepositWatch = {
      ...watch,
      status: 'completed',
      matchedTxId: match.transactionId,
      creditedAmount: creditAmount,
    };
    await saveDepositWatch(kv, next);
  }

  const ledger: Transaction = {
    id: generateId('tx'),
    userId: user.id,
    type: 'deposit',
    amount: creditAmount,
    status: 'completed',
    description: `USDT TRC-20 deposit confirmed (${match.transactionId.slice(0, 12)}…)`,
    timestamp: now,
    txHash: match.transactionId,
    address: dep.address,
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
    depositId: dep.id,
  };
}

function pickMatch(
  transfers: Trc20Transfer[],
  dep: DepositRequest,
  usedTxIds: Set<string>
): Trc20Transfer | null {
  const createdAtMs = new Date(dep.createdAt).getTime();
  const candidates = matchDepositTransfers(transfers, {
    address: dep.address,
    expectedAmount: dep.amount,
    createdAtMs: createdAtMs > 0 ? createdAtMs - 60_000 : 0,
    amountTolerance: 0.000001,
  }).filter((t) => !usedTxIds.has(t.transactionId));

  if (!candidates.length) return null;

  const exact = candidates.find((t) => Math.abs(t.amount - dep.amount) < 0.000001);
  if (exact) return exact;

  candidates.sort((a, b) => a.amount - b.amount || a.blockTimestamp - b.blockTimestamp);
  return candidates[0];
}

export async function verifyDepositWatch(
  kv: KVNamespace,
  opts: { address?: string; depositId?: string }
): Promise<VerifyResult> {
  let dep: DepositRequest | null = null;

  if (opts.depositId) {
    dep = await getDeposit(kv, opts.depositId);
  }

  if (!dep && opts.address) {
    const pending = await listPendingDeposits(kv);
    dep = pending.find((d) => d.address === opts.address && d.status === 'pending') || null;
  }

  if (!dep) {
    return { credited: false, reason: 'No pending deposit found' };
  }

  if (dep.status !== 'pending') {
    return {
      credited: false,
      reason: `Deposit status is ${dep.status}`,
      depositId: dep.id,
      txId: dep.txHash,
    };
  }

  const createdAtMs = new Date(dep.createdAt).getTime();
  let transfers: Trc20Transfer[];
  try {
    transfers = await fetchUsdtTrc20Transfers({
      address: dep.address,
      onlyConfirmed: true,
      limit: 80,
      minTimestamp: createdAtMs > 0 ? createdAtMs - 120_000 : undefined,
      network: resolveNetwork(),
    });
  } catch (e) {
    return {
      credited: false,
      reason: e instanceof Error ? e.message : 'TronGrid error',
      depositId: dep.id,
    };
  }

  const usedTxIds = new Set<string>();
  for (const t of transfers) {
    if (await isTxProcessed(kv, t.transactionId)) usedTxIds.add(t.transactionId);
  }

  const match = pickMatch(transfers, dep, usedTxIds);
  if (!match) {
    return {
      credited: false,
      reason: 'No matching confirmed USDT TRC-20 transfer yet',
      depositId: dep.id,
    };
  }

  return creditDeposit(kv, dep, match);
}

export async function verifyAllPendingDeposits(kv: KVNamespace): Promise<{
  checked: number;
  credited: number;
  results: VerifyResult[];
}> {
  const pending = await listPendingDeposits(kv);
  const results: VerifyResult[] = [];
  let credited = 0;

  const byAddress = new Map<string, DepositRequest[]>();
  for (const dep of pending) {
    const list = byAddress.get(dep.address) || [];
    list.push(dep);
    byAddress.set(dep.address, list);
  }

  // Array.from avoids TS downlevelIteration requirement on Map iterators
  const groups = Array.from(byAddress.entries());
  for (let i = 0; i < groups.length; i += 1) {
    const address = groups[i][0];
    const deps = groups[i][1];
    const oldest = deps.reduce((a, b) =>
      new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime() ? a : b
    );
    const createdAtMs = new Date(oldest.createdAt).getTime();

    let transfers: Trc20Transfer[] = [];
    try {
      transfers = await fetchUsdtTrc20Transfers({
        address,
        onlyConfirmed: true,
        limit: 100,
        minTimestamp: createdAtMs > 0 ? createdAtMs - 120_000 : undefined,
        network: resolveNetwork(),
      });
    } catch {
      for (const d of deps) {
        results.push({ credited: false, reason: 'TronGrid error', depositId: d.id });
      }
      continue;
    }

    const usedTxIds = new Set<string>();
    for (const t of transfers) {
      if (await isTxProcessed(kv, t.transactionId)) usedTxIds.add(t.transactionId);
    }

    const ordered = deps.slice().sort((a, b) => a.amount - b.amount);
    for (const dep of ordered) {
      if (dep.status !== 'pending') continue;
      const match = pickMatch(transfers, dep, usedTxIds);
      if (!match) {
        results.push({
          credited: false,
          reason: 'No matching confirmed USDT TRC-20 transfer yet',
          depositId: dep.id,
        });
        continue;
      }
      const r = await creditDeposit(kv, dep, match);
      if (r.credited && r.txId) usedTxIds.add(r.txId);
      results.push(r);
      if (r.credited) credited += 1;
    }
  }

  return { checked: pending.length, credited, results };
}
