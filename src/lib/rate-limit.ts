/**
 * Lightweight KV-backed rate limiter for Edge / Workers.
 * Not a hard security boundary — reduces abuse and TronGrid pressure.
 */

import type { KVNamespace } from './kv';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

export async function rateLimit(
  kv: KVNamespace,
  key: string,
  opts: { limit: number; windowSec: number }
): Promise<RateLimitResult> {
  const bucket = `rl:${key}`;
  const now = Date.now();
  const raw = await kv.get(bucket);

  let count = 0;
  let windowStart = now;

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { count: number; windowStart: number };
      if (now - parsed.windowStart < opts.windowSec * 1000) {
        count = parsed.count;
        windowStart = parsed.windowStart;
      }
    } catch {
      /* reset window */
    }
  }

  if (count >= opts.limit) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((opts.windowSec * 1000 - (now - windowStart)) / 1000)
    );
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  count += 1;
  await kv.put(
    bucket,
    JSON.stringify({ count, windowStart }),
    { expirationTtl: opts.windowSec + 5 }
  );

  return {
    allowed: true,
    remaining: Math.max(0, opts.limit - count),
    retryAfterSec: 0,
  };
}
