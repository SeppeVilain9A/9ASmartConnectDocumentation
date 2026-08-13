// ============================================================
//  Mirror /docs into a flat export for GitHub's native Wiki
//  (its own <repo>.wiki.git, no subfolders / .order support).
//  Run: node build/publish-wiki.mjs  ->  writes ./wiki-export
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readOrder, parsePage } from "./lib/docs.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const docsDir = path.join(root, "docs");
const outDir = path.join(root, "wiki-export");
const config = JSON.parse(fs.readFileSync(path.join(root, "build/site.config.json"), "utf8"));

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

// slug for every page: Home stays "Home", everything else is "<Group>-<page>"
const slugMap = new Map(); // "folder/base" -> slug, plus "base" -> slug (fallback)
const pages = []; // { slug, title, body, folder }

for (const g of config.groups) {
  const folderAbs = path.join(docsDir, g.folder);
  if (!fs.existsSync(folderAbs)) continue;
  for (const base of readOrder(folderAbs)) {
    const file = path.join(folderAbs, base + ".md");
    if (!fs.existsSync(file)) continue;
    const slug = `${g.folder}-${base}`;
    slugMap.set(`${g.folder}/${base}`.toLowerCase(), slug);
    if (!slugMap.has(base.toLowerCase())) slugMap.set(base.toLowerCase(), slug);
  }
}

// Home.md
{
  const meta = parsePage(fs.readFileSync(path.join(docsDir, "Home.md"), "utf8"), "Home");
  pages.push({ slug: "Home", title: meta.title, body: meta.body, folder: null });
}

for (const g of config.groups) {
  const folderAbs = path.join(docsDir, g.folder);
  if (!fs.existsSync(folderAbs)) continue;
  for (const base of readOrder(folderAbs)) {
    const file = path.join(folderAbs, base + ".md");
    if (!fs.existsSync(file)) continue;
    const meta = parsePage(fs.readFileSync(file, "utf8"), base);
    pages.push({ slug: `${g.folder}-${base}`, title: meta.title, nav: meta.nav, body: meta.body, folder: g.folder });
  }
}

for (const p of pages) {
  const body = rewrite(p.body, p.folder);
  const content = `<!-- Generated from /docs by build/publish-wiki.mjs — edit there, not here. -->\n# ${p.title}\n\n${body}\n`;
  fs.writeFileSync(path.join(outDir, `${p.slug}.md`), content, "utf8");
}

// _Sidebar.md — GitHub Wiki doesn't read .order, so give it an explicit nav
const sidebar = ["**[Home](Home)**", ""];
for (const g of config.groups) {
  const folderAbs = path.join(docsDir, g.folder);
  if (!fs.existsSync(folderAbs)) continue;
  sidebar.push(`### ${g.label}`);
  for (const base of readOrder(folderAbs)) {
    const file = path.join(folderAbs, base + ".md");
    if (!fs.existsSync(file)) continue;
    const meta = parsePage(fs.readFileSync(file, "utf8"), base);
    sidebar.push(`- [${meta.nav}](${g.folder}-${base})`);
  }
  sidebar.push("");
}
fs.writeFileSync(path.join(outDir, "_Sidebar.md"), sidebar.join("\n"), "utf8");

fs.writeFileSync(
  path.join(outDir, "_Footer.md"),
  "Generated from `/docs` — edit the source, not this wiki. Full branded manual: see the GitHub Pages site.\n",
  "utf8"
);

// attachments (images, drawio, etc.)
const attSrc = path.join(docsDir, ".attachments");
if (fs.existsSync(attSrc)) {
  const attDst = path.join(outDir, "attachments");
  fs.mkdirSync(attDst, { recursive: true });
  for (const f of fs.readdirSync(attSrc)) fs.copyFileSync(path.join(attSrc, f), path.join(attDst, f));
}

console.log(`Wrote ${pages.length} pages + _Sidebar.md + _Footer.md to ${path.relative(root, outDir)}/`);

function rewrite(text, folder) {
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, src) => {
    if (/\.attachments\//i.test(src)) return `![${alt}](attachments/${src.split("#")[0].split("/").pop()})`;
    return m;
  });
  text = text.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g, (m, label, href) => {
    if (/^(https?:|mailto:|tel:)/i.test(href) || href.startsWith("#")) return m;
    if (/\.attachments\//i.test(href)) return `[${label}](attachments/${href.split("#")[0].split("/").pop()})`;
    let h = href.split("#")[0].split("?")[0];
    if (!h || !/\.md$/i.test(h)) return m;
    h = h.replace(/\.md$/i, "");
    const parts = h.replace(/^(\.\.?\/)+/, "").split("/").filter(Boolean);
    const base = parts.pop().toLowerCase();
    const explicitFolder = parts.pop();
    const key = (explicitFolder ? `${explicitFolder}/${base}` : folder ? `${folder}/${base}` : base).toLowerCase();
    const slug = slugMap.get(key) || slugMap.get(base);
    return slug ? `[${label}](${slug})` : m;
  });
  return text;
}
