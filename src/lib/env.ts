import type { KVNamespace } from './kv';

/** Resolve USDTSTORAGE binding in Pages Functions / local mock */
export function getKV(): KVNamespace | null {
  const g = globalThis as unknown as { USDTSTORAGE?: KVNamespace; env?: { USDTSTORAGE?: KVNamespace } };
  if (g.USDTSTORAGE) return g.USDTSTORAGE;
  if (g.env?.USDTSTORAGE) return g.env.USDTSTORAGE;

  // Pages / OpenNext may expose the binding on process.env
  const proc = (typeof process !== 'undefined' ? process : undefined) as
    | { env?: { USDTSTORAGE?: unknown } }
    | undefined;
  if (proc?.env?.USDTSTORAGE) {
    return proc.env.USDTSTORAGE as KVNamespace;
  }

  return null;
}
