# USDT Earn Platform

**Repository:** [rrronoses/usdt-earn-platform](https://github.com/rrronoses/usdt-earn-platform)

High-yield style **USDT Earn** app: plans, daily earn claims (24h cooldown), referrals, TRC-20 deposits, admin console.

| | |
|--|--|
| Stack | Next.js 14 App Router · TypeScript · Tailwind |
| Host | Cloudflare Pages (`@cloudflare/next-on-pages`) |
| Storage | Cloudflare KV binding **`USDTSTORAGE`** |
| Chain | TRON USDT **TRC-20** (TronGrid) |
| Live | https://usdtearn.pages.dev/ |

## Features

- User panel: dashboard, plans, deposit, withdraw, history, invitation, account
- Daily **earn** claim per plan with **24-hour** cooldown
- Admin: users, plans, wallets, withdrawals, settings, metrics
- Theme (dark/light) + language (EN/FR)

## Cloudflare Pages build settings

| Setting | Value |
|--------|--------|
| Repository | `rrronoses/usdt-earn-platform` |
| Framework preset | None |
| Build command | `npx @cloudflare/next-on-pages@1.13.16` |
| Build output directory | `.vercel/output/static` |
| Node.js version | 18+ |

## Bindings

- **KV namespace** variable name: `USDTSTORAGE`

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_NAME` | `USDT Earn` |
| `TRON_PRO_API_KEY` | TronGrid API key |
| `TRON_NETWORK` | `mainnet` or `shasta` |
| `CRON_SECRET` | Optional cron / worker secret |
| `ADMIN_USERNAME` | Admin login (optional override) |
| `ADMIN_PASSWORD` | Admin password (optional override) |

## Local development

```bash
npm install
npm run dev
```

Production-like Pages build:

```bash
npm run pages:build
```

## Admin

- URL: `/administrator`
- Credentials: set via Cloudflare env `ADMIN_USERNAME` / `ADMIN_PASSWORD`, or defaults from seed config

---

Product name: **USDT Earn** (not Yield).
