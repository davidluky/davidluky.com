# Flight Deck — Matheus manual

Evergreen operating checklist for changing and deploying the gated Matheus editions safely.

Last updated: 2026-07-12

## Purpose

Use this deck before touching the Matheus site. It converts the project's hard-won lessons into
preflight checks, invariants, route expectations, deployment gates, and rollback actions.

The deck describes current truth. Historical design documents explain how the project arrived here,
but two later decisions supersede their original assumptions:

1. `/` is the authenticated three-edition selector; the photobook does not replace it.
2. `[assets] run_worker_first = true` is required so unknown and future paths cannot bypass the gate.

## Read order

1. This flight deck.
2. [`docs/RETRO-2026-07-12.md`](./RETRO-2026-07-12.md) for reasoning and mistakes to avoid.
3. [`docs/matheus-manual-deployment-2026-06-26.md`](./matheus-manual-deployment-2026-06-26.md)
   for source-refresh history.
4. [`docs/superpowers/specs/2026-07-11-matheus-photobook-design.md`](./superpowers/specs/2026-07-11-matheus-photobook-design.md)
   and the associated plan for historical design detail—not current root-route authority.
5. [`docs/flight-recorder.md`](./flight-recorder.md) for repository-wide failed approaches and gotchas.

## Current position

| Surface | Current state |
|---|---|
| Production host | `https://matheus.davidluky.com/` |
| Legacy/fallback host | `https://manual-matheus.davidluky.com/` (same gate, host-only session) |
| Authentication | Server-side Cloudflare Worker gate |
| Authenticated `/` | Three-edition selector |
| Manual | `/livro/` |
| Magazine | `/revista/` |
| Photography book | `/fotolivro` |
| Login | `/entrar/` |
| Public login assets | `/gate_assets/*` only |
| Worker config | `run_worker_first = true`, nested Assets `404` handling |
| Tests | `matheus-gate`, `worker-matheus`, and `matheus-editions` suites |
| Deploy path | Push to `main` → GitHub quality job → Cloudflare deploy job |

## Non-negotiable invariants

- The GitHub repository is public. Never place a real password, session secret, cookie, authorization
  header, login body, or ignored-file content in tracked files, patches, commit messages, screenshots,
  terminal output, CI logs, issues, or chat transcripts.
- `.dev.vars` and `docs/superpowers/LOCAL-ONLY-SECRETS.md` remain ignored and untracked. Do not recreate,
  stage, or print them.
- Only secret binding names are safe to display: `MATHEUS_PASSWORD` and `MATHEUS_SESSION_SECRET`.
- Missing either Matheus binding must return `503` and never expose content.
- Keep `run_worker_first = true`. A selective list of known paths is not an equivalent security
  boundary.
- Unauthenticated access to every Matheus page, asset, and unknown path is gated except the login
  aliases and `/gate_assets/*`.
- Never place protected content in `gate_assets`.
- Preserve `X-Robots-Tag: noindex, nofollow` and private cache policy on Matheus responses.
- Preserve main-site asset pass-through and the existing `/ebay/deletion` behavior.
- Do not modify `public/matheus/livro/` or `public/matheus/revista/` unless David explicitly requests a
  generated-content refresh. For unrelated work, both trees remain byte-identical to their starting
  state.
- Keep the selector at exactly three choices unless a new information-architecture decision is
  explicitly approved.
- Keep the photobook as the flat file `public/matheus/fotolivro.html`, served at `/fotolivro` without a
  trailing slash. A trailing slash changes the base URL and breaks its relative assets and links.
- The current photobook structure contains 8 chapter openers and 102 image elements.
- Run `npm run verify` immediately before every commit.
- A push to `main` is a production deployment. Obtain explicit approval for the final commit set unless
  the current instruction already grants that exact push.

## Preflight

Run from the repository root:

```powershell
git rev-parse --show-toplevel
git status --short --branch
git fetch origin
git rev-list --left-right --count origin/main...HEAD
node --version
git check-ignore -v .dev.vars docs/superpowers/LOCAL-ONLY-SECRETS.md
```

Go only when:

- The repository and branch are the intended ones.
- Node is version 24 or newer.
- Existing user changes have been identified and will be preserved.
- Both local secret files are ignored.
- Neither generated edition is unexpectedly dirty.

