# 9A Smart Connect — Manual (wiki source + HTML build)

This repository is the **single source of truth** for the 9A Smart Connect user &
technical manual. It contains:

- **`/docs`** — the manual as clean Markdown (the wiki source).
- **`/build`** — a small Node.js build that turns the wiki into the branded,
  single-page HTML manual (the same design you already had).
- **`/site`** — the **generated** HTML output. It is committed by CI; you
  never edit it by hand.
- **`/devops`** and **`/github`** — per-platform CI + setup guides. The content and
  build above are **shared**; only the CI differs.

Edit Markdown in `/docs` → CI regenerates the HTML and commits it back. It works on
**both Azure DevOps and GitHub** from the same files.

```
wiki/
├─ docs/                     # ← the Azure DevOps wiki (edit here)
│  ├─ .order                 #   top-level page order (Home + groups)
│  ├─ Home.md                #   wiki landing page
│  ├─ .attachments/          #   images (DevOps wiki convention)
│  └─ <Group>/               #   one folder per navigation group
│     ├─ .order              #   page order inside the group
│     └─ <Page>.md           #   one Markdown file per manual section
├─ build/                    # ← the generator (Node.js + markdown-it)
│  ├─ build.mjs              #   docs → site/  (run in the pipeline)
│  ├─ migrate.mjs            #   one-time HTML → docs/ importer (dev-only)
│  ├─ site.config.json       #   brand, hero, quick links, group order/labels
│  ├─ assets/               #   styles.css, app.js, mermaid.min.js, logos
│  └─ lib/                   #   markdown/template/docs/inline modules
├─ site/                     # ← generated output (committed by CI)
│  ├─ index.html + assets/   #   multi-file version
│  └─ 9A Smart Connect Manual.html   # single self-contained file
├─ devops/                   # ← Azure DevOps: pipeline + setup guide
│  ├─ azure-pipelines.yml
│  └─ README.md
├─ github/                   # ← GitHub: setup guide (Pages)
│  └─ README.md
├─ .github/workflows/        #   GitHub Actions (GitHub requires this path)
│  └─ build-and-deploy.yml
└─ package.json
```

## Build it locally

```powershell
npm ci
npm run build
```

Outputs land in `site/`. Open `site/index.html` (or the self-contained
`site/9A Smart Connect Manual.html`) in a browser.

## Authoring pages

Every page is plain Markdown and renders both in the Azure DevOps wiki **and** in
the generated HTML. A page starts with a one-line metadata comment (hidden in the
wiki) and an `#` title:

```markdown
<!-- nav: Overview & design | id: overview -->
# Overview & design

Your content here…
```

- **`nav`** — the short label shown in the sidebar (may contain `&`, `,`, etc.).
- **`id`** — the stable anchor used for in-page links. Keep it unchanged so links
  don't break.

### Component cheat-sheet

Write clean Markdown. A few conventions unlock the manual's richer components:

| To get…              | Write this                                                                 |
| -------------------- | -------------------------------------------------------------------------- |
| Info / Tip / Warning | `> **Info: Title**` then a blank `>` line then the body (also `Tip`, `Warning`) |
| Diagram              | a ` ```mermaid ` fenced block                                              |
| Diagram / figure caption | an *italic-only* line directly **after** the diagram or image           |
| Screenshot           | `![Alt text](/.attachments/name.png)`                                      |
| Stat tiles           | a ` ```stats ` block, one `number \| label` per line                       |
| Direction badge      | a table cell whose only content is `in`, `out`, or `in / out`             |
| Object-name pills    | a line of `` `InlineCode` `` tokens                                        |
| Link to another page | a normal relative link, e.g. `[Glossary](../Reference/Glossary.md)`        |
| Tables / lists / code | standard Markdown (GitHub-flavoured)                                       |

Everything else (headings, bold/italic, ordered & unordered lists, code blocks,
links) is ordinary Markdown.

### Add a page

1. Create `docs/<Group>/<Page-Name>.md` with the metadata comment + `#` title.
2. Add its file name (without `.md`) to that group's `docs/<Group>/.order`.
3. Commit. The sidebar, search and "on this page" rail update automatically.

### Add a navigation group

1. Create `docs/<New-Group>/` with an `.order` file.
2. Add an entry to `groups` in [build/site.config.json](build/site.config.json)
   (`folder`, `label`, optional `collapsed`) in the position you want.
3. Add the folder to the root `docs/.order`.

Brand text, the hero, and the home-page quick links also live in
[build/site.config.json](build/site.config.json).

## Deploy — Azure DevOps and/or GitHub

The content and the build are shared; each platform has its own CI and a short setup
guide:

- **Azure DevOps** → [devops/README.md](devops/README.md).
  Publishes `/docs` as a code wiki and runs
  [devops/azure-pipelines.yml](devops/azure-pipelines.yml), which rebuilds `/site`
  and commits it back.
- **GitHub** → [github/README.md](github/README.md).
  Runs [.github/workflows/build-and-deploy.yml](.github/workflows/build-and-deploy.yml),
  which rebuilds `/site`, commits it back, and publishes to **GitHub Pages**.

Both produce the identical branded HTML from the same Markdown, and both exclude
`/site` from their triggers (plus a `[skip ci]` tag) so the automated commit never
loops.

## Regenerating the wiki from the old HTML (one-time)

The wiki was imported from the original `index.html` with
[build/migrate.mjs](build/migrate.mjs). It is a **development-only** tool (needs
the `devDependencies`) and is not used by the pipeline. Re-running it overwrites
`/docs`, so only use it for a fresh import.
