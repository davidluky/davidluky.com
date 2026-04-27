# davidluky.com — Personal Website

## Tech Stack
- **Astro 6.x** — static site generator, zero JS shipped (except i18n + scroll morph)
- **Tailwind CSS 4.x** — via @tailwindcss/vite plugin, theme in global.css @theme block
- **TypeScript** — strict mode via astro/tsconfigs/strict
- **Cloudflare Workers** — static asset deployment via wrangler
- **better-sqlite3** — Game Library SQLite access at build time (devDependency)
- **@resvg/resvg-js** — OG image PNG generation (devDependency)

## Project Structure
- `src/pages/` — File-based routing: index, projects, gaming, about, 404
- `src/components/` — Header.astro, Hero.astro, Footer.astro
- `src/data/projects.ts` — Single source of truth for all 18 projects (EN + PT-BR)
- `src/data/stats.ts` — Centralized stats (game counts, hours, levels, achievements)
- `src/data/gaming.ts` — Gaming data loader: Game Library DB → Steam API → hardcoded fallback
- `src/i18n/shared.ts` — Shared nav/footer i18n strings + applyI18n() helper
- `src/layouts/Base.astro` — HTML shell with meta tags, fonts, OG image
- `src/styles/global.css` — Tailwind imports + @theme (Warm Dark palette) + brand morph CSS
- `src/types/global.d.ts` — Window interface augmentation for define:vars bridge properties
- `public/` — Static assets (favicon, robots.txt, OG images, security headers)
- `scripts/generate-og.mjs` — One-shot OG image generator (SVG → PNG)
- `.github/workflows/deploy.yml` — CI/CD: check → build → wrangler deploy on push to main
- `dist/` — Build output (static HTML/CSS)

## Design System
- **Palette**: Warm Dark — bg #0a0a09, accent #c4a35a (gold), text #faf8f1
- **Fonts**: Inter (body), JetBrains Mono (tech labels), UnifrakturMaguntia (brand mark)
- **Brand**: Blackletter "David Luky" morphs to "DL" on scroll (CSS-only animation)
- **Layout**: sticky header, centered hero, full-width sections, 1280px container, ~600px prose width
- **Breakpoints**: `max-md:` (< 768px), `max-sm:` (< 640px)

## i18n
- All 5 pages are bilingual (EN + PT-BR)
- Language toggle in Header (all pages) + homepage stat card, persisted to `localStorage('dl-lang')`
- `textContent` by default; `innerHTML` opt-in via `data-i18n-html` attribute (XSS prevention)
- Shared strings in `src/i18n/shared.ts`, page-specific strings in each page's `<script>`
- Projects page uses `data-i18n-tag`/`data-i18n-desc` for per-project translations

## Commands
- `npm run dev` — Dev server at localhost:4321
- `npm run build` — Build to dist/
- `npm run preview` — Preview production build
- `npm run check` — Astro TypeScript check
- `npx wrangler deploy` — Deploy to Cloudflare Workers
- `node scripts/generate-og.mjs` — Regenerate OG image PNG

## Deployment
- **Live**: https://davidluky.com (Cloudflare Workers)
- **Repo**: github.com/davidluky/davidluky.com (public)
- **Cloudflare account**: alissonfrangullys@gmail.com
- **CI/CD**: GitHub Actions on push to main (requires `CLOUDFLARE_API_TOKEN` secret)
- **Manual deploy**: `npm run build && npx wrangler deploy`
- **Analytics**: Cloudflare Web Analytics (auto-injected, no cookies, view in CF dashboard)
- **Lighthouse scores**: 99 / 100 / 100 / 100 (Performance / Accessibility / Best Practices / SEO)

## Related Sites
- **play.davidluky.com** — The Room web client (Cloudflare Workers)
- **tibia.davidluky.com** — Tibia Services marketplace (Vercel, CNAME)
- **tibia-services.vercel.app** — Tibia Services direct URL (fallback)

## Documentation
| Doc | Purpose |
|-----|---------|
| `CHANGELOG.md` | Version history |
| `docs/design-decisions.md` | Architectural choices with rationale |
| `docs/tech-notes.md` | Implementation details, patterns, gotchas |
| `docs/developer-guide.md` | Project setup, structure, adding pages/projects |
| `docs/deployment-guide.md` | Build, deploy, CI/CD, DNS, analytics, troubleshooting |
| `docs/flight-recorder.md` | Failed approaches, gotchas, hard-won lessons |
| `docs/audit-2026-04-25.md` | 32-issue audit report with root cause analysis |
| `docs/SESSION-HANDOFF.md` | Latest session state for AI continuity |

## Documentation Maintenance
| Change Type | Update These Docs |
|-------------|-------------------|
| New page | `docs/developer-guide.md` (structure) + CLAUDE.md (pages list) |
| New project | `src/data/projects.ts` (EN + PT descriptions auto-propagate) |
| Stat value change | `src/data/stats.ts` (all pages auto-update) |
| Design decision | `docs/design-decisions.md` |
| Implementation pattern | `docs/tech-notes.md` |
| Version/release | `CHANGELOG.md` |
| Deployment change | `docs/deployment-guide.md` |
| Failed approach or gotcha | `docs/flight-recorder.md` |
| New i18n pattern | `docs/developer-guide.md` (i18n section) |
