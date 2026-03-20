# Changelog

## [0.1.0] - 2026-03-19

### Added

- Added `rayson version` command to print build metadata.
- Added link-time injectable version variables (`Version`, `Commit`, `BuildDate`) in `cmd/version.go` and `cmd/root.go` for `rayson version` output.
- Added `scripts/bump-version.ps1` to bump version values throughout files with optional explicit `x.y.z` or automatic patch increments.
- Added `CHANGELOG` documentation entry for release/versioning workflow.
- Bootstrapped a new Go CLI app named `rayson` with Cobra command structure.
- Added entrypoint for `rayson` at `cmd/rayson/main.go`.
- Added script launcher abstraction in `internal/run/script.go` to execute PowerShell/Bash scripts and resolve paths.
- Added Windows-first command set:
  - `rayson finance export` for full Shopping_History export flow.
  - `rayson finance smartsheet` for Smartsheet-specific CSV export.
  - `rayson wsl startup` for WSL dev startup orchestration.
  - `rayson mongo ssl-setup` for MongoDB SSL setup script execution.
- Added automatic script root detection and `--script-root` override in `cmd/root.go`.
- Added initial CLI user documentation in `README.md` (install/build/run examples and command usage).
