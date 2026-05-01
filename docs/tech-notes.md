# Tech Notes

Implementation notes for `davidluky.com`.

## TN-001: Brand Morph

The header brand renders the full text `David Luky`, then scroll state toggles `.header-scrolled` so the middle letters shrink away and the mark reads as `DL`.

Reduced-motion users still get the state change, but transitions are reduced globally by `prefers-reduced-motion`.

## TN-002: Language State

`src/i18n/shared.ts` owns language storage and synchronization:

- `getLanguage()`
- `setLanguage(lang)`
- `toggleLanguage()`
- `syncLanguageControls()`
- `applyI18n(pageStrings)`

Header buttons and the homepage language card call the same helpers, which prevents the old bug where page text switched to Portuguese while the header label still showed `EN`.

## TN-003: Project Catalog

`src/data/projects.ts` is the single source of truth for project content and presentation metadata.

Each project has:

- stable `id`
- bilingual descriptions
- `tag`, `status`, and `visibility` union keys
- `year`
- optional `featured`
- optional `liveUrl`
- optional `repoUrl`
- optional EN/PT metrics

Derived exports:

- `featuredProjects`
- `liveProjects`
- `getProjectTag()`
- `getProjectStatus()`
- `getProjectVisibility()`

Public live URLs must resolve before being added. Internal dashboards should not set `liveUrl`; otherwise they get counted as live sites and appear in footer/homepage links.

## TN-004: Project JSON-LD

The `/projects` page emits `ItemList` JSON-LD only for `liveProjects`. Private and internal archive entries are deliberately omitted from structured data to avoid duplicate `/projects` URLs and misleading crawler signals.

## TN-005: Cloudflare Worker Entrypoint

`wrangler.toml` points to `src/worker.ts` and also serves `dist/` through Workers static assets.

Request routing:

1. `/ebay/deletion` -> Worker handler.
2. Everything else -> `env.ASSETS.fetch(request)`.

The Worker uses non-secret vars for endpoint URL/environment and secrets for credentials.

## TN-006: eBay Signature Verification

The eBay deletion POST flow is intentionally strict:

1. Parse `X-EBAY-SIGNATURE`.
2. Require JSON.
3. Validate `MARKETPLACE_ACCOUNT_DELETION` shape.
4. Fetch OAuth access token with `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET`.
5. Fetch eBay public key by `kid`.
6. Verify ECDSA signature against the exact request body.
7. Return `204` only after verification.

The Worker caches OAuth tokens and public keys in module scope to avoid unnecessary remote calls across warm invocations.

## TN-007: Static Site Validation

`scripts/validate-site.mjs` guards project-specific failure classes:

- likely mojibake in source/docs
- hardcoded eBay verification token regression
- missing CSP directives
- missing internal links/assets in built HTML
- missing JSON-LD in built HTML

This script runs in `npm run verify` and CI.

## TN-008: Security Headers

`public/_headers` controls CSP and browser security headers:

- no framing
- no camera/microphone/geolocation permissions
- strict origin referrer policy
- HSTS
- self-only base URI and form action
- Cloudflare Web Analytics allowlist

Inline scripts remain allowed because Astro page i18n and JSON-LD currently use local inline script patterns. All translated HTML strings are local source-controlled strings and require `data-i18n-html`.

## TN-009: Gaming Data

Gaming data loads in this order:

1. `GAME_LIBRARY_DB` env var, if provided.
2. Steam API, if `STEAM_API_KEY` and `STEAM_ID` are provided.
3. Hardcoded fallback.

There is no personal absolute DB path fallback anymore. Local builds must opt into machine-specific data by setting `GAME_LIBRARY_DB`.

SQLite handles are closed in `finally` so build failures do not leak native resources.

## TN-010: Google Fonts

Fonts use preconnect plus a non-render-blocking `media="print"` stylesheet swap. The `onload` handler uses `setAttribute("media", "all")` so Astro's checker does not treat `media` as an unused identifier.
