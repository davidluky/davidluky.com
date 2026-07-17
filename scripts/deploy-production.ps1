[CmdletBinding()]
param(
  [switch]$CheckOnly,
  [switch]$ApproveProduction
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ($CheckOnly.IsPresent -eq $ApproveProduction.IsPresent) {
  throw "Pass exactly one of -CheckOnly or -ApproveProduction."
}

$ExpectedBranch = "main"
$Remote = "origin"
$SmokeUrl = "https://davidluky.com/"
$WranglerVersion = "4.110.0"
$RepoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path

function Invoke-CheckedCommand {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Command,

    [string[]]$Arguments = @()
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$Command failed with exit code $LASTEXITCODE."
  }
}

function Get-GitRevision {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Revision
  )

  $output = @(& git.exe rev-parse $Revision)
  if ($LASTEXITCODE -ne 0) {
    throw "Unable to resolve Git revision '$Revision'."
  }

  return ($output -join "").Trim()
}

function Assert-ExpectedBranch {
  $output = @(& git.exe branch --show-current)
  if ($LASTEXITCODE -ne 0) {
    throw "Unable to determine the current Git branch."
  }

  $currentBranch = ($output -join "").Trim()
  if ($currentBranch -ne $ExpectedBranch) {
    throw "Production releases require branch '$ExpectedBranch'; current branch is '$currentBranch'."
  }
}

function Assert-CleanWorktree {
  $status = @(& git.exe status --porcelain=v1 --untracked-files=all)
  if ($LASTEXITCODE -ne 0) {
    throw "Unable to inspect the Git worktree."
  }

  if ($status.Count -ne 0) {
    throw "Production releases require a clean worktree, including no untracked files. Commit, stash, or remove local changes first."
  }
}

function Assert-SyncedWithOrigin {
  Invoke-CheckedCommand -Command "git.exe" -Arguments @("fetch", "--prune", $Remote, $ExpectedBranch)

  $headRevision = Get-GitRevision -Revision "HEAD"
  $originRevision = Get-GitRevision -Revision "$Remote/$ExpectedBranch"
  if ($headRevision -ne $originRevision) {
    throw "HEAD ($headRevision) must exactly match $Remote/$ExpectedBranch ($originRevision) before production release."
  }

  return $headRevision
}

function Invoke-ProductionSmoke {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Uri,

    [int]$Attempts = 6,
    [int]$DelaySeconds = 5
  )

  for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
    try {
      $response = Invoke-WebRequest -Uri $Uri -Method Get -MaximumRedirection 5 -TimeoutSec 20 -UseBasicParsing -ErrorAction Stop
      $statusCode = [int]$response.StatusCode
      if ($statusCode -ge 200 -and $statusCode -lt 400) {
        Write-Host "Production smoke passed for $Uri with HTTP $statusCode."
        return
      }

      Write-Warning "Smoke attempt $attempt returned HTTP $statusCode."
    }
    catch {
      Write-Warning "Smoke attempt $attempt failed: $($_.Exception.Message)"
    }

    if ($attempt -lt $Attempts) {
      Start-Sleep -Seconds $DelaySeconds
    }
  }

  throw "Production smoke failed for $Uri after $Attempts attempts."
}

Push-Location -LiteralPath $RepoRoot
try {
  Assert-ExpectedBranch
  Assert-CleanWorktree
  $releaseRevision = Assert-SyncedWithOrigin

  Write-Host "Checking production candidate $releaseRevision."
  Invoke-CheckedCommand -Command "npm.cmd" -Arguments @("ci")
  Invoke-CheckedCommand -Command "npm.cmd" -Arguments @("run", "verify")
  Invoke-CheckedCommand -Command "npx.cmd" -Arguments @("--yes", "wrangler@$WranglerVersion", "whoami")
  Invoke-CheckedCommand -Command "npx.cmd" -Arguments @("--yes", "wrangler@$WranglerVersion", "deploy", "--dry-run", "--strict")

  Assert-ExpectedBranch
  Assert-CleanWorktree
  $recheckedRevision = Assert-SyncedWithOrigin
  if ($recheckedRevision -ne $releaseRevision) {
    throw "HEAD changed during preflight. Start the release check again."
  }
  Assert-CleanWorktree

  if ($CheckOnly) {
    Write-Host "Check-only preflight passed for $releaseRevision. Nothing was deployed."
    return
  }

  Invoke-CheckedCommand -Command "npx.cmd" -Arguments @(
    "--yes",
    "wrangler@$WranglerVersion",
    "deploy",
    "--strict",
    "--message",
    "git:$releaseRevision"
  )
  Invoke-ProductionSmoke -Uri $SmokeUrl
  Write-Host "Production deployment completed for $releaseRevision."
}
finally {
  Pop-Location
}
