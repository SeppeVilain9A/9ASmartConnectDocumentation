// ============================================================
//  Markdown -> branded HTML for 9A Smart Connect.
//  A markdown-it instance plus a small set of custom rules that
//  map clean, wiki-native Markdown onto the manual's design system:
//
//    ```mermaid fence              -> <div class="diagram"><pre class="mermaid">
//    ```stats fence                -> <div class="feature-row"> stat tiles
//    image-only paragraph          -> <figure class="screenshot">
//    *italic* line after image/dgm -> <figcaption> / <div class="diagram-cap">
//    > **Info: ...** blockquote     -> <div class="callout info">
//    tables                        -> wrapped in <div class="table-wrap">
//    table cell exactly in/out      -> <span class="badge in|out|both">
//    [text](Page.md) / #id links    -> in-page #anchor links
// ============================================================
import MarkdownIt from "markdown-it";
import { escapeHtml, escapeAttr } from "./util.mjs";

const CALLOUT_ICONS = {
  info: '<svg class="co-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  tip: '<svg class="co-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  warn: '<svg class="co-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
};

const CAMERA_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';

const CALLOUT_RE = /^\s*(info|tip|note|warning|warn)\b\s*(?:[—:\u2013-]\s*)?/i;

/**
 * Create a configured markdown-it renderer.
 * @param {object} opts
 * @param {(href:string)=>{href:string,external?:boolean}} opts.resolveLink
 * @param {(src:string)=>string} opts.resolveImage
 * @param {string} [opts.shotBadge] label for the screenshot badge
 */
export function createMarkdown({ resolveLink, resolveImage, shotBadge = "Live screenshot" }) {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: false,
    typographer: false,
  });

  // ---- Fenced blocks: mermaid, stats, plain code ----
  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx];
    const info = (token.info || "").trim().split(/\s+/)[0].toLowerCase();
    if (info === "mermaid") {
      return `<div class="diagram"><pre class="mermaid">\n${escapeHtml(token.content)}</pre></div>\n`;
    }
    if (info === "stats") {
      return renderStats(token.content);
    }
    const cls = info ? ` class="language-${escapeAttr(info)}"` : "";
    return `<pre><code${cls}>${escapeHtml(token.content)}</code></pre>\n`;
  };

  // ---- Inline images (non-figure): just resolve the src ----
  const defaultImage =
    md.renderer.rules.image ||
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const si = token.attrIndex("src");
    if (si >= 0) token.attrs[si][1] = resolveImage(token.attrs[si][1]);
    return defaultImage(tokens, idx, options, env, self);
  };

  // ---- Links: rewrite wiki links to in-page anchors ----
  const defaultLinkOpen =
    md.renderer.rules.link_open ||
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const hi = token.attrIndex("href");
    if (hi >= 0) {
      const res = resolveLink(token.attrs[hi][1]);
      token.attrs[hi][1] = res.href;
      if (res.external) {
        token.attrSet("target", "_blank");
        token.attrSet("rel", "noopener noreferrer");
      }
    }
    return defaultLinkOpen(tokens, idx, options, env, self);
  };

  // ---- Block transforms: figures, captions, callouts ----
  md.core.ruler.push("sc_blocks", (state) => {
    const t = state.tokens;
    const out = [];
    for (let i = 0; i < t.length; i++) {
      const tok = t[i];

      // Mermaid diagram: pick up a following italic caption as .diagram-cap
      if (tok.type === "fence" && (tok.info || "").trim().toLowerCase().split(/\s+/)[0] === "mermaid") {
        out.push(tok);
        const cap = readCaption(state, t, i + 1);
        if (cap) {
          out.push(htmlBlock(state, `<div class="diagram-cap">${cap.html}</div>\n`));
          i = cap.next - 1;
        }
        continue;
      }

      // Figure: a paragraph whose only content is an image
      if (
        tok.type === "paragraph_open" &&
        t[i + 1] && t[i + 1].type === "inline" &&
        t[i + 2] && t[i + 2].type === "paragraph_close"
      ) {
        const img = imageOnly(t[i + 1]);
        if (img) {
          const src = resolveImage(img.attrGet("src") || "");
          const alt = img.content || img.attrGet("alt") || "";
          let capHtml = "";
          let next = i + 3;
          const cap = readCaption(state, t, next);
          if (cap) { capHtml = cap.html; next = cap.next; }
          out.push(htmlBlock(state, buildFigure(src, alt, capHtml, shotBadge)));
          i = next - 1;
          continue;
        }
      }

      // Callout: a blockquote led by **Info: / Tip: / Warning: / Note:**
      if (tok.type === "blockquote_open") {
        const end = matchClose(t, i, "blockquote_open", "blockquote_close");
        const info = detectCallout(t, i);
        if (info) {
          applyCalloutInner(t, i, info);
          out.push(htmlBlock(state, `<div class="callout ${info.type}">${CALLOUT_ICONS[info.type]}<div class="co-body">`));
          for (let k = i + 1; k < end; k++) out.push(t[k]);
          out.push(htmlBlock(state, `</div></div>\n`));
          i = end;
          continue;
        }
      }

      out.push(tok);
    }
    state.tokens = out;
  });

  /** Render a page body (already stripped of front-matter and the H1 title). */
  md.renderBody = (markdown, env = {}) => {
    let html = md.render(markdown, env);
    html = html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, "</table></div>");
    html = html.replace(
      /<td>\s*(in|out|in\s*\/\s*out)\s*<\/td>/gi,
      (_m, v) => {
        const t = v.replace(/\s+/g, " ").toLowerCase();
        if (t === "in") return '<td><span class="badge in">in</span></td>';
        if (t === "out") return '<td><span class="badge out">out</span></td>';
        return '<td><span class="badge both">in / out</span></td>';
      }
    );
    return html;
  };

  return md;
}

