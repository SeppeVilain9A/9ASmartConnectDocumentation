// ============================================================
//  ONE-TIME migration: split the original index.html into a clean
//  Azure DevOps code-wiki under /docs, using the same component
//  vocabulary the build understands. Dev-only tool (jsdom + turndown);
//  the pipeline never runs this.
//
//  Strategy: use jsdom (full DOM API) to simplify the manual's rich
//  components down to clean, semantic HTML, then let turndown convert
//  that residual to Markdown.
//
//  Usage:  node build/migrate.mjs
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { slugify } from "./lib/util.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const sourceHtml = path.join(repoRoot, "..", "index.html");
const docsDir = path.join(repoRoot, "docs");
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "site.config.json"), "utf8"));

function main() {
  if (!fs.existsSync(sourceHtml)) {
    console.error(`Source not found: ${sourceHtml}`);
    process.exit(1);
  }
  const dom = new JSDOM(fs.readFileSync(sourceHtml, "utf8"));
  const doc = dom.window.document;

  // ---- 1. Groups + section order from the sidebar ----
  const navGroups = [...doc.querySelectorAll(".sidebar .nav-group")];
  if (navGroups.length !== config.groups.length) {
    console.warn(`  ! sidebar has ${navGroups.length} groups, config has ${config.groups.length}`);
  }
  const groups = navGroups.map((g, i) => {
    const label = clean(g.querySelector(".nav-group-title")?.textContent || "");
    const cfg = config.groups[i] || { folder: slugify(label), label };
    const items = [...g.querySelectorAll(".nav-list a")].map((a) => ({
      id: (a.getAttribute("href") || "").replace(/^#/, ""),
      nav: clean(a.textContent || ""),
    }));
    return { folder: cfg.folder, label: cfg.label || label, items };
  });

  // ---- 2. id -> {folder, base} for cross-link rewriting ----
  const idMap = new Map();
  for (const g of groups) {
    for (const it of g.items) {
      it.base = slugify(it.nav);
      idMap.set(it.id, { folder: g.folder, base: it.base });
    }
  }

  const td = makeTurndown();

  // ---- 3. Convert every section -> markdown ----
  let nPages = 0;
  for (const g of groups) {
    const folderAbs = path.join(docsDir, g.folder);
    fs.mkdirSync(folderAbs, { recursive: true });
    for (const it of g.items) {
      const sec = doc.getElementById(it.id);
      if (!sec) { console.warn(`  ! section #${it.id} not found`); continue; }
      const title = clean(sec.querySelector("h2")?.textContent || it.nav);
      const clone = sec.cloneNode(true);
      clone.querySelector("h2")?.remove();
      simplify(clone, doc);
      let body = td.turndown(clone.innerHTML);
      body = rewriteLinks(body, g.folder, idMap);
      body = tidy(body);
      const md = `<!-- nav: ${it.nav} | id: ${it.id} -->\n# ${title}\n\n${body}\n`;
      fs.writeFileSync(path.join(folderAbs, it.base + ".md"), md, "utf8");
      nPages++;
    }
    fs.writeFileSync(path.join(folderAbs, ".order"), g.items.map((i) => i.base).join("\n") + "\n", "utf8");
  }

  // ---- 4. Home page + root .order ----
  fs.writeFileSync(path.join(docsDir, "Home.md"), buildHome(groups), "utf8");
  fs.writeFileSync(path.join(docsDir, ".order"), ["Home", ...groups.map((g) => g.folder)].join("\n") + "\n", "utf8");

  console.log(`Migrated ${nPages} sections across ${groups.length} groups into /docs.`);
}

// ============================================================
//  jsdom simplification: rich components -> clean semantic HTML
// ============================================================
function simplify(root, doc) {
  const make = (tag, txt) => { const e = doc.createElement(tag); if (txt != null) e.textContent = txt; return e; };
  const unwrap = (n) => { while (n.firstChild) n.parentNode.insertBefore(n.firstChild, n); n.remove(); };
  const italicP = (t) => { const p = make("p"); const em = make("em", t); p.appendChild(em); return p; };

  const transforms = [
    ["svg,.filter-box,.legend,.shot-badge,.h-chev", (n) => n.remove()],

    ["pre.mermaid", (n) => {
      const pre = make("pre"), code = make("code", n.textContent.trim());
      code.className = "language-mermaid"; pre.appendChild(code); n.replaceWith(pre);
    }],
    [".diagram-cap", (n) => n.replaceWith(italicP(clean(n.textContent)))],

    ["figure", (n) => {
      const img = n.querySelector("img");
      const name = (img?.getAttribute("src") || "").split("/").pop();
      const frag = doc.createDocumentFragment();
      const p = make("p"), ni = make("img");
      ni.setAttribute("src", `/.attachments/${name}`);
      ni.setAttribute("alt", clean(img?.getAttribute("alt") || ""));
      p.appendChild(ni); frag.appendChild(p);
      const fc = n.querySelector("figcaption");
      if (fc) {
        const c = fc.cloneNode(true);
        const ol = c.querySelector("ol");
        let steps = null;
        if (ol) { steps = ol.cloneNode(true); ol.remove(); }
        const cap = clean(c.textContent);
        if (cap) frag.appendChild(italicP(cap));
        if (steps) frag.appendChild(steps);
      }
      n.replaceWith(frag);
    }],

    [".callout", (n) => {
      const type = n.classList.contains("tip") ? "Tip" : n.classList.contains("warn") ? "Warning" : "Info";
      const co = n.querySelector(".co-body") || n;
      const strong = co.querySelector("strong");
      const title = strong ? clean(strong.textContent) : "";
      if (strong) strong.remove();
      const bq = make("blockquote"), head = make("p"), hs = make("strong", title ? `${type}: ${title}` : type);
      head.appendChild(hs); bq.appendChild(head);
      while (co.firstChild) bq.appendChild(co.firstChild);
      n.replaceWith(bq);
    }],

    [".feature-row", (n) => {
      const rows = [...n.querySelectorAll(".feature")].map(
        (f) => `${clean(f.querySelector(".fnum")?.textContent)} | ${clean(f.querySelector(".flabel")?.textContent)}`
      );
      const pre = make("pre"), code = make("code", rows.join("\n"));
      code.className = "language-stats"; pre.appendChild(code); n.replaceWith(pre);
    }],

    [".flow-chain", (n) => {
      const p = make("p"); p.appendChild(make("strong", "Flow:")); p.appendChild(doc.createTextNode(" "));
      [...n.querySelectorAll(".node")].forEach((x, i) => {
        if (i) p.appendChild(doc.createTextNode(" → "));
        p.appendChild(make("code", clean(x.textContent)));
      });
      n.replaceWith(p);
    }],

    [".handler-card", (n) => {
      const head = n.querySelector(".h-head");
      const frag = doc.createDocumentFragment();
      frag.appendChild(make("h3", clean(head?.querySelector("code")?.textContent || "")));
      const badges = [...(head?.querySelectorAll(".badge") || [])].map((b) => clean(b.textContent));
      const purpose = clean(n.querySelector(".h-purpose")?.textContent || "");
      const meta = [badges.join(" · "), purpose].filter(Boolean).join(" — ");
      if (meta) frag.appendChild(italicP(meta));
      const body = n.querySelector(".h-body");
      if (body) while (body.firstChild) frag.appendChild(body.firstChild);
      n.replaceWith(frag);
    }],

    [".tabs", (n) => {
      const labels = [...n.querySelectorAll(".tab-btns .tab-btn")].map((b) => clean(b.textContent));
      const frag = doc.createDocumentFragment();
      [...n.querySelectorAll(".tab-panel")].forEach((pl, i) => {
        frag.appendChild(make("h4", labels[i] || `Tab ${i + 1}`));
        while (pl.firstChild) frag.appendChild(pl.firstChild);
      });
      n.replaceWith(frag);
    }],

    [".mock", (n) => {
      const bar = clean(n.querySelector(".mock-bar")?.textContent || "");
      const fields = [...n.querySelectorAll(".mock-field")];
      const frag = doc.createDocumentFragment();
      if (bar) { const p = make("p"); p.appendChild(make("strong", bar)); frag.appendChild(p); }
      if (fields.length) {
        const table = make("table");
        const thead = make("thead"); thead.innerHTML = "<tr><th>Field</th><th>Value</th></tr>";
        const tbody = make("tbody");
        for (const f of fields) {
          const tr = make("tr");
          tr.appendChild(make("td", clean(f.querySelector(".mf-label")?.textContent || "")));
          tr.appendChild(make("td", clean(f.querySelector(".mf-val")?.textContent || "")));
          tbody.appendChild(tr);
        }
        table.appendChild(thead); table.appendChild(tbody); frag.appendChild(table);
      } else {
        const body = n.querySelector(".mock-body") || n;
        [...body.childNodes].forEach((c) => { if (!(c.nodeType === 1 && c.classList?.contains("mock-bar"))) frag.appendChild(c); });
      }
      n.replaceWith(frag);
    }],

    [".info-card", (n) => {
      const h4 = clean(n.querySelector("h4")?.textContent || "");
      const sub = clean(n.querySelector(".ic-sub")?.textContent || "");
      const p = n.querySelector("p");
      const frag = doc.createDocumentFragment();
      frag.appendChild(make("h4", sub ? `${h4} — ${sub}` : h4));
      if (p) { const np = make("p"); while (p.firstChild) np.appendChild(p.firstChild); frag.appendChild(np); }
      n.replaceWith(frag);
    }],

    [".badge", (n) => {
      const t = clean(n.textContent);
      if (/^(in|out|in\s*\/\s*out)$/i.test(t)) n.replaceWith(doc.createTextNode(t.replace(/\s*\/\s*/, " / ")));
      else n.replaceWith(make("code", t));
    }],

    [".source-link", (n) => {
      const href = n.getAttribute ? n.getAttribute("href") : null;
      const b = n.querySelector("b");
      const title = clean(b?.textContent || "");
      const desc = clean(b?.parentElement?.querySelector("span")?.textContent || "");
      if (href) {
        const p = make("p"), a = make("a");
        a.setAttribute("href", `/.attachments/${href.split("/").pop()}`);
        a.textContent = desc ? `${title} — ${desc}` : title;
        p.appendChild(a); n.replaceWith(p);
      } else {
        n.remove(); // decorative descriptor (repeated by the cards below)
      }
    }],

    [".diagram,.table-wrap,.card-grid,.mock-body,.doc-layout,.content-col,.h-meta,.mock-field,.source-links,.two-col", (n) => unwrap(n)],
  ];

  let changed = true, guard = 0;
  while (changed && guard++ < 60) {
    changed = false;
    for (const [sel, fn] of transforms) {
      let n;
      while ((n = root.querySelector(sel))) { fn(n); changed = true; }
    }
  }
}

// ============================================================
//  turndown (residual clean HTML -> Markdown)
// ============================================================
function makeTurndown() {
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "*",
    strongDelimiter: "**",
    hr: "---",
    linkStyle: "inlined",
  });
  td.use(gfm);
  td.addRule("stripSvg", { filter: (n) => n.nodeName.toLowerCase() === "svg", replacement: () => "" });
  return td;
}

