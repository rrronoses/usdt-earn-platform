import type { KVNamespace } from './kv';

/** Resolve USDTSTORAGE binding in Pages Functions / local mock */
export function getKV(): KVNamespace | null {
  const g = globalThis as unknown as { USDTSTORAGE?: KVNamespace; env?: { USDTSTORAGE?: KVNamespace } };
  if (g.USDTSTORAGE) return g.USDTSTORAGE;
  if (g.env?.USDTSTORAGE) return g.env.USDTSTORAGE;
  // @ts-expect-error process env binding from OpenNext / wrangler
  if (typeof process !== 'undefined' && process.env?.USDTSTORAGE) return process.env.USDTSTORAGE as unknown as KVNamespace;
  return null;
}
