# Project Functionality

Project: `davidluky.com`

Updated: 2026-05-07 20:55 -04:00

This document describes behavior found in the recovered local source, project docs, and recovery audit records. It does not claim manual production deployment validation or full manual UX review.

## Purpose

`davidluky.com` is David Luky's personal website. It presents David's bio, projects, gaming profile, and DigiPets privacy policy, and includes a Cloudflare Worker endpoint for eBay marketplace account deletion compliance.

## Main Capabilities

- Serves a static Astro personal website.
- Provides pages for home, about, projects, gaming, DigiPets privacy policy, and 404.
- Presents a local project catalog from `src\data\projects.ts`.
- Presents gaming-related data from `src\data\gaming.ts`, `src\data\stats.ts`, Game Library DB integration code, Steam API integration code, or fallback data according to local source analysis.
- Supports English and Portuguese client-side text switching.
- Adds SEO/Open Graph/JSON-LD behavior through the base layout.
- Provides Cloudflare Worker routes for eBay marketplace account deletion challenge/notification handling.

## Pages And Interfaces

Static Astro routes verified by source/build:

- `/`
- `/about`
- `/projects`
- `/gaming`
- `/privacy/digipets`
- `/404`

Worker routes:

- `GET /ebay/deletion?challenge_code=...`
- `POST /ebay/deletion`

Package scripts:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run check`
- `npm run validate:site`
- `npm run audit:high`
- `npm run verify`

Deployment interface:

- Cloudflare/Wrangler configuration exists in `wrangler.toml`.
- The project docs/source reference `npx wrangler deploy`.

## Data And Assets

- Project data: `src\data\projects.ts`.
- Gaming loader/data: `src\data\gaming.ts`.
- Stats data: `src\data\stats.ts`.
- Shared translations: `src\i18n\shared.ts`.
- Layout and metadata: `src\layouts\Base.astro`.
- Public assets include `favicon.svg`, `og-image.png`, `og-image.svg`, `robots.txt`, and `_headers`.
- Cloudflare Worker source: `src\worker.ts`.

## Configuration

- Astro config exists in `astro.config.mjs`.
- Cloudflare Workers config exists in `wrangler.toml`.
- The app's static build output is `dist`.
- The language switcher persists preference in browser `localStorage`.

## Runtime Behavior

- Astro builds static pages into `dist`.
- Cloudflare Worker routes `/ebay/deletion` to `src\worker.ts`.
- Other requests are served as static assets.
- eBay POST handling validates signature/payload and returns `204` only after verification according to local source analysis.
- Client-side language selection swaps supported copy between English and Portuguese.

## Verification Performed

- Recovery audit included this project in `project-audit.csv` and `verification-results.csv`.
- Git fsck result was recorded as `ok`.
- Dependency repair recorded one passing npm/pnpm row.
- Automated verification passed with command `npm run verify`.
- Recorded verify sequence:
  - `npm run check`
  - `npm run build`
  - `npm run validate:site`
  - `npm run audit:high`
- Recorded `astro check` result: 0 errors, 0 warnings, 0 hints.
- Recorded build output: 6 pages built.
- Recorded site validation result: passed.
- Recorded npm audit result: found 0 vulnerabilities at high severity threshold.
- Latest tracked text null-byte scan had no remaining finding for this project.
- 2026-05-07 catalog correction updated `matematica-elementar` to 281 audited sets / 2,864 problems based on recovered `matematica-davidluky` evidence.
- 2026-05-07 catalog correction updated `franks-stories` to describe David-approved current static JSON story-reader behavior rather than older admin/upload/SQLite/password-gated behavior.
- After both catalog corrections, `npm.cmd run verify` exited `0`; Astro check reported 0 errors, 0 warnings, 0 hints; build reported 6 pages; site validation passed; high-threshold npm audit found 0 vulnerabilities.
- 2026-05-08/09 promotion gate re-ran `npm.cmd run verify`; command exited `0`, Astro check reported 0 errors/warnings/hints, build reported 6 pages, site validation passed, and high-threshold npm audit found 0 vulnerabilities.
- GitHub Actions/Cloudflare deploy was validated after David added the Cloudflare API token as a GitHub secret; trigger commit `e55244e` deployed successfully.
- Live checks returned HTTP `200` for `https://davidluky.com/`, `https://davidluky.com/projects`, and `https://davidluky.com/privacy/digipets`.
- Live `/projects` contained the recovered math proof content `281 audited sets` and `2,864 problems`, plus the current `Static family storytelling site` Frank's Stories wording.

## Deployment Or Operation Notes

- Local development uses `npm run dev`.
- Static production build uses `npm run build`.
- Full local quality verification uses `npm run verify`.
- Cloudflare deployment should use the Wrangler config and deployment docs.
- Local `npx.cmd wrangler whoami` reported not authenticated in this session, but GitHub Actions deploy works after David configured the Cloudflare secret directly in GitHub.
- Worker compliance behavior should be treated as production-sensitive and should be rechecked before any account-deletion endpoint changes.

## Known Limits And Not Claimed

- Manual browser UX review is not claimed.
- Security review is not claimed.
- Full manual production UX review is not claimed beyond the live HTTP/content checks listed above.
- Automated tests beyond the recorded `npm run verify` command are not claimed.
- Audit data records `HasTests=False`.
- The project remains dirty only because of recovery/promotion documentation files unless future audit says otherwise.
- The documented catalog corrections were observed on the live `/projects` page during the 2026-05-08/09 promotion check.

## Evidence Sources

- `README.md`
- `package.json`
- `astro.config.mjs`
- `wrangler.toml`
- `src\worker.ts`
- `src\pages`
- `src\pages\privacy\digipets.astro`
- `src\data\projects.ts`
- `src\data\gaming.ts`
- `src\data\stats.ts`
- `src\i18n\shared.ts`
- `src\layouts\Base.astro`
- `scripts\validate-site.mjs`
- `public\_headers`
- `public\robots.txt`
- `docs\tech-notes.md`
- `docs\deployment-guide.md`
- `docs\SESSION-HANDOFF.md`
- `CODEX_RECOVERY_CHECKLIST.md`
- `C:\Users\David\OneDrive\Desktop\Programas\_codex_project_audit_20260506\verification-logs-20260506_193448\davidluky.com.stdout.log`
- `C:\Users\David\OneDrive\Desktop\Programas\_codex_project_audit_20260506\verification-logs-20260506_193448\davidluky.com.stderr.log`
- `C:\Users\David\OneDrive\Desktop\Programas\_codex_project_audit_20260506\VERIFICATION_RESULTS.md`
- `C:\Users\David\OneDrive\Desktop\Programas\_codex_project_audit_20260506\PROJECT_AUDIT.md`
