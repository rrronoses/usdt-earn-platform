import { getRequestContext } from '@cloudflare/next-on-pages';
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

function fromPagesEnv(): KVNamespace | null {
  try {
    const { env } = getRequestContext() as { env?: { USDTSTORAGE?: KVNamespace } };
    if (env?.USDTSTORAGE) return env.USDTSTORAGE;
  } catch {
    // Not inside a Cloudflare request (e.g. local next dev)
  }
  return null;
}

/**
 * Resolve Cloudflare KV binding `USDTSTORAGE`.
 * Production (Pages + next-on-pages): real KV namespace
 * Local next dev: in-memory fallback (does not persist)
 */
export function getStorage(): KVNamespace {
  const bound = fromPagesEnv();
  if (bound) return bound;

  const g = globalThis as unknown as {
    USDTSTORAGE?: KVNamespace;
    env?: { USDTSTORAGE?: KVNamespace };
  };
  if (g.USDTSTORAGE) return g.USDTSTORAGE;
  if (g.env?.USDTSTORAGE) return g.env.USDTSTORAGE;

  return memoryKV;
}

export function isUsingRealKV(): boolean {
  if (fromPagesEnv()) return true;
  const g = globalThis as unknown as { USDTSTORAGE?: KVNamespace; env?: { USDTSTORAGE?: KVNamespace } };
  return !!(g.USDTSTORAGE || g.env?.USDTSTORAGE);
}
