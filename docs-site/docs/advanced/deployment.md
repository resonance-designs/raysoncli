---
id: deployment
title: Deployment
sidebar_position: 3
---

RaySon has two deployment tracks:

## 1) Application release track

- `release` branch push: snapshot artifact build (`release.yml`)
- semver tag push (`vX.Y.Z`): official publish (`publish.yml`)

This gives maintainers validation artifacts before public releases.

## 2) Documentation track

- `release` branch push builds docs and deploys GitHub Pages (`docs-site.yml`)

## Required GitHub setup

- Pages source: GitHub Actions
- `github-pages` environment allows deployments from `release` branch
- repository Actions permissions allow workflow writes where required
