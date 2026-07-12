# Deployment Guide

How to build, verify, deploy, and operate `davidluky.com`.

## Architecture

```text
Browser
  -> Cloudflare DNS
  -> Cloudflare Worker `davidluky-com`
       -> /ebay/deletion handled by src/worker.ts
       -> Matheus hosts pass through the password gate, then /matheus static assets
       -> everything else served from dist/ static assets
```

Related domains:

| Host | Target | Notes |
|------|--------|-------|
| `davidluky.com` | `davidluky-com` Worker | This site |
| `play.davidluky.com` | The Room Web Worker | Public live app |
| `matheus.davidluky.com` | `davidluky-com` Worker | Password-gated Matheus seafood manual editions |
| `manual-matheus.davidluky.com` | `davidluky-com` Worker | Gated legacy/fallback Matheus alias |
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
2. `npm run test`
3. `npm run build`
4. `npm run validate:site`
5. `npm run audit:high`

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
binding = "ASSETS"
not_found_handling = "404-page"
run_worker_first = true
```

`run_worker_first = true` is required for the hostname-aware Matheus gate. See the
[Matheus flight deck](./FLIGHT-DECK.md) before changing Worker or Matheus routes.

## Required Secrets

GitHub Actions:

- `CLOUDFLARE_API_TOKEN`

Cloudflare Worker:

- `EBAY_VERIFICATION_TOKEN`
- `EBAY_CLIENT_ID`
- `EBAY_CLIENT_SECRET`
- `MATHEUS_PASSWORD`
- `MATHEUS_SESSION_SECRET`

Set Worker secrets:

```bash
npx wrangler secret put EBAY_VERIFICATION_TOKEN
npx wrangler secret put EBAY_CLIENT_ID
npx wrangler secret put EBAY_CLIENT_SECRET
npx wrangler secret put MATHEUS_PASSWORD
npx wrangler secret put MATHEUS_SESSION_SECRET
```

Never put these values in tracked `.env` files, source files, docs, screenshots, or issue text. The repo has a gitleaks rule and `scripts/validate-site.mjs` guard for the eBay token class.
Matheus values also remain only in ignored local storage and Worker bindings; never print ignored-file
contents, login bodies, or cookies.

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
| `quality` | pull requests and pushes | checkout, gitleaks, npm ci, check, tests, build, validate, high/critical audit |
| `deploy` | push to `main` only | npm ci, build, Cloudflare token preflight, Wrangler deploy |

Deploy uses GitHub Environment `production`, so environment-level protections can be added in GitHub without changing the workflow.

## Emergency Manual Deploy

Use direct Wrangler deployment only when the normal GitHub deployment path is unavailable and David
has explicitly approved the emergency path for the exact commit.

```bash
npm run verify
npx wrangler deploy --dry-run
npx wrangler deploy
```

Manual deploys use local Wrangler auth. CI deploys require `CLOUDFLARE_API_TOKEN`. Never use a manual
deploy to bypass a failing quality job or the explicit production-approval gate. Record the deployed
Git SHA, reconcile `main` with that exact state, and run the same production smoke checks required by
`docs/FLIGHT-DECK.md`.

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

### Matheus returns 503

List Worker secret names and confirm both `MATHEUS_PASSWORD` and `MATHEUS_SESSION_SECRET` exist. Never
print their values. The gate intentionally fails closed when either binding is absent.

### A Matheus asset is visible before login

Confirm `wrangler.toml` still has `run_worker_first = true` and that the asset is not under
`public/matheus/gate_assets/`. Run the Matheus Worker tests and follow `docs/FLIGHT-DECK.md` before
deploying a fix.

### OG image not showing

Regenerate and deploy:

```bash
node scripts/generate-og.mjs
npm run verify
npx wrangler deploy
```
