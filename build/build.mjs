// ============================================================
//  9A Smart Connect — wiki -> HTML build.
//  Reads the /docs code-wiki + /build/assets and regenerates the
//  branded manual as:
//    site/index.html            (+ site/assets/*)  — multi-file
//    site/<singleFileName>.html                    — fully inlined
//
//  Usage:  node build/build.mjs
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDocs, makeResolvers } from "./lib/docs.mjs";
import { createMarkdown } from "./lib/markdown.mjs";
import { renderSidebar, renderSections, renderShell } from "./lib/template.mjs";
import { inlineAssets } from "./lib/inline.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const docsDir = path.join(repoRoot, "docs");
const assetsDir = path.join(__dirname, "assets");
const screensSrc = path.join(docsDir, ".attachments");
const siteDir = path.join(repoRoot, "site");
const siteAssets = path.join(siteDir, "assets");
const siteScreens = path.join(siteAssets, "screens");

function main() {
  const t0 = Date.now();
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, "site.config.json"), "utf8"));

  console.log("Loading wiki from /docs …");
  const model = loadDocs(docsDir, config);
  const nSections = model.groups.reduce((n, g) => n + g.sections.length, 0);
  console.log(`  ${model.groups.length} groups · ${nSections} sections`);
  if (!nSections) {
    console.warn("  ! No sections found. Run `npm run migrate` first, or check /docs.");
  }

  const { resolveLink, resolveImage } = makeResolvers(model);
  const md = createMarkdown({ resolveLink, resolveImage });

  console.log("Rendering …");
  const sidebar = renderSidebar(model.groups);
  const sections = renderSections(md, model.groups);
  const firstId = model.groups[0]?.sections[0]?.id || "top";
  const html = renderShell(config, { sidebar, sections, firstId });

  // ---- Write the multi-file site ----
  fs.rmSync(siteDir, { recursive: true, force: true });
  fs.mkdirSync(siteAssets, { recursive: true });
  fs.mkdirSync(siteScreens, { recursive: true });
  for (const f of fs.readdirSync(assetsDir)) {
    fs.copyFileSync(path.join(assetsDir, f), path.join(siteAssets, f));
  }
  let nShots = 0;
  if (fs.existsSync(screensSrc)) {
    for (const f of fs.readdirSync(screensSrc)) {
      const src = path.join(screensSrc, f);
      if (!fs.statSync(src).isFile()) continue;
      fs.copyFileSync(src, path.join(siteScreens, f));
      if (/\.png$/i.test(f)) nShots++;
    }
  }
  const indexPath = path.join(siteDir, "index.html");
  fs.writeFileSync(indexPath, html, "utf8");

  // ---- Write the fully inlined single file ----
  const single = inlineAssets(html, assetsDir, screensSrc);
  const singlePath = path.join(siteDir, config.singleFileName || "manual.html");
  fs.writeFileSync(singlePath, single, "utf8");

  const kb = (p) => (fs.statSync(p).size / 1024).toFixed(0);
  console.log(`  copied ${nShots} screenshot(s)`);
  console.log(`Wrote:`);
  console.log(`  site/index.html                    (${kb(indexPath)} KB + assets)`);
  console.log(`  site/${path.basename(singlePath)}   (${kb(singlePath)} KB, self-contained)`);
  console.log(`Done in ${Date.now() - t0} ms.`);
}

main();
