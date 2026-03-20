# RaySon CLI

[![Static Badge](https://img.shields.io/badge/Version-0.1.3-orange)](https://github.com/resonance-designs/rayson)
[![Docs](https://img.shields.io/badge/Docs-GitHub%20Pages-2ea44f)](https://resonance-designs.github.io/rayson/)
[![Build](https://img.shields.io/github/actions/workflow/status/resonance-designs/rayson/.github/workflows/release.yml?branch=release)](https://github.com/resonance-designs/rayson/actions/workflows/release.yml)
[![Release](https://img.shields.io/github/v/release/resonance-designs/rayson)](https://github.com/resonance-designs/rayson/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Go](https://img.shields.io/badge/Go-1.22+-00ADD8)](https://go.dev/dl/)

RaySon is a Go CLI that wraps your existing automation scripts into one workflow entrypoint.

## What this does now

- `finance export`: runs `scripts/scripts/fin-automation/Export-ShoppingHistory.ps1`
- `finance smartsheet`: runs `scripts/scripts/fin-automation/Export-ShoppingHistory-Smartsheet.ps1`
- `wsl startup`: runs `scripts/scripts/wsl-dev-startup/WSL-Dev-Startup.ps1`
- `mongo ssl-setup`: runs `scripts/scripts/setup-mongodb-ssl/setup-mongodb-ssl.sh`

## Prerequisites

- Windows (primary target), PowerShell, Bash (for setup-mongodb-ssl script)
- Go 1.22+

## Quick start

```powershell
cd C:\Dev\Projects\raysoncli
go mod tidy
go run ./cmd/rayson --help
```

Build a local binary:

```powershell
go build -o .\rayson.exe .\cmd\rayson
.\rayson.exe --help
```

## Command examples

```powershell
rayson finance export
rayson finance smartsheet
rayson wsl startup
rayson mongo ssl-setup
```

## Notes

- Script root auto-detection is enabled; use `--script-root` if needed.
- Current version is Windows-first and executes PowerShell/Bash scripts.

## Versioning

`rayson version` uses the hardcoded version constant defined in `cmd/version.go`, so the version is under source control in one place.

```powershell
rayson version
```

Behavior:

- `Version` comes from the hardcoded constant in `cmd/version.go`.
- `commit` and `built` are read from VCS metadata embedded by the Go toolchain.

If your build environment does not include VCS metadata, commit/build fallback to `unknown`.

### Bumping version

Use the helper script to bump version:

```powershell
# Auto-increment patch (x.y.Z -> x.y.(Z+1))
node scripts/bump-version.js

# Set a specific version
# The script updates both cmd/version.go and the README badge in one step.
node scripts/bump-version.js 1.2.3
```

## Road Map

- Add a release-process cleanup pass to keep `bin/` artifacts and generated outputs out of source control across all contributors.
- Add a cross-platform Windows installer package in the next release cycle.
- Add a `rayson` install script for one-command bootstrap (`download or build + install`).
- Add release notes and changelog generation from GoReleaser output.
- Expand docs coverage for all command flows and automation scripts (including failure diagnostics).
- Translate the current PowerShell/Bash automation scripts to native Go where practical.
- Add vulnerability checks for project lock files (`package-lock.json`, `Cargo.lock`, `go.mod`, `poetry.lock`, `requirements.txt`).
- Add a configurable `linecount` command to count files/lines at configurable depth.
- Improve financial scripting with more intelligent, adaptive behavior.
- Expand business automation commands for workflow operations.

## Contributing

RaySon is open to community and internal contributions. We keep this repo friendly to contributors by making onboarding straightforward, review expectations clear, and release work separate from everyday development.

### Before you start

- Use small, focused commits and keep PRs scoped to one feature or fix.
- Match existing command naming and script conventions before introducing new behavior.
- Prefer clear docs updates for any user-facing change.
- Add or update tests where practical for changed logic.

### Development workflow

- Clone the repository and install dependencies:
- Go 1.22+
- Node.js 20+ (for repo scripts)
- Bash (for release-related scripts)
- `go mod tidy`
- `go mod download`
- `npm install`
- Run these checks before proposing a PR:
- `go test ./...`
- `go run ./cmd/rayson --help`
- Build a local binary and smoke-test it:
- `go build -o bin/rayson ./cmd/rayson`
- `./bin/rayson --help` (or `.\bin\\rayson.exe --help` on Windows)

### Release and maintenance

Maintainer flow is branch-driven:

1. Build features on short-lived branches (from `master`) and merge into `master` when ready.
2. When a release candidate is ready, merge `master` into `release`.
3. A push to `release` triggers CI workflows:
- `.github/workflows/release.yml` builds multi-platform snapshot artifacts and uploads them to the workflow run.
- `.github/workflows/docs-site.yml` builds and deploys docs to GitHub Pages.
4. Validate artifacts and docs from that `release` run.
5. Publish an official release by creating and pushing a semver tag from `release` (for example `v0.1.4`).
6. The tag triggers `.github/workflows/publish.yml`, which syncs version from the tag and publishes a GitHub Release with artifacts.

Version preparation:

- Update version source-of-truth: `node scripts/bump-version.js 0.1.4` (or omit value to auto-increment patch).
- Commit and merge through the normal flow before tagging.

Useful maintainer commands:

- `npm run release:dist` for local snapshot-style artifact builds.
- `go run ./cmd/rayson version` to inspect runtime version metadata locally.

### Support and questions

- For contribution questions or support requests, email [info@resonancedesigns.dev](mailto:info@resonancedesigns.dev).
