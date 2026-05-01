# Changelog

All notable changes to davidluky.com are documented here.

## [Unreleased] — 2026-05-01

### Added
- **`stats.yearsCoding`**: Auto-computed years since 2014 (DD-012 pattern), used on the homepage "Years Coding" stat card.
- **`stats.codingStartYear`**: Source constant for the coding start year.
- **Lua** added to the About page tech stack (Languages category).
- **About link** in the footer under a new "Explore" column (was "Gaming" only).

### Changed
- **Homepage stat card**: Replaced "Gaming Platforms" (linked to /gaming) with **"Years Coding"** (linked to /about). Bilingual: EN "Years Coding" / PT "Anos Programando".
- **The Room achievements**: 239 → **249** in `stats.ts`.
- **Matemática Elementar**: "221 audited sets, 2,483 problems" → **"267 sets, 5,564 problems"** in description and metrics (EN + PT).
- **TCG Arbitrage**: "31 tests, 16 commands" → **"80 tests, 18 commands"** in description and metrics (EN + PT).
- **Game Library**: "8+ platforms" → **"10+ platforms"** in description and metrics (EN + PT). Description now lists Game Pass PC/Xbox split.
- **About page timeline**: 2014 entry now mentions coding alongside Tibia (EN + PT).
- **Footer**: "Gaming" column renamed to "Explore" with Gaming + About links. Shared i18n strings updated.

### Fixed
- 5 stale hardcoded stat values across project descriptions (FR-023).

## [Unreleased] — 2026-04-30

### Added
- **Cloudflare Worker eBay endpoint**: `/ebay/deletion` now handles eBay marketplace account deletion challenge and signed POST notifications.
- **Worker secret/env contract**: `EBAY_VERIFICATION_TOKEN`, `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `EBAY_ENDPOINT_URL`, and `EBAY_ENVIRONMENT`.
- **Rich project catalog**: projects now include typed status, visibility, year, featured flag, live/source URLs, and EN/PT metrics.
- **Featured projects section** on `/projects`, plus live-only JSON-LD structured data.
- **`scripts/validate-site.mjs`** guard for internal links, JSON-LD, CSP directives, mojibake, and hardcoded eBay token regressions.
- **CI quality job** for PRs and pushes: gitleaks, check, build, site validation, and high/critical npm audit.
- **Custom gitleaks rule** for quoted and unquoted eBay verification token assignments.

### Changed
- Refreshed the projects page with current work: Matemática Elementar dual-curriculum scope, TCG Arbitrage, DigiPets, Alisson site, Laptop Bootstrap, and updated Power Monitor as internal.
- Homepage project stat now says "Projects" instead of overclaiming "Active Projects".
- Live-site counts now derive only from public `liveUrl` values.
- Footer project links now derive from `liveProjects`.
- Language state helpers now centralize header/homepage toggle synchronization.
- Informational stat tiles now use `<details>/<summary>` disclosure semantics instead of fake button roles.
- Gaming data no longer falls back to a personal absolute Game Library DB path; local DB use requires `GAME_LIBRARY_DB`.
- npm dependencies updated and `yaml` overridden to `^2.8.3`; npm audit now reports 0 vulnerabilities.

### Fixed
- Removed hardcoded eBay verification token from source.
- Replaced blind eBay POST acknowledgement with signed notification validation.
- Fixed reduced-motion behavior so brand morph transitions are not exempted.
- Added locale metadata and JSON-LD structured data.
- Updated README, CLAUDE, developer guide, deployment guide, tech notes, design decisions, flight recorder, and session handoff for the new architecture.

## [Unreleased] — 2026-04-26

### Changed
- **MMX Trainer** (formerly Glimmering Falcon) — project name updated across all user-facing content: `projects.ts` display name, `about.astro` 2026 timeline entry (EN + PT-BR), and 3 prior CHANGELOG entries. Aligns with the rename in the mmx-trainer repo (GF-090 + GF-091).
- **Gemini Image Generator** (formerly Gemini Pixel Art Generator) — project name and description updated in `projects.ts`. The tool is general-purpose (any image type), not pixel-art-only. Aligned with the project's own README title.

## [Unreleased] — 2026-04-25

### Added
- **`src/data/stats.ts`** — Single source of truth for all hardcoded stats (The Room games/achievements, Steam hours, Tibia level, etc.). All pages now import from here instead of scattering magic numbers.
- **3 new projects**: Power Monitor, Matemática Elementar, SNES ROM Ripper — total 18 projects.
- **Full PT-BR translations for about page**: timeline entries and tech stack categories now translate when switching to Portuguese.
- **Footer links**: Power Monitor and Matemática added to Projects column.
- **Xbox gamerscore stats**: Xbox card on gaming page now shows 476 games + 75,268 gamerscore (real data from Xbox Live API).
- **Platform hours breakdown**: Total gaming hours (15,595) computed dynamically from Game Library DB grouped by platform (Steam 12,288h + Xbox 3,307h).
- **Flight recorder entries**: FR-011 through FR-018 documenting Xbox auth, ESM imports, safeStorage gotchas, and audit lessons.
- **`src/types/global.d.ts`** — Window interface augmentation for `__stats`, `__gaming`, `__about` bridge properties.
- **Header language toggle** — EN/PT switch in desktop nav and mobile menu (all pages).
- **Keyboard-accessible tooltips** — `tabindex="0"`, `role="button"`, `aria-label`, `:focus-within` CSS for achievements, live-sites, and hours tiles.
- **`docs/audit-2026-04-25.md`** — Full 32-issue audit report with root cause analysis and fixes.
- **CI/CD** via GitHub Actions (`.github/workflows/deploy.yml`): check → build → wrangler deploy on push to main.
- **Cloudflare Web Analytics** — unblocked auto-injected beacon by adding `static.cloudflareinsights.com` to CSP.
- **`<main>` landmark** in `Base.astro` for screen reader navigation.
- **Non-render-blocking Google Fonts** via `media="print" onload="this.media='all'"` swap pattern.

### Fixed
- **Location**: "Based in Brazil" → "Based in the US" across index + about pages (EN + PT).
- **The Room game count**: hardcoded 13 → dynamic `stats.theRoomGames` (14) across all pages.
- **Live Sites stat**: hardcoded "3" → computed from `projects.filter(p => p.link?.startsWith("http"))`, now links to /projects.
- **Projects page PT duplication**: eliminated 18-entry hardcoded `projectsPt` map — now reads `descriptionPt`/`tagPt` directly from `projects.ts`.
- **Gaming page stats**: all hardcoded numbers replaced with `stats.*` refs.
- **ESM module loading** (`gaming.ts`): `require("better-sqlite3")` → `await import("better-sqlite3")`. Astro runs ESM at build time; `require()` silently threw, causing the gaming page to always show fallback data instead of real DB data.
- **Xbox stats**: Replaced hardcoded `xboxTrackedGames: 5` / `xboxHoursPlayed: 59` with real data `xboxGames: 476` / `xboxGamerscore: "75,268"`.
- **XSS in applyI18n()**: Changed from `innerHTML` for all strings to `textContent` by default, `innerHTML` only via `data-i18n-html` opt-in.
- **CSP headers**: Added `base-uri 'self'; form-action 'self'` to Content-Security-Policy.
- **npm vulnerabilities**: Patched Astro + PostCSS CVEs via `npm audit fix`.
- **Heading hierarchy**: 9x `<h3>` → `<h2>` on gaming + about pages (WCAG 1.3.1).
- **Mobile menu a11y**: Added `aria-expanded` toggling, switched from inline styles to CSS class toggles.
- **Homepage SEO**: Added custom `<title>` and `<meta description>`.
- **DB query types**: All 6 better-sqlite3 query sites now have proper type assertions.
- **stats.ts all numbers**: Converted mixed string/number values to all numbers; formatting at template layer.
- **Gaming distribution labels**: Added PT-BR translations for 4 distribution categories.
- **404 HTML entity**: Added `data-i18n-html` for `&larr;` entity preservation.
- **Color contrast**: Bumped `text-text-3` from `#6a6458` → `#847a6c` (WCAG AA 4.5:1 compliance).
- **accent/70 contrast**: Bumped to `accent/80` on stat card label for WCAG compliance.
- **aria-label mismatch**: Tooltip tiles now include visible text in accessible name.
- **Render-blocking fonts**: Google Fonts now loaded non-blocking via `media="print" onload` swap.
- **CSP console errors**: Allowed Cloudflare analytics beacon in script-src and connect-src.
- **Lighthouse scores**: 98/94/92/100 → **99/100/100/100** (Performance/Accessibility/Best Practices/SEO).

