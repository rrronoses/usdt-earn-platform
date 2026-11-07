import type { KVNamespace } from './kv';
import { getStorage, isUsingRealKV } from './memory-kv';

/** Resolve USDTSTORAGE binding — null only if you need optional checks */
export function getKV(): KVNamespace | null {
  if (!isUsingRealKV()) {
    // Still return storage (may be memory) so callers can work in dev
    return getStorage();
  }
  return getStorage();
}

export { getStorage, isUsingRealKV };
