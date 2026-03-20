---
id: configuration
title: Configuration
sidebar_position: 1
---

This section covers configuration used by RaySon maintainers and contributors.

## Scope

- CLI command wiring in Go (`cmd/`, `internal/`)
- Script discovery and execution behavior
- Release/publish workflow configuration
- Docs-site YAML configuration

## Primary files

- `go.mod` and `cmd/version.go` for versioned Go module/runtime version values
- `.goreleaser.yaml` for artifact packaging and publish behavior
- `.github/workflows/*.yml` for branch/tag automation
- `docs-site/config/*.yml` for docs metadata, navigation, badges, and demos

## Next pages

- [API Reference](/docs/configuration/api-reference)
- [Automation Scripts](/docs/configuration/automation-scripts)
- [Available Scripts](/docs/configuration/available-scripts)
- [Key Components](/docs/configuration/key-components)
