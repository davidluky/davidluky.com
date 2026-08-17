# Retro

## 2026-06-02 session

### What this project is

`davidluky.com` is David Luky's personal website: a static Astro 6 + Tailwind 4 site deployed on Cloudflare Workers. A small Worker entrypoint (`src/worker.ts`) serves the static assets and also implements the eBay Marketplace Account Deletion compliance endpoint (`/ebay/deletion`) — a GET challenge-code verification and a POST signed-notification handler. Content (projects, gaming stats, socials) is data-driven from `src/data/*`. There are documented Quality Gates wired into `npm run verify` and CI.

### Starting health

Strong. Once the toolchain was installed, all four documented gates passed on the first run:

- `astro check`: 21 files, 0 errors / 0 warnings / 0 hints.
- `astro build`: 6 pages + sitemap.
- `validate:site`: passed (internal links, JSON-LD, CSP directives, mojibake, eBay-token guard).
- `audit:high`: 0 vulnerabilities.

The one real wrinkle was the local install: `npm ci`/`npm install` hard-failed because the `better-sqlite3` devDependency tried a node-gyp native build that aborted the whole install on this machine (no Visual Studio, Node 26 with no prebuilt). That is an install-resilience problem, not a gate failure.

### Fixes and why

1. **`better-sqlite3` → `optionalDependencies` + Vite external (build resilience / portability).**
   - Why: it is a build-time-only data source, dynamically imported in `src/data/gaming.ts` behind an `if (!GAME_LIBRARY_DB) return null;` guard. In CI and default dev that branch never runs, yet a failed native compile was aborting the entire `npm install`, and Rollup was statically resolving the dynamic import at build time (so simply making it optional broke `npm run build` when the package was absent).
   - Fix: move the runtime package to `optionalDependencies` (so a failed native build is non-fatal), keep `@types/better-sqlite3` in devDependencies (pure TS, needed for the type-only import), and add `vite.ssr.external` + `vite.build.rollupOptions.external` for `better-sqlite3` so the static build never bundles it. Result: a fresh clone now does `npm install && npm run verify` successfully on any platform/Node, and the deployed static artifact never references the native module.
   - This was the highest-value fix: it removes a real onboarding/CI-portability hazard with zero impact on the working paths.

2. **OG/Twitter image metadata + a head cleanup (SEO/a11y).**
   - Added `og:image:width` (1200), `og:image:height` (630), `og:image:alt`, and `twitter:image:alt` in `src/layouts/Base.astro`. The OG image is a known 1200x630 PNG (`scripts/generate-og.mjs`); declaring dimensions improves social-unfurl rendering and the alt text is a standard a11y/SEO addition. Also removed a stray double blank line in `<head>`.

### eBay endpoint — reviewed, deliberately unchanged

The compliance endpoint was the primary security focus. It was checked field-by-field against eBay's official spec and reference implementations, and it is correct:

- GET challenge response = hex SHA-256 of `challengeCode + verificationToken + endpointURL`. Verified byte-identical to eBay's documented algorithm against their published test vector.
- POST verifies a real ECDSA/P-256 signature over the raw request body, using eBay's public key fetched (with cache) from `/commerce/notification/v1/public_key/{kid}` via a client-credentials OAuth token; it parses and type-guards the base64 `x-ebay-signature` header, validates the payload shape, converts the DER signature to raw r||s for WebCrypto, and returns 204 only after verification succeeds (otherwise 400/412/415/503 as appropriate). It does not blindly acknowledge.

No change was made to this logic. Modifying correct, security-load-bearing code without a concrete defect would only add risk. Secret hygiene is also clean: credentials are read solely from `env.*`, with no hardcoded values in source or git history and no tracked `.env`/secret files.

### Other deliberate non-changes

- **Pre-existing `src/data/projects.ts` working-tree edit** (adds 4 catalog entries): left untouched — it predates this session and is out of scope.
- **Per-page JSON-LD**: about/gaming/privacy emit the default Person schema rather than page-specific structured data. Acceptable, not wrong; logged as a P2 recommendation instead of changed, to stay surgical.
- **No lint tool added**: noted previously in the handoff. `astro check` + the custom validator already cover types and project-specific risks. Adding a linter is a larger, opinionated change; logged as P2.
- **No dependency version bumps**: routine Astro/Tailwind semver updates exist but there is no security or gate pressure. Out of scope for a surgical pass.
- **`scroll-behavior: smooth`** is globally set but correctly disabled under `prefers-reduced-motion`. Fine.

### Risks

- The Vite `external` for `better-sqlite3` means: when the maintainer actually runs a Game Library build (`GAME_LIBRARY_DB` set), the optional package MUST be installed and compiled on that machine for the dynamic import to resolve at runtime. That is the intended/only path that needs it, and it falls back gracefully (logs + fallback data) if the import throws. The default builds (CI/dev) are unaffected.
- Local Node here is v26, outside `better-sqlite3`'s declared engines (20-25). CI uses Node 22, so CI gets a prebuilt binary and is unaffected. The optional-dependency change makes the local mismatch a non-event.