### Removed
- **`public/stats-banner.svg`** — stale hardcoded stats, never updated.
- **5 dead stats values** from `stats.ts` (`steamGames`, `steamGamesPt`, `steamAchievements`, `totalHoursPlayed`, `totalHoursPlayedPt`).
- **Unused CSS** — `@keyframes fade-in` and `.animate-fade-in`.
- **`.pytest_cache/`** — stray artifact from another project.

### Removed
- **`/mmx-boss-animations` page** — unused debug page from MMX KB project.
- **8 `public/mmx-*` asset folders** — ~200+ boss animation GIFs, phase viewers, and debug assets (not part of the live site).

### Architecture
- Centralized all numeric stats into `src/data/stats.ts` (DD-011 pattern).
- `yearsGaming` auto-computes from current year, never goes stale.
- About page uses `define:vars` to pass server-side data to client-side i18n scripts.
- Projects page i18n reads translations directly from imported data (no duplication).
- Platform hours are now dynamic — queried from `game_stats` table by platform at build time. New platforms added to Game Library will auto-appear on the website.

## [Unreleased] — 2026-04-24

### Fixed
- **The Room** game count: 13 → 14 (Memory Match + Prank Call added in v1.69). Updated in `projects.ts` (EN + PT), `projects.astro` (PT map), and added raylib to tech stack.
- **MMX Trainer** PT-BR translation missing in `projects.astro` `projectsPt` map — added entry '13', shifted davidluky.com to '14'.
- `CLAUDE.md` project count: 12 → 15.

## [Unreleased] — 2026-04-20

### Added
- **MMX Trainer** project entry in `src/data/projects.ts`. Reinforcement learning agent for Mega Man X SNES via PBT, distributed across 5080 workstation + Xeon server; bilingual description and "AI Tooling" tag (shares color with Local IA / Gemini Image Generator).
- `about.astro`: **PyTorch** added to the Tools tech stack.
- `about.astro`: 2026 timeline entry extended to name MMX Trainer alongside Megaman X remake and Gemini sprite gen.

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
