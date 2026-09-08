# Session handoff

Last updated: 2026-09-08

## 2026-09-08 — Painel da Vida catalog release

- The catalog descriptions now cover seven origins, starting-age choice, 43 available
  events, optional adult content, the Venezuela hyperinflation mode and mobile UI.
  The copy leads with the origins and events because catalog rows truncate descriptions.
- Release prepared on `main` in the isolated clone
  `_codex_tmp/davidluky-catalog-release-20260908`, based on `c9d5b66` from GitHub.
  The published DigiPets policy is retained exactly; the original checkout's three
  unstaged files remain untouched. Its earlier publication notes are preserved below
  and in FR-036 rather than lost during the isolated release.
- Verification: `npm ci` and full `npm run verify` passed (69 tests, check, lint,
  seven-page build, site validation and zero audit vulnerabilities). Browser checks
  covered EN/PT copy, search, and desktop/mobile presentation without horizontal overflow.
- Publication is authorized by the current user request. Record the actual deployment
  and anonymous production checks after the push; a successful local build is not a receipt.


## 2026-09-08 — DigiPets privacy publication and public verification

- The reviewed DigiPets privacy-policy change was published from commit
  `268c1a5fab619c2482ada4a3327979f857f7dddf` on `main` after the site gate
  passed. Cloudflare deployment `e2cd15ec-3a1f-4157-8f6f-5521a96f546f` reached
  100% and was created at `2026-09-08T14:58:04.033Z`.
- Anonymous public checks on 2026-09-08 returned `200` for
  `https://davidluky.com/` (title: `David Luky - Projects, Games, and Online
  Presence`) and `https://davidluky.com/privacy/digipets/` (title: `DigiPets —
  Privacy Policy`). The live policy contains the September 8, 2026 effective
  date, the `href="#data-deletion"` link and `id="data-deletion"` target, the
  Google basic-profile disclosure, and the FID and Play Integrity/App Check
  disclosures.
- Anonymous requests to the protected Matheus host remained gated:
  `https://matheus.davidluky.com/` returned `302` to `/entrar/`, and
  `/fotolivro` returned `302` to `/entrar/?voltar=%2Ffotolivro`. No cookies or
  credentials were used or printed. The protected-root response also retained
  `Cache-Control: private, no-store` and `X-Robots-Tag: noindex, nofollow` and
  did not set a cookie.
- The local `main` checkout is intentionally preserved at
  `0157f8e2666131d88132a41e376e88685f580aaa`, one commit behind
  `origin/main` (`268c1a5fab619c2482ada4a3327979f857f7dddf`), with its pre-existing unstaged
  `src/pages/privacy/digipets.astro` WIP untouched. Do not reset or overwrite
  that file while reconciling the published state.

## 2026-08-17 — branch `gt-refresh-2026-08-17` (GameTracker refresh)

- A separate worktree branch off `origin/main` refreshes `/game-tracker` from
  "Video Jogos 2026 - Organized - REVISADA.xlsx": regenerated
  `src/data/gameTracker.json`, a new `scripts/generate-game-tracker.py` generator,
  a new `tests/game-tracker-data.test.ts` suite, a Forecast panel, three-way donut,
  data-derived filters, and accent-insensitive backlog search.
- Reviewed (multi-angle code review + independent data cross-check) and pushed to
  `main` on 2026-08-17 with David's prior authorization; the push deploys to
  production via Cloudflare Workers Builds.
- The July portfolio-audit work still uncommitted in David's own checkout was
  deliberately left untouched. The one exception is `src/pages/game-tracker.astro`:
  its pending type-safety cleanup was copied in as this branch's first commit so the
  later edits build on it, which retires his local diff for that single file instead
  of conflicting with it. No other file he has open was read from or written to.
- `npm run audit:high` fails on this branch exactly as it does on untouched
  `origin/main` (seven high advisories from the July lockfile). Dependency work is
  David's separate batch and was not attempted here.
- The sections below still describe the earlier July audit batch and are unchanged.

## Current position

- Repository: `davidluky.com`, branch `main`. The audit began at `64c5eaa`;
  provider-native deployment safeguards were subsequently committed at
  `9a60ce8` while this batch remained in the worktree.
- This portfolio-audit release candidate has not been pushed or deployed and
  did not change Cloudflare/eBay/Google Play or use production secrets.
- The generated `public/matheus/livro/` and `public/matheus/revista/` trees are
  unchanged from the starting head.

## Local improvements in this batch

- Bounded eBay notification bodies at 256 KiB and Matheus login forms at 16
  KiB, checking both declared and streamed sizes.
