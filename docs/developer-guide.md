# Developer Guide

Everything needed to work on `davidluky.com`.

## Prerequisites

- Node.js 22+
- npm 10+
- Cloudflare account with Wrangler access for deploys

## Quick Start

```bash
cd davidluky.com
npm install
npm run dev        # http://localhost:4321
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Astro dev server |
| `npm run check` | Astro + TypeScript diagnostics |
| `npm run build` | Build static output into `dist/` |
| `npm run validate:site` | Validate internal links, JSON-LD, headers, mojibake, and Worker secret guard |
| `npm run audit:high` | Fail on high/critical npm advisories |
| `npm run verify` | `check` + `build` + `validate:site` + `audit:high` |
| `npm run preview` | Preview production build locally |
| `npx wrangler deploy` | Deploy to Cloudflare Workers |
| `node scripts/generate-og.mjs` | Regenerate OG image PNG |

## Project Structure

```text
davidluky.com/
  src/
    components/          Header, Hero, Footer
    data/
      projects.ts        Rich project catalog and project metadata
      stats.ts           Centralized stats
      gaming.ts          Game Library DB -> Steam API -> fallback loader
    i18n/shared.ts       Shared strings and language-state helpers
    layouts/Base.astro   HTML shell, metadata, JSON-LD, fonts
    pages/               index, projects, gaming, about, 404
    styles/global.css    Tailwind theme and global interaction CSS
    worker.ts            Cloudflare Worker entrypoint for static assets + eBay deletion endpoint
  public/
    _headers             Security headers and CSP
    favicon.svg
    og-image.png
    og-image.svg
    robots.txt
  scripts/
    generate-og.mjs
    validate-site.mjs
  docs/
  wrangler.toml
```

## Adding a New Project

Edit `src/data/projects.ts` and add a `Project` entry:

```typescript
{
  id: "project-id",
  name: "Project Name",
  year: 2026,
  description: "English description.",
  descriptionPt: "Descrição em português.",
  tech: ["TypeScript", "React"],
  tag: "web-app",
  status: "active",
  visibility: "private",
  featured: true,
  liveUrl: "https://example.com",
  repoUrl: "https://github.com/davidluky/example",
  metrics: ["Metric"],
  metricsPt: ["Métrica"],
}
```

Rules:

- Use an existing `projectTags` key or add a new tag in the same file.
- Only set `liveUrl` when the public URL resolves. Internal dashboards should use `visibility: "internal"` and no `liveUrl`.
- `featured` controls the curated section on `/projects`.
- `liveProjects`, footer links, homepage live count, and JSON-LD derive from this data.

## i18n System

`src/i18n/shared.ts` owns the language key, storage access, header label syncing, and `applyI18n()`.

- Language is stored in `localStorage("dl-lang")`.
- `applyI18n()` updates `[data-i18n]` elements and keeps `<html lang>` in sync.
- Page scripts provide EN/PT strings.
- Rich HTML translations still require explicit `data-i18n-html`; use sparingly and keep strings local-controlled.
- Project page dynamic copy uses project IDs, not array indexes.

## Worker Endpoint

`src/worker.ts` handles `/ebay/deletion` before falling through to static assets:

- `GET /ebay/deletion?challenge_code=...` computes the eBay challenge response with `EBAY_VERIFICATION_TOKEN`.
- `POST /ebay/deletion` requires JSON, validates the marketplace deletion payload, verifies `X-EBAY-SIGNATURE` with eBay's Notification API public key, and returns `204` only for verified notifications.
- This website stores no eBay user account data, so a verified notification has no local records to delete.

Required Worker secrets:

- `EBAY_VERIFICATION_TOKEN`
- `EBAY_CLIENT_ID`
- `EBAY_CLIENT_SECRET`

Required Worker vars in `wrangler.toml`:

- `EBAY_ENDPOINT_URL`
- `EBAY_ENVIRONMENT`

## Testing

Before committing or deploying:

```bash
npm run verify
```

For visual checks:

```bash
npm run preview
```

Then inspect desktop and mobile widths.

## CI/CD

`.github/workflows/deploy.yml` has two jobs:

- `quality`: pull requests and pushes run checkout, gitleaks, install, `check`, `build`, `validate:site`, and `audit:high`.
- `deploy`: only pushes to `main`, requires the quality job, checks `CLOUDFLARE_API_TOKEN`, then deploys through Wrangler.

## Accessibility

- Main landmark lives in `Base.astro`.
- Header menu tracks `aria-expanded`.
- Informational tooltip tiles use `aria-describedby` instead of fake button roles.
- Reduced-motion users get snapped transitions instead of scroll-triggered brand animation.
- Muted text color is WCAG AA against the dark backgrounds.
