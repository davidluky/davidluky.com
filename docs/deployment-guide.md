# Deployment Guide

How to build, verify, deploy, and operate `davidluky.com`.

## Architecture

```text
Browser
  -> Cloudflare DNS
  -> Cloudflare Worker `davidluky-com`
       -> /ebay/deletion handled by src/worker.ts
       -> everything else served from dist/ static assets
```

Related domains:

| Host | Target | Notes |
|------|--------|-------|
| `davidluky.com` | `davidluky-com` Worker | This site |
| `play.davidluky.com` | The Room Web Worker | Public live app |
| `tibia.davidluky.com` | Vercel | Public live marketplace |
| `matematica.davidluky.com` | Vercel | Public live math site |

`power.davidluky.com` is not listed as public/live because DNS did not resolve during the 2026-04-30 audit. Power Monitor remains documented as an internal dashboard.

## Local Build

```bash
npm install
npm run verify
```

`npm run verify` runs:

1. `npm run check`
2. `npm run build`
3. `npm run validate:site`
4. `npm run audit:high`

## Wrangler Config

`wrangler.toml` uses a Worker entrypoint plus static assets:

```toml
name = "davidluky-com"
compatibility_date = "2026-04-11"
main = "src/worker.ts"

[vars]
EBAY_ENDPOINT_URL = "https://davidluky.com/ebay/deletion"
EBAY_ENVIRONMENT = "production"

[assets]
directory = "./dist"
not_found_handling = "404-page"
```

## Required Secrets

GitHub Actions:

- `CLOUDFLARE_API_TOKEN`

Cloudflare Worker:

- `EBAY_VERIFICATION_TOKEN`
- `EBAY_CLIENT_ID`
- `EBAY_CLIENT_SECRET`

Set Worker secrets:

```bash
npx wrangler secret put EBAY_VERIFICATION_TOKEN
npx wrangler secret put EBAY_CLIENT_ID
npx wrangler secret put EBAY_CLIENT_SECRET
```

Never put these values in `.env`, source files, docs, screenshots, or issue text. The repo has a gitleaks rule and `scripts/validate-site.mjs` guard for the eBay token class.

## eBay Endpoint

`src/worker.ts` handles eBay marketplace account deletion:

- `GET /ebay/deletion?challenge_code=...`
  - Requires `EBAY_VERIFICATION_TOKEN`.
  - Returns `{ "challengeResponse": "..." }`.
- `POST /ebay/deletion`
  - Requires `content-type: application/json`.
  - Requires a valid `X-EBAY-SIGNATURE`.
  - Validates `MARKETPLACE_ACCOUNT_DELETION` payload shape.
  - Fetches eBay public keys using client-credentials OAuth.
  - Returns `204` only after signature verification succeeds.

The site does not persist eBay user account data, so a verified deletion notification has no local records to delete. Acknowledgement after verification is the full local action.

## CI/CD

`.github/workflows/deploy.yml` runs two jobs:

| Job | Trigger | Steps |
|-----|---------|-------|
| `quality` | pull requests and pushes | checkout, gitleaks, npm ci, check, build, validate, high/critical audit |
| `deploy` | push to `main` only | npm ci, build, Cloudflare token preflight, Wrangler deploy |

Deploy uses GitHub Environment `production`, so environment-level protections can be added in GitHub without changing the workflow.

## Manual Deploy

```bash
npm run verify
npx wrangler deploy
```

Manual deploys use local Wrangler auth. CI deploys require `CLOUDFLARE_API_TOKEN`.

## Analytics

Cloudflare Web Analytics is injected by Cloudflare for the proxied domain. CSP allows:

- `script-src https://static.cloudflareinsights.com`
- `connect-src https://cloudflareinsights.com`

## Troubleshooting

### CI says `CLOUDFLARE_API_TOKEN` is missing

Create or refresh the GitHub Actions secret with Worker deploy permissions.

### eBay challenge returns 503

`EBAY_VERIFICATION_TOKEN` is missing in Worker secrets. Add it with `npx wrangler secret put EBAY_VERIFICATION_TOKEN`.

### eBay POST returns 412

The signature header is missing, invalid, or does not verify against eBay's public key.

### eBay POST returns 503

The Worker could not fetch OAuth/public-key data. Check `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, and `EBAY_ENVIRONMENT`.

### Fonts not loading

Check CSP entries for `fonts.googleapis.com` and `fonts.gstatic.com`.

### OG image not showing

Regenerate and deploy:

```bash
node scripts/generate-og.mjs
npm run verify
npx wrangler deploy
```
