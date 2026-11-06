/**
 * TRON Mainnet / Shasta USDT TRC-20 verification client (TronGrid v1)
 * Official USDT TRC-20: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t (6 decimals)
 */

export const USDT_TRC20_MAINNET = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
export const USDT_TRC20_SHASTA = 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs';
export const USDT_DECIMALS = 6;
export const USDT_SCALE = 10 ** USDT_DECIMALS;

export type TronNetwork = 'mainnet' | 'shasta';

export interface Trc20Transfer {
  transactionId: string;
  from: string;
  to: string;
  amount: number;
  rawValue: string;
  blockTimestamp: number;
  tokenSymbol?: string;
  contractAddress: string;
}

export interface FetchTransfersOptions {
  address: string;
  onlyConfirmed?: boolean;
  limit?: number;
  minTimestamp?: number;
  network?: TronNetwork;
  apiKey?: string;
  maxRetries?: number;
}

function baseUrl(network: TronNetwork): string {
  return network === 'shasta'
    ? 'https://api.shasta.trongrid.io'
    : 'https://api.trongrid.io';
}

function usdtContract(network: TronNetwork): string {
  const envContract = process.env.USDT_TRC20_CONTRACT;
  if (envContract) return envContract;
  return network === 'shasta' ? USDT_TRC20_SHASTA : USDT_TRC20_MAINNET;
}

export function resolveNetwork(): TronNetwork {
  const n = (process.env.TRON_NETWORK || 'mainnet').toLowerCase();
  return n === 'shasta' ? 'shasta' : 'mainnet';
}

export function getTronApiKey(): string | undefined {
  return process.env.TRON_PRO_API_KEY || process.env.TRONGRID_API_KEY;
}

export function rawToUsdt(raw: string | number): number {
  const n = typeof raw === 'string' ? Number(raw) : raw;
  if (!Number.isFinite(n)) return 0;
  return n / USDT_SCALE;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchUsdtTrc20Transfers(
  options: FetchTransfersOptions
): Promise<Trc20Transfer[]> {
  const network = options.network ?? resolveNetwork();
  const apiKey = options.apiKey ?? getTronApiKey();
  const contract = usdtContract(network);
  const onlyConfirmed = options.onlyConfirmed !== false;
  const limit = options.limit ?? 50;
  const maxRetries = options.maxRetries ?? 4;

  const params = new URLSearchParams({
    only_confirmed: onlyConfirmed ? 'true' : 'false',
    limit: String(limit),
    contract_address: contract,
  });
  if (options.minTimestamp) {
    params.set('min_timestamp', String(options.minTimestamp));
  }

  const url = `${baseUrl(network)}/v1/accounts/${options.address}/transactions/trc20?${params}`;

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= maxRetries) {
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (apiKey) headers['TRON-PRO-API-KEY'] = apiKey;

      const res = await fetch(url, { headers, method: 'GET' });

      if (res.status === 429) {
        const backoff = Math.min(30_000, 500 * 2 ** attempt);
        await sleep(backoff);
        attempt += 1;
        lastError = new Error('TronGrid rate limited (429)');
        continue;
      }

      if (res.status === 404) return [];

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`TronGrid HTTP ${res.status}: ${text.slice(0, 200)}`);
      }

      const json = (await res.json()) as {
        success?: boolean;
        data?: Array<Record<string, unknown>>;
        Error?: string;
      };

      if (json.Error) return [];

      const rows = Array.isArray(json.data) ? json.data : [];
      const transfers: Trc20Transfer[] = [];

      for (const row of rows) {
        const transactionId = String(row.transaction_id || row.txID || '');
        const from = String(row.from || '');
        const to = String(row.to || '');
        const rawValue = String(row.value ?? '0');
        const blockTimestamp = Number(row.block_timestamp || 0);
        const contractAddress = String(
          (row.token_info as { address?: string } | undefined)?.address ||
            row.contract_address ||
            contract
        );

        if (!transactionId || !to) continue;

        transfers.push({
          transactionId,
          from,
          to,
          amount: rawToUsdt(rawValue),
          rawValue,
          blockTimestamp,
          tokenSymbol: (row.token_info as { symbol?: string } | undefined)?.symbol || 'USDT',
          contractAddress,
        });
      }

      return transfers;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      const backoff = Math.min(30_000, 500 * 2 ** attempt);
      await sleep(backoff);
      attempt += 1;
    }
  }

  throw lastError || new Error('TronGrid fetch failed after retries');
}

export function matchDepositTransfers(
  transfers: Trc20Transfer[],
  watch: {
    address: string;
    expectedAmount: number;
    createdAtMs: number;
    amountTolerance?: number;
  }
): Trc20Transfer[] {
  const addr = watch.address.trim();
  const tolerance = watch.amountTolerance ?? 0;
  const minAmount = Math.max(0, watch.expectedAmount - tolerance);

  return transfers.filter((t) => {
    if (t.to !== addr) return false;
    if (t.amount + 1e-12 < minAmount) return false;
    if (watch.createdAtMs && t.blockTimestamp && t.blockTimestamp < watch.createdAtMs) {
      return false;
    }
    return true;
  });
}
