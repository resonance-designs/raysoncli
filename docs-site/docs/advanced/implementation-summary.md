---
id: implementation-summary
title: Architecture
sidebar_position: 2
---

RaySon architecture is intentionally simple:

- Go command surface for user-facing operations
- Script runner abstraction for existing automation
- JavaScript tooling for repo/release/docs helpers
- GitHub Actions plus GoReleaser for cross-platform release outputs

## Current tradeoff

The project optimizes for delivery speed by wrapping mature scripts first, then gradually replacing script logic with native Go implementations.

## Reliability guardrails

- Explicit version sync flow
- Branch vs tag release separation
- Docs and release workflows automated in CI
