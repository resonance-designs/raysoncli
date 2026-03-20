---
title: Status
sidebar_position: 19
---

import Badges from '@site/src/components/Badges';

<Badges />

---

This page is a quick maintainer health check for RaySon.

## What to verify

- `release.yml` passing on `release` branch
- `publish.yml` passing on tag events
- `docs-site.yml` passing for docs deployment
- repository activity signals (issues, commits, contributors)

## Release readiness

If any release or docs badge is red, resolve that workflow before tagging and publishing.
