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

export function getStorage(): KVNamespace {
  const g = globalThis as unknown as { USDTSTORAGE?: KVNamespace };
  if (g.USDTSTORAGE) return g.USDTSTORAGE;
  return memoryKV;
}