- Added ten-second timeouts and redirect rejection to eBay OAuth/public-key
  fetches.
- Scoped OAuth and public-key caches by environment/client or API host so
  sandbox/production state cannot collide inside one Worker instance.
- Strictly validated supported ECDSA algorithm/digest metadata instead of
  treating every unknown digest as SHA-1.
- Validated exact request media types and added `Cache-Control: no-store` to
  eBay JSON responses.
- Added a real generated P-256 signature test. It proves a valid raw payload
  returns `204` and the same signature over a tampered payload returns `412`.
- Added callback tests for body limits, content types, supported methods, and
  digest rejection, plus login tests for form type and size.
- Updated the EN/PT-BR DigiPets privacy disclosure for the already-shipped
  Friends/visits feature: friend code, active-pet summary, relationships,
  requests, visits, house summary, and kudos. A regression test prevents the
  obsolete progress-only claim from returning.

## Verification

- Runtime used locally: Node 26.2.0 / npm 11.13.0; the package supports Node
  24 and newer and CI uses Node 24.
- Baseline `npm run verify`: passed with 37 tests, seven pages, site validation,
  and zero audit vulnerabilities.
- Post-change focused gate: Astro diagnostics clean; five Vitest files / 47
  tests pass; seven-page build and site validator pass.
- `npm ls --all`: valid dependency tree. Full and production-only npm audits:
  zero vulnerabilities.
- `npm outdated`: only separate majors (Astro 7 and TypeScript 7); do not mix
  them into this Worker/privacy batch.
- Wrangler 4.110.0 deployment dry-run passed, reading 961 assets and compiling
  the Worker without deploying it. The generated dry-run directory was removed.
- A production binding-name check on 2026-07-17 listed
  `MATHEUS_PASSWORD` and `MATHEUS_SESSION_SECRET`, but not the three required
  eBay bindings. No secret values were read or printed.
- Focused local browser QA rendered the DigiPets policy in English and PT-BR,
  confirmed the Friends disclosure and July 12 effective date in both states,
  and found no browser console warnings or errors.
- `git diff --check`: passes with line-ending notices only.

Run `npm run verify` once more after any documentation or code change and
before any future commit.

## Release disposition

Local source is verified, but production is owner-gated. The live Worker and
privacy page do not contain these changes until an authorized push completes a
Cloudflare Workers Build for the exact source commit.

High-priority production follow-up:

1. Restore `EBAY_VERIFICATION_TOKEN`, `EBAY_CLIENT_ID`, and
   `EBAY_CLIENT_SECRET` through an authorized provider flow without printing
   values. Until then, the eBay challenge/callback cannot be claimed live.
2. Review the complete diff and confirm the revised DigiPets disclosure matches
   the current Google Play Data safety answers.
3. Run `npm ci`, `npm run verify`, and `npx wrangler deploy --dry-run` on the
   exact intended commit.
4. With explicit deployment approval, push `main` and monitor the Cloudflare
   Workers Build verification and deploy for that exact SHA. Keep GitHub
   Actions disabled.
5. Smoke the public site, DigiPets privacy page, Matheus guest/login/protected
   routes, normal main-site pass-through, and eBay challenge endpoint without
   printing any secrets or cookies.
6. Use eBay's authorized test-notification tool to prove a real provider-signed
   callback. The generated local fixture is strong offline evidence, not live
   provider evidence.

## Remaining decisions and debt

- The shared Matheus password gate still has no application-level rate limiter,
  logout route, per-user identity, or per-user revocation. Cloudflare rate
  limiting is the preferred owner/account decision before adding stateful code.
- Changing `MATHEUS_PASSWORD` does not revoke existing sessions; rotate
  `MATHEUS_SESSION_SECRET` for global revocation.
- Astro 7 and TypeScript 7 are separate major migrations requiring their own
  visual/build review.
- Static portfolio statistics still depend on manual/sibling-project freshness.
- There is no lint/format gate beyond Astro diagnostics, tests, and the custom
  site validator.

## Safety boundaries

- Never print, copy, or commit real Matheus/eBay secrets, login bodies, cookies,
  or ignored local secret files.
- A push to `main` is a production deployment.
- Keep `[assets] run_worker_first = true`; it is part of the Matheus access
  boundary.
- Preserve `public/matheus/livro/` and `public/matheus/revista/` during unrelated
  changes.
- Do not call the eBay tester, mutate Cloudflare bindings, or edit Google Play
  declarations without an authorized owner session.
