// ============================================================
//  Scan the F&O metadata (D365 Ax* object XML) into a flat manifest
//  the docs change-tracker can diff. One entry per object file:
//    { module, type, name, key, sha256, mtime, relPath }
//  key = "<Type>/<Name>" (e.g. "AxClass/NANConnecterAPI").
// ============================================================
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// workspaceRoot is three levels above /build (…/wiki/build/lib -> …/wiki -> …/Smart Connect -> …/Documentation -> workspace)
export function resolveWorkspaceRoot(buildDir) {
  // buildDir = …/Documentation/Smart Connect/wiki/build
  return path.resolve(buildDir, "..", "..", "..", "..");
}

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

// Recursively collect *.xml under a directory.
function walkXml(dir, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) walkXml(abs, out);
    else if (e.isFile() && e.name.toLowerCase().endsWith(".xml")) out.push(abs);
  }
  return out;
}

// Find every "AxSomething" object-type folder under a module's branch metadata.
// Layout: <root>/<branch>/metadata/<Descriptor-or-model>/<model>/Ax*/**.xml
function findAxFolders(moduleBranchDir) {
  const found = [];
  const metaDir = path.join(moduleBranchDir, "metadata");
  if (!fs.existsSync(metaDir)) return found;
  // metadata/<pkg>/<model>/Ax*  — walk two levels then pick Ax* dirs.
  for (const pkg of safeDirs(metaDir)) {
    const pkgDir = path.join(metaDir, pkg);
    for (const model of safeDirs(pkgDir)) {
      if (model === "Descriptor") continue;
      const modelDir = path.join(pkgDir, model);
      for (const child of safeDirs(modelDir)) {
        if (/^Ax/.test(child)) found.push({ type: child, dir: path.join(modelDir, child) });
      }
    }
  }
  return found;
}

function safeDirs(dir) {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch {
    return [];
  }
}

// Scan all configured modules -> { objects: [...], warnings: [...], scannedAt }
export function scanFoCode(config, workspaceRoot) {
  const ignoreTypes = new Set(config.ignoreObjectTypes || []);
  const objects = [];
  const warnings = [];

  for (const mod of config.modules) {
    const branchDir = path.join(workspaceRoot, mod.root, config.branch);
    if (!fs.existsSync(branchDir)) {
      warnings.push(`module "${mod.id}" (${mod.label}): branch "${config.branch}" not found at ${mod.root}/${config.branch} — skipped`);
      continue;
    }
    const axFolders = findAxFolders(branchDir);
    if (!axFolders.length) {
      warnings.push(`module "${mod.id}": no Ax* object folders under ${mod.root}/${config.branch}/metadata — skipped`);
      continue;
    }
    let count = 0;
    for (const { type, dir } of axFolders) {
      if (ignoreTypes.has(type)) continue;
      for (const file of walkXml(dir, [])) {
        const name = path.basename(file, ".xml");
        const buf = fs.readFileSync(file);
        objects.push({
          module: mod.id,
          type,
          name,
          key: `${type}/${name}`,
          sha256: sha256(buf),
          mtime: fs.statSync(file).mtimeMs,
          relPath: path.relative(workspaceRoot, file).split(path.sep).join("/"),
        });
        count++;
      }
    }
    if (!count) warnings.push(`module "${mod.id}": 0 objects scanned`);
  }

  objects.sort((a, b) => (a.module + a.key).localeCompare(b.module + b.key));
  return { scannedAt: new Date().toISOString(), branch: config.branch, objects, warnings };
}

// Diff a fresh scan against a baseline manifest. Returns grouped changes.
export function diffManifests(baseline, current) {
  const baseMap = new Map((baseline.objects || []).map((o) => [o.module + "\u0000" + o.key, o]));
  const curMap = new Map(current.objects.map((o) => [o.module + "\u0000" + o.key, o]));

  const added = [];
  const modified = [];
  const removed = [];

  for (const [k, o] of curMap) {
    const prev = baseMap.get(k);
    if (!prev) added.push(o);
    else if (prev.sha256 !== o.sha256) modified.push(o);
  }
  for (const [k, o] of baseMap) {
    if (!curMap.has(k)) removed.push(o);
  }

  const sortKey = (o) => o.module + o.key;
  added.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  modified.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  removed.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  return { added, modified, removed };
}

// Map one object to the docs pages that must be reviewed.
export function pagesForObject(obj, config) {
  for (const rule of config.mapping || []) {
    if (new RegExp(rule.match, "i").test(obj.key)) return rule.pages.slice();
  }
  const fallback = (config.modulePages && config.modulePages[obj.module]) || [];
  return fallback.slice();
}
