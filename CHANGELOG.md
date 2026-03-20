# Changelog

## [0.1.4] - 2026-03-20

### Changed

- Updated GitHub Actions workflows for current release/docs flow:
  - modernized action references and Node 24 action-runtime opt-in
  - corrected docs deployment to official Pages flow (`configure-pages` + `upload-pages-artifact` + `deploy-pages`)
- Fixed docs-site dependency/tooling compatibility:
  - replaced deprecated `react-beautiful-dnd` with `@hello-pangea/dnd`
  - removed Linux-only `@rollup/rollup-linux-x64-gnu` hard dependency
  - converted docs-site script commands from `pnpm` calls to npm-compatible equivalents
- Tailored docs-site core configuration from template defaults to RaySon project metadata and repository links.
- Switched docs-site default theme to `sunset` and disabled theme switching in navigation.

### Added

- Added new RaySon-focused docs pages:
  - `docs-site/docs/intro.md`
  - `docs-site/docs/commands.md`
  - `docs-site/docs/release-flow.md`
  - `docs-site/docs/project-structure.md`
- Added a `/demos` index page at `docs-site/src/pages/demos/index.tsx` to eliminate dead demo-root links.

### Removed

- Removed template-only docs content outside the retained RaySon docs scope:
  - PRD pages
  - `core-systems/*`
  - `guides/*`
  - `pull-requests/*`
  - extra getting-started pages not used by RaySon (`examples`, `real-world-examples`)

## [0.1.3] - 2026-03-20

### Changed

- Hardened `scripts/bump-version.js` to fail the run if any planned target cannot be updated (missing file, missing badge, non-semver version), logging each skip as an error and preventing partial writes.
- Updated `scripts/capture-build-timings.js` replacement logic to detect the next exact `# Build Timings` section boundary (instead of any heading marker), preventing premature truncation by nested headings.
- Updated Docusaurus config metadata/links for the project (`docs-site/docusaurus.config.js`), including Rayson title/tagline/site URL, repo org/project, edit links, footer links, copyright, and base URL for Pages.
- Changed local build output to a platform-aware binary name via `scripts/build.js` (`rayson.exe` on Windows, `rayson` elsewhere) and wired `rayson:build` to this script.
- Added `bin/` to `.gitignore` to avoid committing built executables.

### Added

- Added release tooling scaffolding:
  - `.goreleaser.yaml`
  - `scripts/release.js`
  - `scripts/Makefile`
  - `.github/workflows/release.yml` for merge builds on `release` branch
  - `.github/workflows/publish.yml` for tag-published releases
  - `.github/workflows/docs-site.yml` for Docusaurus GitHub Pages deployment
- Added npm scripts in `package.json` for release flows:
  - `release:dist`
  - `release`

## [0.1.2] - 2026-03-20

### Changed

- Reworked `scripts/bump-version.js` to plan version updates first (Go version, package versions, README badge) and apply file writes only after all validation passes.
- Updated docs-site metadata and repository links in `docs-site/docusaurus.config.js`:
  - Set RaySon-specific title/tagline/url and GitHub org/project values.
  - Updated edit links and footer GitHub links to the RaySon repository.
- Updated `scripts/capture-build-timings.js` to:
  - Preserve content after existing `# Build Timings` section when regenerating timings.
  - Emit captured `stdout` and `stderr` output when `go test` fails before exiting.

### Added

- Updated docs-site accessibility example in `docs-site/docs/tutorial-basics/markdown-features.mdx` by converting the interactive `Highlight` component from `<span>` to `<button type="button">`.
- Anchored `scripts/print-handoff.js` file lookups to script-relative project root (`path.resolve(__dirname, "..")`) for stable execution across working directories.

## [0.1.1] - 2026-03-20

### Changed

- Switched version bumping from PowerShell (`scripts/bump-version.ps1`) to JavaScript (`scripts/bump-version.js`).
- Updated `scripts/bump-version.js` to include `package.json` and `docs-site/package.json` as targets.

### Added

- Added Go-focused tooling scripts:
  - `scripts/find-bin.js`
  - `scripts/print-handoff.js`
  - `scripts/capture-build-metrics.js`
  - `scripts/capture-build-timings.js`
  - `scripts/check-build-matrix.js`
  - `scripts/deploy-docs.js`
- Added Go-oriented root tooling integration in `package.json` (`rayson:*`, `version:sync`, `docs:*` script commands).
- Added Docusaurus documentation site scaffolding in `docs-site` with npm-prefixed helper scripts for install/dev/build/serve.

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
