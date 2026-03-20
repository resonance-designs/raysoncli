---
id: available-scripts
title: Scripts
sidebar_position: 4
---

## Root scripts (`package.json`)

- `npm run rayson:build` - Build local RaySon binary via project script
- `npm run version:sync` - Sync version values across tracked files
- `npm run release:dist` - Build snapshot artifacts (no public publish)
- `npm run release` - Publish release flow (used by tagged publish workflow)

## Docs scripts

- `npm --prefix docs-site run start` - Start docs dev server
- `npm --prefix docs-site run build` - Build docs output
- `npm --prefix docs-site run serve` - Serve built docs locally

## Validation scripts

- `go test ./...` - Run Go tests
- `go run ./cmd/rayson --help` - Sanity-check command registration
- `go run ./cmd/rayson version` - Verify runtime version output
