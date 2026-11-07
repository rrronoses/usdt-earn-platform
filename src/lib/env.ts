import type { KVNamespace } from './kv';

/** Resolve USDTSTORAGE binding in Pages Functions / local mock */
export function getKV(): KVNamespace | null {
  try {
    const { getRequestContext } = require('@cloudflare/next-on-pages') as {
      getRequestContext: () => { env: { USDTSTORAGE?: KVNamespace } };
    };
    const ctx = getRequestContext();
    if (ctx?.env?.USDTSTORAGE) return ctx.env.USDTSTORAGE;
  } catch {
    /* not in request context */
  }

  const g = globalThis as unknown as { USDTSTORAGE?: KVNamespace; env?: { USDTSTORAGE?: KVNamespace } };
  if (g.USDTSTORAGE) return g.USDTSTORAGE;
  if (g.env?.USDTSTORAGE) return g.env.USDTSTORAGE;

  return null;
}
