# GitHub deployment

Everything here targets **GitHub**. The manual content and the build engine are
shared and live at the repo root (`/docs`, `/build`, `/site`) — the same files
Azure DevOps uses. Nothing is duplicated.

## The workflow

GitHub only runs workflows from **`.github/workflows/`**, so the runnable file is:

- [`.github/workflows/build-and-deploy.yml`](../.github/workflows/build-and-deploy.yml)

On every change to `/docs` or `/build` it:

1. installs Node + `markdown-it`,
2. runs `node build/build.mjs`,
3. commits the refreshed `/site` back with `[skip ci]`, and
4. deploys `/site` to **GitHub Pages** (a live URL).

## Enable it (one-time)

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Actions → General → Workflow permissions: Read and write.**
   (Needed so the workflow can commit the regenerated `/site` back.)
3. If `main` is a protected branch, allow the `github-actions[bot]` to push (or
   remove the commit-back step and rely on Pages only — see below).

Push a change to `/docs` and the manual publishes to
`https://<owner>.github.io/<repo>/`.

## Fallback: hosted runners disabled

Some GitHub Enterprise tenants block **GitHub-hosted Actions runners** by policy
("*GitHub Actions hosted runners are disabled for this repository*"). That policy
is set at the Enterprise level (Enterprise Settings → Policies → Actions →
Policies for GitHub-hosted runners) — a repo or org owner usually can't override
it themselves; ask your GitHub Enterprise Administrator to allow it.

Until then, Pages can still be served **without Actions at all**, since `/site`
is already committed to the repo. Push it to a dedicated `gh-pages` branch and
use classic branch deployment:

```powershell
git subtree push --prefix site origin gh-pages
```

Then set **Settings → Pages → Build and deployment → Source: Deploy from a
branch** → branch `gh-pages`, folder `/ (root)`. Re-run the command above (after
`node build/build.mjs`) whenever `/docs` changes to publish an update. Once
hosted runners are enabled, switch the source back to **GitHub Actions** to
resume automatic builds.

## What renders where

- **GitHub Pages (recommended):** serves the **built HTML** — identical to Azure
  DevOps, with full navigation, search, Mermaid, screenshots and theming.
- **Raw Markdown on github.com (repo browser):** renders too — Mermaid, tables,
  relative `.md` links and the hidden front-matter all work. Two differences vs the
  built site: `.order` does not drive ordering (files list alphabetically) and
  `/.attachments/…` image paths don't resolve in the raw preview. Both are handled
  correctly in the built Pages site, so prefer Pages for browsing.

## Pages-only (no committed HTML)

If you don't want the generated HTML committed to Git, delete the
*"Commit regenerated site back to Git"* step from the workflow. Pages is served
straight from the build artifact, so the live site is unaffected.
