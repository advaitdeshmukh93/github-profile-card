/**
 * Barrel export for all utility modules.
 * Import from "src/utils" for convenience.
 *
 * @author Nayan Das <https://github.com/nayandas69>
 */

export { resolveColors, type Theme } from './themes.js';
// Only kFormat and escapeXml are used in production code; wrapText was removed.
export { kFormat, escapeXml } from './format.js';
export { getLangColor } from './languages.js';
export { icons, icon, type IconName } from './icons.js';
