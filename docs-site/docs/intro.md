---
id: intro
title: RaySon Overview
sidebar_position: 1
---

RaySon is a Go CLI that provides a single entrypoint for automation scripts and release tooling.

The current focus is Windows-first script orchestration with a gradual migration path to native Go commands for better cross-platform support.

## What RaySon covers today

- Finance export flows (shopping history and Smartsheet formatting)
- WSL startup automation for local dev environments
- MongoDB SSL setup helper command
- Maintainer release workflows with GitHub Actions and GoReleaser

## Project goals

- Keep common automation tasks consistent and discoverable under one CLI
- Reduce hand-run script errors through commandized workflows
- Provide a clear contributor and maintainer release process
- Move high-value script logic into native Go implementations over time

## Next steps

- Start with [Quick Start](/docs/getting-started/quick-start)
- Review [Command Reference](/docs/commands)
- Follow [Release Flow](/docs/release-flow) for maintainer publishing
