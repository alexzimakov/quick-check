import { expect, test } from 'vitest';
import { formatList } from './format-list.js';

test('throws an error when passed invalid `type` parameter', () => {
  expect(
    // @ts-expect-error passed invalid `type` parameter
    () => formatList(['a', 'b'], { type: 'unit' }),
  ).toThrowError();
});

test('throws an error when `maxItems` parameter is less than 1', () => {
  expect(
    () => formatList(['a', 'b'], { maxItems: 0 }),
  ).toThrowError();
});

test('formats an empty list', () => {
  expect(formatList([])).toBe('');
});

test('formats a list that contains only one item', () => {
  expect(formatList(['a'])).toBe('a');
});

test('formats a list that contains 2 items', () => {
  expect(formatList(['a', 'b'])).toBe('a and b');
});

test('formats a list that contains more than 2 items', () => {
  expect(formatList(['a', 'b', 'c'])).toBe('a, b, and c');
});

test('formats a list with `maxItems` parameter', () => {
  const items = ['a', 'b', 'c', 'd'];
  expect(
    formatList(items, { maxItems: 1 }),
  ).toBe('a and 3 more');
  expect(
    formatList(items, { maxItems: 2 }),
  ).toBe('a, b, and 2 more');
  expect(
    formatList(items, { maxItems: 3 }),
  ).toBe('a, b, c, and d');
});

test('formats a list with `type` parameter', () => {
  expect(
    formatList(['a', 'b'], { type: 'and' }),
  ).toBe('a and b');
  expect(
    formatList(['a', 'b', 'c'], { type: 'and' }),
  ).toBe('a, b, and c');
  expect(
    formatList(['a', 'b'], { type: 'or' }),
  ).toBe('a or b');
  expect(
    formatList(['a', 'b', 'c'], { type: 'or' }),
  ).toBe('a, b, or c');
});

test('formats a list with `quoteItems` parameter', () => {
  expect(
    formatList(['a', 'b', 'c'], { quoteItems: true }),
  ).toBe("'a', 'b', and 'c'");
});

test('formats a list with `quoteStyle` parameter', () => {
  expect(
    formatList(['a', 'b', 'c'], {
      quoteItems: true,
      quoteStyle: '`',
    }),
  ).toBe('`a`, `b`, and `c`');
});
