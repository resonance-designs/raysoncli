---
id: commands
title: Command Reference
sidebar_position: 2
---

This page documents the current RaySon command surface.

## Global usage

```powershell
rayson --help
rayson <group> <command> [flags]
```

## Finance commands

### `rayson finance export`

Runs the full shopping history export flow from the finance automation scripts.

Expected output:

- normalized export data for spreadsheet usage
- files suitable for downstream import workflows

### `rayson finance smartsheet`

Runs the Smartsheet-oriented export transform, producing a sheet-friendly output format for sorting/filtering in Smartsheet.

## Environment commands

### `rayson wsl startup`

Runs WSL startup orchestration to bootstrap a repeatable development environment.

## Infrastructure commands

### `rayson mongo ssl-setup`

Runs the Mongo SSL setup helper script to prepare certificates/configuration for secured local or managed Mongo workflows.

## Script root behavior

RaySon auto-detects script locations by default.

If needed, override script discovery manually:

```powershell
rayson --script-root C:\path\to\scripts finance export
```
