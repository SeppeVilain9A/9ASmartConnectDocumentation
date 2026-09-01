---
description: "Workflow for updating the 9A Smart Connect manual when new F&O (main) code is loaded into the source folders. Trigger by asking to \"update the documentation\"."
applyTo: "Documentation/Smart Connect/wiki/**"
---

# Update the Smart Connect manual from new F&O code

Follow this when the user loads new **`main`** F&O code into the source folders and asks to
**"update the documentation"**. Work only inside `Documentation/Smart Connect/wiki/`.

## Golden rules
- **Targeted edits only.** Never blanket-regenerate a page. Edit just the sections that the
  changed code affects, preserving surrounding prose (some of it is authored in the GitHub Wiki UI).
- **Never run `npm run migrate`** — it overwrites `docs/` from the old HTML.
- **Do not touch** `.github/workflows/*` (build-and-deploy, wiki-sync) or `azure-pipelines.yml`.
- **No git operations** — the user commits/pushes. Leave everything staged for their review.
- Keep the Markdown component vocabulary intact: callouts `> **Info: …**`, ```mermaid fences,
  figures (image + *italic* caption), ```stats blocks, direction badges (table cell `in`/`out`),
  inline `code` pills, relative `.md` cross-links.

## Steps

1. **Scan.** Run `npm run scan:fo`. It diffs the current code against `build/fo-baseline.json`
   and writes `build/fo-changes.json` (Added / Modified / Removed objects, each with the doc
   `pages` to review). If it says "up to date", stop and report that.

2. **Understand each change.** For every Added/Modified object, read its XML under the module's
   `main/metadata/**` (labels, fields, methods, `Extends`, properties, enum values, form
   controls). Derive both the functional meaning (what a user sees/does) and the technical detail
   (class role, table fields, enum members). For Removed objects, find and prune stale references.

3. **Edit the mapped pages.** Apply minimal edits to the `pages` listed for each object:
   - New/changed `NANHandler*` → add/update its card in `docs/Handlers-and-Flows/Handler-catalogue.md`
     and the matching Outbound/Inbound page.
   - New/changed `NANConnecter*` → `Functional-Guide/Connectors.md`, `Field-and-Parameter-Reference/Connector-fields.md`, `Reference/Connector-reference.md`.
   - `AxTable*` → `Technical-Reference/Data-model.md`; `AxEnum*` → `Enumerations-reference.md`;
     `AxSecurity*` → `Security-roles.md`; `AxDataEntityView*` → `Reference/Data-entities.md`.
   - Add every new `NAN*` class/table name to the right group in `Reference/Object-index.md`.
   - Add-on modules → the relevant `Add-on-Modules/*.md`.

4. **Screenshots (fully automated).** When a change adds/alters a **form, field, menu item, or
   tile**, capture a fresh screenshot — do not hand-wave it:
   - Login + secrets are automated from `../../.env` (Entra ID + Key Vault + TOTP). Deep-link
     pattern is `<FO_ENVIRONMENT-base>/?cmp=AM01&mi=<MenuItemName>`.
   - Prefer the existing infra in `Documentation/Smart Connect/_capture/` (`capture*.py`,
     `annotate.py`; blue rounded boxes + numbered circles; `field_ctrl` matches `data-dyn-controlname`).
     Add a step/spec there for the new form, run it, then run `annotate.py`.
   - Alternatively drive it with the Playwright MCP / webwright skill using the same `.env` creds.
   - Save annotated PNGs into `docs/.attachments/` and reference them as a figure
     (image + *italic* caption) on the mapped page. One spec per control (overlapping boxes if two match).

5. **Build.** Run `npm run build`. Confirm it reports the expected section count with no warnings.

6. **Verify in the browser.** Open `site/9A Smart Connect Manual.html` (or `site/index.html`) with
   the browser tools, navigate to each edited section, confirm it renders correctly, images load,
   and search still lands on the right place.

7. **End-to-end coherence check (always).** Re-read the edited pages in context: do cross-links
   resolve, is there no orphaned/removed reference, does the functional story still flow, and do
   new objects appear in `Object-index.md`? Fix anything that no longer makes sense.

8. **Promote the baseline.** Once the docs reflect the new code, run `npm run baseline:fo` so the
   diff resets, and stamp the update date in `docs/Reference/Document-information.md`.

9. **Report.** Summarise what changed, which pages/screenshots were updated, and confirm the build
   + browser check passed. Remind the user to commit/push (and, if EB `main` is now mapped, that it
   will be picked up automatically next scan).

## Tooling reference
- `npm run scan:fo` — diff current code vs baseline → `build/fo-changes.json` + terminal report.
- `npm run baseline:fo` — (re)write `build/fo-baseline.json` (the "documented" snapshot).
- `build/fo-config.json` — module roots, tracked branch, object→page mapping. Edit this when new
  object-name patterns or pages appear, or when a module's `main` branch becomes available (e.g. EB).
