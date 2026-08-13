// ============================================================
//  Load the wiki (/docs) into an ordered model the build can render.
//  Group = folder (order from site.config.json). Section = .md file
//  (order from each folder's .order). Page front-matter lives in a
//  leading HTML comment: <!-- nav: <label> | id: <anchor> -->
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { idSlug } from "./util.mjs";

export function loadDocs(docsDir, config) {
  const groups = [];
  const byId = new Map();
  const pathToId = new Map();
  const slugToId = new Map();

  for (const g of config.groups) {
    const folderAbs = path.join(docsDir, g.folder);
    if (!fs.existsSync(folderAbs)) {
      console.warn(`  ! group folder missing: ${g.folder}`);
      continue;
    }
    const sections = [];
    for (const base of readOrder(folderAbs)) {
      const file = path.join(folderAbs, base + ".md");
      if (!fs.existsSync(file)) {
        console.warn(`  ! listed in .order but missing: ${g.folder}/${base}.md`);
        continue;
      }
      const meta = parsePage(fs.readFileSync(file, "utf8"), base);
      const relPath = `${g.folder}/${base}`;
      const section = { ...meta, relPath, folder: g.folder, base };
      if (byId.has(section.id)) console.warn(`  ! duplicate id "${section.id}" (${relPath})`);
      sections.push(section);
      byId.set(section.id, section);
      pathToId.set(relPath.toLowerCase(), section.id);
      slugToId.set(base.toLowerCase(), section.id);
    }
    groups.push({ folder: g.folder, label: g.label, collapsed: !!g.collapsed, sections });
  }
  return { groups, byId, pathToId, slugToId };
}

/** Build the link/image resolvers the Markdown engine needs. */
export function makeResolvers({ pathToId, slugToId }) {
  const resolveLink = (href) => {
    if (/^(https?:|mailto:|tel:)/i.test(href)) return { href, external: true };
    if (!href || href.startsWith("#")) return { href };
    if (/\.attachments\//i.test(href)) return { href: "assets/screens/" + href.split("#")[0].split("/").pop() };
    let h = href.split("#")[0].split("?")[0];
    if (!h) return { href };
    h = h.replace(/\.md$/i, "");
    const base = h.split("/").pop().toLowerCase();
    const norm = h.replace(/^[./]+/, "").toLowerCase();
    const id = slugToId.get(base) || pathToId.get(norm);
    return id ? { href: "#" + id } : { href };
  };
  const resolveImage = (src) => {
    if (/^(https?:|data:)/i.test(src)) return src;
    const name = src.split("/").pop();
    if (/\.attachments\//i.test(src) || /^\/?\.attachments/i.test(src)) return "assets/screens/" + name;
    return src;
  };
  return { resolveLink, resolveImage };
}

function readOrder(folderAbs) {
  const orderFile = path.join(folderAbs, ".order");
  if (fs.existsSync(orderFile)) {
    return fs.readFileSync(orderFile, "utf8").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  }
  return fs.readdirSync(folderAbs).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")).sort();
}

function parsePage(raw, base) {
  let text = raw.replace(/^\uFEFF/, "");
  let nav = null;
  let id = null;
  const fm = text.match(/^\s*<!--([\s\S]*?)-->\s*/);
  if (fm) {
    const navM = /nav:\s*([^|\r\n]+?)\s*(?:\||-->|$)/i.exec(fm[1]);
    const idM = /id:\s*([A-Za-z0-9_-]+)/i.exec(fm[1]);
    if (navM) nav = navM[1].trim();
    if (idM) id = idM[1].trim();
    text = text.slice(fm[0].length);
  }
  let title = null;
  const h1 = text.match(/^#\s+(.+?)\s*$/m);
  if (h1 && h1.index < 4) {
    title = h1[1].trim();
    text = text.slice(0, h1.index) + text.slice(h1.index + h1[0].length);
  } else if (h1) {
    title = h1[1].trim();
    text = text.slice(0, h1.index) + text.slice(h1.index + h1[0].length);
  }
  const navLabel = nav || base.replace(/-/g, " ");
  return { nav: navLabel, id: id || idSlug(base), title: title || navLabel, body: text.trim() };
}
