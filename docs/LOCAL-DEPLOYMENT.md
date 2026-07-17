# Automated production deployment and local fallback

GitHub stores the source, but Actions is disabled repository-wide. Cloudflare
Workers Builds is the normal automated deployment path from `main`; the
guarded local Wrangler script remains the fallback path.

## One-time control-plane setup

1. In GitHub, keep Actions disabled repository-wide. Confirm the API returns
   `false`:

   ```powershell
   gh api repos/davidluky/davidluky.com/actions/permissions --jq '.enabled'
   ```

2. In Cloudflare, open **Workers & Pages > davidluky-com > Settings > Builds**.
   Connect `davidluky/davidluky.com`, select `main` as the production branch,
   keep production deployment enabled, and disable non-production branch
   builds so preview hostnames cannot bypass hostname-specific access gates.
   Use build command `npm run verify` and deploy command
   `npx wrangler@4.110.0 deploy --strict`.
3. Keep local Wrangler authenticated with the Cloudflare account that owns
   `davidluky-com` for manual recovery. A push should trigger Cloudflare's own
   build, never a GitHub Actions runner.

Recheck both controls after changing Git provider access, Cloudflare accounts,
or repository automation.

## Safety model

The release script refuses to continue unless all of these are true:

- exactly one of `-CheckOnly` or `-ApproveProduction` was supplied;
- the current branch is `main`;
- the worktree is clean, including untracked files;
- a fresh fetch succeeds; and
- `HEAD` exactly matches `origin/main`.

It then performs a clean install, the full repository verification gate,
Wrangler authentication check, and strict dry run. It repeats the Git checks
before any upload. A production upload occurs only with
`-ApproveProduction`, and the script retries an HTTP smoke check against
`https://davidluky.com/` afterward.

The Worker also serves `matheus.davidluky.com` and
`manual-matheus.davidluky.com`; follow `docs/FLIGHT-DECK.md` for their gated
route checks after relevant Worker or Matheus changes.

## Automated release

From a clean checkout, run `npm ci` and `npm run verify`, commit the reviewed
change, and push `main`. Cloudflare then builds and deploys that commit on its
own infrastructure. Monitor the Workers Build and repeat the public Matheus,
manual, eBay, and home-page route checks relevant to the change.

## Manual fallback

Use the local script only when Workers Builds is unavailable or an explicit
manual recovery is required. Commit and push the intended source first so the
fallback deploy remains tied to an exact public Git revision.

Run the non-production preflight:

```powershell
.\scripts\deploy-production.ps1 -CheckOnly
```

Review that exact commit and obtain explicit production approval. Then run:

```powershell
.\scripts\deploy-production.ps1 -ApproveProduction
```

Never use both switches, omit both switches, bypass a failed verification, or
deploy from a dirty tree. The script pins Wrangler `4.110.0` so the checked and
deployed toolchain is identical.

## Secrets

Never print, copy into command arguments, commit, or log Worker secret values,
passwords, login bodies, authorization headers, or cookies. Keep ignored local
secret files ignored. Use Wrangler's interactive secret command when a binding
must be changed:

```powershell
npx.cmd --yes wrangler@4.110.0 secret put <BINDING_NAME>
```

Listing binding names is safe; exposing values is not. A routine deploy does
not require secret values to be re-entered.

## Rollback

List recent Worker deployments and select the last known-good version:

```powershell
npx.cmd --yes wrangler@4.110.0 deployments list
npx.cmd --yes wrangler@4.110.0 rollback <VERSION_ID> --message "rollback: <reason>"
```

After rollback, repeat the public smoke check and the relevant Matheus/eBay
checks without printing secrets, cookies, or provider payloads. Record the
failed and restored Git revisions in the flight recorder.
