# davidluky.com — Personal Website

## Tech Stack
- **Astro 6.x** — static site generator, zero JS shipped (except i18n + scroll morph)
- **Tailwind CSS 4.x** — via @tailwindcss/vite plugin, theme in global.css @theme block
- **TypeScript** — strict mode via astro/tsconfigs/strict
- **Cloudflare Workers** — static asset deployment via wrangler
- **@resvg/resvg-js** — OG image PNG generation (devDependency)

## Project Structure
- `src/pages/` — File-based routing: index, projects, gaming, about, 404
- `src/components/` — Header.astro, Hero.astro, Footer.astro
- `src/data/projects.ts` — Single source of truth for all 12 projects (EN + PT-BR)
- `src/i18n/shared.ts` — Shared nav/footer i18n strings + applyI18n() helper
- `src/layouts/Base.astro` — HTML shell with meta tags, fonts, OG image
- `src/styles/global.css` — Tailwind imports + @theme (Warm Dark palette) + brand morph CSS
- `public/` — Static assets (favicon, robots.txt, OG images, security headers)
- `scripts/generate-og.mjs` — One-shot OG image generator (SVG → PNG)
- `dist/` — Build output (static HTML/CSS)

## Design System
- **Palette**: Warm Dark — bg #0a0a09, accent #c4a35a (gold), text #faf8f1
- **Fonts**: Inter (body), JetBrains Mono (tech labels), UnifrakturMaguntia (brand mark)
- **Brand**: Blackletter "David Luky" morphs to "DL" on scroll (CSS-only animation)
- **Layout**: sticky header, centered hero, full-width sections, 1280px container, ~600px prose width
- **Breakpoints**: `max-md:` (< 768px), `max-sm:` (< 640px)

## i18n
- All 5 pages are bilingual (EN + PT-BR)
- Language toggle on homepage stat card, persisted to `localStorage('dl-lang')`
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
- Deploy: `npm run build && npx wrangler deploy`

## Related Sites
- **play.davidluky.com** — The Room web client (Cloudflare Workers)
- **tibia.davidluky.com** — Tibia Services marketplace (Vercel, CNAME)
- **tibia-services.vercel.app** — Tibia Services direct URL

## Documentation
| Doc | Purpose |
|-----|---------|
| `CHANGELOG.md` | Version history |
| `docs/design-decisions.md` | Architectural choices with rationale |
| `docs/tech-notes.md` | Implementation details, patterns, gotchas |
| `docs/developer-guide.md` | Project setup, structure, adding pages/projects |
| `docs/deployment-guide.md` | Build, deploy, DNS, troubleshooting |
| `docs/SESSION-HANDOFF.md` | Latest session state for AI continuity |

## Documentation Maintenance
| Change Type | Update These Docs |
|-------------|-------------------|
| New page | `docs/developer-guide.md` (structure) + CLAUDE.md (pages list) |
| New project | `src/data/projects.ts` + projects page `projectsPt` map |
| Design decision | `docs/design-decisions.md` |
| Implementation pattern | `docs/tech-notes.md` |
| Version/release | `CHANGELOG.md` |
| Deployment change | `docs/deployment-guide.md` |
| New i18n pattern | `docs/developer-guide.md` (i18n section) |
