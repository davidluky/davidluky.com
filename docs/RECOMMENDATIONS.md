# Recommendations

## 2026-07-12 portfolio audit

### P0 — owner-gated before the next DigiPets release

1. **Publish the corrected DigiPets privacy disclosure and reconcile Play Data
   safety.**
   - The live policy predates Friends and visits. Source now discloses friend
     codes, active-pet summaries, relationships, requests, visits, house
     summaries, and kudos in EN/PT-BR.
   - Deployment and Play Console review require an authorized owner session;
     neither occurred in this local audit.

2. **Restore the three required eBay Worker secret bindings before claiming
   that endpoint production-ready.**
   - The 2026-07-17 binding-name check listed the two Matheus secrets but not
     `EBAY_VERIFICATION_TOKEN`, `EBAY_CLIENT_ID`, or `EBAY_CLIENT_SECRET`.
   - Set them through the authorized provider flow without printing values,
     then run the eBay challenge and signed test-notification checks.

### P1

1. **Deploy and live-test the Worker hardening through Cloudflare Workers Builds.**
   - Local code now bounds callback/login bodies, times out eBay dependencies,
     isolates caches, validates media/algorithm/digest metadata, and has a real
     generated signature/tamper test.
   - After an approved push, verify the exact source SHA in Cloudflare, public
     routes, Matheus guest/auth behavior, and eBay challenge behavior.

2. **Run an authorized eBay test notification.**
   - The local test proves WebCrypto verification with a generated P-256 key and
     raw payload, but provider credentials, public-key lookup, and delivery
     remain unverified live.

3. **Choose the Matheus brute-force/logout boundary.**
   - The accepted shared-password design still has no application rate limiter,
     logout route, per-user identity, or per-user revocation.
   - Prefer a Cloudflare rate-limiting rule if the account supports it; retain
     session-secret rotation as the documented global-revocation control.

### P2

1. **Keep Astro 7 and TypeScript 7 as separate major migrations.** The current
   Astro 6 / TypeScript 5 line builds and audits cleanly; framework/toolchain
   majors need their own browser and Worker review.
2. **Add a focused lint/format gate.** Astro diagnostics and the custom validator
   are strong project checks but do not replace general static analysis.
3. **Automate sibling-project statistic freshness.** Portfolio counts and claims
   still drift unless compared with their source projects.

The older 2026-06-02 section below is historical. Its eBay-fixture and Node-pin
recommendations are now closed: the generated signature suite exists and the
package/CI use the Node 24+ line.

## 2026-06-02 session

Prioritized follow-ups. P0 = do before next deploy; P1 = soon; P2 = nice-to-have.
Each item: what / why / effort / risk.

### Secrets / committed credentials

No committed eBay verification tokens, client IDs/secrets, API keys, or `.env`
files were found in the working tree or git history. All eBay credentials are
read only from the Worker `env` binding (`src/worker.ts` lines 12, 14-15, 120-125,
265). gitleaks (`.gitleaks.toml`) and `scripts/validate-site.mjs` both guard the
eBay token class. Nothing to flag.

---

### P0 — none

The four documented Quality Gates pass and `npm run verify` is green. The eBay
compliance endpoint is correct and genuinely authenticated. No release blockers.

---

### P1

1. **Validate the eBay endpoint end-to-end against eBay's tester (or a recorded fixture).**
   - What: Use eBay's "Send Test Notification" / endpoint validation in the developer
     console (or capture one real signed payload + header) and confirm the live Worker
     returns the correct `challengeResponse` and a 204 for a valid signature, 412 for a
     tampered one. Optionally add a tiny offline unit test that feeds a known
     payload+signature+SPKI key through the verification functions.
   - Why: The logic was verified by spec review and a challenge-response test vector,
     but there is no automated test exercising the POST signature path. A regression
     here fails silently (eBay would start rejecting the endpoint).
   - Effort: S-M (console test is minutes; a committed fixture test is ~1-2 hrs because
     the verify helpers are module-internal and would need light exporting).
   - Risk: Low. Test-only; no production change.

2. **Pin a Node version for local dev to match CI (and document the optional native build).**
   - What: Add an `.nvmrc`/`engines.node` (e.g. 22) and a one-line README note that
     `better-sqlite3` is optional and only needed for `GAME_LIBRARY_DB` builds; on
     unsupported Node/OS its native build may be skipped, which is fine.
   - Why: Local Node 26 fell outside `better-sqlite3`'s engine range and triggered a
     gyp build. The optional-dependency change already prevents that from breaking
     install/build, but pinning Node removes the surprise entirely and aligns dev with CI.
   - Effort: S.
   - Risk: Low.

---

### P2

3. **Page-specific structured data for `/about` and `/gaming`.**
   - What: Pass a tailored `structuredData` prop (e.g. `AboutPage`, or `Person` with
     `mainEntityOfPage` pointing at the page) instead of the default Person schema that
     every non-projects page currently emits.
   - Why: Minor SEO/rich-result upside; `/projects` already does this well (ItemList).
   - Effort: S.
   - Risk: Low. Validate JSON-LD after (validate:site checks presence, not schema).

4. **Add a lightweight linter/formatter.**
   - What: ESLint (astro plugin) + Prettier, wired into `verify` and CI.
   - Why: `astro check` covers types; there is no style/static-analysis layer. Noted in
     the prior handoff retro as a known gap.
   - Effort: M.
   - Risk: Low-Med — an initial run may surface many cosmetic diffs; land separately
     from functional changes.

5. **Skip-to-content link for keyboard/screen-reader users.**
   - What: Add a visually-hidden "Skip to main content" link targeting `<main>` in
     `Base.astro`.
   - Why: Standard a11y affordance; the site has a sticky header and repeated nav.
   - Effort: S.
   - Risk: Low.

6. **Routine dependency refresh as a dedicated change.**
   - What: Bump Astro/Tailwind to current semver-allowed versions (and re-evaluate the
     TypeScript major) behind a full `npm run verify` + visual smoke test.
   - Why: Keep current; no security pressure today (`audit:high` clean), so this is
     hygiene, not urgent. Keep it isolated from feature/security changes.
   - Effort: S-M.
   - Risk: Med — framework minor bumps can shift build output; verify + eyeball.

7. **Consider self-hosting the Google Fonts (or subset) to tighten CSP.**
   - What: Bundle Inter / JetBrains Mono / UnifrakturMaguntia locally and drop the
     `fonts.googleapis.com` / `fonts.gstatic.com` allowances.
   - Why: Removes a third-party origin from `style-src`/`font-src` and eliminates the
     `unsafe-inline` style needed for the Google Fonts swap shim, modestly hardening CSP
     and improving privacy/perf.
   - Effort: M.
   - Risk: Med — must re-verify the blackletter brand morph renders identically.