Capture the preservation baseline before editing:

```powershell
$BaseCommit = git rev-parse HEAD
$LivroTree = git rev-parse HEAD:public/matheus/livro
$RevistaTree = git rev-parse HEAD:public/matheus/revista
```

When a task depends on production bindings, list names only:

```powershell
npx wrangler secret list
```

If a required name is missing, stop before deploying gate code. Follow the ignored local instructions
to set it without echoing or interpolating the value into command output. Confirm names again, then
prove behavior with a login—not by printing or comparing plaintext.

## Control map

| File or directory | Responsibility |
|---|---|
| `src/matheus-gate.ts` | Password comparison, signed sessions, cookie parsing, safe return paths |
| `src/worker.ts` | Host routing, gate enforcement, headers, redirects, Assets mapping |
| `wrangler.toml` | Worker routes and Worker-first static asset behavior |
| `public/matheus/index.html` | Authenticated three-edition selector |
| `public/matheus/fotolivro.html` | Hand-authored photography book |
| `public/matheus/entrar/index.html` | Public login page |
| `public/matheus/gate_assets/` | Only assets intentionally visible before authentication |
| `public/matheus/404.html` | Authenticated nested Matheus `404` |
| `public/matheus/livro/` | Generated original/manual edition |
| `public/matheus/revista/` | Generated magazine edition |
| `public/matheus/html_preview_assets/` | Original/manual source images and contact sheets |
| `public/matheus/magazine_assets/` | Magazine assets |
| `public/matheus/book_assets/` | Responsive photobook derivatives and self-hosted fonts |
| `scripts/optimize-matheus-images.mjs` | One-time derivative generator; not a normal build step |
| `tests/matheus-gate.test.ts` | Pure gate/security primitives |
| `tests/worker-matheus.test.ts` | Worker routes, config, headers, failures, and regressions |
| `tests/matheus-editions.test.ts` | Selector targets and photobook structure |

## Route and authentication matrix

| Request | Unauthenticated | Authenticated |
|---|---|---|
| `/` or `/index.html` | `302` to `/entrar/` | `200` selector |
| `/entrar`, `/entrar/`, `/entrar/index.html` | `200` login page | `302` to `/` |
| Correct `POST /entrar/` | `303`, hardened 30-day session cookie | Same login handler |
| Incorrect `POST /entrar/` | `303` to `erro=1`, no cookie | Same login handler |
| `/gate_assets/*` | Public, private cache | Public, private cache |
| `/livro` or `/revista` | `302` to login with `voltar` | `308` to trailing-slash form |
| `/livro/` or `/revista/` | `302` to login with `voltar` | `200` edition |
| `/fotolivro` | `302` to login with `voltar` | `200` photobook |
| `/fotolivro/` or `/fotolivro.html` | `302` to login first | `308` to `/fotolivro` |
| Protected image/font/derivative | `302` to login | Asset response |
| Unknown Matheus path | `302` to login | Nearest nested Assets `404` |
| `davidluky.com/matheus` or `/matheus/*` | `301` to HTTPS Matheus host | Same redirect, then gate |
| Other main-site path | Normal Assets behavior | Normal Assets behavior |
| `davidluky.com/ebay/deletion` | Existing eBay handler | Existing eBay handler |

Security expectations:

- Gated hostnames: `matheus.davidluky.com`, `manual-matheus.davidluky.com`, and
  `matheus.localhost`. Session cookies are host-only and do not transfer between them.
- Session signature: HMAC-SHA256 over the expiration timestamp.
- Password comparison: fixed-length SHA-256 digests compared in constant time.
- Cookie attributes: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, 30-day lifetime.
- Absolute, scheme-relative, or backslash-containing return paths fall back to `/`.
- Gate redirects, authenticated redirects away from login, and login POST responses:
  `Cache-Control: private, no-store`. The login page itself uses the private ten-minute cache policy.
- Normal authenticated Matheus assets: `Cache-Control: private, max-age=600`.
- All Matheus responses: `X-Robots-Tag: noindex, nofollow`.

Session operations:

- Changing only `MATHEUS_PASSWORD` does not revoke existing signed sessions.
- Rotate `MATHEUS_SESSION_SECRET` to invalidate every active session.
- If any secret provenance or exposure is uncertain, treat it as compromised, rotate the relevant
  binding safely, and repeat guest/authenticated production checks.

## Standard change sortie

### 1. Orient and bound the change

- Read the relevant files and current tests before editing.
- State which user-visible behavior will change.
- Identify whether the change touches routing, authentication, generated editions, or image sources.
- Prefer additive/reversible navigation changes until visual acceptance is explicit.
- Record any departure from the historical plan in current documentation.

### 2. Use focused checks while editing

```powershell
npx vitest run tests/matheus-gate.test.ts
npx vitest run tests/worker-matheus.test.ts
npx vitest run tests/matheus-editions.test.ts
```

For Worker changes, always retain tests for:

- `run_worker_first = true`.
- Missing-secret `503` failure.
- Unknown and future paths.
- Protected shared assets.
- Nearest nested `404` preservation.
- Main-host `/matheus` and `/matheus/*` redirects.
- Main-site pass-through.
- eBay regression behavior.

### 3. Protect the generated editions

During unrelated work:

```powershell
git diff --exit-code $BaseCommit -- public/matheus/livro public/matheus/revista

$FrozenStatus = git status --porcelain --untracked-files=all -- `
  public/matheus/livro public/matheus/revista

if ($FrozenStatus) {
  throw "Frozen Matheus editions changed."
}
```

After committing, compare tree identities:

```powershell
if ((git rev-parse HEAD:public/matheus/livro) -ne $LivroTree) {
  throw "Livro tree changed."
}

if ((git rev-parse HEAD:public/matheus/revista) -ne $RevistaTree) {
  throw "Revista tree changed."
}
```

### 4. Regenerate images only when inputs change

```powershell
npm run images:matheus
```

This generator is not part of `verify` or CI. It does not clean stale output and uses the first source
directory when basenames collide. Before committing:

- Reconcile expected source basenames with generated basenames.
- Check duplicate names for content differences.
- Remove stale derivatives deliberately, never by broad unverified deletion.
- Inspect file counts, formats, dimensions, and largest outputs.
- Confirm selector, photobook, manual, and magazine references still resolve.

Reference from the initial photobook build: 112 unique source basenames, 672 responsive derivatives,
and 6 self-hosted font files. Treat those as a drift signal, not an eternal required count.

### 5. Perform visual acceptance

For changes to the selector, login page, photobook layout, or project screenshot:

- Review desktop and 375px widths.
- Use keyboard-only navigation.
- Test photobook fragment navigation, arrow keys, lightbox open/close, and Escape.
- Check the browser console and network panel for missing assets.
- Confirm the first screen and edition choices match David's intent.

Do not substitute markup counts for visual acceptance when the decision is primarily experiential.

### 6. Run the full gate

```powershell
npm run verify
npx wrangler deploy --dry-run
```

`npm run verify` currently runs:

1. Astro/TypeScript diagnostics.
2. All Vitest tests.
3. Production build.
4. Site validation.
5. High/critical dependency audit.

### 7. Run a host-aware local smoke

Use Wrangler's upstream host option. In the current Wrangler version, a `Host` header alone did not
reliably exercise the Matheus branch.

```powershell
npx wrangler dev --local --ip 127.0.0.1 --port 8787 --local-upstream matheus.localhost
```

Use the displayed loopback URL for scripted requests. Verify without exposing credentials or cookies:

- Guest `/` redirects to login.
- Login page and `gate_assets/capa.jpg` return `200`.
- A source image, derivative, photobook route, and unknown path redirect to login.
- Wrong password sets no session and renders the Portuguese error state.
- Correct password returns the selector with exactly three choices.
- Manual, magazine, and photobook return `200`.
- `/fotolivro/` and `/fotolivro.html` canonicalize to `/fotolivro` after authentication.
- A representative derivative returns `200` after authentication.
- Authenticated unknown path returns the themed Matheus `404`.

Use an in-memory client or a real browser. Never place the password directly in a recorded command and
never print `Set-Cookie`. If a browser refuses the `Secure` cookie over local HTTP, use local HTTPS or
a status-only in-memory smoke; do not weaken production cookie attributes.

### 8. Commit safely

Run `npm run verify` immediately before each commit, even if it passed earlier in the task.

```powershell
npm run verify
git diff --check
git status --short
git add <explicit-files>
git diff --cached --check
git diff --cached --name-only
git diff --cached
git commit -m "<safe summary>"
```

Before committing:

- Confirm no ignored secret file is staged.
- Confirm no literal secret, cookie, or login body appears in the diff or commit message.
- Confirm the immutable edition checks still pass.
- Confirm docs describe current behavior, not only the historical plan.

### 9. Obtain production approval

Before a production push, report:

- Final commit list and SHA.
- User-visible and security behavior changed.
- Full verification and dry-run results.
- Immutable edition result.
- Confirmation that required binding names exist—names only.
- Expected production impact and exact smoke plan.

Stop unless the current user instruction explicitly authorizes pushing that exact final state. If code
changes after approval, re-run the gates and obtain fresh approval.

### 10. Push, monitor, and prove production

```powershell
git push origin main
$DeploySha = git rev-parse HEAD
gh run list --commit $DeploySha --workflow "Check and Deploy" --limit 1 `
  --json databaseId,headSha,status,conclusion,url
gh run watch <run-id> --exit-status
```

