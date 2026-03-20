# GitHub Pages Setup Guide

Use this guide for any repository that wants to publish static docs to GitHub Pages via GitHub Actions.

## What this guide assumes

- A GitHub repository with a docs source directory (example: `docs-site`).
- A workflow file at `.github/workflows/<docs-workflow>.yml`.
- A built docs output directory (example: `docs-site/build`).
- Optional: Docusaurus docs; non-Docusaurus builders can use the same Pages workflow pattern.

You can reuse the same patterns with any project name/path.

---

## 1) One-time repository setup

### 1.1 Enable GitHub Pages

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Set **Build and deployment** to `GitHub Actions`.
4. Save.

If this is not set, configuration actions can fail with `Not Found` when querying the Pages site.

### 1.2 Set workflow permissions

1. Go to **Settings → Actions → General**.
2. Under **Workflow permissions**, choose **Read and write permissions**.
3. Save.

### 1.3 If your repo is in an organization

If your org applies stricter permission policies:
- Ensure the workflow actor is allowed to perform `pages: write`.
- Confirm org policies allow this action token to call the Pages API.

---

## 2) Optional fallback token (recommended for strict org policies)

Some org policies deny `GITHUB_TOKEN` write operations for Pages. Add a fallback PAT secret:

- `GITHUB_TOKEN` (primary): automatically provided by GitHub Actions.
- `GH_PAGES_TOKEN` (fallback): a repository secret containing a PAT with enough Pages permission.

### 2.1 Create a PAT

1. GitHub profile → **Settings → Developer settings → Personal access tokens**.
2. Create a token with repo/admin Pages deployment permissions for your target repo.
3. Copy the value.

### 2.2 Add repository secret

1. Repo → **Settings → Secrets and variables → Actions**.
2. Add secret:
   - `Name`: `GH_PAGES_TOKEN`
   - `Value`: your PAT token

---

## 3) Workflow baseline configuration

At minimum, your docs workflow should include:

```yaml
permissions:
  contents: write
  pages: write
  id-token: write

env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
```

These permissions are required for deployment to GitHub Pages and are not specific to any project.

---

## 4) Typical workflow structure

Below is a generalized template for a docs workflow.

