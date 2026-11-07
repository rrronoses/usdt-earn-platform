import type {
  User, Plan, UserPlan, Transaction, DepositRequest, WithdrawalRequest,
  SystemConfig, Analytics,
} from '@/types';
import { DEFAULT_PLANS, DEFAULT_CONFIG, DEFAULT_ANALYTICS } from '@/types';

export interface KVNamespace {
  get(key: string, type?: 'text' | 'json'): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    keys: { name: string }[];
    list_complete: boolean;
    cursor?: string;
  }>;
}

export type Env = { USDTSTORAGE: KVNamespace };

export const keys = {
  user: (id: string) => `user:${id}`,
  email: (email: string) => `email:${email.toLowerCase()}`,
  username: (username: string) => `username:${username.toLowerCase()}`,
  plan: (id: string) => `plan:${id}`,
  plansIndex: () => `plans:index`,
  userPlans: (userId: string) => `user_plans:${userId}`,
  tx: (id: string) => `tx:${id}`,
  userTxIndex: (userId: string) => `user_tx:${userId}`,
  deposit: (id: string) => `deposit:${id}`,
  depositsPending: () => `deposits:pending`,
  withdrawal: (id: string) => `withdrawal:${id}`,
  withdrawalsPending: () => `withdrawals:pending`,
  config: () => `system:config`,
  analytics: () => `system:analytics`,
  depositAddresses: () => `system:deposit_addresses`,
  depositWatch: (address: string) => `deposit_watch:${address}`,
  depositWatchById: (depositId: string) => `deposit_watch_id:${depositId}`,
  processedTx: (txId: string) => `processed_tx:${txId}`,
};

export async function getJSON<T>(kv: KVNamespace, key: string): Promise<T | null> {
  const raw = await kv.get(key);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export async function putJSON(kv: KVNamespace, key: string, value: unknown) {
  await kv.put(key, JSON.stringify(value));
}

/** Read index value that may be raw string or JSON-quoted string (legacy). */
async function getIndexId(kv: KVNamespace, key: string): Promise<string | null> {
  const raw = await kv.get(key);
  if (!raw) return null;
  const trimmed = raw.trim();
  // Legacy bug: putJSON stored "\"12345678\"" or "\"12345678\""
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'string' && parsed) return parsed;
    } catch {
      /* fall through */
    }
  }
  return trimmed || null;
}

export async function ensureSeeded(kv: KVNamespace) {
  const cfg = await getJSON(kv, keys.config());
  if (!cfg) await putJSON(kv, keys.config(), DEFAULT_CONFIG);
  const plansIdx = await getJSON<string[]>(kv, keys.plansIndex());
  if (!plansIdx || plansIdx.length === 0) {
    const ids: string[] = [];
    for (const p of DEFAULT_PLANS) {
      await putJSON(kv, keys.plan(p.id), p);
      ids.push(p.id);
    }
    await putJSON(kv, keys.plansIndex(), ids);
  }
  const analytics = await getJSON(kv, keys.analytics());
  if (!analytics) await putJSON(kv, keys.analytics(), DEFAULT_ANALYTICS);
}

export async function getUser(kv: KVNamespace, userId: string) {
  return getJSON<User>(kv, keys.user(userId));
}

export async function getUserByEmail(kv: KVNamespace, email: string) {
  const id = await getIndexId(kv, keys.email(email));
  if (!id) return null;
  return getUser(kv, id);
}

export async function getUserByUsername(kv: KVNamespace, username: string) {
  const id = await getIndexId(kv, keys.username(username));
  if (id) {
    const u = await getUser(kv, id);
    if (u) return u;
  }
  // Fallback scan for older accounts without username index
  const users = await listUsers(kv, 500);
  const lower = username.toLowerCase();
  return users.find((u) => u.username.toLowerCase() === lower) || null;
}

/** Resolve login identifier: email or username */
export async function getUserByLogin(kv: KVNamespace, login: string) {
  const q = login.trim();
  if (!q) return null;
  if (q.includes('@')) {
    return getUserByEmail(kv, q.toLowerCase());
  }
  const byUser = await getUserByUsername(kv, q);
  if (byUser) return byUser;
  // Also try email path in case someone typed email without @ somehow
  return getUserByEmail(kv, q.toLowerCase());
}

export async function saveUser(kv: KVNamespace, user: User) {
  await putJSON(kv, keys.user(user.id), user);
  // Store indexes as RAW strings (not JSON) so get() returns the id directly
  await kv.put(keys.email(user.email), user.id);
  await kv.put(keys.username(user.username), user.id);
}

export async function listUsers(kv: KVNamespace, limit = 200): Promise<User[]> {
  const listed = await kv.list({ prefix: 'user:', limit });
  const users: User[] = [];
  for (const k of listed.keys) {
    if (k.name.startsWith('user_plans:') || k.name.startsWith('user_tx:')) continue;
    const u = await getJSON<User>(kv, k.name);
    if (u && u.id) users.push(u);
  }
  return users;
}

