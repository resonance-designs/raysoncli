# RaySon CLI

[![Static Badge](https://img.shields.io/badge/Version-0.1.4-orange)](https://github.com/resonance-designs/rayson)
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

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for full contribution guidelines, development workflow, release/maintenance process, and support contact details.
