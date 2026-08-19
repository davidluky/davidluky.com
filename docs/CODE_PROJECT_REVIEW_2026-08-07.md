# Code and project review — 2026-08-07

## Outcome

The portfolio is locally healthy. Astro was upgraded from 6.2.1 to 7.2.0, the
lockfile was regenerated without forcing peers, and the full dependency graph
now audits at zero vulnerabilities. The current uncommitted Matheus-gate,
logout, rate-limit, eBay callback, content, and CI work was reviewed in place
and preserved.

The local quality layer is also complete: ESLint now covers Astro, TypeScript,
scripts, and tests; `verify` runs lint and all 61 tests before the seven-page
production build. Page-specific JSON-LD and a keyboard skip link close the
small SEO/accessibility recommendations. The Matheus login limiter now fails
closed when its declared Cloudflare binding is absent or throws.

No provider, account, secret, live callback, deploy, commit, or push boundary
was used. Those external release checks remain owner-gated rather than being
reported as complete.

## Architecture assessment

- `src/worker.ts` is the Cloudflare boundary for static assets, Matheus session
  routes, and the eBay account-deletion callback.
- `src/matheus-gate.ts` keeps authentication/session primitives independently
  testable, while Astro owns the static bilingual portfolio.
- The design is appropriate for the site's size. The principal maintainability
  pressure is the growing number of unrelated HTTP responsibilities in one
  Worker module.

## Confirmed findings and file-specific recommendations

1. **P0 closed — dependency remediation:** Astro 7.2.0, Sharp 0.35.3 and the
   patched transitive graph install reproducibly with `npm ci`; live audit is
   zero at every severity.
2. **P1 conditional — `src/worker.ts`:** keep the current route behavior, but split future
   growth into small Matheus, eBay, and routing modules. This reduces the blast
   radius if another independent route is added; no speculative refactor is
   warranted for the current tested surface.
3. **P1 closed — `src/worker.ts` / `wrangler.toml`:** login now returns 429 when
   `MATHEUS_LOGIN_LIMITER` is absent or errors. A regression test locks the
   fail-closed boundary while the binding declaration remains in `wrangler.toml`.
4. **P1 closed — `.github/workflows/deploy.yml`:** gitleaks is pinned to
   `e0c47f4f8be36e29cdc102c57e68cb5cbf0e8d1e` with the human-readable
   `v3.0.0` comment; `scripts/validate-site.mjs` enforces immutable pins.
5. **P2 closed — presentation/metadata:** desktop and 390x844 mobile browser
   smokes covered every built route with no overflow or broken images. The
   shared layout now exposes a focusable skip link; About/Gaming emit tailored
   structured data and the validator enforces both contracts.
6. **P2 owner decision — sibling statistics:** the achievement count has an
   authoritative native test guard, but “games” is semantically ambiguous
   (14 registry entries normally, 15 when the raylib RPG variant is compiled).
   Automatic cross-repo sync must wait for the owner to choose that public
   counting rule; silently changing the displayed 15 would be unsafe.

## Verification evidence

- `npm ci`: 560 packages installed from the committed lockfile.
- `npm run verify`: Astro check passed (31 files, no diagnostics); ESLint passed
  with zero warnings; Vitest passed 61/61; the seven-page Astro 7 build, site
  validator, and audit gate passed.
- Focused Matheus Worker suite: 34/34, including the missing-binding regression.
- Live `npm audit --json`: zero info/low/moderate/high/critical findings across
  the full production and development graph.
- `npm ls --depth=0`: all declared top-level dependencies resolved cleanly.
- `git diff --check`: clean; no conflict markers found.
- Provider state, live callbacks, and production deployment were not exercised.

## Change ownership

This review preserves all pre-existing Matheus, eBay, content, workflow, and
Worker WIP. Campaign-owned changes are limited to the verified dependency/lint
layer, structured metadata, skip navigation, fail-closed limiter decision, and
supporting tests/documentation.
