# Session handoff

Last updated: 2026-07-17

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
