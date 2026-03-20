---
id: useApi
title: API Integration Notes
sidebar_position: 6
---

RaySon does not currently expose a first-party HTTP API.

## Current model

- Primary interface is CLI commands
- External integrations are handled through scripts and generated files

## If adding API integration

- Keep transport details outside command business logic
- Define stable request/response contracts
- Add tests around retries, timeouts, and failure handling
- Document auth model and security constraints before rollout

## Recommendation

Implement native Go command behavior first, then add service/API layers only where command-only flows become limiting.
