import { getStorage, isUsingRealKV } from '@/lib/memory-kv';
import { ensureSeeded } from '@/lib/kv';
import { jsonOk, withSecurityHeaders } from '@/lib/http';
import { resolveNetwork } from '@/lib/tron';

export const runtime = 'edge';

export async function GET() {
  const kv = getStorage();
  await ensureSeeded(kv);

  return withSecurityHeaders(
    jsonOk({
      status: 'ok',
      storage: isUsingRealKV() ? 'cloudflare-kv' : 'memory-fallback',
      binding: 'USDTSTORAGE',
      tronNetwork: resolveNetwork(),
      time: new Date().toISOString(),
    })
  );
}
