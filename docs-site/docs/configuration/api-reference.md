---
id: api-reference
title: API Reference
sidebar_position: 2
---

RaySon is primarily a CLI app, not a long-running HTTP API service.

## Command API surface

Treat CLI commands as the public interface:

- `rayson finance export`
- `rayson finance smartsheet`
- `rayson wsl startup`
- `rayson mongo ssl-setup`
- `rayson version`

## Contracts

- Input contract: command args + flags (including `--script-root` when needed)
- Output contract: command success/failure code and script/tool output
- Version contract: value from `cmd/version.go` plus build metadata at runtime

## Internal extension points

- `internal/run/script.go` for script execution and path resolution
- `cmd/*.go` for command registration and argument validation
- `scripts/*.js` for release/version/documentation helper tooling

## Notes

- Any future HTTP endpoints should be documented separately under a dedicated API section.
