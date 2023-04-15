import { describe, expect, test } from 'vitest';
import { createArraySchema } from './array-schema.js';
import { createStringSchema } from './string-schema.js';
import { ValidationError } from '../validation-error.js';

test('passes validation when value is an array', () => {
  const schema = createArraySchema();
  const values: unknown[] = [
    [],
    [1, 2, 3],
    ['a', 'b', 'c'],
  ];
  for (const value of values) {
    expect(schema.validate(value)).toStrictEqual(value);
  }
});

describe('fails validation when value is:', () => {
  const schema = createArraySchema();
  const testCases: [string, unknown][] = [
    ['null', null],
    ['undefined', undefined],
    ['a string', '[]'],
    ['a number', 1],
    ['a bigint', 1n],
    ['a boolean', true],
    ['a symbol', Symbol('test')],
    ['an object', { key: 'value' }],
    ['a class instance', new Date()],
    ['a function', () => 'test'],
  ];
  testCases.forEach(([message, value]) => {
    test(message, () => {
      expect(() => schema.validate(value)).toThrow();
    });
  });
});

describe('typed array', () => {
  test(
    'passes validation when a value is an array and ' +
    'every item conforms the item schema',
    () => {
      const schema = createArraySchema({
        item: createStringSchema(),
      });
      const values: unknown[] = [
        [],
        ['a', 'b', 'c'],
      ];
      for (const value of values) {
        expect(schema.validate(value)).toStrictEqual(value);
      }
    },
  );

  test(
    'fails validation when a value is an array and ' +
    'some item does not conform the item schema',
    () => {
      const schema = createArraySchema({
        item: createStringSchema(),
      });
      const values: unknown[] = [
        [1],
        [1, 2, 3],
      ];
      for (const value of values) {
        expect(() => schema.validate(value)).toThrow();
      }
    },
  );

  test('stores items errors', () => {
    const schema = createArraySchema({
      item: createStringSchema(),
    });
    try {
      schema.validate([1, 'b', 3]);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      const subErrors = (error as ValidationError).subErrors;
      expect(subErrors).toHaveLength(2);
      expect(subErrors[0]).toBeInstanceOf(ValidationError);
      expect(subErrors[0].path).toStrictEqual([0]);
      expect(subErrors[1]).toBeInstanceOf(ValidationError);
      expect(subErrors[1].path).toStrictEqual([2]);
    }
  });
});
