import type { KVNamespace } from './kv';

/** In-memory KV for local `next dev` when USDTSTORAGE is not bound */
const store = new Map<string, string>();

export const memoryKV: KVNamespace = {
  async get(key: string) {
    return store.get(key) ?? null;
  },
  async put(key: string, value: string) {
    store.set(key, value);
  },
  async delete(key: string) {
    store.delete(key);
  },
  async list(options?: { prefix?: string; limit?: number }) {
    const prefix = options?.prefix ?? '';
    const limit = options?.limit ?? 1000;
    const keys = Array.from(store.keys())
      .filter((k) => k.startsWith(prefix))
      .slice(0, limit)
      .map((name) => ({ name }));
    return { keys, list_complete: true };
  },
};

/**
 * Resolve Cloudflare KV binding `USDTSTORAGE`.
 * On Pages + next-on-pages the binding is on getRequestContext().env
 */
export function getStorage(): KVNamespace {
  // 1) Official next-on-pages request context (production)
  try {
    // Dynamic require-style access so local builds without the package still typecheck
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getRequestContext } = require('@cloudflare/next-on-pages') as {
      getRequestContext: () => { env: { USDTSTORAGE?: KVNamespace } };
    };
    const ctx = getRequestContext();
    if (ctx?.env?.USDTSTORAGE) return ctx.env.USDTSTORAGE;
  } catch {
    // Not in a Pages request, or package unavailable locally
  }

  // 2) globalThis / env injected by runtime
  const g = globalThis as unknown as {
    USDTSTORAGE?: KVNamespace;
    env?: { USDTSTORAGE?: KVNamespace };
  };
  if (g.USDTSTORAGE) return g.USDTSTORAGE;
  if (g.env?.USDTSTORAGE) return g.env.USDTSTORAGE;

  // 3) Local dev fallback (does NOT persist across deploys / cold starts)
  return memoryKV;
}

export function isUsingRealKV(): boolean {
  try {
    const { getRequestContext } = require('@cloudflare/next-on-pages') as {
      getRequestContext: () => { env: { USDTSTORAGE?: KVNamespace } };
    };
    const ctx = getRequestContext();
    if (ctx?.env?.USDTSTORAGE) return true;
  } catch {
    /* ignore */
  }
  const g = globalThis as unknown as { USDTSTORAGE?: KVNamespace; env?: { USDTSTORAGE?: KVNamespace } };
  return !!(g.USDTSTORAGE || g.env?.USDTSTORAGE);
}
