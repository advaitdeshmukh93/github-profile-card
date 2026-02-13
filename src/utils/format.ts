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

/**
 * Wraps a long string into multiple lines, respecting word boundaries.
 * Adds an ellipsis to the last line if the text was truncated.
 *
 * @param input   - The raw text to wrap
 * @param maxLen  - Maximum characters per line
 * @param maxLines - Maximum number of output lines
 */
export function wrapText(input: string, maxLen: number, maxLines: number): string[] {
  const words = input.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length <= maxLen) {
      current = next;
      continue;
    }

    // Current line is full, push it
    if (current) lines.push(current);
    current = word;

    // Stop early if we've hit the line limit
    if (lines.length >= maxLines - 1) break;
  }

  // Push any remaining text
  if (current && lines.length < maxLines) lines.push(current);

  // Fallback: if nothing was added but input exists, force the first chunk
  if (lines.length === 0 && input) lines.push(input.slice(0, maxLen));

  // Add ellipsis if text was truncated
  if (lines.length === maxLines && words.length > 0) {
    const last = lines[lines.length - 1];
    if (!last) return lines;

    if (last.length > maxLen) {
      lines[lines.length - 1] = last.slice(0, Math.max(0, maxLen - 1)) + '\u2026';
    } else if (words.join(' ').length > lines.join(' ').length) {
      lines[lines.length - 1] = last.slice(0, Math.max(0, maxLen - 1)) + '\u2026';
    }
  }

  return lines;
}
