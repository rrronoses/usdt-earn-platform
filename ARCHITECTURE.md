# USDTSTORAGE — Platform Architecture

Edge-deployed USDT yield application on **Cloudflare Pages** (Next.js App Router) with **Cloudflare KV** binding `USDTSTORAGE`.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 App Router, React 18, TypeScript, Tailwind |
| Edge runtime | `@cloudflare/next-on-pages` |
| Storage | Cloudflare KV (`USDTSTORAGE`) |
| Chain | TRON Mainnet USDT TRC-20 via TronGrid |
| Auth | HTTP-only cookies (`app_auth_token`, `admin_auth_token`) |

## KV key schema

| Key | Purpose |
|-----|---------|
| `user:{id}` | User profile + balances |
| `email:{email}` | Login index → userId (raw string) |
| `username:{name}` | Login index → userId (raw string) |
| `user_plans:{userId}` | Purchased plans array |
| `tx:{txId}` | Immutable ledger entry |
| `user_tx:{userId}` | Recent tx id index |
| `deposit:{id}` | Deposit request |
| `deposits:pending` | Pending deposit ids |
| `deposit_watch_id:{depositId}` | Watch metadata |
| `processed_tx:{chainTxId}` | Idempotency — never double-credit |
| `system:config` | Limits, notes, admin hash |
| `system:deposit_addresses` | TRC-20 address pool |
| `plan:{id}` / `plans:index` | Plan catalog |
| `rl:{key}` | Rate-limit buckets |

## Deposit verification flow

1. User creates deposit → random **enabled** TRC-20 address from admin pool
2. Client polls `/api/deposit/check-status` (and optional “Check chain now”)
3. Worker calls TronGrid `accounts/{address}/transactions/trc20`
4. Match **confirmed** transfers: `to == address`, amount ≥ expected, after createdAt
5. Prefer **exact amount** match (safe for shared addresses)
6. Acquire short lock → write `processed_tx:{txId}` → credit `depositBalance` → ledger
7. Cron: `GET/POST /api/deposit/verify?all=1` with `x-cron-secret`

### Env vars (Cloudflare Pages)

- `TRON_PRO_API_KEY` — TronGrid API key (recommended)
- `TRON_NETWORK` — `mainnet` (default) or `shasta`
- `USDT_TRC20_CONTRACT` — optional override
- `CRON_SECRET` — protects bulk verify endpoint

## Auth & access control

- User routes: cookie `app_auth_token`
- Admin routes: cookie `admin_auth_token` + `role === 'admin'`
- Deposit bulk verify: admin session **or** `x-cron-secret`

## Claim model

Per-plan daily claim: `POST /api/claim` with `{ userPlanId }`. Each plan tracks `lastClaimedAt` independently.

## Frontend

- Theme: `dark` / `light` (localStorage)
- Language: `en` / `fr` (localStorage)
- Toasts: global `ToastProvider`
- User shell: bottom nav + glass header
- Admin shell: module tabs + KPI overview

## Operational notes

- KV is **eventually consistent** — always gate credits with `processed_tx`
- Prefer dedicated deposit addresses when volume grows
- Rotate admin password in `system:config` after first deploy
- Monitor TronGrid 429s; engine uses exponential backoff