// ---------- helpers ----------
function clean(s) {
  return String(s).replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function rewriteLinks(md, fromFolder, idMap) {
  return md
    .replace(/\]\(#([A-Za-z0-9_-]+)\)/g, (m, id) => {
      const t = idMap.get(id);
      if (!t) return m;
      const rel = t.folder === fromFolder ? `${t.base}.md` : `../${t.folder}/${t.base}.md`;
      return `](${rel})`;
    })
    .replace(/\]\(assets\/screens\//g, "](/.attachments/")
    .replace(/\]\(assets\//g, "](/.attachments/");
}

function tidy(md) {
  return md.replace(/\u00a0/g, " ").replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
}

function buildHome(groups) {
  const lines = [
    "<!-- nav: Home | id: home -->",
    "# 9A Smart Connect — User & Technical Manual",
    "",
    "Welcome to the **9A Smart Connect** manual. 9A Smart Connect is the information-integration",
    "framework that connects Microsoft Dynamics 365 Finance & Operations to the outside world —",
    "files, APIs, EDI, e-invoicing and cloud storage — through one consistent, configurable model.",
    "",
    "> **Tip: How this wiki is organised**",
    "> The pages below are grouped exactly like the manual. Edit any page and the pipeline",
    "> regenerates the branded single-page HTML automatically.",
    "",
    "## Contents",
    "",
  ];
  for (const g of groups) {
    lines.push(`### ${g.label}`, "");
    for (const it of g.items) lines.push(`- [${it.nav}](${g.folder}/${it.base}.md)`);
    lines.push("");
  }
  return lines.join("\n");
}

main();
