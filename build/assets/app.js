/* ============================================================
   9A Smart Connect — Manual interactivity
   ============================================================ */
(function () {
    "use strict";

    /* ---------- Theme ---------- */
    var root = document.documentElement;
    var stored = localStorage.getItem("sc-theme");
    if (stored) root.setAttribute("data-theme", stored);
    else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.setAttribute("data-theme", "dark");
    }

    function toggleTheme() {
        var cur = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
        var next = cur === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem("sc-theme", next);
    }
    var themeBtn = document.getElementById("themeToggle");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

    /* ---------- Mobile nav ---------- */
    var navToggle = document.getElementById("navToggle");
    var scrim = document.querySelector(".scrim");
    function closeNav() { document.body.classList.remove("nav-open"); }
    if (navToggle) navToggle.addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
    if (scrim) scrim.addEventListener("click", closeNav);

    /* ---------- Collapsible nav groups ---------- */
    document.querySelectorAll(".nav-group-title").forEach(function (btn) {
        btn.addEventListener("click", function () {
            btn.closest(".nav-group").classList.toggle("collapsed");
        });
    });

    /* ---------- Smooth close nav on link click (mobile) ---------- */
    var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-list a"));
    navLinks.forEach(function (a) {
        a.addEventListener("click", function () { if (window.innerWidth <= 860) closeNav(); });
    });

    /* ---------- Scrollspy ---------- */
    var sections = Array.prototype.slice.call(document.querySelectorAll("section.doc"));
    var linkById = {};
    navLinks.forEach(function (a) {
        var id = a.getAttribute("href");
        if (id && id.charAt(0) === "#") linkById[id.slice(1)] = a;
    });

    function setActive(id) {
        navLinks.forEach(function (a) { a.classList.remove("active"); });
        var link = linkById[id];
        if (link) {
            link.classList.add("active");
            var grp = link.closest(".nav-group");
            if (grp && grp.classList.contains("collapsed")) grp.classList.remove("collapsed");
            // keep the active link visible by scrolling ONLY the sidebar (never the window)
            var sb = document.querySelector(".sidebar");
            if (sb) {
                var lr = link.getBoundingClientRect();
                var sr = sb.getBoundingClientRect();
                if (lr.top < sr.top + 56) sb.scrollTop -= (sr.top + 56 - lr.top);
                else if (lr.bottom > sr.bottom - 16) sb.scrollTop += (lr.bottom - (sr.bottom - 16));
            }
        }
    }

    if ("IntersectionObserver" in window) {
        var ticking = false;
        function updateActive() {
            ticking = false;
            if (!sections.length) return;
            var offset = 96; // fixed header + breathing room
            var current = sections[0].id;
            for (var i = 0; i < sections.length; i++) {
                if (sections[i].getBoundingClientRect().top - offset <= 0) current = sections[i].id;
                else break;
            }
            // when scrolled to the very bottom, force-select the last section
            if (window.innerHeight + Math.ceil(window.scrollY) >= document.documentElement.scrollHeight - 2) {
                current = sections[sections.length - 1].id;
            }
            setActive(current);
        }
        function onScroll() {
            if (!ticking) { ticking = true; window.requestAnimationFrame(updateActive); }
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        // run once fonts/diagrams have settled so measurements are correct
        window.addEventListener("load", updateActive);
        updateActive();
    }

    /* ---------- Content search (find words anywhere, jump to them) ---------- */
    var search = document.getElementById("navSearch");
    var sidebar = document.querySelector(".sidebar");
    var resultsBox = document.getElementById("searchResults");
    var HEAD_OFFSET = 92;

    // Build a searchable index of content blocks.
    var searchIndex = [];
    sections.forEach(function (sec) {
        var h2 = sec.querySelector("h2");
        var secTitle = h2 ? h2.textContent.trim() : sec.id;
        var curHead = secTitle;
        sec.querySelectorAll("h2, h3, h4, p, li, td, th, figcaption").forEach(function (el) {
            var tag = el.tagName.toLowerCase();
            if (tag === "h3" || tag === "h4") curHead = el.textContent.trim();
            var text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
            if (text.length < 2) return;
            searchIndex.push({ sec: sec.id, secTitle: secTitle, head: curHead, el: el, lower: text.toLowerCase(), text: text });
        });
    });

    function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
    function escHtml(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

    function clearHighlights() {
        document.querySelectorAll("mark.sc-hit").forEach(function (m) {
            var p = m.parentNode; if (!p) return;
            p.replaceChild(document.createTextNode(m.textContent), m); p.normalize();
        });
        document.querySelectorAll(".sc-flash").forEach(function (e) { e.classList.remove("sc-flash"); });
    }

    function highlightIn(el, terms) {
        if (!terms.length) return;
        var re = new RegExp("(" + terms.map(escRe).join("|") + ")", "ig");
        var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
        var nodes = [], n;
        while ((n = walker.nextNode())) nodes.push(n);
        nodes.forEach(function (node) {
            var val = node.nodeValue; re.lastIndex = 0;
            if (!re.test(val)) return;
            re.lastIndex = 0;
            var frag = document.createDocumentFragment(), last = 0, m;
            while ((m = re.exec(val))) {
                if (m.index > last) frag.appendChild(document.createTextNode(val.slice(last, m.index)));
                var mk = document.createElement("mark"); mk.className = "sc-hit"; mk.textContent = m[0];
                frag.appendChild(mk);
                last = m.index + m[0].length;
                if (m[0].length === 0) re.lastIndex++;
            }
            if (last < val.length) frag.appendChild(document.createTextNode(val.slice(last)));
            if (node.parentNode) node.parentNode.replaceChild(frag, node);
        });
    }

    function jumpTo(rec, terms) {
        clearHighlights();
        highlightIn(rec.el, terms);
        var y = rec.el.getBoundingClientRect().top + window.scrollY - HEAD_OFFSET;
        window.scrollTo({ top: y, behavior: "smooth" });
        rec.el.classList.add("sc-flash");
        setTimeout(function () { rec.el.classList.remove("sc-flash"); }, 2200);
        if (window.innerWidth <= 860) closeNav();
    }

    function makeSnippet(rec, terms) {
        var text = rec.text, lower = rec.lower, idx = -1;
        terms.forEach(function (t) { var i = lower.indexOf(t); if (i >= 0 && (idx < 0 || i < idx)) idx = i; });
        if (idx < 0) idx = 0;
        var start = Math.max(0, idx - 42), end = Math.min(text.length, idx + 96);
        var s = (start > 0 ? "\u2026" : "") + text.slice(start, end) + (end < text.length ? "\u2026" : "");
        var html = escHtml(s);
        terms.forEach(function (t) { html = html.replace(new RegExp("(" + escRe(escHtml(t)) + ")", "ig"), "<mark>$1</mark>"); });
        return html;
    }

    var srItems = [], srActive = -1;
    function hideResults() { if (resultsBox) { resultsBox.hidden = true; resultsBox.innerHTML = ""; } srItems = []; srActive = -1; }

    function setSrActive(i) {
        if (!srItems.length) return;
        if (srActive >= 0 && srItems[srActive]) srItems[srActive].el.classList.remove("active");
        srActive = (i + srItems.length) % srItems.length;
        srItems[srActive].el.classList.add("active");
        srItems[srActive].el.scrollIntoView({ block: "nearest" });
    }

    function updateNav(terms, counts) {
        navLinks.forEach(function (a) {
            var b = a.querySelector(".nav-hits"); if (b) b.remove();
            a.classList.remove("sc-dim");
            if (!terms.length) return;
            var id = (a.getAttribute("href") || "").slice(1);
            var c = counts[id] || 0;
            if (c > 0) {
                var badge = document.createElement("span");
                badge.className = "nav-hits"; badge.textContent = c > 99 ? "99+" : String(c);
                a.appendChild(badge);
                var grp = a.closest(".nav-group"); if (grp) grp.classList.remove("collapsed");
            } else {
                a.classList.add("sc-dim");
            }
        });
    }

    function queryTerms() { return (search ? search.value : "").trim().toLowerCase().split(/\s+/).filter(Boolean); }

    function matchesTerms(rec, terms) {
        for (var t = 0; t < terms.length; t++) { if (rec.lower.indexOf(terms[t]) === -1) return false; }
        return true;
    }

    function runSearch() {
        var terms = queryTerms();
        if (!terms.length) { hideResults(); updateNav([], {}); clearHighlights(); return; }
        var matches = [], counts = {};
        for (var i = 0; i < searchIndex.length; i++) {
            if (matchesTerms(searchIndex[i], terms)) {
                counts[searchIndex[i].sec] = (counts[searchIndex[i].sec] || 0) + 1;
                if (matches.length < 40) matches.push(searchIndex[i]);
            }
        }
        updateNav(terms, counts);
        renderResults(matches, terms);
    }

    function renderResults(matches, terms) {
        if (!resultsBox) return;
        resultsBox.innerHTML = ""; srItems = []; srActive = -1;
        if (!matches.length) {
            resultsBox.innerHTML = '<div class="sr-empty">No matches found</div>';
            resultsBox.hidden = false; return;
        }
        var meta = document.createElement("div"); meta.className = "sr-meta";
        meta.textContent = matches.length + (matches.length === 40 ? "+ results" : (matches.length === 1 ? " result" : " results")) + " \u2014 \u2191\u2193 to move, Enter to open";
        resultsBox.appendChild(meta);
        matches.forEach(function (rec) {
            var it = document.createElement("button");
            it.type = "button"; it.className = "sr-item"; it.setAttribute("role", "option");
            it.innerHTML = '<div class="sr-sec">' + escHtml(rec.secTitle) + (rec.head && rec.head !== rec.secTitle ? " \u203a " + escHtml(rec.head) : "") + "</div>" +
                           '<div class="sr-snip">' + makeSnippet(rec, terms) + "</div>";
            it.addEventListener("click", function () { jumpTo(rec, terms); hideResults(); });
            resultsBox.appendChild(it);
            srItems.push({ el: it, rec: rec });
        });
        resultsBox.hidden = false;
    }

    if (search) {
        search.addEventListener("input", runSearch);
        search.addEventListener("focus", function () { if (search.value.trim()) runSearch(); });
        search.addEventListener("keydown", function (e) {
            if (e.key === "Escape") { search.value = ""; runSearch(); hideResults(); clearHighlights(); search.blur(); }
            else if (e.key === "ArrowDown") { e.preventDefault(); setSrActive(srActive + 1); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setSrActive(srActive - 1); }
            else if (e.key === "Enter") {
                e.preventDefault();
                var pick = srActive >= 0 ? srItems[srActive] : srItems[0];
                if (pick) { jumpTo(pick.rec, queryTerms()); hideResults(); }
            }
        });
    }
    document.addEventListener("click", function (e) {
        if (!resultsBox || resultsBox.hidden) return;
        var wrap = document.querySelector(".header-search-wrap");
        if (wrap && !wrap.contains(e.target)) hideResults();
    });
    // Keyboard shortcut "/" focuses search
    document.addEventListener("keydown", function (e) {
        if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
            e.preventDefault(); if (search) search.focus();
        }
    });
    // Clicking a nav module while searching jumps to the first match inside it
    navLinks.forEach(function (a) {
        a.addEventListener("click", function () {
            var terms = queryTerms(); if (!terms.length) return;
            var id = (a.getAttribute("href") || "").slice(1), first = null;
            for (var i = 0; i < searchIndex.length; i++) {
                if (searchIndex[i].sec === id && matchesTerms(searchIndex[i], terms)) { first = searchIndex[i]; break; }
            }
            if (first) setTimeout(function () { jumpTo(first, terms); }, 70);
        });
    });

    /* ---------- "On this page" rail ---------- */
    (function () {
        var otpList = document.getElementById("otpList");
        var otpWrap = document.getElementById("onThisPage");
        if (!otpList || !sections.length) return;
        var slugSeen = {};
        function slug(s) {
            var base = (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 42) || "sec";
            return base;
        }
        sections.forEach(function (sec) {
            sec.querySelectorAll("h3, h4").forEach(function (h) {
                if (h.id) return;
                var s = sec.id + "-" + slug(h.textContent);
                if (slugSeen[s]) { slugSeen[s]++; s += "-" + slugSeen[s]; } else slugSeen[s] = 1;
                h.id = s;
            });
        });

        var builtFor = null, otpHeads = [], otpAnchors = {};
        function build(secId) {
            var sec = document.getElementById(secId); if (!sec) return;
            otpList.innerHTML = ""; otpHeads = []; otpAnchors = {};
            var heads = sec.querySelectorAll("h3, h4");
            builtFor = secId;
            if (!heads.length) { if (otpWrap) otpWrap.style.visibility = "hidden"; return; }
            if (otpWrap) otpWrap.style.visibility = "";
            heads.forEach(function (h) {
                var li = document.createElement("li");
                if (h.tagName.toLowerCase() === "h4") li.className = "otp-sub";
                var a = document.createElement("a");
                a.href = "#" + h.id; a.textContent = h.textContent;
                li.appendChild(a); otpList.appendChild(li);
                otpHeads.push(h); otpAnchors[h.id] = a;
            });
        }
        function activeSection() {
            var cur = sections[0].id, offset = 100;
            for (var i = 0; i < sections.length; i++) {
                if (sections[i].getBoundingClientRect().top - offset <= 0) cur = sections[i].id; else break;
            }
            if (window.innerHeight + Math.ceil(window.scrollY) >= document.documentElement.scrollHeight - 2)
                cur = sections[sections.length - 1].id;
            return cur;
        }
        function update() {
            var secId = activeSection();
            if (secId !== builtFor) build(secId);
            var activeId = null, offset = 124;
            for (var i = 0; i < otpHeads.length; i++) {
                if (otpHeads[i].getBoundingClientRect().top - offset <= 0) activeId = otpHeads[i].id; else break;
            }
            for (var id in otpAnchors) otpAnchors[id].classList.remove("active");
            if (activeId && otpAnchors[activeId]) otpAnchors[activeId].classList.add("active");
        }
        var ticking = false;
        function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; update(); }); } }
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        window.addEventListener("load", update);
        update();
    })();

    /* ---------- Copy buttons ---------- */
    document.querySelectorAll("pre > code").forEach(function (code) {
        var pre = code.parentNode;
        var btn = document.createElement("button");
        btn.className = "copy-btn";
        btn.type = "button";
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy</span>';
        btn.addEventListener("click", function () {
            var text = code.innerText;
            navigator.clipboard.writeText(text).then(function () {
                btn.querySelector("span").textContent = "Copied!";
                setTimeout(function () { btn.querySelector("span").textContent = "Copy"; }, 1600);
            });
        });
        pre.appendChild(btn);
    });

    /* ---------- Tabs ---------- */
    document.querySelectorAll(".tabs").forEach(function (tabs) {
        var btns = tabs.querySelectorAll(".tab-btn");
        var panels = tabs.querySelectorAll(".tab-panel");
        btns.forEach(function (b, i) {
            b.addEventListener("click", function () {
                btns.forEach(function (x) { x.classList.remove("active"); });
                panels.forEach(function (x) { x.classList.remove("active"); });
                b.classList.add("active");
                if (panels[i]) panels[i].classList.add("active");
                // render any diagrams that were hidden in this tab
                setTimeout(renderVisibleMermaid, 30);
            });
        });
    });

    /* ---------- Back to top ---------- */
    var backTop = document.getElementById("backTop");
    window.addEventListener("scroll", function () {
        if (backTop) backTop.classList.toggle("show", window.scrollY > 600);
    }, { passive: true });
    if (backTop) backTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

    /* ---------- Handler catalogue filter ---------- */
    var handlerFilter = document.getElementById("handlerFilter");
    if (handlerFilter) {
        handlerFilter.addEventListener("input", function () {
            var q = handlerFilter.value.trim().toLowerCase();
            document.querySelectorAll(".handler-card").forEach(function (card) {
                var match = !q || card.textContent.toLowerCase().indexOf(q) !== -1;
                card.classList.toggle("hidden", !match);
            });
        });
    }

    /* ---------- Handler card expand / collapse ---------- */
    document.querySelectorAll(".handler-card").forEach(function (card) {
        var summary = card.querySelector(".h-summary");
        if (!summary) return;
        summary.addEventListener("click", function () {
            card.classList.toggle("open");
        });
    });

    /* ---------- Lightbox (fullscreen diagram / image viewer) ---------- */
    (function () {
        var lb = document.getElementById("lightbox");
        if (!lb) return;
        var stage = document.getElementById("lightboxStage");
        var canvas = document.getElementById("lightboxCanvas");
        var cap = document.getElementById("lightboxCap");
        var scale = 1, baseScale = 1, tx = 0, ty = 0;
        var dragging = false, moved = false, sx = 0, sy = 0;

        function apply() {
            canvas.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + scale + ")";
        }
        function reset() { scale = baseScale; tx = 0; ty = 0; apply(); }
        function zoom(f) { scale = Math.min(Math.max(scale * f, 0.15), 12); apply(); }

        /* Serialize SVG node to a clean data-URL image.
           This completely isolates it from the page's dark-mode CSS. */
        function svgToImg(svgNode, caption) {
            // Inline any computed fill/stroke styles that Mermaid applied via class
            // by first serialising the SVG to markup
            var serializer = new window.XMLSerializer();
            var svgStr = serializer.serializeToString(svgNode);

            // Ensure a white background rect is present
            if (svgStr.indexOf("background:") === -1 && svgStr.indexOf("<rect") === -1) {
                svgStr = svgStr.replace(/<svg([^>]*)>/, "<svg$1><rect width='100%' height='100%' fill='white'/>");
            }

            // Build a blob URL so the browser renders it natively (no page-CSS leakage)
            var blob = new window.Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
            var url = window.URL.createObjectURL(blob);

            var img = new window.Image();
            img.onload = function () {
                window.URL.revokeObjectURL(url);
                // Compute fit-to-viewport scale
                var vw = window.innerWidth, vh = window.innerHeight;
                var natW = img.naturalWidth || svgNode.getBoundingClientRect().width || 800;
                var natH = img.naturalHeight || svgNode.getBoundingClientRect().height || 600;
                baseScale = Math.min((vw * 0.88) / natW, (vh * 0.82) / natH, 3);
                img.style.width = natW + "px";
                img.style.height = natH + "px";
                img.style.maxWidth = "none";
                img.style.maxHeight = "none";
                canvas.innerHTML = "";
                canvas.appendChild(img);
                cap.textContent = caption || "";
                reset();
            };
            img.src = url;
        }

        function open(node, caption) {
            canvas.innerHTML = "";
            lb.classList.add("open");
            document.body.style.overflow = "hidden";
            baseScale = 1; scale = 1; tx = 0; ty = 0;
            if (node.tagName && node.tagName.toLowerCase() === "svg") {
                svgToImg(node, caption);
            } else {
                // Already an image
                var img = node.cloneNode(true);
                img.style.maxWidth = "88vw"; img.style.maxHeight = "82vh";
                canvas.appendChild(img);
                cap.textContent = caption || "";
                reset();
            }
        }
        function close() {
            lb.classList.remove("open");
            document.body.style.overflow = "";
            setTimeout(function () { canvas.innerHTML = ""; }, 250);
        }

        // Attach click handler to every .diagram
        document.querySelectorAll(".diagram").forEach(function (d) {
            d.addEventListener("click", function () {
                var node = d.querySelector("svg") || d.querySelector("img");
                if (!node) return;
                var next = d.nextElementSibling;
                var caption = (next && next.classList.contains("diagram-cap")) ? next.textContent : "";
                open(node, caption);
            });
        });
        document.querySelectorAll("img.zoomable").forEach(function (im) {
            im.addEventListener("click", function () { open(im, im.alt || ""); });
        });

        // Toolbar buttons
        lb.querySelectorAll("[data-lb]").forEach(function (b) {
            b.addEventListener("click", function (e) {
                e.stopPropagation();
                var a = b.getAttribute("data-lb");
                if (a === "close") close();
                else if (a === "reset") reset();
                else if (a === "zoomin") zoom(1.3);
                else if (a === "zoomout") zoom(1 / 1.3);
            });
        });

        // Scroll to zoom
        stage.addEventListener("wheel", function (e) {
            e.preventDefault();
            var f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
            // Zoom toward cursor position
            var rect = canvas.getBoundingClientRect();
            var cx = e.clientX - window.innerWidth / 2;
            var cy = e.clientY - window.innerHeight / 2;
            var prevScale = scale;
            scale = Math.min(Math.max(scale * f, 0.15), 12);
            var sf = scale / prevScale;
            tx = cx - sf * (cx - tx);
            ty = cy - sf * (cy - ty);
            apply();
        }, { passive: false });

        // Drag to pan
        stage.addEventListener("mousedown", function (e) {
            if (e.button !== 0) return;
            dragging = true; moved = false;
            sx = e.clientX - tx; sy = e.clientY - ty;
            stage.classList.add("grabbing");
        });
        window.addEventListener("mousemove", function (e) {
            if (!dragging) return;
            moved = true;
            tx = e.clientX - sx; ty = e.clientY - sy;
            apply();
        });
        window.addEventListener("mouseup", function () { dragging = false; stage.classList.remove("grabbing"); });

        // Double-click to reset
        stage.addEventListener("dblclick", function (e) { if (e.target !== lb) reset(); });

        // Click backdrop to close
        stage.addEventListener("click", function (e) { if (e.target === stage && !moved) close(); moved = false; });

        // Keyboard
        document.addEventListener("keydown", function (e) {
            if (!lb.classList.contains("open")) return;
            if (e.key === "Escape") close();
            else if (e.key === "+" || e.key === "=") zoom(1.3);
            else if (e.key === "-") zoom(1 / 1.3);
            else if (e.key === "0") reset();
        });
    })();

    /* ---------- Mermaid init (lazy, with CDN fallback) ---------- */
    function renderVisibleMermaid() {
        if (typeof mermaid === "undefined" || !mermaid.run) return;
        var nodes = [];
        document.querySelectorAll(".mermaid").forEach(function (m) {
            if (m.getAttribute("data-processed") === "true") return; // already rendered
            if (m.offsetParent === null) return;                     // hidden (e.g. inactive tab)
            nodes.push(m);
        });
        if (nodes.length) { try { mermaid.run({ nodes: nodes }); } catch (e) { console.warn(e); } }
    }
    function initMermaid() {
        if (typeof mermaid === "undefined") return false;
        try {
            mermaid.initialize({
                startOnLoad: false,
                securityLevel: "loose",
                theme: "base",
                themeVariables: {
                    primaryColor: "#eef1fb",
                    primaryBorderColor: "#2549B5",
                    primaryTextColor: "#101d4f",
                    lineColor: "#5b6a9e",
                    secondaryColor: "#e7f6ee",
                    tertiaryColor: "#fdf3e5",
                    fontFamily: "Segoe UI, system-ui, sans-serif",
                    fontSize: "14px"
                },
                flowchart: { curve: "basis", htmlLabels: true, padding: 12 },
                sequence: { actorMargin: 46, mirrorActors: false, useMaxWidth: true },
                er: { useMaxWidth: true }
            });
            return true;
        } catch (err) { console.warn("Mermaid init error", err); return false; }
    }
    if (initMermaid()) {
        renderVisibleMermaid();
    } else {
        // local file missing -> try CDN
        var s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
        s.onload = function () { if (initMermaid()) renderVisibleMermaid(); };
        document.head.appendChild(s);
    }
})();
