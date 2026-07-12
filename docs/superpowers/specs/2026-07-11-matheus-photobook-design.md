# Matheus Manual — Photography-Book Edition + Password Gate (Design)

Date: 2026-07-11
Status: approved-by-default (David asked for the plan and was away for the
clarifying questions; every decision below is marked so he can override).
Implementation plan: `docs/superpowers/plans/2026-07-11-matheus-photobook-and-gate.md`

## Context

`matheus.davidluky.com` serves the "Know-How: Manipulação de Pescados" manual
(text by Matheus Felipe Silverio) from `public/matheus/` in this repo, routed
by the Cloudflare Worker (`src/worker.ts`). Today it has:

- `/` — a hand-authored style selector (choose "livro" or "revista")
- `/livro/` — generated book layout (~1,900 lines, full manual text, 8 chapters)
- `/revista/` — generated magazine layout
- ~95 photos, ~33 MB, unoptimized JPEG
- Publicly linked from davidluky.com projects page
- Also directly reachable at `davidluky.com/matheus/...` (static assets path)

The GitHub repo `davidluky/davidluky.com` is **public**, which constrains
where secrets can live.

## Goals

1. Password-protect the entire Matheus site with the password David provided
   (value stored in `docs/superpowers/LOCAL-ONLY-SECRETS.md`, untracked, and
   in Cloudflare Worker secrets — never in the repo).
2. Redesign the Matheus experience as a premium "photography book" — a
   coffee-table-book reading experience where the photos are the stars.
3. Small, low-risk quick wins on the other sites in the Websites folder.

## Non-goals

- No changes to `/livro/` and `/revista/` content (kept byte-identical as
  alternate editions).
- No user accounts, no per-user passwords, no rate limiting beyond
  Cloudflare's defaults.
- No re-shoot or re-edit of photos; only optimization and presentation.
- No framework migration; the Matheus pages stay plain static HTML + the
  existing Worker.

## Decisions (each overridable by David)

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | Gate is **server-side in the Worker**, not client-side JS | A JS prompt is bypassable via view-source; the Worker actually withholds pages and images until authenticated. |
| D2 | Password + session secret stored as **Worker secrets** (`MATHEUS_PASSWORD`, `MATHEUS_SESSION_SECRET`) | Repo is public; plaintext or hashed passwords in git are unacceptable. |
| D3 | Session = signed cookie (HMAC-SHA256 over expiry timestamp), 30 days, HttpOnly/Secure/SameSite=Lax | Stateless, no KV needed, survives redeploys. |
| D4 | The **login page is the book cover** — entering the password "opens the book" | Turns a security speed bump into part of the design. |
| D5 | `davidluky.com/matheus/*` redirects to the subdomain (which gates) | Closes the static-assets bypass on the main host. |
| D6 | All matheus-host responses get `X-Robots-Tag: noindex, nofollow` and `Cache-Control: private` | Gated content must not be indexed or shared-cache'd. |
| D7 | The new photobook **replaces the selector at `/`**; livro/revista remain reachable from the colophon | The book should open on the book, not on a menu. |
| D8 | Images get responsive AVIF/WebP derivatives via a one-time `sharp` script; originals kept as fallback | 33 MB of JPEG is the single biggest UX problem today. |
| D9 | Fail-closed: if secrets are unconfigured the Worker returns 503 for matheus hosts | Never accidentally serve the site ungated. |
| D10 | The davidluky.com project card stays public and keeps its link | The cover/login page is presentable; visitors see a classy locked cover. David may prefer `visibility: "internal"` instead — his call. |

## Architecture

### Password gate (Worker)

New module `src/matheus-gate.ts` (pure, unit-testable): cookie sign/verify,
constant-time password check, cookie parsing, safe return-path validation.
`src/worker.ts` wires it into `handleMatheusSite`:

- Unauthenticated GET (except `/entrar/` and `/gate_assets/*`) → 302 to
  `/entrar/?voltar=<path>`.