Confirm the returned `headSha` equals the explicitly approved `$DeploySha`. Do not bypass failed CI
with a direct Wrangler deployment. Wait for both `quality` and `deploy` on that exact SHA.

## Production smoke

Safe guest checks:

```powershell
curl.exe -s -o NUL -w "%{http_code} %{redirect_url}`n" https://matheus.davidluky.com/
# 302 -> /entrar/

curl.exe -s -o NUL -w "%{http_code}`n" https://matheus.davidluky.com/entrar/
# 200

curl.exe -s -o NUL -w "%{http_code}`n" https://matheus.davidluky.com/gate_assets/capa.jpg
# 200

curl.exe -s -o NUL -w "%{http_code} %{redirect_url}`n" https://matheus.davidluky.com/fotolivro
# 302 -> /entrar/?voltar=...

curl.exe -s -o NUL -w "%{http_code} %{redirect_url}`n" https://matheus.davidluky.com/html_preview_assets/images/cover-matheus-peixaria.jpg
# 302 -> /entrar/?voltar=...

curl.exe -s -o NUL -w "%{http_code} %{redirect_url}`n" https://matheus.davidluky.com/book_assets/img/cover-matheus-peixaria-960.avif
# 302 -> /entrar/?voltar=...

curl.exe -s -o NUL -w "%{http_code} %{redirect_url}`n" https://matheus.davidluky.com/nao-existe
# 302 -> /entrar/?voltar=...

curl.exe -s -o NUL -w "%{http_code} %{redirect_url}`n" https://manual-matheus.davidluky.com/
# 302 -> https://manual-matheus.davidluky.com/entrar/

curl.exe -s -o NUL -w "%{http_code} %{redirect_url}`n" https://manual-matheus.davidluky.com/html_preview_assets/images/cover-matheus-peixaria.jpg
# 302 -> the fallback host's /entrar/?voltar=...

curl.exe -s -o NUL -w "%{http_code} %{redirect_url}`n" https://davidluky.com/matheus/livro/index.html
# 301 -> https://matheus.davidluky.com/livro/index.html

curl.exe -s -o NUL -w "%{http_code}`n" https://davidluky.com/
# 200

