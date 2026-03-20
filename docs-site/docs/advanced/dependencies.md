---
id: dependencies
title: Dependencies
sidebar_position: 4
---

## Runtime stack

- Go 1.22+ for CLI runtime and command implementations
- Cobra for command structure
- PowerShell/Bash for existing script packs

## Build/release stack

- GoReleaser for multi-platform artifacts
- GitHub Actions for branch and tag workflows
- Node.js scripts for version sync and release orchestration

## Docs stack

- Docusaurus 3.x
- React 19
- YAML-driven docs-site config and prebuild transforms

## Dependency policy

- Prefer maintained libraries with clear upgrade paths
- Avoid platform-pinned dependencies unless absolutely required
- Keep release-critical tooling versions explicit in workflows/config
