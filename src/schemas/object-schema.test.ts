import { describe, expect, test } from 'vitest';
import { createObjectSchema } from './object-schema.js';
import { createEnumSchema } from './enum-schema.js';
import { createNumberSchema } from './number-schema.js';

test('passes validation when value is a plain object', () => {
  const schema = createObjectSchema();
  const values: unknown[] = [
    {},
    { key: 'value', one: 1 },
  ];
  for (const value of values) {
    expect(schema.validate(value)).toStrictEqual(value);
  }
});

describe('fails validation when value is:', () => {
  const schema = createObjectSchema();
  const testCases: [string, unknown][] = [
    ['null', null],
    ['undefined', undefined],
    ['a string', '{}'],
    ['a number', 1],
    ['a bigint', 1n],
    ['a boolean', true],
    ['a symbol', Symbol('test')],
    ['an array', []],
    ['a class instance', new Date()],
    ['a function', () => 'test'],
  ];
  testCases.forEach(([message, value]) => {
    test(message, () => {
      expect(() => schema.validate(value)).toThrow();
    });
  });
});

describe('an object with typed keys', () => {
  test(
    'passes validation when value is an object and ' +
    'every key conforms the key schema',
    () => {
      const schema = createObjectSchema({
        key: createEnumSchema([
          'north',
          'south',
          'east',
          'west',
        ] as const),
      });
      const values: unknown[] = [
        {},
        { north: 1, south: 2 },
      ];
      for (const value of values) {
        expect(schema.validate(value)).toStrictEqual(value);
      }
    },
  );

  test(
    'fails validation when value is an object and ' +
    'some key does not conform the key schema',
    () => {
      const schema = createObjectSchema({
        key: createEnumSchema([
          'north',
          'south',
          'east',
          'west',
        ] as const),
      });
      const values: unknown[] = [
        { key: 'value' },
        { North: 1, South: 2 },
      ];
      for (const value of values) {
        expect(() => schema.validate(value)).toThrow();
      }
    },
  );
});

describe('an object with typed values', () => {
  test(
    'passes validation when value is an object and ' +
    'every value conforms the value schema',
    () => {
      const schema = createObjectSchema({
        value: createNumberSchema(),
      });
      const values: unknown[] = [
        {},
        { one: 1, two: 2 },
      ];
      for (const value of values) {
        expect(schema.validate(value)).toStrictEqual(value);
      }
    },
  );

  test(
    'fails validation when value is an object and ' +
    'some value does not conform the value schema',
    () => {
      const schema = createObjectSchema({
        value: createNumberSchema(),
      });
      const values: unknown[] = [
        { one: NaN },
        { one: 'one', two: 'two' },
      ];
      for (const value of values) {
        expect(() => schema.validate(value)).toThrow();
      }
    },
  );
});

describe('an object with typed keys and values', () => {
  test(
    'passes validation when value is an object and ' +
    'every key and value conforms the specified schema',
    () => {
      const schema = createObjectSchema({
        key: createEnumSchema([
          'north',
          'south',
          'east',
          'west',
        ] as const),
        value: createNumberSchema(),
      });
      const values: unknown[] = [
        {},
        { north: 1, south: 2 },
      ];
      for (const value of values) {
        expect(schema.validate(value)).toStrictEqual(value);
      }
    },
  );

  test(
    'fails validation when value is an object and ' +
    'some key or value does not conform the specified schema',
    () => {
      const schema = createObjectSchema({
        key: createEnumSchema([
          'north',
          'south',
          'east',
          'west',
        ] as const),
        value: createNumberSchema(),
      });
      const values: unknown[] = [
        { key: 1 },
        { north: NaN },
        { North: 1, south: '2' },
      ];
      for (const value of values) {
        expect(() => schema.validate(value)).toThrow();
      }
    },
  );
});
