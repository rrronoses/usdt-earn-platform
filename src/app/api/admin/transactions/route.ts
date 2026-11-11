import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/memory-kv';
import { ensureSeeded, listUsers, getUserTransactions } from '@/lib/kv';
import { getAdminToken, parseToken } from '@/lib/auth';
import type { Transaction } from '@/types';
import { dedupeWithdrawalTransactions } from '@/lib/tx-utils';

export const runtime = 'edge';

function requireAdmin() {
  const tok = getAdminToken();
  if (!tok) return null;
  const p = parseToken(tok);
  return p?.role === 'admin' ? p : null;
}

export async function GET(req: Request) {
  if (!requireAdmin()) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const kv = getStorage();
  await ensureSeeded(kv);
  const url = new URL(req.url);
  const type = url.searchParams.get('type') || '';
  const status = url.searchParams.get('status') || '';
  const userId = url.searchParams.get('userId') || '';
  const limit = Math.min(500, Number(url.searchParams.get('limit') || 200));

  let txs: Transaction[] = [];
  if (userId) {
    txs = await getUserTransactions(kv, userId, limit);
  } else {
    const users = await listUsers(kv, 300);
    for (const u of users) {
      const ut = await getUserTransactions(kv, u.id, 50);
      txs.push(...ut);
    }
    txs.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    txs = txs.slice(0, limit);
  }

  txs = dedupeWithdrawalTransactions(txs);

  if (type) txs = txs.filter((t) => t.type === type);
  if (status) txs = txs.filter((t) => t.status === status);
  return NextResponse.json({ ok: true, transactions: txs });
}
