import { expect, test } from 'vitest';
import { pluralize } from './pluralize.js';

test('returns singular form when `count` argument is 1', () => {
  expect(pluralize(1, 'item', 'items')).toBe('1 item');
});

test('returns plural form when `count` argument is 0 or greater than 1', () => {
  expect(pluralize(0, 'item', 'items')).toBe('0 items');
  expect(pluralize(2, 'item', 'items')).toBe('2 items');
});
