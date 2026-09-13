# Project agent guide

## Reading and completion

Use the rules below for this project. For a small isolated edit, read the affected source and applicable rules. For substantive resumes, read the current canonical position; historical status is not live evidence. Preserve unrelated work and existing release, security, data and physical-action boundaries.

Detailed reference: [AGENT_REFERENCE.md](AGENT_REFERENCE.md). Before changing a subsystem or running an operation covered by a section below, read that section; do not read the whole reference by default. Maps and historical entries are lookup aids.

- [Tech Stack](AGENT_REFERENCE.md#tech-stack)
- [Project Structure](AGENT_REFERENCE.md#project-structure)
- [Related Sites](AGENT_REFERENCE.md#related-sites)
- [Documentation](AGENT_REFERENCE.md#documentation)

## Commands
- `npm run dev` — Dev server at localhost:4321
- `npm run check` — Astro TypeScript check
- `npm run lint` — ESLint for Astro, TypeScript, scripts, and tests (zero warnings)
- `npm run test` — Vitest unit and Worker regression suite
- `npm run build` — Build to `dist/`
- `npm run validate:site` — Site/content/security guard
- `npm run audit:high` — Fail on high/critical npm advisories
- `npm run verify` — check + lint + test + build + validate + audit
- `.\scripts\deploy-production.ps1 -CheckOnly` — Verify a clean, pushed production candidate without deploying
- `.\scripts\deploy-production.ps1 -ApproveProduction` — Explicitly approved local fallback deploy
- `node scripts/generate-og.mjs` — Regenerate OG image PNG

## Deployment
- **Live**: https://davidluky.com
- **Repo**: github.com/davidluky/davidluky.com
- **CI/CD**: GitHub Actions is disabled; Cloudflare Workers Builds verifies and deploys pushes to `main`
- **Local fallback**: guarded, version-pinned Wrangler flow in `scripts/deploy-production.ps1`
- **Worker secrets**: `EBAY_VERIFICATION_TOKEN`, `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `MATHEUS_PASSWORD`, `MATHEUS_SESSION_SECRET`
- **Worker vars**: `EBAY_ENDPOINT_URL`, `EBAY_ENVIRONMENT`, `MATHEUS_SESSION_EPOCH`
- **Revoking Matheus access**: rotating `MATHEUS_PASSWORD` alone leaves cookies valid for up to 30 days. Bump `MATHEUS_SESSION_EPOCH` in `wrangler.toml` and redeploy to invalidate every session at once; guests can sign out themselves with the "Sair" button (`POST /sair/`)
- **Analytics**: Cloudflare Web Analytics, allowed in CSP

## Maintenance Notes
- Add projects only through `src/data/projects.ts`; counts and live-site lists derive from it.
- Public live links must resolve before they are added as `liveUrl`. Internal dashboards use `visibility: "internal"` and no public `liveUrl`.
- Never hardcode eBay or Cloudflare credentials. `scripts/validate-site.mjs` and gitleaks both guard this.
- **Profile-content boundary:** Do not use LessWrong or GreaterWrong profile information, activity, links, or research anywhere on this site — social cards, footer links, metadata, JSON-LD `sameAs`, or future copy. The site owner determined that this information adds no value here. `scripts/validate-site.mjs` enforces this boundary in generated HTML.
- Run `npm run verify` before commit/deploy.
