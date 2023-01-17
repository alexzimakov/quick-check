import { describe, expect, test } from 'vitest';
import { pluralize } from '../util.js';

describe('pluralize()', () => {
  const singular = 'item';
  const plural = 'items';

  test('returns singular message', () => {
    expect(pluralize(1, singular, plural)).toBe(1 + ' ' + singular);
  });

  test('returns plural message', () => {
    expect(pluralize(5, singular, plural)).toBe(5 + ' ' + plural);
  });
});
