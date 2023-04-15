import { expect, test } from 'vitest';
import { determineType } from './determine-type.js';

test('determines type of a given value', () => {
  expect(determineType(undefined)).toBe('undefined');
  expect(determineType(null)).toBe('null');
  expect(determineType(true)).toBe('boolean');
  expect(determineType(false)).toBe('boolean');
  expect(determineType(1)).toBe('number');
  expect(determineType(1n)).toBe('bigint');
  expect(determineType('abc')).toBe('string');
  expect(determineType(Symbol('test'))).toBe('symbol');
  expect(determineType([1, 2, 3])).toBe('array');
  expect(determineType({})).toBe('object');
  expect(determineType(new Date())).toBe('object');
  expect(determineType(() => null)).toBe('function');
});
