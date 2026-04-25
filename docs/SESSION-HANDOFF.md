# Session Handoff — 2026-04-25

## What was done

### Cleanup
- Deleted `/mmx-boss-animations` page (unused debug page)
- Deleted 8 `public/mmx-*` asset folders (~200+ GIFs, phase viewers, debug assets)

### Data centralization (root-cause fix for scattered hardcoded numbers)
- Created `src/data/stats.ts` — single source of truth for all numeric stats
- All 4 content pages (index, projects, gaming, about) now import from `stats.ts`
- `yearsGaming` auto-computes from current year

### Content fixes
- Location: "Based in Brazil" → "Based in the US" (index + about, EN + PT)
- The Room game count: hardcoded 13 → dynamic `stats.theRoomGames` (14)
- Live Sites stat: hardcoded "3" → computed from projects data, now links to /projects
- Gaming page: all hardcoded numbers replaced with stats refs
- Added 3 new projects: Power Monitor, Matemática Elementar, SNES ROM Ripper (total: 18)

### i18n improvements
- About page: full PT-BR translations for timeline entries and tech stack categories
- Projects page: eliminated 18-entry hardcoded `projectsPt` map — reads directly from `projects.ts`
- Footer: added Power Monitor and Matemática links

### Documentation updated
- CHANGELOG.md — new unreleased section with all changes
- design-decisions.md — DD-011 (stats.ts centralization pattern)
- tech-notes.md — TN-010 (define:vars server-to-client bridge), updated TN-005 (no more duplication)
- developer-guide.md — updated counts, data files, adding-projects instructions
- CLAUDE.md — updated project count (18), added stats.ts to structure, updated doc maintenance table

### Deployment
- Deployed to Cloudflare Workers — live at davidluky.com

## Current state
- **Builds clean**: site builds and deploys without errors
- **Live**: all changes deployed to davidluky.com
- **All changes uncommitted** — git status shows modified + deleted files

## What's next
1. **Commit changes** — large batch: deleted MMX assets, new stats.ts, all page updates, doc updates
2. **Push to GitHub** — public repo
3. **CI/CD** — still manual `npx wrangler deploy`
4. **Analytics** — consider Cloudflare Web Analytics
5. **Performance audit** — Lighthouse score after the cleanup

## Decisions made
- Stats centralization via `src/data/stats.ts` (DD-011) — prevents the class of bug where numbers drift between pages
- `define:vars` bridge pattern (TN-010) — necessary for Astro's server/client boundary
- Eliminated `projectsPt` duplication — projects.ts is now the only place PT descriptions live
