# Flight Recorder

Chronological log of the portfolio quality pass. Newest session appended at top of each section.

## 2026-07-12 portfolio audit

### Context and protection

- Started clean on `main` at `64c5eaa`, three commits ahead of `origin/main`.
- Provider-native deployment safeguards later advanced the branch to
  `9a60ce8` while this audited batch remained preserved in the worktree.
- Audited the Astro/static site, Cloudflare Worker, Matheus gate, eBay deletion
  callback, CI/package gates, and the cross-project DigiPets privacy page.
- Preserved the generated `public/matheus/livro/` and
  `public/matheus/revista/` trees exactly. No secret, external account,
  provider callback, commit, push, or deployment was used.

### Findings and changes

- eBay POST and Matheus login bodies were unbounded. Added 256 KiB and 16 KiB
  streamed limits respectively, including early declared-length rejection.
- eBay OAuth/public-key fetches had no deadline and followed redirects. Added a
  ten-second timeout and redirect rejection.
- OAuth/public-key caches were not scoped to environment/API identity. Added
  environment/client and API-host cache keys.
- Unknown digest values silently fell back to SHA-1. Verification now accepts
  only supported SHA-1/SHA-256 metadata, requires matching key/header digests,
  and accepts documented ECDSA algorithm naming without loose fallback.
- Content-type checks used substring/prefix matching. They now compare the
  parsed media type exactly, and eBay JSON responses are explicitly no-store.
- The eBay POST path had no full signature regression. Added a generated P-256
  key/signature fixture: the original raw body returns `204`; a tampered body
  with the same signature returns `412`. Added size/media/digest/method tests.
- The public DigiPets policy still claimed data was used only for game progress,
  despite the shipped Friends/visits model. Updated EN/PT-BR collection, use,
  Firebase, and child-directed wording and locked the social disclosure with a
  regression test.

### Verification

- Baseline `npm run verify`: 37 tests, seven pages, validator and audit passed.
- Post-change Astro diagnostics: zero errors/warnings/hints.
- Five Vitest files / 47 tests pass.
- Seven-page production build and `npm run validate:site` pass.
- `npm ls --all`, full audit, and production-only audit pass with zero
  vulnerabilities.
- Wrangler 4.110.0 dry-run compiled the Worker and enumerated 961 static assets;
  no deployment occurred and the temporary output was removed.
- A focused local browser pass rendered the updated DigiPets disclosure in
  English and PT-BR and found no console warnings or errors.
- A 2026-07-17 production binding-name check found both Matheus bindings but
  none of the three required eBay bindings. Values were not accessed; restoring
  and live-testing those bindings remains an owner/provider action.
- Generated Matheus edition comparison and `git diff --check` pass (line-ending
  notices only).

### Remaining boundary

- Source changes are not live until an authorized push/deploy.
- Reconcile the corrected policy with Google Play Data safety and run an
  authorized eBay test notification after deployment.
- The shared Matheus gate still intentionally lacks an application rate limiter,
  logout, per-user identity, and per-user revocation. Treat provider-side rate
  limiting as an owner/account decision.

## 2026-06-02 session

### Context

- Project: `davidluky.com` — personal website. Astro 6 + Tailwind 4 (static output), deployed on Cloudflare Workers. A small Worker (`src/worker.ts`) serves static assets and implements the eBay Marketplace Account Deletion compliance endpoint.
- Scope: Worker handler correctness + security, build/lint/type health, documented Quality Gates, SEO/meta, a11y, docs. No deploy.
- Repo state at start: on `main`, up to date with `origin/main`, with a pre-existing unstaged change to `src/data/projects.ts` (adds 4 catalog entries). That change was authored by someone else and was left untouched.

### Observations

1. Read README, CLAUDE.md, deployment-guide, SESSION-HANDOFF, the Worker, Astro config, validate-site script, CI workflow, all pages/components/data files, global.css, `_headers`, `.gitleaks.toml`, `.gitignore`.
2. Quality Gates are documented and real: `npm run check` (astro check), `npm run build`, `npm run validate:site` (custom guard: internal links, JSON-LD presence, CSP directives, mojibake, hardcoded-eBay-token regression), `npm run audit:high`. `npm run verify` chains all four.
3. Node/npm: local Node v26.2.0, npm 11.13.0.

### Install friction (environment, not a repo bug at first glance)

- `npm ci` → FAILED. `better-sqlite3@12.9.0` (a devDependency) attempted a node-gyp native build; no Visual Studio on this machine + Node 26 has no prebuilt binary, so the build errored and npm rolled back the entire install (node_modules left empty). `astro` was therefore absent and `npm run check` could not run.
- Reproduced with `npm install` (same gyp abort).
- Worked around locally with `npm install --ignore-scripts` (387 packages) to get a usable toolchain. Confirmed root cause: a failed optional native build was aborting the whole install, and — separately — Rollup statically resolves the `import("better-sqlite3")` in `src/data/gaming.ts` at build time even though it is guarded by a runtime env check.

### Gate results (initial, with deps present via --ignore-scripts)

