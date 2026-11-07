import { NextResponse } from 'next/server';
import { getStorage, isUsingRealKV } from '@/lib/memory-kv';
import { ensureSeeded, keys } from '@/lib/kv';

export const runtime = 'edge';

/** Public health check — confirms whether Cloudflare KV is bound and writable */
export async function GET() {
  const real = isUsingRealKV();
  const kv = getStorage();
  let writeOk = false;
  let readBack: string | null = null;
  let error: string | null = null;

  try {
    await ensureSeeded(kv);
    const probeKey = 'system:health_probe';
    const token = `ok_${Date.now()}`;
    await kv.put(probeKey, token);
    readBack = await kv.get(probeKey);
    writeOk = readBack === token;
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    ok: writeOk,
    kvBound: real,
    binding: 'USDTSTORAGE',
    namespaceIdHint: '9a30b0e9303a4c54ae25b9e69a2003b9',
    writeOk,
    readBack: writeOk ? 'match' : readBack,
    storageMode: real ? 'cloudflare-kv' : 'memory-fallback',
    error,
    tip: real
      ? 'KV is connected. User/admin data will persist.'
      : 'KV not visible to the Worker. In Pages → Settings → Functions → KV bindings, set Variable name exactly: USDTSTORAGE, then Redeploy.',
  });
}
