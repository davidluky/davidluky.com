# Changelog

All notable changes to davidluky.com are documented here.

## [Unreleased] — 2026-04-17

### Added
- **`/mmx-phase4-weapons/`** viewer. Static HTML + JSON companion to the megaman-x Phase 4 P3 work: 10 SNES screenshots from `weapon_palette_probe.lua`, each decorated with CGRAM-row-9 colour swatches decoded from the capture's `.bin`. Sidebar table flags each SELECT-tap transition as clean / zero-change / scroll-event. Noindex; same dark aesthetic as `mmx-phase4-fall`.

## [1.0.0] — 2026-04-11

### Added
- **Homepage** with hero section, introduction, 2x2 stats grid, and EN/PT-BR language toggle
- **Projects page** with all 12 projects, category tags, tech badges, and full PT-BR translations
- **Gaming page** with real stats from Steam (1,337 games, 6,338h Dota 2), Tibia (Lvl 627 Elder Druid), Xbox, and Epic Games profiles
- **About page** with background, tech stack grid, timeline, and contact section
- **404 page** with bilingual support
- **Brand morph animation** — "David Luky" in blackletter (UnifrakturMaguntia) collapses to "DL" on scroll with gold glow
- **Bilingual support** — EN/PT-BR toggle on homepage, persisted via localStorage, shared nav/footer strings via `src/i18n/shared.ts`
- **OG image** — 1200x630 PNG generated via `@resvg/resvg-js` for Twitter/Discord/Slack compatibility
- **Mobile responsive** — all pages tested at 320px–1280px breakpoints
- **Cloudflare Workers deployment** — static site served from edge
- **Sitemap** — auto-generated via `@astrojs/sitemap`
- **CSP headers** — via `public/_headers`
- **Favicon** — SVG with "DL" monogram

### Architecture
- Astro 6.x static output — zero JavaScript shipped except scroll animation + language toggle
- Tailwind CSS 4.x via Vite plugin with custom Warm Dark theme
- TypeScript strict mode
- Shared project data in `src/data/projects.ts` — both homepage and projects page import from it
- Shared i18n strings in `src/i18n/shared.ts` — all pages import nav/footer translations

### Deployment
- Cloudflare Workers via `npx wrangler deploy`
- GitHub repo: github.com/davidluky/davidluky.com (public)
- Custom domain: davidluky.com
