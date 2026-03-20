---
id: release-flow
title: Release Flow
sidebar_position: 3
---

RaySon uses a branch-driven maintainer flow with tag-based publishing.

## Branch model

1. Build features on short-lived branches from `master`.
2. Merge completed work into `master`.
3. Merge `master` into `release` when a release candidate is ready.

## What happens on `release` pushes

Two workflows run automatically:

- `.github/workflows/release.yml`: builds multi-platform snapshot artifacts
- `.github/workflows/docs-site.yml`: builds and deploys docs to GitHub Pages

This gives maintainers a full validation checkpoint before creating a public release.

## Publishing a public release

1. Sync version values:

```powershell
node scripts/bump-version.js 0.1.4
```

2. Commit and merge changes through the normal flow into `release`.
3. Create and push a semver tag from `release`:

```powershell
git tag v0.1.4
git push origin v0.1.4
```

4. The tag triggers `.github/workflows/publish.yml`, which publishes GitHub Release artifacts.

## Local maintainer checks

```powershell
npm run release:dist
go run ./cmd/rayson version
```
