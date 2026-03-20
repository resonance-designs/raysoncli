# Contributing

RaySon is open to community and internal contributions. We keep this repo friendly to contributors by making onboarding straightforward, review expectations clear, and release work separate from everyday development.

## Before you start

- Use small, focused commits and keep PRs scoped to one feature or fix.
- Match existing command naming and script conventions before introducing new behavior.
- Prefer clear docs updates for any user-facing change.
- Add or update tests where practical for changed logic.

## Development workflow

- Clone the repository and install dependencies:
- Go 1.22+
- Node.js 20+ (for repo scripts)
- Bash (for release-related scripts)
- `go mod tidy`
- `go mod download`
- `npm install`
- Run these checks before proposing a PR:
- `go test ./...`
- `go run ./cmd/rayson --help`
- Build a local binary and smoke-test it:
- `go build -o bin/rayson ./cmd/rayson`
- `./bin/rayson --help` (or `.\bin\\rayson.exe --help` on Windows)

## Release and maintenance

Maintainer flow is branch-driven and uses `release` as the release-candidate branch.

1. Create feature branches from `master`.
2. Merge ready feature branches into `master`.
3. When ready for release validation, merge `master` into `release`.
4. Push `release` and review workflow results:
- `.github/workflows/release.yml` (snapshot artifacts)
- `.github/workflows/docs-site.yml` (docs deployment)
5. If validation passes, create and push a semver tag from `release` (for example `v0.1.4`).
6. Tag push triggers `.github/workflows/publish.yml` to publish GitHub Release artifacts.

Version prep before release:

```powershell
# explicit version
node scripts/bump-version.js 0.1.4

# or auto patch bump
node scripts/bump-version.js
```

Commit the version changes, merge through normal branch flow, then release from `release`.

Command-line release flow:

```powershell
# from local repo
git checkout master
git pull origin master

# merge completed feature branch(es) into master (example)
git merge feature/my-change
git push origin master

# move release branch forward to current master
git checkout release
git pull origin release
git merge master
git push origin release

# after release/docs workflows pass, tag from release HEAD
git tag v0.1.4
git push origin v0.1.4
```

GitKraken release flow:

1. Checkout `master` and pull latest.
2. Merge each ready feature branch into `master`.
3. Push `master`.
4. Checkout `release` and pull latest.
5. Merge `master` into `release`.
6. Push `release` (this runs release/docs workflows).
7. Open GitHub Actions and confirm both workflows are green.
8. In GitKraken, create tag `vX.Y.Z` on current `release` commit.
9. Push the tag to origin.
10. Confirm `.github/workflows/publish.yml` succeeds and creates the GitHub Release.

Useful maintainer checks:

- `npm run release:dist` for local snapshot artifact builds.
- `go run ./cmd/rayson version` to inspect runtime version metadata.

## Support and questions

- For contribution questions or support requests, email [info@resonancedesigns.dev](mailto:info@resonancedesigns.dev).
