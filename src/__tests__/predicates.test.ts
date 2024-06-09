import assert from 'node:assert';
import { describe, test } from 'vitest';
import { isObject } from '../predicates.js';

describe('isObject()', () => {
  test('returns true when the given value is a plain object', () => {
    assert.equal(isObject({}), true);
    assert.equal(isObject({ a: 1 }), true);
  });

  test('returns true when the given value is an instance', () => {
    assert.equal(isObject(new Date()), true);
    assert.equal(isObject(new Map()), true);
  });

  test('returns false when the given value is an array', () => {
    assert.equal(isObject([]), false);
  });

  test('returns false when the given value is not an object', () => {
    assert.equal(isObject(null), false);
    assert.equal(isObject(undefined), false);
    assert.equal(isObject('string'), false);
    assert.equal(isObject(1.5), false);
    assert.equal(isObject(1n), false);
    assert.equal(isObject(true), false);
    assert.equal(isObject(() => null), false);
  });
});
