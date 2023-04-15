import { describe, expect, test } from 'vitest';
import { isPlainObject } from './is-plain-object.js';

// noinspection JSPrimitiveTypeWrapperUsage
const positiveCases: [string, unknown][] = [
  ['object literal', {}],
  ['new Object()', new Object()], // eslint-disable-line no-new-object
  ['Object.create(null)', Object.create(null)],
  ['not empty object', { a: { b: 'c' } }],
];

describe('returns true when a given value is:', () => {
  positiveCases.forEach(([type, value]) => {
    test(type, () => {
      expect(isPlainObject(value)).toBe(true);
    });
  });
});

// noinspection JSPrimitiveTypeWrapperUsage
const negativeCases: [string, unknown][] = [
  ['wrapper object', new String('a string')], // eslint-disable-line no-new-wrappers
  ['string', 'a string'],
  ['number', 12.5],
  ['bigint', 10n],
  ['boolean', true],
  ['symbol', Symbol('object')],
  ['null', null],
  ['undefined', undefined],
  ['array', []],
  ['function', test],
  ['class instance', (() => {
    class Foo {
      constructor(public readonly value = 1) {}
    }
    return new Foo();
  })()],
  ['date', new Date()],
];

describe('returns false when a given value is:', () => {
  negativeCases.forEach(([type, value]) => {
    test(type, () => {
      expect(isPlainObject(value)).toBe(false);
    });
  });
});
