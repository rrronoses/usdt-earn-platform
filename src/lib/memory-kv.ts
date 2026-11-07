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

function readFromRequestContext(): KVNamespace | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@cloudflare/next-on-pages') as {
      getRequestContext?: () => { env?: { USDTSTORAGE?: KVNamespace } };
    };
    const ctx = mod.getRequestContext?.();
    if (ctx?.env?.USDTSTORAGE) return ctx.env.USDTSTORAGE;
  } catch {
    /* offline / local */
  }

  // Fallback: some runtimes attach env on globalThis
  try {
    // @ts-expect-error optional cloudflare global
    const cf = globalThis[Symbol.for('cloudflare:request-context')];
    if (cf?.env?.USDTSTORAGE) return cf.env.USDTSTORAGE as KVNamespace;
  } catch {
    /* ignore */
  }

  return null;
}

/**
 * Resolve Cloudflare KV binding `USDTSTORAGE`.
 * Production (Pages + next-on-pages): real KV
 * Local next dev: memory fallback
 */
export function getStorage(): KVNamespace {
  const fromCtx = readFromRequestContext();
  if (fromCtx) return fromCtx;

  const g = globalThis as unknown as {
    USDTSTORAGE?: KVNamespace;
    env?: { USDTSTORAGE?: KVNamespace };
  };
  if (g.USDTSTORAGE) return g.USDTSTORAGE;
  if (g.env?.USDTSTORAGE) return g.env.USDTSTORAGE;

  return memoryKV;
}

export function isUsingRealKV(): boolean {
  if (readFromRequestContext()) return true;
  const g = globalThis as unknown as { USDTSTORAGE?: KVNamespace; env?: { USDTSTORAGE?: KVNamespace } };
  return !!(g.USDTSTORAGE || g.env?.USDTSTORAGE);
}
