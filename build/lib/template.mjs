// ============================================================
//  HTML shell for the generated manual. Reproduces the original
//  index.html chrome (header, sidebar, hero, quick links, footer,
//  lightbox) and injects the generated navigation + sections.
// ============================================================
import { escapeHtml, escapeAttr } from "./util.mjs";

const CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';

const QUICK_ICONS = {
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  connect: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  process: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  help: '<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/><circle cx="12" cy="12" r="10"/>',
};

export function renderSidebar(groups) {
  return groups
    .map((g) => {
      const items = g.sections
        .map((s) => `        <li><a href="#${escapeAttr(s.id)}"><span class="dot"></span>${escapeHtml(s.nav)}</a></li>`)
        .join("\n");
      return `      <div class="nav-group${g.collapsed ? " collapsed" : ""}">
        <button class="nav-group-title">${escapeHtml(g.label)}
          ${CHEV}
        </button>
        <ul class="nav-list">
${items}
        </ul>
      </div>`;
    })
    .join("\n");
}

export function renderSections(md, groups) {
  const out = [];
  for (const g of groups) {
    for (const s of g.sections) {
      const body = md.renderBody(s.body);
      out.push(`      <section id="${escapeAttr(s.id)}" class="doc">
        <h2>${escapeHtml(s.title)}</h2>
${indent(body, 8)}
      </section>`);
    }
  }
  return out.join("\n\n");
}

function renderHero(hero) {
  const meta = (hero.meta || [])
    .map((m) => `                <span>${m.emoji} ${escapeHtml(m.label)}&nbsp;<b>${escapeHtml(m.value)}</b></span>`)
    .join("\n");
  return `                <span class="eyebrow">${escapeHtml(hero.eyebrow)}</span>
                <h1>${escapeHtml(hero.title)}</h1>
                <p>${hero.lead}</p>
                <div class="hero-meta">
${meta}
                </div>`;
}

function renderQuickGrid(quickLinks) {
  return (quickLinks || [])
    .map((q) => {
      const paths = QUICK_ICONS[q.icon] || QUICK_ICONS.info;
      return `                <a class="quick-card" href="${escapeAttr(q.href)}">
                    <div class="qc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${paths}</svg></div>
                    <b>${escapeHtml(q.title)}</b><span>${escapeHtml(q.text)}</span>
                </a>`;
    })
    .join("\n");
}

function indent(text, spaces) {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((l) => (l.length ? pad + l : l))
    .join("\n");
}

export function renderShell(config, { sidebar, sections, firstId }) {
  const b = config.brand;
  return `<!DOCTYPE html>
<html lang="${escapeAttr(config.lang || "en")}" data-theme="${escapeAttr(config.themeDefault || "light")}">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(config.documentTitle)}</title>
    <meta name="description" content="${escapeAttr(config.metaDescription)}" />
    <link rel="icon" type="image/png" href="${escapeAttr(b.favicon)}" />
    <link rel="stylesheet" href="assets/styles.css" />
</head>

<body>
    <a class="skip-link" href="#${escapeAttr(firstId)}">Skip to content</a>

    <header class="app-header">
        <button id="navToggle" class="icon-btn" aria-label="Toggle navigation" title="Menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="brand-lockup">
            <img src="${escapeAttr(b.logo)}" alt="9Altitudes" />
            <span class="brand-divider"></span>
            <span class="brand-title">
                <b>${escapeHtml(b.title)}</b>
                <span>${escapeHtml(b.subtitle)}</span>
            </span>
        </div>
        <div class="header-spacer"></div>
        <div class="header-search-wrap">
            <label class="header-search" title="Search the whole manual (press /)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input id="navSearch" type="search" placeholder="Search the manual…" autocomplete="off" aria-label="Search the manual" />
                <kbd>/</kbd>
            </label>
            <div id="searchResults" class="search-results" role="listbox" aria-label="Search results" hidden></div>
        </div>
        <button id="themeToggle" class="icon-btn" aria-label="Toggle light / dark theme" title="Toggle theme">
            <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/></svg>
        </button>
    </header>

    <div class="scrim"></div>

    <nav class="sidebar" aria-label="Manual navigation">
${sidebar}
        <div class="sidebar-foot">
            ${config.sidebarFoot}
        </div>
    </nav>

    <main class="main">
        <div class="container">

            <div class="hero">
${renderHero(config.hero)}
            </div>

            <div class="quick-grid">
${renderQuickGrid(config.quickLinks)}
            </div>

            <div class="doc-layout">
            <div class="content-col">
${sections}
            </div>
            <aside class="on-this-page" id="onThisPage" aria-label="On this page">
                <div class="otp-head">On this page</div>
                <ul class="otp-list" id="otpList"></ul>
            </aside>
            </div>

            <footer class="doc-foot">
                <span>${escapeHtml(config.footer)}</span>
                <img src="${escapeAttr(b.logo)}" alt="9Altitudes" />
            </footer>

        </div>
    </main>

    <button id="backTop" class="back-top" aria-label="Back to top" title="Back to top">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
    </button>

    <div id="lightbox" class="lightbox" role="dialog" aria-modal="true" aria-label="Diagram viewer">
        <div class="lightbox-hint">
            <span><kbd>scroll</kbd> zoom</span>
            <span><kbd>drag</kbd> pan</span>
            <span><kbd>dbl‑click</kbd> reset</span>
            <span><kbd>Esc</kbd> close</span>
        </div>
        <div class="lightbox-toolbar">
            <button class="lb-btn" data-lb="zoomin"  aria-label="Zoom in"   title="Zoom in (+)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></button>
            <button class="lb-btn" data-lb="zoomout" aria-label="Zoom out"  title="Zoom out (-)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg></button>
            <button class="lb-btn" data-lb="reset"   aria-label="Reset zoom" title="Reset (0)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg></button>
            <span class="lb-sep"></span>
            <button class="lb-btn" data-lb="close"   aria-label="Close" title="Close (Esc)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="lightbox-stage" id="lightboxStage">
            <div class="lightbox-canvas" id="lightboxCanvas"></div>
        </div>
        <div class="lightbox-cap" id="lightboxCap"></div>
    </div>

    <script src="assets/mermaid.min.js"></script>
    <script src="assets/app.js"></script>
</body>

</html>
`;
}
