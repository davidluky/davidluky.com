# davidluky.com — Personal Website

## Tech Stack
- **Astro 6.x** — static site generator
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
- `scripts/validate-site.mjs` — content/build guard for links, JSON-LD, headers, mojibake, and Worker secret regressions
- `public/_headers` — Cloudflare security headers and CSP
- `.github/workflows/deploy.yml` — PR/push quality job and protected production deploy

## Commands
- `npm run dev` — Dev server at localhost:4321
- `npm run check` — Astro TypeScript check
- `npm run build` — Build to `dist/`
- `npm run validate:site` — Site/content/security guard
- `npm run audit:high` — Fail on high/critical npm advisories
- `npm run verify` — check + build + validate + audit
- `npx wrangler deploy` — Deploy to Cloudflare Workers
- `node scripts/generate-og.mjs` — Regenerate OG image PNG

## Deployment
- **Live**: https://davidluky.com
- **Repo**: github.com/davidluky/davidluky.com
- **CI/CD**: GitHub Actions on PR and push to `main`; deploy only after quality passes on `main`
- **GitHub secret**: `CLOUDFLARE_API_TOKEN`
- **Worker secrets**: `EBAY_VERIFICATION_TOKEN`, `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`
- **Worker vars**: `EBAY_ENDPOINT_URL`, `EBAY_ENVIRONMENT`
- **Analytics**: Cloudflare Web Analytics, allowed in CSP

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

## Maintenance Notes
- Add projects only through `src/data/projects.ts`; counts and live-site lists derive from it.
- Public live links must resolve before they are added as `liveUrl`. Internal dashboards use `visibility: "internal"` and no public `liveUrl`.
- Never hardcode eBay or Cloudflare credentials. `scripts/validate-site.mjs` and gitleaks both guard this.
- Run `npm run verify` before commit/deploy.
