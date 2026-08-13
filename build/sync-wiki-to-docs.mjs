// ============================================================
//  Reverse-sync: pull edits made in the GitHub Wiki UI back into
//  /docs, so the normal build (docs -> site) picks them up.
//  Run: node build/sync-wiki-to-docs.mjs <path-to-wiki-checkout>
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { idSlug } from "./lib/util.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const docsDir = path.join(root, "docs");
const config = JSON.parse(fs.readFileSync(path.join(root, "build/site.config.json"), "utf8"));
const wikiDir = process.argv[2];

if (!wikiDir || !fs.existsSync(wikiDir)) {
  console.error("Usage: node build/sync-wiki-to-docs.mjs <path-to-wiki-checkout>");
  process.exit(1);
}

// Longest folder name first, so "E-Invoicing-and-EDI-France-MySupply" doesn't
// false-match a shorter unrelated prefix.
const groupFolders = config.groups.map((g) => g.folder).sort((a, b) => b.length - a.length);
const knownSlugs = new Map(); // slug (lower) -> "Group/base" (lower), for link rewriting

for (const g of config.groups) {
  const folderAbs = path.join(docsDir, g.folder);
  if (!fs.existsSync(folderAbs)) continue;
  for (const f of fs.readdirSync(folderAbs)) {
    if (!f.endsWith(".md")) continue;
    const base = f.replace(/\.md$/, "");
    knownSlugs.set(`${g.folder}-${base}`.toLowerCase(), `${g.folder}/${base}`.toLowerCase());
  }
}

const IGNORE = new Set(["_Sidebar.md", "_Footer.md", "_Header.md", "Home.md"]);
const changed = [];

for (const f of fs.readdirSync(wikiDir)) {
  if (!f.endsWith(".md") || IGNORE.has(f)) continue;
  const slug = f.replace(/\.md$/, "");
  const split = splitSlug(slug);
  if (!split) {
    console.warn(`  ! skipping "${f}" — doesn't match any known <Group>-<Page> slug`);
    continue;
  }
  writePage(path.join(wikiDir, f), path.join(docsDir, split.folder, split.base + ".md"), split.folder, split.base);
  changed.push(`${split.folder}/${split.base}`);
}

// Home.md maps straight back to docs/Home.md
if (fs.existsSync(path.join(wikiDir, "Home.md"))) {
  writePage(path.join(wikiDir, "Home.md"), path.join(docsDir, "Home.md"), null, "Home");
  changed.push("Home");
}

console.log(changed.length ? `Synced ${changed.length} page(s) from wiki into /docs:\n  ${changed.join("\n  ")}` : "No wiki pages to sync.");

function splitSlug(slug) {
  for (const folder of groupFolders) {
    if (slug.startsWith(folder + "-")) return { folder, base: slug.slice(folder.length + 1) };
  }
  return null;
}

function writePage(srcFile, destFile, folder, base) {
  let text = fs.readFileSync(srcFile, "utf8").replace(/^\uFEFF/, "");
  text = text.replace(/^<!--\s*Generated from \/docs[\s\S]*?-->\s*\n?/, "");

  let title = base.replace(/-/g, " ");
  const h1 = text.match(/^#\s+(.+?)\s*$/m);
  if (h1) {
    title = h1[1].trim();
    text = text.slice(0, h1.index) + text.slice(h1.index + h1[0].length);
  }

  // Keep the existing nav/id if this page already exists, so anchors don't break.
  let nav = title;
  let id = idSlug(base);
  if (fs.existsSync(destFile)) {
    const existing = fs.readFileSync(destFile, "utf8");
    const fm = existing.match(/^\s*<!--([\s\S]*?)-->/);
    if (fm) {
      const navM = /nav:\s*([^|\r\n]+?)\s*(?:\||-->|$)/i.exec(fm[1]);
      const idM = /id:\s*([A-Za-z0-9_-]+)/i.exec(fm[1]);
      if (navM) nav = navM[1].trim();
      if (idM) id = idM[1].trim();
    }
  }

  text = text.replace(/!\[([^\]]*)\]\(attachments\/([^)]+)\)/g, "![$1](/.attachments/$2)");
  text = text.replace(/(?<!!)\[([^\]]+)\]\(attachments\/([^)]+)\)/g, "[$1](/.attachments/$2)");
  text = text.replace(/(?<!!)\[([^\]]+)\]\(([A-Za-z0-9_-]+)\)/g, (m, label, slug) => {
    const target = knownSlugs.get(slug.toLowerCase());
    if (!target) return m;
    const [g, b] = target.split("/");
    if (folder && g === folder.toLowerCase()) return `[${label}](${b}.md)`;
    return `[${label}](${folder ? "../" : ""}${g}/${b}.md)`;
  });

  fs.mkdirSync(path.dirname(destFile), { recursive: true });
  fs.writeFileSync(destFile, `<!-- nav: ${nav} | id: ${id} -->\n# ${title}\n\n${text.trim()}\n`, "utf8");

  if (folder) {
    const orderFile = path.join(docsDir, folder, ".order");
    const order = fs.existsSync(orderFile) ? fs.readFileSync(orderFile, "utf8").split(/\r?\n/).map((s) => s.trim()).filter(Boolean) : [];
    if (!order.includes(base)) {
      order.push(base);
      fs.writeFileSync(orderFile, order.join("\n") + "\n", "utf8");
    }
  }
}
