---
id: automation-scripts
title: Automation
sidebar_position: 3
---

RaySon currently wraps existing scripts while native Go replacements are phased in.

## Script groups

- `scripts/scripts/fin-automation/`
- `scripts/scripts/wsl-dev-startup/`
- `scripts/scripts/setup-mongodb-ssl/`

## How RaySon runs scripts

- Commands resolve script paths from detected script roots
- `--script-root` can override path discovery
- Non-zero script exits bubble up as command failures

## JavaScript tooling scripts

Repository automation is managed with Node scripts in `scripts/`, including:

- version synchronization (`bump-version.js`)
- release orchestration (`release.js`)
- build helpers and diagnostics

## Recommendation

When adding new script packs, first wire them under a clear command group, then add docs and tests before expanding behavior.
