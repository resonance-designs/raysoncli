---
id: development-workflow
title: Development Workflow
sidebar_position: 5
---

## Local loop

```powershell
go test ./...
go run ./cmd/rayson --help
npm --prefix docs-site run build
```

## Branch flow

1. Create a feature branch from `master`.
2. Merge completed features into `master`.
3. Merge `master` into `release` when candidate is ready.
4. Validate release-branch artifacts and docs deployment.
5. Tag from `release` to publish official release.

## Versioning

- Source-of-truth version lives in `cmd/version.go`
- Sync versioned files with `node scripts/bump-version.js`

## Quality expectations

- Keep changes scoped and documented
- Update command/docs when behavior changes
- Avoid introducing platform lock-in in shared tooling
