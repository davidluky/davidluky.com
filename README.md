# davidluky.com

Personal website for David Luky. Built with Astro + Tailwind CSS, deployed on Cloudflare Workers with a small Worker entrypoint for static assets and eBay marketplace account deletion compliance.

## Setup

```bash
npm install
npm run dev       # http://localhost:4321
```

## Quality Gates

```bash
npm run check          # Astro + TypeScript diagnostics
npm run build          # Build static output into dist/
npm run validate:site  # Internal links, JSON-LD, headers, mojibake, Worker secret guard
npm run audit:high     # Fail on high/critical npm advisories
npm run verify         # Run all of the above in order
```

## Deploy

```bash
npm run build
npx wrangler deploy
```

GitHub Actions runs the same quality path on pull requests and pushes to `main`; deploy runs only after the quality job passes on `main`.

Required GitHub secret:

- `CLOUDFLARE_API_TOKEN` — Cloudflare API token with Worker deploy permissions.

Required Cloudflare Worker secrets:

- `EBAY_VERIFICATION_TOKEN` — 32-80 character marketplace deletion verification token from eBay.
- `EBAY_CLIENT_ID` — eBay application client ID for Notification API public-key lookup.
- `EBAY_CLIENT_SECRET` — eBay application client secret for Notification API public-key lookup.

Set Worker secrets with:

```bash
npx wrangler secret put EBAY_VERIFICATION_TOKEN
npx wrangler secret put EBAY_CLIENT_ID
npx wrangler secret put EBAY_CLIENT_SECRET
```

Non-secret Worker vars live in `wrangler.toml`:

- `EBAY_ENDPOINT_URL = "https://davidluky.com/ebay/deletion"`
- `EBAY_ENVIRONMENT = "production"`

## Project Content

Projects live in `src/data/projects.ts` as the single source of truth. Each entry includes bilingual descriptions, tag, status, visibility, year, optional live/source URLs, featured flag, and metrics. The homepage, footer, live-site count, JSON-LD, and `/projects` page all derive from that data.

Power Monitor is intentionally marked as an internal dashboard, so it is no longer counted as a live public site until DNS/public access exists.
