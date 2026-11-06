# USDT Yield Platform

Next.js 14 App Router · TypeScript · Tailwind · **Cloudflare KV (`USDTSTORAGE`)** · Automated **USDT TRC-20** deposits (TronGrid)

## Live structure

### Pages
| Route | Role |
|-------|------|
| `/` | Landing |
| `/login` `/signup` | Auth |
| `/dashboard` | Balances, deposit TRC-20, claim, txs |
| `/plans` | Buy investment tiers |
| `/invitation` | Referral link (20%) |
| `/account` | Profile, withdraw, password, logout |
| `/administrator` | Admin login |
| `/administrator/dashboard` | Admin home |
| `/administrator/deposits` | Multi USDT TRC-20 address CRUD |

### APIs
| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/signup` | Signup + free Bronze + 8-digit id |
| `POST /api/auth/login` | User / admin login |
| `POST /api/auth/logout` | Clear cookies |
| `GET /api/me` | Session user + plans + txs |
| `POST /api/deposit` | Create TRC-20 watch |
| `POST /api/deposit/verify` | TronGrid auto-credit |
| `GET /api/deposit/check-status` | UI poll |
| `POST /api/plans/buy` | Purchase + 20% referral |
| `POST /api/claim` | Daily yield |
| `POST /api/withdraw` | Withdrawal queue |
| `GET/POST /api/admin/deposit-addresses` | Address admin |

### Core libs
- `src/lib/kv.ts` → re-exports `kv-core` + `kv-deposit`
- `src/lib/tron.ts` — TronGrid USDT TRC-20 client
- `src/lib/deposit-engine.ts` — verify + idempotent credit
- `src/middleware.ts` — protect dashboard & admin

## Env
```bash
TRON_PRO_API_KEY=
TRON_NETWORK=mainnet
CRON_SECRET=
```

## Local
```bash
npm install
npm run dev
```

Admin: `/administrator` → `admin` / `admin123`

## Deploy (Cloudflare Pages)
1. Bind KV as **`USDTSTORAGE`**
2. Flag `nodejs_compat`
3. Connect this repo
