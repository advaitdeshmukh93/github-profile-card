/**
 * Tests for text formatting and number utilities.
 * Covers kFormat, escapeXml, and wrapText functions.
 *
 * @author Nayan Das <https://github.com/nayandas69>
 */

import { describe, it, expect } from 'vitest';
import { kFormat, escapeXml, wrapText } from '../src/utils/format';

/* -------------------------------------------------- */
/*  kFormat - compact number formatting               */
/* -------------------------------------------------- */
describe('kFormat', () => {
  it('returns plain number below 1000', () => {
    expect(kFormat(0)).toBe('0');
    expect(kFormat(1)).toBe('1');
    expect(kFormat(999)).toBe('999');
  });

  it('formats thousands with k suffix', () => {
    expect(kFormat(1000)).toBe('1k');
    expect(kFormat(1500)).toBe('1.5k');
    expect(kFormat(9999)).toBe('10k');
    expect(kFormat(100_000)).toBe('100k');
  });

  it('formats millions with M suffix', () => {
    expect(kFormat(1_000_000)).toBe('1M');
    expect(kFormat(1_500_000)).toBe('1.5M');
    expect(kFormat(10_000_000)).toBe('10M');
  });
});

/* -------------------------------------------------- */
/*  escapeXml - SVG/XML-safe string encoding          */
/* -------------------------------------------------- */
describe('escapeXml', () => {
  it('escapes ampersands', () => {
    expect(escapeXml('a & b')).toBe('a &amp; b');
  });

  it('escapes angle brackets', () => {
    expect(escapeXml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes quotes', () => {
    expect(escapeXml(`"hello" 'world'`)).toBe('&quot;hello&quot; &#39;world&#39;');
  });

  it('returns empty string unchanged', () => {
    expect(escapeXml('')).toBe('');
  });

  it('leaves normal text untouched', () => {
    expect(escapeXml('Hello World')).toBe('Hello World');
  });
});

/* -------------------------------------------------- */
/*  wrapText - multi-line text wrapper                */
/* -------------------------------------------------- */
describe('wrapText', () => {
  it('does not wrap short text', () => {
    const result = wrapText('Hello', 20, 2);
    expect(result).toEqual(['Hello']);
  });

  it('wraps long text into multiple lines', () => {
    const result = wrapText('This is a longer text that should be wrapped', 20, 3);
    expect(result.length).toBeGreaterThan(1);
    // Each line should roughly respect the max width
    for (const line of result) {
      expect(line.length).toBeLessThanOrEqual(21);
    }
  });

  it('respects max lines limit', () => {
    const result = wrapText('word '.repeat(100), 10, 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('handles empty input gracefully', () => {
    const result = wrapText('', 20, 2);
    expect(result).toEqual([]);
  });
});
