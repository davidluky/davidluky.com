# Design Decisions

Architectural and design choices for `davidluky.com`.

## DD-001: Astro Static Site

**Decision**: Use Astro as the site framework.

**Rationale**: The core site is static portfolio content. Astro keeps the HTML-first model, low runtime JavaScript, file-based routing, and easy Tailwind integration.

## DD-002: Warm Dark Visual System

**Decision**: Use a warm near-black palette with gold accent and a blackletter brand mark.

**Rationale**: The site should feel personal and game-adjacent rather than corporate. The palette and brand morph give the portfolio a recognizable identity while keeping pages quiet enough for dense project content.

## DD-003: Client-Side EN/PT-BR i18n

**Decision**: Keep bilingual content client-side with `localStorage("dl-lang")`.

**Rationale**: Static duplicate routes would add routing and SEO complexity that is not currently needed. The language state is centralized in `src/i18n/shared.ts` so all toggles and header labels stay synchronized.

**Trade-off**: The initial static HTML is English. Portuguese SEO would require route-based pages later.

## DD-004: Rich Project Catalog as Source of Truth

**Decision**: Model projects in `src/data/projects.ts` with typed tag/status/visibility metadata instead of one display string and one link.

**Rationale**: The portfolio needs to distinguish public live products, private active work, internal dashboards, and archived utilities. Deriving featured projects, live-site counts, footer links, and JSON-LD from typed metadata prevents stale counts and dead public links.

**Guard**: Public `liveUrl` values must resolve. Internal tools use `visibility: "internal"` and do not appear in live-site counts.

## DD-005: Cloudflare Workers With Static Assets

**Decision**: Deploy to Cloudflare Workers using `main = "src/worker.ts"` plus `[assets]`.

**Rationale**: The site is mostly static, but TCG Arbitrage needs an eBay marketplace account deletion endpoint on the main domain. A Worker entrypoint lets `/ebay/deletion` be dynamic while everything else remains static edge assets.

## DD-006: eBay Secrets as Worker Bindings

**Decision**: Store eBay verification and API credentials only as Cloudflare Worker secrets.

**Rationale**: The previous Worker draft hardcoded a verification token. Moving secrets to bindings and adding gitleaks/validation guards fixes the class of secret-in-source bugs rather than just removing one string.

## DD-007: Verify eBay POSTs Before Acknowledgement

**Decision**: The eBay deletion POST endpoint returns success only after signature verification and payload validation.

**Rationale**: Blindly returning `{ status: "ok" }` can make integrations look compliant while ignoring authenticity and deletion semantics. The current site stores no eBay account data, so verified acknowledgement is the full local action.

## DD-008: CI Quality Before Deploy

**Decision**: Pull requests and pushes run secret scanning, type checks, build, site validation, and high/critical audit before production deploy.

**Rationale**: Deployment should not be the first time regressions are discovered. The workflow now separates `quality` from `deploy`, and deploy runs only on `main` after quality succeeds.

## DD-009: Project-Specific Validation Script

**Decision**: Add `scripts/validate-site.mjs`.

**Rationale**: Generic tools do not know this project's failure classes: mojibake, missing JSON-LD, dead internal assets, missing CSP directives, and hardcoded eBay token regressions. The custom validator keeps those checks cheap and explicit.

## DD-010: Google Fonts Non-Blocking Load

**Decision**: Load Google Fonts through preconnect plus `media="print"` stylesheet swap.

**Rationale**: It keeps first render fast while preserving the visual system. The onload handler uses `setAttribute` to avoid Astro check hints.

## DD-012: Auto-Computing Time-Based Stats

**Decision**: `yearsCoding` and `yearsGaming` derive from the current year minus a start year, rather than being hardcoded numbers.

**Rationale**: Hardcoded year-difference stats go stale on January 1st every year. Computing them from `new Date().getFullYear() - startYear` eliminates a class of stale data — the site never shows "11 years coding" when it should show "12".

**Guard**: All time-derived stats in `stats.ts` use the computation pattern. Hardcoded year-difference numbers are a code smell.

## DD-011: JSON-LD Only for Public Live Projects

**Decision**: The `/projects` ItemList structured data includes only `liveProjects`.

**Rationale**: Emitting private/internal entries as source-code entities with duplicate `/projects` URLs creates noisy structured data. Public live apps provide cleaner crawler signals.
