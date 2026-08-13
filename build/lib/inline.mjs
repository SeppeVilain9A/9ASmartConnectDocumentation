// ============================================================
//  Inline every asset into a single portable .html file
//  (CSS, app.js, mermaid.js, logos, favicon and screenshots as
//  data URIs). Mirrors the original build.ps1 behaviour.
// ============================================================
import fs from "node:fs";
import path from "node:path";

const replaceAll = (str, find, repl) => str.split(find).join(repl);
const b64 = (p) => fs.readFileSync(p).toString("base64");
const pngUri = (p) => "data:image/png;base64," + b64(p);

export function inlineAssets(html, assetsDir, screensDir) {
  const css = fs.readFileSync(path.join(assetsDir, "styles.css"), "utf8");
  const app = fs.readFileSync(path.join(assetsDir, "app.js"), "utf8");
  const mer = fs.readFileSync(path.join(assetsDir, "mermaid.min.js"), "utf8");

  const logo = pngUri(path.join(assetsDir, "9a-logo.png"));
  const logoW = pngUri(path.join(assetsDir, "9a-logo-white.png"));
  const favicon = pngUri(path.join(assetsDir, "favicon.png"));

  html = replaceAll(html, '<link rel="stylesheet" href="assets/styles.css" />', `<style>\n${css}\n</style>`);
  html = replaceAll(html, '<script src="assets/mermaid.min.js"></script>', `<script>\n${mer}\n</script>`);
  html = replaceAll(html, '<script src="assets/app.js"></script>', `<script>\n${app}\n</script>`);

  html = replaceAll(html, 'href="assets/favicon.png"', `href="${favicon}"`);
  html = replaceAll(html, '"assets/9a-logo-white.png"', `"${logoW}"`);
  html = replaceAll(html, '"assets/9a-logo.png"', `"${logo}"`);
  html = replaceAll(html, 'url("9a-logo-white.png")', `url("${logoW}")`);

  if (fs.existsSync(screensDir)) {
    for (const f of fs.readdirSync(screensDir)) {
      if (!/\.png$/i.test(f)) continue;
      const uri = pngUri(path.join(screensDir, f));
      html = replaceAll(html, `"assets/screens/${f}"`, `"${uri}"`);
    }
  }
  return html;
}
