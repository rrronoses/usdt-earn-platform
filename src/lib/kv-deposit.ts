import type { DepositAddress, DepositWatch } from '@/types';
import type { KVNamespace } from './kv-core';
import { keys, getJSON, putJSON, generateId, getConfig } from './kv-core';

export async function listDepositAddresses(kv: KVNamespace): Promise<DepositAddress[]> {
  return (await getJSON<DepositAddress[]>(kv, keys.depositAddresses())) || [];
}

export async function saveDepositAddresses(kv: KVNamespace, list: DepositAddress[]) {
  await putJSON(kv, keys.depositAddresses(), list);
}

/** Enabled addresses in the random assignment pool (active === true). */
export async function listEnabledDepositAddresses(kv: KVNamespace): Promise<DepositAddress[]> {
  const list = await listDepositAddresses(kv);
  const enabled = list.filter((a) => a.active && a.address);
  if (enabled.length) return enabled;
  if (list.length) return list;
  const cfg = await getConfig(kv);
  if (cfg.depositAddress) {
    const entry: DepositAddress = {
      id: generateId('addr'),
      network: 'TRC20',
      address: cfg.depositAddress,
      label: 'USDT TRC20',
      active: true,
      createdAt: new Date().toISOString(),
    };
    await saveDepositAddresses(kv, [entry]);
    return [entry];
  }
  return [];
}

/** Random USDT TRC-20 address from the enabled pool. */
export async function pickRandomDepositAddress(kv: KVNamespace): Promise<DepositAddress | null> {
  const pool = await listEnabledDepositAddresses(kv);
  if (!pool.length) return null;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

/** @deprecated Prefer pickRandomDepositAddress */
export async function getActiveDepositAddress(kv: KVNamespace): Promise<DepositAddress | null> {
  return pickRandomDepositAddress(kv);
}

export async function addDepositAddress(
  kv: KVNamespace,
  address: string,
  label?: string,
  setActive = true
): Promise<DepositAddress> {
  const list = await listDepositAddresses(kv);
  const entry: DepositAddress = {
    id: generateId('addr'),
    network: 'TRC20',
    address: address.trim(),
    label: label?.trim() || 'USDT TRC20',
    active: setActive,
    createdAt: new Date().toISOString(),
  };
  list.push(entry);
  await saveDepositAddresses(kv, list);
  return entry;
}

export async function updateDepositAddress(
  kv: KVNamespace,
  id: string,
  patch: Partial<Pick<DepositAddress, 'address' | 'label' | 'active'>>
): Promise<DepositAddress | null> {
  const list = await listDepositAddresses(kv);
  const idx = list.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  const next = [...list];
  next[idx] = {
    ...next[idx],
    ...patch,
    network: 'TRC20',
    address: patch.address?.trim() || next[idx].address,
  };
  await saveDepositAddresses(kv, next);
  return next[idx];
}

export async function removeDepositAddress(kv: KVNamespace, id: string): Promise<boolean> {
  const list = await listDepositAddresses(kv);
  const next = list.filter((a) => a.id !== id);
  if (next.length === list.length) return false;
  await saveDepositAddresses(kv, next);
  return true;
}

export async function getDepositWatchByAddress(kv: KVNamespace, address: string) {
  return getJSON<DepositWatch>(kv, keys.depositWatch(address));
}

export async function getDepositWatchById(kv: KVNamespace, depositId: string) {
  return getJSON<DepositWatch>(kv, keys.depositWatchById(depositId));
}

export async function saveDepositWatch(kv: KVNamespace, watch: DepositWatch) {
  await putJSON(kv, keys.depositWatch(watch.address), watch);
  await putJSON(kv, keys.depositWatchById(watch.depositId), watch);
}

export async function clearDepositWatch(kv: KVNamespace, watch: DepositWatch) {
  await kv.delete(keys.depositWatch(watch.address));
  await putJSON(kv, keys.depositWatchById(watch.depositId), watch);
}

export async function isTxProcessed(kv: KVNamespace, txId: string): Promise<boolean> {
  const v = await kv.get(keys.processedTx(txId));
  return Boolean(v);
}

export async function markTxProcessed(
  kv: KVNamespace,
  txId: string,
  meta: { userId: string; amount: number; depositId: string }
) {
  await putJSON(kv, keys.processedTx(txId), {
    ...meta,
    processedAt: new Date().toISOString(),
  });
}
