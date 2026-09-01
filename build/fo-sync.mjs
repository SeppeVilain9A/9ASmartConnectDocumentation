// ============================================================
//  F&O code -> docs change tracker (CLI).
//
//    node build/fo-sync.mjs --baseline   Write build/fo-baseline.json from the
//                                         current code (the "documented" snapshot).
//    node build/fo-sync.mjs              Diff current code vs the baseline and
//                                         print a review report; also writes
//                                         build/fo-changes.json for the agent.
//
//  No git, no doc edits — this only inspects the metadata and reports.
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scanFoCode, diffManifests, pagesForObject, resolveWorkspaceRoot } from "./lib/foscan.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = __dirname;
const configPath = path.join(buildDir, "fo-config.json");
const baselinePath = path.join(buildDir, "fo-baseline.json");
const changesPath = path.join(buildDir, "fo-changes.json");

function loadConfig() {
  const raw = JSON.parse(fs.readFileSync(configPath, "utf8"));
  // strip "//" doc keys
  return raw;
}

function writeBaseline(config, workspaceRoot) {
  const scan = scanFoCode(config, workspaceRoot);
  fs.writeFileSync(baselinePath, JSON.stringify(scan, null, 2) + "\n", "utf8");
  console.log(`Baseline written: build/fo-baseline.json`);
  console.log(`  ${scan.objects.length} objects across ${config.modules.length} configured module(s), branch "${scan.branch}"`);
  for (const w of scan.warnings) console.warn(`  ! ${w}`);
  summariseByModuleType(scan.objects);
}

function summariseByModuleType(objects) {
  const byMod = {};
  for (const o of objects) {
    byMod[o.module] = byMod[o.module] || {};
    byMod[o.module][o.type] = (byMod[o.module][o.type] || 0) + 1;
  }
  for (const mod of Object.keys(byMod).sort()) {
    const parts = Object.entries(byMod[mod]).sort().map(([t, n]) => `${t}:${n}`).join("  ");
    console.log(`    ${mod}  —  ${parts}`);
  }
}

function reportDiff(config, workspaceRoot) {
  if (!fs.existsSync(baselinePath)) {
    console.error("No baseline found. Run `npm run baseline:fo` first (ideally before merging new code).");
    process.exit(2);
  }
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  const current = scanFoCode(config, workspaceRoot);
  const { added, modified, removed } = diffManifests(baseline, current);

  for (const w of current.warnings) console.warn(`! ${w}`);

  const withPages = (arr) => arr.map((o) => ({ ...o, pages: pagesForObject(o, config) }));
  const changes = {
    baselineAt: baseline.scannedAt,
    comparedAt: current.scannedAt,
    branch: current.branch,
    counts: { added: added.length, modified: modified.length, removed: removed.length },
    added: withPages(added),
    modified: withPages(modified),
    removed: withPages(removed),
  };
  fs.writeFileSync(changesPath, JSON.stringify(changes, null, 2) + "\n", "utf8");

  const total = added.length + modified.length + removed.length;
  console.log("");
  console.log("=== F&O → docs change report ===");
  console.log(`Baseline: ${baseline.scannedAt}`);
  console.log(`Current:  ${current.scannedAt}  (branch "${current.branch}")`);
  console.log(`Added ${added.length} · Modified ${modified.length} · Removed ${removed.length}`);
  if (!total) {
    console.log("\nNo code changes vs baseline. Documentation is up to date.");
    console.log("\nDetails written to build/fo-changes.json");
    return;
  }

  printSection("ADDED", changes.added);
  printSection("MODIFIED", changes.modified);
  printSection("REMOVED", changes.removed);

  const pages = new Set();
  for (const o of [...changes.added, ...changes.modified, ...changes.removed]) o.pages.forEach((p) => pages.add(p));
  console.log("\nPages to review/update:");
  [...pages].sort().forEach((p) => console.log(`  - docs/${p}`));
  console.log("\nDetails written to build/fo-changes.json");
}

function printSection(title, arr) {
  if (!arr.length) return;
  console.log(`\n${title} (${arr.length}):`);
  for (const o of arr) {
    console.log(`  [${o.module}] ${o.key}`);
    if (o.pages.length) console.log(`        -> ${o.pages.join(", ")}`);
  }
}

function main() {
  const config = loadConfig();
  const workspaceRoot = resolveWorkspaceRoot(buildDir);
  const wantBaseline = process.argv.includes("--baseline");
  if (wantBaseline) writeBaseline(config, workspaceRoot);
  else reportDiff(config, workspaceRoot);
}

main();