curl.exe -s -X OPTIONS -o NUL -D - https://davidluky.com/ebay/deletion
# 405 with Allow: GET, POST
```

Inspect guest root headers:

```powershell
curl.exe -s -D - -o NUL https://matheus.davidluky.com/
```

Expect `X-Robots-Tag: noindex, nofollow` and `Cache-Control: private, no-store`.

Authenticated production checks must use a secure in-memory client or a browser without recording the
password or cookie. Confirm:

- Correct login returns `303` and a cookie with `Secure`, `HttpOnly`, and `SameSite=Lax`.
- `/` returns the selector with all three targets.
- `/livro/`, `/revista/`, and `/fotolivro` return `200`.
- The photobook still contains 8 chapter openers and 102 image elements.
- A representative protected derivative returns `200`.
- `/fotolivro.html` returns `308` to `/fotolivro`.
- An unknown authenticated path returns the themed `404`.
- The main site remains `200`.

## Troubleshooting board

| Symptom | Likely cause | First action |
|---|---|---|
| Matheus returns `503` | Missing gate binding | List secret names; configure missing binding safely before code changes |
| Guest protected path returns `200` or `404` | Worker bypass | Confirm hostname route and `run_worker_first = true` |
| Local `/entrar/` is `404` and `/` is main site | Wrong local hostname branch | Restart with `--local-upstream matheus.localhost` |
| Correct password loops back to login | Cookie rejected or session secret mismatch | Inspect attributes/names only; repeat status-only login; verify binding names |
| Photobook assets `404` | Trailing-slash base or wrong Worker mapping | Keep flat file and canonical `/fotolivro` without slash |
| Unknown authenticated path shows main `404` | Asset prefix/fallback regression | Preserve first nested Assets `404` response |
| New asset is public before login | Asset placed in open prefix or Worker bypass | Remove from `gate_assets`; verify Worker-first routing |
| Main site or eBay route regresses | Worker blast-radius change | Run main-site/eBay regression tests before deploy |
| Image output count unexpectedly grows | Stale derivatives or basename collision | Reconcile inputs/outputs; do not commit blind regeneration |
| Selector has fewer than three cards | Stale or overwritten hand-authored root | Restore selector and run `matheus-editions` test |

## Rollback

For a code/content regression:

1. Identify the public commit that introduced it.
2. Use `git revert --no-commit <sha>`; do not rewrite shared history or use destructive reset
   commands.
3. Run the full verification, Worker dry run, immutable-tree check, and local smoke.
4. Run `npm run verify` again immediately before creating the revert commit.
5. Commit the verified revert explicitly, then obtain approval for the rollback push.
6. Push `main`, monitor the exact Actions run, and repeat production smoke.

Do not rotate secrets for an ordinary layout or routing rollback. If the password may be exposed,
rotate both the password and session secret because an attacker may already have minted a session. If
only the signing secret's provenance is uncertain, rotate the session secret. Secret rotation is a
production mutation and requires explicit authorization unless the incident instruction already grants
it. After rotation, verify binding names and authentication without printing values.

## Known debt and next waypoint

- The gate intentionally uses one shared password. It has no per-user identity/revocation, application
  rate limiter, or logout route. Clear the host's site data for local logout; rotate the session secret
  only when global revocation is required.
- Optional Task 10 remains separate; the portfolio screenshot can be refreshed to show the final
  three-card selector.
- The historical implementation plan's unchecked boxes are not a reliable completion ledger. Use Git,
  tests, the retrospective, and this deck for current state.
- The image generator needs explicit stale-output and duplicate-basename review on future source
  refreshes.
- GitHub Actions currently emits upstream Node runtime deprecation notices for some action versions.
  They were non-blocking, but action upgrades should be handled in a focused maintenance change.
- Any future fourth edition requires an explicit selector/route decision, a new static structure test,
  and a full gate audit before deploy.

## Definition of done

- The intended user-visible choice was explicitly accepted.
- Required tests, `npm run verify`, and Wrangler dry run passed.
- Generated-edition invariants passed or an explicitly requested refresh was reviewed separately.
- No secret or cookie appeared in source, diffs, commits, logs, screenshots, or chat.
- Explicit production approval covered the exact final state.
- Quality and deploy succeeded for the exact pushed SHA.
- Guest and authenticated production smoke checks passed.
- Main-site and eBay behavior remained intact.
- Working tree is clean and synchronized with `origin/main`.
- New deviations, failures, and deferred work were recorded.

## Self-improvement prompts

Before takeoff:

1. Which user-visible decision could be wrong even if every automated test passes?
2. Which invariant can be proven with a hash, tree ID, status code, or exact response header?
3. Which provider behavior am I assuming instead of testing?
4. Could any secret value or cookie enter output through the command I am about to run?
5. What exact evidence will let me say “live” truthfully?

After landing:

1. What surprised me, and is it now encoded as a test or checklist item?
2. Did the final product differ from the written plan, and is current documentation explicit?
3. What did David correct that should change my default behavior next time?
4. Did I verify production authority rather than a local substitute?
5. Is there any deferred work that I accidentally implied was complete?
