---
id: key-components
title: Components
sidebar_position: 5
---

Key components of the RaySon stack:

## CLI runtime

- `cmd/root.go`: root command and global flags
- `cmd/version.go`: source-of-truth version constant and version command
- `internal/run/script.go`: script runner abstraction

## Command packs

- `cmd/finance.go`: finance export commands
- `cmd/mongo.go`: Mongo SSL command group
- additional command files grouped by domain

## Release automation

- `.github/workflows/release.yml`: branch-based snapshot artifacts
- `.github/workflows/publish.yml`: tag-based public release publish
- `.goreleaser.yaml`: cross-platform binary/archive configuration

## Docs system

- `docs-site/config/*.yml`: site/content metadata and dynamic demo data
- `docs-site/docusaurus.config.ts`: docs framework configuration
- `docs-site/docs/*`: maintainer and user-facing docs pages