```yaml
name: Publish Docs

on:
  push:
    branches:
      - <release-branch>
  workflow_dispatch:

permissions:
  contents: write
  pages: write
  id-token: write
env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true

jobs:
  docs:
    runs-on: ubuntu-latest
    env:
      GH_PAGES_TOKEN: ${{ secrets.GH_PAGES_TOKEN }}
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: "22"

      - name: Install docs dependencies
        run: npm --prefix <docs-dir> ci

      - name: Build docs
        run: npm --prefix <docs-dir> run build

      - name: Setup Pages (GITHUB_TOKEN)
        id: configure_pages
        uses: actions/configure-pages@v5
        continue-on-error: true
        with:
          enablement: true
          token: ${{ github.token }}

      - name: Setup Pages (fallback PAT)
        id: configure_pages_pat
        if: steps.configure_pages.outcome != 'success' && env.GH_PAGES_TOKEN != ''
        uses: actions/configure-pages@v5
        with:
          enablement: true
          token: ${{ env.GH_PAGES_TOKEN }}

      - name: Manual Pages setup required
        if: steps.configure_pages.outcome != 'success' && steps.configure_pages_pat.outcome != 'success'
        run: |
          echo "GitHub Pages could not be configured."
          echo "Enable Pages for the repository and verify token permissions."
          exit 1

      - name: Upload docs artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: <docs-output-dir>

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Replace placeholders:
- `<release-branch>`: branch that triggers docs builds (for example `release` or `main`)
- `<docs-dir>`: docs build directory (for example `docs-site`)
- `<docs-output-dir>`: static output directory (for example `docs-site/build`)

---

## 5) Failure diagnostics

### `Get Pages site failed. Not Found`

Meaning: Pages is not configured on the repo.

Fix:
- Set repo Pages source to `GitHub Actions` in Settings.

### `Create Pages site failed. Resource not accessible by integration`

Meaning: token being used lacks required permissions.

Fix:
- Verify `pages: write` and org policies.
- Add/refresh fallback `GH_PAGES_TOKEN` secret if needed.

### `Parameter token or opts.auth is required`

Meaning: token input passed to action was empty.

Fix:
- Confirm `token` is set from one of:
  - `${{ github.token }}`
  - `${{ env.GH_PAGES_TOKEN }}`

---

## 6) Local docs validation (optional)

From repo root:

```bash
cd /path/to/repo
npm --prefix <docs-dir> ci
npm --prefix <docs-dir> run build
```

If local build fails, fix tooling/lockfile issues first; if it passes, deployment failures are usually permissions-related.

---

## 7) Deployment verification

Run workflow manually or push to the trigger branch and confirm it reaches:
- `Setup Pages`
- `Upload docs artifact`
- `Deploy to GitHub Pages`

Then check Pages URL under the workflow environment or in repo Settings → Pages.

For standard GitHub Pages without custom domain:

```text
https://<org-or-user>.github.io/<repo-name>/
```

For custom domains, use your configured custom domain instead.

---

## 8) Custom domain setup (complete guide)

Use this section when you want your Pages site at a domain you own (for example `docs.example.com` or `example.com`).

### 8.1 Decide your domain shape

- **Subdomain**: `docs.example.com` or `www.example.com`
- **Apex/root domain**: `example.com`
- Optional best practice: configure both apex and `www`, then choose one canonical host.

### 8.2 Configure custom domain in GitHub first

1. Go to **Settings → Pages** in the repository.
2. In **Custom domain**, enter your domain (for example `docs.example.com`).
3. Save.

Important notes:
- If publishing from a **branch source**, GitHub may create a `CNAME` file commit.
- If publishing from a **custom GitHub Actions workflow**, no `CNAME` file is required and existing `CNAME` is ignored.

### 8.3 Add DNS records at your DNS provider

#### Subdomain (`docs.example.com` or `www.example.com`)

Create a `CNAME` record:

- `docs` (or `www`) -> `<user>.github.io` or `<org>.github.io`
- Do **not** include the repository name in the target.

#### Apex domain (`example.com`)

Use one of:

- `ALIAS`/`ANAME` to `<user>.github.io` or `<org>.github.io`, or
- `A` + `AAAA` records to GitHub Pages endpoints.

Current GitHub Pages IP records:

`A` records:
- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

`AAAA` records:
- `2606:50c0:8000::153`
- `2606:50c0:8001::153`
- `2606:50c0:8002::153`
- `2606:50c0:8003::153`

Recommendation:
- For apex, prefer `ALIAS`/`ANAME` when your DNS provider supports it.
- If using IPv6, keep `A` records too (do not use AAAA-only).

### 8.4 Optional canonical redirect setup

If you set the custom domain to `www.example.com` and also configure apex DNS records, GitHub Pages can redirect `example.com` -> `www.example.com` automatically.

Likewise, if `example.com` is canonical, `www.example.com` can redirect to apex.

### 8.5 Verify DNS propagation and correctness

DNS propagation can take up to 24 hours.

Windows PowerShell:

```powershell
Resolve-DnsName docs.example.com -Type CNAME
Resolve-DnsName example.com -Type A
Resolve-DnsName example.com -Type AAAA
```

Unix-like:

```bash
dig docs.example.com +short
dig example.com A +short
dig example.com AAAA +short
```

### 8.6 Enable HTTPS

After DNS is valid and GitHub recognizes the domain:

1. Return to **Settings → Pages**.
2. Enable **Enforce HTTPS** (may be unavailable until cert provisioning finishes).

Certificate issuance can take some time after DNS is correct.

### 8.7 Secure against domain takeover

- Verify your domain in GitHub Pages/domain settings.
- Avoid wildcard DNS records like `*.example.com` for Pages.
- If Pages is disabled, remove stale DNS records to avoid takeover risk.

### 8.8 Common custom-domain failure patterns

- **Domain not resolving to Pages**
  - Wrong CNAME target (must be `<user>.github.io` or `<org>.github.io`)
  - Missing one or more apex `A`/`AAAA` records
- **HTTPS not available**
  - DNS not fully propagated yet
  - CNAME/subdomain pointed to apex incorrectly
- **Domain already taken**
  - Domain still attached to another repository; remove there first
- **Intermittent failures**
  - Mixed/duplicate DNS entries at provider (old and new targets both present)

---

## 9) Adapting this for non-Docusaurus doc builders

Only replace build/install commands and output directory; keep the Pages setup/deploy steps the same:
- Build/install command: update `npm --prefix <docs-dir> run build`
- Output path: update `<docs-output-dir>` to the final static output path
- Keep action permissions and token setup unchanged

---

## 10) Quick mapping checklist

- Project docs path → replace `<docs-dir>`
- Build output path → replace `<docs-output-dir>`
- Trigger branch policy → replace `<release-branch>`
- Token fallback desired? Keep/Remove `GH_PAGES_TOKEN` fallback section.

This template can be copied as-is and customized with only a few placeholder replacements.
