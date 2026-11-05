# USDT Yield Platform

Next.js 14 App Router + TypeScript + Tailwind + **Cloudflare KV (`USDTSTORAGE`)**

## Architecture

- Edge runtime API routes
- Partitioned KV keys: `user:`, `email:`, `plan:`, `tx:`, `deposit:`, `system:config`
- Auth cookies: `app_auth_token`, `admin_auth_token`
- Deposit flow: user request → USDT **TRC20** address + QR → admin approve
- Default admin: `/administrator` → `admin` / `admin123`

## Local

```bash
npm install
npm run dev
```

Uses in-memory KV when binding is missing.

## Deploy

1. Bind KV as **USDTSTORAGE** on Cloudflare Pages
2. Enable `nodejs_compat`
3. Connect GitHub repo and build

See full source in repo for `src/lib/kv.ts`, auth routes, dashboard, and deposit API.