export async function listPlans(kv: KVNamespace): Promise<Plan[]> {
  const ids = (await getJSON<string[]>(kv, keys.plansIndex())) || [];
  const plans: Plan[] = [];
  for (const id of ids) {
    const p = await getJSON<Plan>(kv, keys.plan(id));
    if (p) plans.push(p);
  }
  return plans;
}

export async function savePlan(kv: KVNamespace, plan: Plan) {
  await putJSON(kv, keys.plan(plan.id), plan);
  const ids = (await getJSON<string[]>(kv, keys.plansIndex())) || [];
  if (!ids.includes(plan.id)) {
    ids.push(plan.id);
    await putJSON(kv, keys.plansIndex(), ids);
  }
}

export async function deletePlan(kv: KVNamespace, planId: string) {
  await kv.delete(keys.plan(planId));
  const ids = ((await getJSON<string[]>(kv, keys.plansIndex())) || []).filter((id) => id !== planId);
  await putJSON(kv, keys.plansIndex(), ids);
}

export async function getUserPlans(kv: KVNamespace, userId: string) {
  return (await getJSON<UserPlan[]>(kv, keys.userPlans(userId))) || [];
}

export async function saveUserPlans(kv: KVNamespace, userId: string, plans: UserPlan[]) {
  await putJSON(kv, keys.userPlans(userId), plans);
}

export async function saveTx(kv: KVNamespace, tx: Transaction) {
  await putJSON(kv, keys.tx(tx.id), tx);
  const idx = (await getJSON<string[]>(kv, keys.userTxIndex(tx.userId))) || [];
  idx.unshift(tx.id);
  await putJSON(kv, keys.userTxIndex(tx.userId), idx.slice(0, 200));
}

export async function getUserTransactions(kv: KVNamespace, userId: string, limit = 50) {
  const idx = (await getJSON<string[]>(kv, keys.userTxIndex(userId))) || [];
  const txs: Transaction[] = [];
  for (const id of idx.slice(0, limit)) {
    const t = await getJSON<Transaction>(kv, keys.tx(id));
    if (t) txs.push(t);
  }
  return txs;
}

export async function saveDeposit(kv: KVNamespace, dep: DepositRequest) {
  await putJSON(kv, keys.deposit(dep.id), dep);
  if (dep.status === 'pending') {
    const pend = (await getJSON<string[]>(kv, keys.depositsPending())) || [];
    if (!pend.includes(dep.id)) {
      pend.unshift(dep.id);
      await putJSON(kv, keys.depositsPending(), pend);
    }
  } else {
    const pend = ((await getJSON<string[]>(kv, keys.depositsPending())) || []).filter((id) => id !== dep.id);
    await putJSON(kv, keys.depositsPending(), pend);
  }
}

export async function getDeposit(kv: KVNamespace, id: string) {
  return getJSON<DepositRequest>(kv, keys.deposit(id));
}

export async function listPendingDeposits(kv: KVNamespace) {
  const pend = (await getJSON<string[]>(kv, keys.depositsPending())) || [];
  const out: DepositRequest[] = [];
  for (const id of pend) {
    const d = await getDeposit(kv, id);
    if (d) out.push(d);
  }
  return out;
}

export async function saveWithdrawal(kv: KVNamespace, w: WithdrawalRequest) {
  await putJSON(kv, keys.withdrawal(w.id), w);
  if (w.status === 'pending') {
    const pend = (await getJSON<string[]>(kv, keys.withdrawalsPending())) || [];
    if (!pend.includes(w.id)) {
      pend.unshift(w.id);
      await putJSON(kv, keys.withdrawalsPending(), pend);
    }
  } else {
    const pend = ((await getJSON<string[]>(kv, keys.withdrawalsPending())) || []).filter((id) => id !== w.id);
    await putJSON(kv, keys.withdrawalsPending(), pend);
  }
}

export async function getWithdrawal(kv: KVNamespace, id: string) {
  return getJSON<WithdrawalRequest>(kv, keys.withdrawal(id));
}

export async function listPendingWithdrawals(kv: KVNamespace) {
  const pend = (await getJSON<string[]>(kv, keys.withdrawalsPending())) || [];
  const out: WithdrawalRequest[] = [];
  for (const id of pend) {
    const w = await getWithdrawal(kv, id);
    if (w) out.push(w);
  }
  return out;
}

export async function getConfig(kv: KVNamespace) {
  return (await getJSON<SystemConfig>(kv, keys.config())) || DEFAULT_CONFIG;
}

export async function saveConfig(kv: KVNamespace, cfg: SystemConfig) {
  await putJSON(kv, keys.config(), cfg);
}

export async function getAnalytics(kv: KVNamespace) {
  return (await getJSON<Analytics>(kv, keys.analytics())) || DEFAULT_ANALYTICS;
}

export async function saveAnalytics(kv: KVNamespace, a: Analytics) {
  await putJSON(kv, keys.analytics(), a);
}

export function generateUserId(): string {
  return String(Math.floor(10000000 + Math.random() * 90000000));
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function isSameDay(a: string | null, b: string): boolean {
  if (!a) return false;
  const d1 = new Date(a);
  const d2 = new Date(b);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}