### Lessons

- A dynamic `import()` guarded by a runtime flag is still statically resolved by the bundler; making a native dependency "optional" requires telling Vite/Rollup it is external, not just moving it in `package.json`. The two changes have to land together or the build breaks.
- An exit code of 0 from a backgrounded `npm install` can be misleading when an optional-dependency lifecycle script fails — verify the actual install (e.g. that `node_modules/astro` exists) rather than trusting the wrapper status.
- The fastest way to be sure about security-critical hashing is an empirical test against the vendor's published test vector, not just code reading.

## 2026-08-17 session — GameTracker REVISADA refresh + Astro 7 deploy gate

### What shipped

`/game-tracker` refreshed from "Video Jogos 2026 - Organized - REVISADA.xlsx" after two months of
stale data: a 147-game queue (128 backlog / 12 "2026 target" / 7 in progress), the unified 34-row
2022-2026 played log, a Forecast panel (0.52 finished/month → all clear ~May 2050, or Dec 2038 at
1/month), a 3-segment donut, an "In progress" queue status with its own filter chip,
accent-insensitive backlog search, and filter chips / year chart derived from data instead of
hardcoded lists. The data pipeline is now reproducible: `scripts/generate-game-tracker.py`
(header-name-keyed, fails loudly on workbook layout changes) plus
`tests/game-tracker-data.test.ts`. Unblocking the deploy additionally landed `astro ~7.2.2`, the
vite override raised to `^8.2.1`, and an `npm audit fix` — verify fully green, 0 vulnerabilities.
Commits `bd8e41f..ddb4df7` on `main`, deployed and live-verified (tracker, home, gaming).

### Process

Three-role flow: a planner wrote an executable plan with hard acceptance numbers for every
extracted figure; an implementer executed it in an isolated worktree off `origin/main` — chosen
because the owner's checkout carries ~25 uncommitted July-audit files that must not ride along to
production; a reviewer then ran an eight-angle code review plus an independent second extraction
of the workbook before anything was pushed.

### What went well

- **Independent re-derivation beat code reading.** The reviewer extracted the workbook separately
  and diffed against the generated JSON: 0 mismatches across every row, status, date, and join.
  For data-refresh work this is the strongest cheap check that exists.
- **Acceptance numbers as hard gates.** Seventeen expected figures were written into the plan
  before implementation; all matched on the first run, so "green" carried real information.
- **The multi-angle review earned its cost**: 10 confirmed findings, including two visible-on-page
  count contradictions (8 vs 7 "in progress", 20 vs 12 "finish this year") and two defects planted
  by the plan itself — the pre-1990 date cutoff (FR-035) and the Pokemon row filter. All fixed and
  re-verified before deploy.
- **Behavior proven, not assumed.** The implementer extracted the built page's real inline script
  and ran it against the real card attributes (accented and unaccented queries), and byte-compared
  two generator runs to prove determinism.
- **The worktree pattern worked.** The owner's dirty checkout was never touched; his pending
  `game-tracker.astro` cleanup was adopted as the branch's first commit, retiring that local diff
  instead of conflicting with it.

### What went wrong

- **A known-red gate was treated as background noise.** Baseline verify showed `audit:high`
  failing (7 advisories) and it was filed as "pre-existing — ignore" — but Workers Builds runs
  that same `npm run verify`, so the first push failed exactly as the baseline predicted (FR-031).
  The prediction was available in-repo before the push.
- **The Astro bump tripped on the repo's own vite override** — a misleading bundler error and a
  ten-minute detour that reading `overrides` first would have avoided (FR-032).
- **The plan's verbatim test snippet violated the repo's mojibake guard** it was meant to echo
  (FR-034); caught at final verify, cost one extra commit.

### Lessons

- A red stage in baseline verification is a deploy blocker by definition when the deployer runs
  the same command. "Pre-existing" describes blame, not impact.
- Plans that embed exact code must be checked against the target repo's own gates before an
  implementer runs them verbatim.
- When a framework major fails inside the bundler with an error matching nothing in your config,
  read `package.json` `overrides` first.

### Follow-ups (owner)

- Rebase the local checkout (now behind `origin/main`): the `game-tracker.astro` diff disappears;
  `package.json`/lockfile conflict with `ddb4df7` is small (eslint and friends remain to land).
- Workbook: add Eldest Souls to "Quero jogar" so the queue/log in-progress counts reconcile
  (the page labels the two scopes in the meantime).
- Optional: `.gitignore` entry for `scripts/__pycache__/`; a one-line `grid-column: 1 / -1` if the
  empty dashboard cell beside In Progress bothers; the "2026 target" vocabulary and
  `queue2026Targets` field roll over in January 2027 (accepted tripwire — the generator's status
  map fails loudly when the workbook moves to "Meta 2027").
