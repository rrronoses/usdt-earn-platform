# USDT Earn Platform

React + TypeScript + Vite + Cloudflare Pages Functions + **Cloudflare KV** (`USDTSTORAGE`)

## Deposit system (real flow)

1. User enters amount → creates a **pending deposit request**
2. User sees QR + deposit address (active address from admin)
3. User sends exact USDT amount on the correct network
4. User can optionally paste **TX hash** for faster review
5. Admin opens **Deposits** tab → verifies on blockchain explorer → **Approve & Credit** or **Reject**
6. On Approve: user deposit balance is credited and transaction marked completed

No auto-credit. Only admin approval credits funds.

## Withdrawal limit (admin configurable)

- Admin → **Settings** tab
- Set **Minimum withdrawal (USDT)**
- Set deposit review window (minutes) and withdrawal note text
- Enforced on user withdraw form and API logic

## KV binding

Binding name must be exactly: **`USDTSTORAGE`**

```toml
[[kv_namespaces]]
binding = "USDTSTORAGE"
```

Cloudflare Pages → Settings → Functions → KV namespace bindings → bind `USDTSTORAGE`.

Falls back to `localStorage` when KV is unavailable (local `npm run dev`).

## Admin login

URL: `/administrator`  
User: `admin`  
Pass: `admin123`

## Run locally

```bash
npm install
npm run dev
```

## Deploy Cloudflare Pages

- Build: `npm run build`
- Output: `dist`
- Bind KV as **USDTSTORAGE**
