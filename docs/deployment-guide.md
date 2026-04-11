# Deployment Guide

How to build, deploy, and manage davidluky.com infrastructure.

## Architecture Overview

```
Browser → Cloudflare DNS → Cloudflare Workers → Static HTML/CSS/JS
                         → (play.davidluky.com) → The Room Web Worker
                         → (tibia.davidluky.com) → CNAME → Vercel
```

## Build & Deploy

### Standard Deployment

```bash
npm run build          # Build to dist/
npm run check          # Verify TypeScript (optional but recommended)
npx wrangler deploy    # Upload to Cloudflare Workers
```

Build output is ~15 static files (5 HTML pages + CSS + JS chunks + assets).

### What Gets Uploaded

Wrangler uploads the `dist/` directory as static assets. It diffs against the previous deployment and only uploads changed files. Typical deploy takes 5-10 seconds.

### Verify Deployment

After `wrangler deploy`, the site is immediately live at:
- https://davidluky.com (custom domain)
- https://davidluky-com.alissonfrangullys.workers.dev (worker URL)

## Cloudflare Configuration

### Account
- **Email**: alissonfrangullys@gmail.com
- **Domain**: davidluky.com (registered and DNS managed by Cloudflare)

### Workers
| Worker | Domain | Purpose |
|--------|--------|---------|
| `davidluky-com` | davidluky.com | This site |
| `the-room-web` | play.davidluky.com | The Room web client |

### DNS Records

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| (Worker route) | davidluky.com | `davidluky-com` worker | Yes |
| (Worker route) | play.davidluky.com | `the-room-web` worker | Yes |
| CNAME | tibia | cname.vercel-dns.com | DNS only |

### wrangler.toml

```toml
name = "davidluky-com"
compatibility_date = "2026-04-11"

[assets]
directory = "./dist"
not_found_handling = "404-page"
```

### Authentication

Wrangler uses OAuth — run `npx wrangler login` to authenticate via browser. Token is stored locally and refreshed automatically.

## GitHub

### Repository
- **URL**: https://github.com/davidluky/davidluky.com
- **Visibility**: Public
- **Branch**: `main` (single branch)

### Pushing
```bash
git add -A
git commit -m "description"
git push
```

No CI/CD is configured — deploys are manual via `npx wrangler deploy`. Could add Cloudflare Builds for automatic deploys on push.

## Related Services

### Vercel (Tibia Services)
- **URL**: https://tibia.davidluky.com
- **Direct URL**: https://tibia-services.vercel.app (Vercel default)
- **Repo**: github.com/davidluky/tibia-services
- **Account**: linked to GitHub `davidluky`

### Supabase (Tibia Services backend)
- **Project**: lsizuiyxowfbipslkdya
- **URL**: https://lsizuiyxowfbipslkdya.supabase.co

## OG Image Regeneration

If the OG image design changes:

```bash
# Edit the SVG in scripts/generate-og.mjs
node scripts/generate-og.mjs     # Generates public/og-image.png
npm run build                     # Rebuild with new image
npx wrangler deploy               # Deploy
```

The SVG source in `public/og-image.svg` is kept as reference but is not used by social platforms — only `og-image.png` is referenced in meta tags.

## Troubleshooting

### "Worker not found" after deploy
The custom domain might have been reassigned. Use the Cloudflare API to reassign:
```bash
curl -X PUT "https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/workers/domains" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{"zone_id":"{ZONE_ID}","hostname":"davidluky.com","service":"davidluky-com","environment":"production"}'
```

### Fonts not loading
Check that `fonts.googleapis.com` and `fonts.gstatic.com` are allowed in the CSP header (`public/_headers`).

### OG image not showing on Twitter/Discord
1. Verify `public/og-image.png` exists and is a valid PNG
2. Check `src/layouts/Base.astro` references `og-image.png` (not `.svg`)
3. Twitter card should be `summary_large_image` for the 1200x630 format
4. Use https://cards-dev.twitter.com/validator to debug

### Language toggle not persisting
Check that `localStorage` is accessible (not blocked by browser privacy settings). The key is `dl-lang` with values `en` or `pt`.
