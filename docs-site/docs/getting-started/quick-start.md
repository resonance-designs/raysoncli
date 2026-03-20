---
id: quick-start
title: Quick Start
sidebar_position: 1
---

This guide gets RaySon running locally for development and testing.

## Prerequisites

- Go 1.22+
- Node.js 22+
- PowerShell (Windows)
- Git

## Clone and install

```powershell
git clone https://github.com/resonance-designs/rayson.git
cd rayson
go mod tidy
npm ci
```

## Build and run

```powershell
go run ./cmd/rayson --help
go build -o .\bin\rayson.exe .\cmd\rayson
.\bin\rayson.exe --help
```

## Run key commands

```powershell
.\bin\rayson.exe finance export
.\bin\rayson.exe finance smartsheet
.\bin\rayson.exe wsl startup
.\bin\rayson.exe mongo ssl-setup
```

## Build docs locally

```powershell
npm --prefix docs-site ci
npm --prefix docs-site run build
```

## Version sync

```powershell
node scripts/bump-version.js
# or
node scripts/bump-version.js 0.1.4
```
