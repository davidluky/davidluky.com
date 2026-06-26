# Matheus Manual Deployment - 2026-06-26

This note records the Matheus seafood manual publishing work so it can be recovered or repeated later.

## Goal

Publish the current HTML preview from the Matheus project online under the David Luky domain, and add it to `davidluky.com` so it is easy to find later.

Final intended URL:

```text
https://matheus.davidluky.com/
```

Verified fallback URL during rollout:

```text
https://manual-matheus.davidluky.com/matheus/
```

## Source Snapshot

Original project folder:

```text
C:\Users\ala0r\OneDrive\Desktop\Programas\Matheus\Know-how manipulacao basica de pescados-20260626T010627Z-3-001\Know-how manipulacao basica de pescados
```

Published source files copied into this repo:

```text
public/matheus/index.html           # style selector
public/matheus/livro/index.html     # original book/manual layout
public/matheus/revista/index.html   # magazine layout experiment
public/matheus/404.html
public/matheus/html_preview_assets/
public/matheus/magazine_assets/
```

The published snapshot contains:

```text
113 files
33,157,476 bytes after the 2026-06-26 01:32 local refresh
95 image references validated in the HTML
```

Latest refresh:

```text
2026-06-26 01:32 BRT
public/matheus/index.html copied from the regenerated preview_livro_manual.html
public/matheus/html_preview_assets/ replaced from the regenerated html_preview_assets folder
```

Style selector refresh:

```text
2026-06-26 BRT
public/matheus/index.html now lets the reader choose between:
- https://matheus.davidluky.com/livro/
- https://matheus.davidluky.com/revista/

The original generated book HTML lives at public/matheus/livro/index.html.
The generated magazine HTML lives at public/matheus/revista/index.html.
Generated HTML asset paths are adjusted one level up:
- `../html_preview_assets/...` from `/livro/`
- `../magazine_assets/...` from `/revista/`

This keeps browser URLs correct on the Matheus subdomain and keeps the local `validate-site` link
checker happy after Astro copies `public/` into `dist/`.
```

## Hosting Approach

The manual is hosted by the existing `davidluky-com` Cloudflare Worker instead of a separate project. This keeps it on the same deployment system already used by `davidluky.com`.

Files involved:

```text
wrangler.toml
src/worker.ts
src/data/projects.ts
scripts/validate-site.mjs
docs/deployment-guide.md
public/matheus/
```

`wrangler.toml` includes custom domains for:

```text
davidluky.com
matheus.davidluky.com
manual-matheus.davidluky.com
```

`src/worker.ts` checks the request hostname. For `matheus.davidluky.com` and `manual-matheus.davidluky.com`, it rewrites asset requests into `/matheus/...`.

The important Cloudflare setting is:

```toml
[assets]
run_worker_first = [
  "/",
  "/index.html",
  "/livro",
  "/livro/*",
  "/revista",
  "/revista/*",
  "/html_preview_assets/*",
  "/magazine_assets/*"
]
```

Without this, Cloudflare Workers Static Assets can serve the main `davidluky.com` homepage for `/` before the Worker script gets a chance to route the Matheus host. The `/html_preview_assets/*` entry is needed because the manual HTML references images with relative paths from the subdomain root.
The `/magazine_assets/*`, `/livro/*`, and `/revista/*` entries are needed for the style selector and
the magazine layout.

## davidluky.com Catalog Entry

The manual was added to `src/data/projects.ts` as:

```text
id: matheus-manual-pescados
name: Manual de Pescados - Matheus
liveUrl: https://matheus.davidluky.com/
status: wip
visibility: public
```

Because the main site derives homepage live links, project pages, and footer links from `projects.ts`, this automatically adds the manual link to `davidluky.com`.

## Validation Commands Used

Local checks:

```powershell
node_modules\.bin\astro-check.CMD
node_modules\.bin\astro.CMD build
node scripts\validate-site.mjs
pnpm dlx wrangler@4 deploy --dry-run
pnpm dlx npm@11 audit --audit-level=high
```

The repo uses `npm` in CI, but this local Codex shell did not have `npm` on `PATH`, so the checks were run through the bundled Node runtime and temporary `pnpm dlx` commands where needed.

## Deployment Path

Local Wrangler was not authenticated, so production deploys were done through the existing GitHub Actions workflow by pushing to `origin/main`.

Workflow:

```text
.github/workflows/deploy.yml
```

Relevant commits from this publishing session:

```text
2cd970d Add Matheus manual subdomain
732be13 Add manual Matheus domain alias
a200f03 Fix Matheus subdomain root routing
48f74f0 Use fresh Matheus seafood subdomain
8444a6c Point Matheus link to verified route
```

The final cleanup commit after this note updates the public link back to `matheus.davidluky.com` and enables `run_worker_first`.

## Smoke Tests

Tests used after deploy:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "https://matheus.davidluky.com/"
Invoke-WebRequest -UseBasicParsing -Uri "https://matheus.davidluky.com/livro/"
Invoke-WebRequest -UseBasicParsing -Uri "https://matheus.davidluky.com/revista/"
Invoke-WebRequest -UseBasicParsing -Uri "https://matheus.davidluky.com/html_preview_assets/images/cover-matheus-peixaria.jpg"
Invoke-WebRequest -UseBasicParsing -Uri "https://matheus.davidluky.com/magazine_assets/images/cover-revista-matheus-peixaria.jpg"
Invoke-WebRequest -UseBasicParsing -Uri "https://davidluky.com/projects"
Invoke-WebRequest -UseBasicParsing -Uri "https://davidluky.com/"
```

Expected:

```text
Root returns HTTP 200 and contains links to `/livro/` and `/revista/`
Book HTML returns HTTP 200 and contains html_preview_assets/images/cover-matheus-peixaria.jpg
Magazine HTML returns HTTP 200 and contains magazine_assets/images/cover-revista-matheus-peixaria.jpg
Cover image returns HTTP 200 and image/jpeg
Magazine cover image returns HTTP 200 and image/jpeg
davidluky.com/projects contains Manual de Pescados - Matheus
davidluky.com links to https://matheus.davidluky.com/
```

## Update Procedure

When the manual changes:

1. Regenerate the HTML/assets in the Matheus project.
2. Replace:

```text
public/matheus/livro/index.html
public/matheus/revista/index.html
public/matheus/html_preview_assets/
public/matheus/magazine_assets/
```

Keep `public/matheus/index.html` as the hand-authored style selector unless the selector design also
needs to change.

3. Run:

```powershell
node_modules\.bin\astro-check.CMD
node_modules\.bin\astro.CMD build
node scripts\validate-site.mjs
pnpm dlx wrangler@4 deploy --dry-run
```

4. Commit and push to `main`.
5. Smoke test `https://matheus.davidluky.com/`.

## Notes

During rollout, `matheus.davidluky.com/` initially returned the main homepage because Static Assets handled `/index.html` before the Worker script. The fix is `run_worker_first = ["/", "/index.html"]`.

The temporary/fallback URL `manual-matheus.davidluky.com/matheus/` worked while diagnosing this behavior and can remain useful as a backup check, but the public URL should be `https://matheus.davidluky.com/`.
