---
title: Project Structure
sidebar_position: 1
---

```text
rayson/
  cmd/                    Go CLI command entrypoints
  internal/               Internal runtime helpers (script execution, plumbing)
  scripts/                Automation helpers and wrappers
  docs-site/              Docusaurus documentation app
  .github/workflows/      CI/CD and release automation
  .goreleaser.yaml        Artifact packaging configuration
  README.md               Primary contributor and maintainer guide
  CHANGELOG.md            Project release notes
```

## Design intent

- Keep command wiring in Go
- Keep script wrappers organized by domain
- Keep release logic declarative in workflows and GoReleaser config
- Keep maintainer process documented in both root README and docs site
