---
title: Project Structure
sidebar_position: 21
---

This page describes the repository layout from a maintainer perspective.

## Top-level map

```text
rayson/
  cmd/                    CLI commands
  internal/               internal runtime helpers
  scripts/                automation and release helper scripts
  docs-site/              documentation application
  .github/workflows/      CI/CD pipelines
  README.md               onboarding and contributor guide
  CHANGELOG.md            release history
```

## Ownership model

- Go command behavior and execution flow live in `cmd/` + `internal/`
- operational scripts live in `scripts/`
- release/publish/deploy automation lives in `.github/workflows/`
- user and maintainer documentation lives in `README.md` and `docs-site/docs/`

## Attribution

Docs-site foundation based on:
https://github.com/The-Running-Dev/Docusaurus-Template