// ---------- helpers ----------

function renderStats(content) {
  const tiles = content
    .trim()
    .split("\n")
    .map((l) => l.split("|").map((s) => s.trim()))
    .filter((r) => r.length >= 2 && r[0])
    .map(
      ([num, label]) =>
        `<div class="feature"><div class="fnum">${escapeHtml(num)}</div><div class="flabel">${escapeHtml(label)}</div></div>`
    )
    .join("");
  return `<div class="feature-row">${tiles}</div>\n`;
}

function buildFigure(src, alt, capHtml, badgeLabel) {
  const badge = `<span class="shot-badge">${CAMERA_SVG}${escapeHtml(badgeLabel)}</span>`;
  const fc = capHtml ? `<figcaption>${capHtml}</figcaption>` : "";
  return `<figure class="screenshot">${badge}<img class="zoomable" src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy" />${fc}</figure>\n`;
}

function htmlBlock(state, html) {
  const tok = new state.Token("html_block", "", 0);
  tok.content = html;
  tok.block = true;
  return tok;
}

function matchClose(tokens, openIdx, openType, closeType) {
  let depth = 0;
  for (let k = openIdx; k < tokens.length; k++) {
    if (tokens[k].type === openType) depth++;
    else if (tokens[k].type === closeType && --depth === 0) return k;
  }
  return tokens.length - 1;
}

function meaningful(kids) {
  return kids.filter((k) => k.type !== "softbreak" && k.type !== "hardbreak" && !(k.type === "text" && !k.content.trim()));
}

function imageOnly(inline) {
  if (!inline.children) return null;
  const f = meaningful(inline.children);
  return f.length === 1 && f[0].type === "image" ? f[0] : null;
}

function readCaption(state, tokens, idx) {
  const pOpen = tokens[idx], inline = tokens[idx + 1], pClose = tokens[idx + 2];
  if (!pOpen || pOpen.type !== "paragraph_open") return null;
  if (!inline || inline.type !== "inline") return null;
  if (!pClose || pClose.type !== "paragraph_close") return null;
  const f = meaningful(inline.children);
  if (f.length < 2 || f[0].type !== "em_open" || f[f.length - 1].type !== "em_close") return null;
  const start = inline.children.indexOf(f[0]);
  const end = inline.children.lastIndexOf(f[f.length - 1]);
  const inner = inline.children.slice(start + 1, end);
  const html = state.md.renderer.renderInline(inner, state.md.options, state.env);
  return { html, next: idx + 3 };
}

function detectCallout(tokens, openIdx) {
  const pOpen = tokens[openIdx + 1];
  const inline = tokens[openIdx + 2];
  if (!pOpen || pOpen.type !== "paragraph_open") return null;
  if (!inline || inline.type !== "inline" || !inline.children) return null;
  const kids = inline.children;
  let p = 0;
  while (p < kids.length && kids[p].type === "text" && !kids[p].content.trim()) p++;
  if (p >= kids.length || kids[p].type !== "strong_open") return null;
  const textTok = kids[p + 1];
  if (!textTok || textTok.type !== "text") return null;
  const m = CALLOUT_RE.exec(textTok.content);
  if (!m) return null;
  const kw = m[1].toLowerCase();
  const type = kw === "tip" ? "tip" : kw === "warn" || kw === "warning" ? "warn" : "info";
  return { type, strongPos: p, textTok, prefixLen: m[0].length };
}

function applyCalloutInner(tokens, openIdx, info) {
  const paraOpen = tokens[openIdx + 1];
  const paraClose = tokens[openIdx + 3];
  const kids = tokens[openIdx + 2].children;
  const p = info.strongPos;
  // strip the "Info:/Tip:/..." keyword from the title
  info.textTok.content = info.textTok.content.slice(info.prefixLen);
  let c = p + 1;
  while (c < kids.length && kids[c].type !== "strong_close") c++;
  const titleText = kids.slice(p + 1, c).map((k) => k.content || "").join("").trim();
  const rest = kids.slice(c + 1).map((k) => k.content || "").join("").trim();
  if (!titleText) {
    for (let k = p; k <= c && k < kids.length; k++) {
      kids[k].type = "text"; kids[k].tag = ""; kids[k].nesting = 0; kids[k].content = "";
    }
  }
  // Title-only first line (blank line before body) -> render as bare <strong>, no <p>
  if (!rest && paraOpen && paraClose) {
    paraOpen.hidden = true;
    paraClose.hidden = true;
  }
}