- `POST /entrar/` with form field `senha` → verify → `Set-Cookie` → 303 to
  `voltar` (validated local path) — or 303 back to `/entrar/?erro=1`.
- Authenticated GET `/entrar/` → 302 to `/`.
- Main host `/matheus` and `/matheus/*` → 301 to `https://matheus.davidluky.com/...`.
- `matheus.localhost` added to the host set for local `wrangler dev` testing.
- `wrangler.toml` `run_worker_first` gains: `/matheus`, `/matheus/*`,
  `/entrar`, `/entrar/*`, `/gate_assets/*`, `/book_assets/*`.
  **Standing rule:** every new top-level path under `public/matheus/` must be
  added to `run_worker_first`, or it bypasses the gate.

Testing: `vitest` (new devDependency) unit tests for the gate module and for
the Worker fetch handler with a stubbed `env.ASSETS`. `npm run verify` gains
`npm run test`.

### Photography-book edition

New hand-authored `public/matheus/index.html` ("Edição fotográfica"):

- **Cover** — full-viewport hero, display serif (Fraunces, self-hosted woff2),
  kicker, title, credit line, paper/ink palette anchored on the existing
  teal `#0f6866`.
- **Sumário** — chapter list styled like a book table of contents.
- **8 chapters** (from the livro edition, which is the canonical text):
  01 Fundamentos da Manipulação, 02 Água, Higiene e Armazenamento, 03 Lula,
  04 Polvo, 05 Camarão Rosa, 06 Mexilhão, 07 Peixes, 08 Setorização de Filés
  Grandes. Each chapter: opener (huge numeral + hero plate), text pages with
  book measure, photo plates with numbered captions ("Prancha N"), and
  contact-sheet grids where the source has image series.
- **Colophon** — credits, "outras edições" links to `/livro/` and `/revista/`.
- Interactions (vanilla JS, inline, no dependencies): lightbox via `<dialog>`,
  arrow-key spread navigation, IntersectionObserver reveal (disabled under
  `prefers-reduced-motion`).
- All copy pt-BR. Alt text preserved from the livro edition.

### Assets

- `scripts/optimize-matheus-images.mjs` (sharp, devDependency, already in
  `allowScripts`): emits `book_assets/img/<name>-{480,960,1600}.{avif,webp}`;
  `<picture>` falls back to the original JPEGs.
- Fraunces woff2 (latin 400/600/900 + 400 italic) and Inter (400/600) copied
  into `public/matheus/book_assets/fonts/`; `@font-face` inline in the page.
- `public/matheus/gate_assets/capa.jpg` — copy of the cover photo for the
  login page (must be readable unauthenticated).
- `public/matheus/entrar/index.html` — login/cover page, inline CSS.

### Quick wins (other sites, time-boxed)

One audit checklist task: builds pass, no broken links, OG/meta present,
mobile nav works — for alisson.davidluky.com, tibia-services, franks-stories,
the-room-web, matematica-davidluky. Plus: refresh the Matheus project card
screenshot/copy on davidluky.com after the redesign.

## Security notes

- Constant-time comparisons for password and cookie MAC.
- `voltar` redirect target validated (must start with `/`, not `//`, no `\`).
- Login POST has no CSRF token: the only state change is issuing a session,
  SameSite=Lax already blocks cross-site POST cookies, and the form carries
  no user data — acceptable for this threat model.
- No lockout/rate limit: acceptable for a shared-password family/work site;
  Cloudflare bot protection remains in front.

## Rollout

Deploys happen via push to `main` (GitHub Actions). Secrets must be set on
the Worker **before** the gate code deploys (D9 means the site 503s if the
code arrives first). Order: set secrets → merge/push → smoke test.
**Do not push without David's explicit go-ahead.**

## Open questions for David

1. Keep the public project-card link to the now-locked site (D10), or switch
   the card to `visibility: "internal"`?
2. 30-day session length OK?
3. Should `/livro/` and `/revista/` stay linked in the colophon, or be
   retired once the photobook lands?
4. Any photos that must NOT appear in the new edition?
