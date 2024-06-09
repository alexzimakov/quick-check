import assert from 'node:assert';
import { describe, test } from 'vitest';
import { formatList, freezeMap, pluralize } from '../utils.js';

describe('freezeMap()', () => {
  test('returns an element by a key', () => {
    const map = freezeMap(new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]));
    assert.equal(map.get('a'), 1);
    assert.equal(map.get('b'), 2);
    assert.equal(map.get('c'), 3);
  });

  test('returns the size of a map', () => {
    const map = freezeMap(new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]));
    assert.equal(map.size, 3);
  });

  test('throws an error when trying to add a new element', () => {
    const map = freezeMap(new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]));
    assert.throws(() => {
      map.set('d', 4);
    }, TypeError);
  });

  test('throws an error when trying to delete an element', () => {
    const map = freezeMap(new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]));
    assert.throws(() => {
      map.delete('b');
    }, TypeError);
  });

  test('throws an error when trying to clear the map', () => {
    const map = freezeMap(new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]));
    assert.throws(() => {
      map.clear();
    }, TypeError);
  });
});

describe('formatList()', () => {
  describe('default (unit type)', () => {
    const testCases = [
      { list: [], formattedList: '' },
      { list: [1], formattedList: '1' },
      { list: [1, 2], formattedList: '1, 2' },
      { list: [1, 2, 3], formattedList: '1, 2, 3' },
    ];
    for (const { list, formattedList } of testCases) {
      const message = `format ${JSON.stringify(list)}`;
      test(message, () => {
        assert.equal(formatList(list), formattedList);
      });
    }
  });

  describe('conjunction type', () => {
    const testCases = [
      { list: [], formattedList: '' },
      { list: [1], formattedList: '1' },
      { list: [1, 2], formattedList: '1 and 2' },
      { list: [1, 2, 3], formattedList: '1, 2, and 3' },
    ];
    for (const { list, formattedList } of testCases) {
      const message = `format ${JSON.stringify(list)}`;
      test(message, () => {
        assert.equal(formatList(list, { type: 'conjunction' }), formattedList);
      });
    }
  });

  describe('disjunction type', () => {
    const testCases = [
      { list: [], formattedList: '' },
      { list: [1], formattedList: '1' },
      { list: [1, 2], formattedList: '1 or 2' },
      { list: [1, 2, 3], formattedList: '1, 2, or 3' },
    ];
    for (const { list, formattedList } of testCases) {
      const message = `format ${JSON.stringify(list)}`;
      test(message, () => {
        assert.equal(formatList(list, { type: 'disjunction' }), formattedList);
      });
    }
  });

  test('should quote elements', () => {
    const list = [1, 2, 3];
    const formattedList = '"1", "2", "3"';
    assert.equal(formatList(list, { quoteValues: true }), formattedList);
  });

  test('should quote elements', () => {
    const list = [1, 2, 3];
    const formattedList = '"1", "2", "3"';
    assert.equal(formatList(list, { quoteValues: true }), formattedList);
  });

  test('should quote elements with a given quotes style', () => {
    const list = [1, 2, 3];
    const formattedList = '\'1\', \'2\', \'3\'';
    assert.equal(formatList(list, {
      quoteValues: true,
      quoteStyle: '\'',
    }), formattedList);
  });
});

describe('pluralize()', () => {
  test('returns pluralized string', () => {
    assert.equal(
      pluralize(1, { singular: 'item', plural: 'items' }),
      '1 item',
    );
    assert.equal(
      pluralize(2, { singular: 'item', plural: 'items' }),
      '2 items',
    );
  });
});
