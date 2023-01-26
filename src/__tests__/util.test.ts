import { describe, expect, test } from 'vitest';
import { format, formatList, pluralize } from '../util.js';

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

describe('format()', () => {
  test('return formatted value', () => {
    const date = new Date(2022, 0, 26);
    expect(format(undefined)).toBe('undefined');
    expect(format(null)).toBe('null');
    expect(format(true)).toBe('true');
    expect(format(false)).toBe('false');
    expect(format(7.35)).toBe('7.35');
    expect(format(10n)).toBe('10n');
    expect(format(NaN)).toBe('NaN');
    expect(format('lorem ipsum')).toBe("'lorem ipsum'");
    expect(format(Symbol('test'))).toBe('Symbol(test)');
    expect(format({ num: 1, str: 'foo' })).toBe('{"num":1,"str":"foo"}');
    expect(format([1, 2, 3])).toBe('[1,2,3]');
    expect(format(date)).toBe(date.toISOString());
  });
});

describe('formatList', () => {
  test('returns empty string when the list is empty', () => {
    expect(formatList([], { type: 'or' })).toBe('');
  });

  test('returns first item when the list length is 1', () => {
    expect(formatList([], { type: 'or' })).toBe('');
    expect(formatList(['sum'], { type: 'or' })).toBe("'sum'");
  });

  test(
    'returns joined 1st and 2nd item using " or " when the list length is 2',
    () => {
      expect(formatList(['a', 'b'], { type: 'or' })).toBe("'a' or 'b'");
    }
  );

  test(
    'returns joined items using " or " when the list length is greater than 2',
    () => {
      expect(formatList(['a', 'b', 'c'], { type: 'or' })).toBe(
        "'a', 'b' or 'c'"
      );
    }
  );

  test('returns joined items using " and "', () => {
    expect(formatList(['a', 'b', 'c'], { type: 'and' })).toBe(
      "'a', 'b' and 'c'"
    );
  });
});