- `npm run check`: 21 files, 0 errors / 0 warnings / 0 hints.
- `npm run build`: 6 pages + sitemap, success.
- `npm run validate:site`: passed.
- `npm run audit:high`: found 0 vulnerabilities.
- Starting health: GREEN on all four documented gates.

### eBay endpoint security review (the load-bearing part)

Verified `src/worker.ts` against eBay's official specification (developer.ebay.com docs + community/reference implementations):

- GET challenge: SHA-256 of `challengeCode + verificationToken + endpointURL`, hex-encoded, returned as `{ "challengeResponse": "..." }`. CONFIRMED CORRECT.
  - Proved empirically: ran the worker's exact algorithm (concat + WebCrypto SHA-256 hex) against eBay's published test vector (challengeCode `6e90...dec3f`, token `EbayTestTokenForProductionKeys2025`, endpoint ngrok URL). Output `3b8ec5c9...2d2466` matched Node's reference `createHash` sequential-update implementation byte-for-byte (MATCH: true).
- POST notification:
  - Header `x-ebay-signature` is base64 JSON `{alg, kid, signature, digest}`. Worker parses + type-guards all four fields. CONFIRMED matches spec.
  - `alg` must be `ECDSA`; worker enforces `alg.toUpperCase() === "ECDSA"`. CONFIRMED.
  - Public key fetched from `GET {api}/commerce/notification/v1/public_key/{kid}` with a client-credentials OAuth bearer (scope `https://api.ebay.com/oauth/api_scope`). CONFIRMED endpoint + flow match spec. Sandbox host swap handled.
  - Public key returned as SPKI PEM; imported via `crypto.subtle.importKey("spki", …, {name:"ECDSA", namedCurve:"P-256"})`. eBay notification keys are P-256. CONFIRMED.
  - eBay signs the raw payload; worker verifies the ECDSA signature over the raw `request.text()` body (not a re-serialized object). CONFIRMED — avoids a common JSON-reserialization pitfall.
  - DER→raw r||s conversion present (`derEcdsaSignatureToRaw`) because WebCrypto expects raw 64-byte signatures while eBay sends DER. CONFIRMED correct for P-256.
  - Endpoint does NOT blindly 200: 503 if token unconfigured, 400 missing challenge_code / invalid JSON / bad payload shape, 412 missing/invalid/failed signature, 415 wrong content-type, 405 other methods, 204 only after signature verification passes. Authentication is real.
- Secret hygiene: all eBay credentials read only from `env.*`; no hardcoded literals in source or git history; no `.env`/secret files tracked; gitleaks rule + validate-site guard both present.

Conclusion: eBay endpoint is correct and genuinely authenticated. No security bug found. No code change made to the verification logic (changing correct security code without cause would add risk).

### Fixes applied

1. Optional native dependency portability + build resilience:
   - `package.json`: moved `better-sqlite3` from `devDependencies` to `optionalDependencies` (kept `@types/better-sqlite3` in devDependencies — pure TS, always installs). Rationale: it is a build-time-only data source, loaded by a dynamic import guarded by `GAME_LIBRARY_DB` (unset in CI and default dev). A failed native build should not abort install.
   - `astro.config.mjs`: added `vite.ssr.external` and `vite.build.rollupOptions.external` for `better-sqlite3` so the static build never tries to bundle/resolve the native module. Without this, removing the package made Rollup fail to resolve the dynamic import and the build emitted 0 pages.
   - Regenerated `package-lock.json` (`npm install`, no `--ignore-scripts`) — now exits 0 even when the optional native build fails, and `node_modules` is correctly populated (astro present).
2. SEO/meta + a11y (`src/layouts/Base.astro`): added `og:image:width` (1200), `og:image:height` (630), `og:image:alt`, and `twitter:image:alt`. Removed a stray double blank line in `<head>`.

### Verification after fixes

- `npm install` (no flags): exit 0, removed the 36 better-sqlite3 packages as optional, astro present.
- `npm run verify`: exit 0.
  - `check`: 0 errors / 0 warnings / 0 hints.
  - `build`: 6 page(s) built — WITHOUT better-sqlite3 installed.
  - `validate:site`: passed (also confirms the new OG meta has no mojibake and JSON-LD still present).
  - `audit:high`: 0 vulnerabilities.
- Confirmed `dist/` is purely static client assets: no `_worker.js`, and grep for `better-sqlite3` in `dist/` returns nothing — the externalized dep does not leak into the shipped artifact, so the deployed site/Worker are unaffected.
- Confirmed OG tags render in built HTML with a correct em-dash.

### Final state

- All four documented Quality Gates pass; `npm run verify` is green and now works on a fresh clone regardless of platform/Node (optional native dep no longer blocks install or build).
- eBay compliance endpoint reviewed and confirmed correct + secure; unchanged.
- Changed files: `package.json`, `package-lock.json`, `astro.config.mjs`, `src/layouts/Base.astro`. Pre-existing `src/data/projects.ts` working-tree change left untouched. No commit, no deploy.
