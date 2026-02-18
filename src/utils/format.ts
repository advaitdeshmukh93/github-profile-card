/**
 * Text formatting and number utilities for the SVG card.
 *
 * @author Nayan Das <https://github.com/nayandas69>
 */

/**
 * Formats a number into a compact human-readable string.
 * Examples: 999 -> "999", 1500 -> "1.5k", 1000000 -> "1M"
 */
export function kFormat(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return String(num);
}

/**
 * Escapes special XML/HTML characters to prevent injection in SVG output.
 * This is critical for safely embedding user-provided strings (bio, name, etc.).
 */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// NOTE: wrapText was removed because the SVG card uses single-line bio
// truncation (see card.ts) rather than multi-line wrapping. Keeping only
// the utilities that are actually consumed by production code.
