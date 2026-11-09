import type { DepositAddress, DepositWatch } from '@/types';
import type { KVNamespace } from './kv-core';
import { keys, getJSON, putJSON, generateId, getConfig } from './kv-core';
import { isValidTronAddress, normalizeTronAddress } from './tron';

export async function listDepositAddresses(kv: KVNamespace): Promise<DepositAddress[]> {
  const list = (await getJSON<DepositAddress[]>(kv, keys.depositAddresses())) || [];
  return list.map((a) => ({
    ...a,
    address: normalizeTronAddress(a.address),
    network: 'TRC20' as const,
  }));
}

export async function saveDepositAddresses(kv: KVNamespace, list: DepositAddress[]) {
  await putJSON(kv, keys.depositAddresses(), list);
}

/** Enabled valid TRC-20 addresses in the random assignment pool. */
export async function listEnabledDepositAddresses(kv: KVNamespace): Promise<DepositAddress[]> {
  const list = await listDepositAddresses(kv);
  const enabled = list.filter((a) => a.active && isValidTronAddress(a.address));
  if (enabled.length) return enabled;

  // Fallback: any valid address in list (even if marked inactive)
  const anyValid = list.filter((a) => isValidTronAddress(a.address));
  if (anyValid.length) return anyValid;

  // Last resort: legacy system:config.depositAddress if it is a real TRON wallet
  const cfg = await getConfig(kv);
  const legacy = normalizeTronAddress(cfg.depositAddress || '');
  if (isValidTronAddress(legacy)) {
    const entry: DepositAddress = {
      id: generateId('addr'),
      network: 'TRC20',
      address: legacy,
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
  const picked = pool[idx];
  if (!isValidTronAddress(picked.address)) return null;
  return { ...picked, address: normalizeTronAddress(picked.address) };
}

/** @deprecated Prefer pickRandomDepositAddress */
export async function getActiveDepositAddress(kv: KVNamespace): Promise<DepositAddress | null> {
  return pickRandomDepositAddress(kv);
}

/** Mark one address enabled in the random pool (does not disable others). */
export async function setActiveDepositAddress(kv: KVNamespace, id: string): Promise<DepositAddress[]> {
  const list = await listDepositAddresses(kv);
  const next = list.map((a) => (a.id === id ? { ...a, active: true } : a));
  await saveDepositAddresses(kv, next);
  return next;
}

export async function addDepositAddress(
  kv: KVNamespace,
  input:
    | string
    | {
        address: string;
        label?: string;
        network?: string;
        active?: boolean;
      },
  labelOrSetActive?: string | boolean,
  setActiveArg = true
): Promise<DepositAddress[]> {
  const list = await listDepositAddresses(kv);

  let address = '';
  let label = 'USDT TRC20';
  let active = true;

  if (typeof input === 'string') {
    address = normalizeTronAddress(input);
    if (typeof labelOrSetActive === 'string') label = labelOrSetActive.trim() || label;
    if (typeof labelOrSetActive === 'boolean') active = labelOrSetActive;
    else active = setActiveArg;
  } else {
    address = normalizeTronAddress(String(input.address || ''));
    label = input.label?.trim() || 'USDT TRC20';
    active = input.active !== false;
  }

  if (!isValidTronAddress(address)) {
    throw new Error('Invalid TRON/TRC-20 address');
  }

  // Avoid duplicates
  if (list.some((a) => normalizeTronAddress(a.address) === address)) {
    return list;
  }

  const entry: DepositAddress = {
    id: generateId('addr'),
    network: 'TRC20',
    address,
    label,
    active,
    createdAt: new Date().toISOString(),
  };
  list.push(entry);
  await saveDepositAddresses(kv, list);
  return list;
}

export async function updateDepositAddress(
  kv: KVNamespace,
  id: string,
  patch: Partial<Pick<DepositAddress, 'address' | 'label' | 'active' | 'network'>>
): Promise<DepositAddress | null> {
  const list = await listDepositAddresses(kv);
  const idx = list.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  const next = [...list];
  const newAddr =
    patch.address !== undefined ? normalizeTronAddress(String(patch.address)) : next[idx].address;
  if (patch.address !== undefined && !isValidTronAddress(newAddr)) {
    throw new Error('Invalid TRON/TRC-20 address');
  }
  next[idx] = {
    ...next[idx],
    ...patch,
    network: 'TRC20',
    address: newAddr,
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
  return getJSON<DepositWatch>(kv, keys.depositWatch(normalizeTronAddress(address)));
}

export async function getDepositWatchById(kv: KVNamespace, depositId: string) {
  return getJSON<DepositWatch>(kv, keys.depositWatchById(depositId));
}

export async function saveDepositWatch(kv: KVNamespace, watch: DepositWatch) {
  const addr = normalizeTronAddress(watch.address);
  const normalized = { ...watch, address: addr };
  await putJSON(kv, keys.depositWatch(addr), normalized);
  await putJSON(kv, keys.depositWatchById(watch.depositId), normalized);
}

export async function clearDepositWatch(kv: KVNamespace, watch: DepositWatch) {
  await kv.delete(keys.depositWatch(normalizeTronAddress(watch.address)));
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
