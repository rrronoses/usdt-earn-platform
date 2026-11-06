# USDT Yield Platform

Next.js 14 · Cloudflare Pages · KV **USDTSTORAGE** · USDT TRC-20 deposits

## Cloudflare Pages build settings (no local PC needed)

| Setting | Value |
|---------|--------|
| Framework preset | None / Next.js |
| **Build command** | `npx @cloudflare/next-on-pages@1.13.16` |
| **Build output directory** | `.vercel/output/static` |
| Node version | 20 (`NODE_VERSION=20` env) |
| Production branch | `main` |

### Bindings (Pages → Settings → Functions)

- **KV namespace binding** name: `USDTSTORAGE` → your KV namespace

### Environment variables

- `TRON_PRO_API_KEY` — TronGrid API key
- `TRON_NETWORK` — `mainnet` or `shasta`
- `CRON_SECRET` — random secret for verify cron
- `NODE_VERSION` — `20`

### After deploy

1. Open `https://YOUR-PROJECT.pages.dev/administrator`
2. Login `admin` / `admin123`
3. **Deposits** → add USDT TRC-20 addresses (`T…`)
4. **Settings** → min withdrawal / deposit limits

Admin: `/administrator`  
User: `/signup` · `/dashboard`
