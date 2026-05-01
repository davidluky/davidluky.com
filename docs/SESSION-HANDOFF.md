# Session Handoff

Last updated: 2026-05-01

## What Was Done

- Audited all 22 website project entries against actual project state in `Programas/`.
- Fixed 5 stale stat values:
  - The Room achievements: 239 → 249 (`stats.ts`)
  - Matemática Elementar: 221 sets / 2,483 problems → 267 sets / 5,564 problems (`projects.ts` description + metrics EN/PT)
  - TCG Arbitrage: 31 tests / 16 commands → 80 tests / 18 commands (`projects.ts` description + metrics EN/PT)
  - Game Library: 8+ platforms → 10+ platforms (`projects.ts` description + metrics EN/PT)
- Replaced homepage "Gaming Platforms" stat card with "Years Coding" (since 2014, auto-computed via DD-012).
- Added `yearsCoding` and `codingStartYear` to `stats.ts`.
- Updated About page timeline to mention coding start in 2014 alongside Tibia.
- Added Lua to the About page tech stack.
- Added About link to footer; renamed "Gaming" column to "Explore".
- Updated shared i18n strings for the new footer structure.
- Updated docs: CHANGELOG, flight-recorder (FR-023), design-decisions (DD-012), SESSION-HANDOFF.

## In Progress

- Nothing left unfinished.

## What's Next

1. Consider adding a build-time validation step that cross-checks key project stats (test counts, set counts) against source repos to prevent drift.
2. The `_transfers` (Xeon ops scripts) folder is the only Programas project not represented on the website — could be added as an internal/ops-tooling entry if desired.
3. Monitor Tibia Services deployment status — it's listed as `live` with a liveUrl but was noted as "NOT deployed" in memory. Verify `tibia.davidluky.com` resolves.

## Current State

- `npm run check`: 0 errors, 0 warnings.
- `npm run build`: 6 pages built successfully.
- `npm run validate:site`: passed.
- `npm run audit:high`: 0 vulnerabilities.
- All changes committed and pushed.

## Decisions Made

- Replaced "Gaming Platforms" with "Years Coding" on homepage — Gaming is still accessible via the gaming page and footer.
- Used 2014 as coding start year per user instruction.
- Auto-compute `yearsCoding` to prevent annual staleness (DD-012).
- Footer reorganized: "Gaming" column → "Explore" column with both Gaming and About links.
- Added Lua to tech stack since it's actively used in Mesen2 oracle scripts for MMX Trainer.

## Retro

**What went well:**
- Cross-project stat verification caught significant drift (Matemática was showing less than half its actual content).
- The auto-computing pattern (DD-012) prevents an entire class of annual staleness bugs.
- Build passed on first try after all changes.

**What could be better:**
- Stats in project descriptions are inherently fragile — they're hardcoded text that drifts as projects evolve. A build-time cross-check or a convention of using ranges ("250+" instead of "249") would reduce maintenance burden.
- The `projects.ts` file is getting long (400+ lines) — consider splitting into individual project files if it grows further.

**Risks:**
- Tibia Services is marked `live` but may not be deployed yet — needs verification.
- Project stats will drift again over time. The flight recorder (FR-023) documents this but doesn't prevent it.
