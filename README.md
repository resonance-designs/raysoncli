# RaySon CLI

![Static Badge](https://img.shields.io/badge/Version-0.1.0-orange)

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
.\scripts\bump-version.ps1

# Set a specific version
# The script updates both cmd/version.go and the README badge in one step.
.\scripts\bump-version.ps1 1.2.3
```
