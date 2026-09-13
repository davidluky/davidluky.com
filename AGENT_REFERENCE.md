# Project reference

Task-specific reference extracted from the former CLAUDE.md. AGENTS.md is the canonical entrypoint. Read relevant sections when needed; dates and version observations are historical until reverified. Paths remain relative to the repository root.

## Tech Stack
- **Astro 7.x** — static site generator
- **Tailwind CSS 4.x** — via `@tailwindcss/vite`, theme in `src/styles/global.css`
- **TypeScript** — strict Astro config
- **Cloudflare Workers** — static assets plus `src/worker.ts` for `/ebay/deletion`
- **better-sqlite3** — optional Game Library SQLite access at build time
- **@resvg/resvg-js** — OG image PNG generation

## Project Structure
- `src/pages/` — `index`, `projects`, `gaming`, `about`, `404`
- `src/components/` — `Header`, `Hero`, `Footer`
- `src/data/projects.ts` — rich project catalog: EN/PT copy, tags, status, visibility, featured flags, metrics, live/source URLs
- `src/data/stats.ts` — centralized stats
- `src/data/gaming.ts` — Game Library DB -> Steam API -> fallback data loader
- `src/i18n/shared.ts` — shared i18n strings plus language-state helpers
- `src/layouts/Base.astro` — HTML shell, metadata, OG, JSON-LD, fonts
- `src/worker.ts` — Cloudflare Worker entrypoint for eBay marketplace account deletion challenge + signed notification validation
- `scripts/validate-site.mjs` — content/build guard for links, JSON-LD, headers, mojibake, excluded profile content, and Worker secret regressions
- `public/_headers` — Cloudflare security headers and CSP
- `.github/workflows/deploy.yml` — legacy workflow kept only because repository Actions is disabled; it still triggers on every push to `main` if Actions is ever re-enabled. Every third-party action is pinned to an immutable commit SHA; gitleaks uses the Node 24-compatible v3.0.0 release.
- `docs/LOCAL-DEPLOYMENT.md` — Cloudflare Workers Builds release path and guarded local fallback

## Related Sites
- **play.davidluky.com** — The Room web client
- **tibia.davidluky.com** — Tibia Services marketplace
- **matematica.davidluky.com** — Matemática Elementar

## Documentation
| Doc | Purpose |
|-----|---------|
| `CHANGELOG.md` | Version history |
| `docs/design-decisions.md` | Architectural choices |
| `docs/tech-notes.md` | Implementation patterns |
| `docs/developer-guide.md` | Setup, structure, adding pages/projects |
| `docs/deployment-guide.md` | Build, deploy, CI/CD, DNS, eBay endpoint |
| `docs/flight-recorder.md` | Failed approaches and gotchas |
| `docs/SESSION-HANDOFF.md` | Latest session state |
