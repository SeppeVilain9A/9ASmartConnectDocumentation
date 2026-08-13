// Shared helpers for the build and migration scripts.

/** Escape text for use in HTML element content. */
export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Escape text for use inside a double-quoted HTML attribute. */
export function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}

/**
 * Turn a human label into a filesystem/URL-safe slug while keeping it readable.
 * Ampersands become "and"; punctuation is dropped; spaces become dashes.
 * Original casing is preserved so the Azure DevOps wiki tree stays legible.
 *   "Overview & design"     -> "Overview-and-design"
 *   "Queue, events & logs"  -> "Queue-events-and-logs"
 *   "Reporting (ER & SSRS)"  -> "Reporting-ER-and-SSRS"
 */
export function slugify(label) {
  return String(label)
    .replace(/&/g, " and ")
    .replace(/\//g, "-")
    .replace(/[–—]/g, "-")
    .replace(/['"()[\]{}.,:;!?]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Lower-cased slug, used as a stable lookup key / anchor id. */
export function idSlug(s) {
  return slugify(s).toLowerCase();
}
