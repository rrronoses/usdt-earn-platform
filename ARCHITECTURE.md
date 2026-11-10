# USDTSTORAGE — USDT Earn Architecture

Edge-deployed **USDT Earn** application on **Cloudflare Pages** (Next.js App Router) with **Cloudflare KV** binding `USDTSTORAGE`.

Repository: `usdt-earn-platform` (formerly usdt-yield-platform).

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 App Router, React 18, TypeScript, Tailwind |
| Edge runtime | `@cloudflare/next-on-pages` |
| Storage | Cloudflare KV (`USDTSTORAGE`) |
| Chain | TRON Mainnet USDT TRC-20 via TronGrid |
| Auth | HTTP-only cookies (`app_auth_token`, `admin_auth_token`) |

## Product name

**USDT Earn**. Domain: usdtearn.pages.dev

## Claim model

Per-plan daily claim with **24-hour cooldown** from last claim:
`POST /api/claim` with `{ userPlanId }`.

Applies to free and paid plans alike.
