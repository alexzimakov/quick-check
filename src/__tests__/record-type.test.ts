import { describe, expect, test } from 'vitest';
import { RecordType } from '../type-aliases/record-type.js';
import { NumberType } from '../type-aliases/number-type.js';
import { StringType } from '../type-aliases/string-type.js';
import { EnumType } from '../type-aliases/enum-type.js';
import { ParseError } from '../parse-error.js';
import { format } from '../util.js';

describe('positive cases', () => {
  const valid = [
    { one: 1, two: 2, three: 3 },
    {},
  ];
  const schema = RecordType.create(NumberType.create().int());
  valid.forEach((value) => {
    test(
      `should return ${format(value)} when value is ${format(value)}`,
      () => expect(schema.parse(value)).toEqual(value)
    );
  });
});

describe('negative cases', () => {
  const invalid = [
    null,
    undefined,
    '{"one":1}',
    Symbol('object'),
    1,
    1n,
    [],
    { one: 1, two: 2, three: '3' },
  ];
  const schema = RecordType.create(NumberType.create().int());
  invalid.forEach((value) => {
    test(`should throw an error when value is ${format(value)}`, () => {
      expect(() => schema.parse(value)).toThrow(ParseError);
    });
  });
});

test('should validate keys', () => {
  const schema = RecordType.create(
    NumberType.create().int(),
    StringType.create().minLength(2)
  );

  expect(schema.parse({
    ab: 2,
    abc: 3,
  })).toEqual({
    ab: 2,
    abc: 3,
  });

  expect(() => schema.parse({
    a: 1,
    ab: 2,
  })).toThrow(ParseError);
});

test('should validate enum keys', () => {
  const schema = RecordType.create(
    NumberType.create().int(),
    EnumType.create(['north', 'south', 'east', 'west'] as const)
  );

  expect(schema.parse({
    north: 1,
    south: 2,
    east: 3,
    west: 4,
  })).toEqual({
    north: 1,
    south: 2,
    east: 3,
    west: 4,
  });

  expect(() => schema.parse({
    north: 1,
    south: 2,
    east: 3,
  })).toThrow(ParseError);
});

test('checks that an object contains all keys from `EnumType`', () => {
  const keys = ['north', 'south', 'east', 'west'] as const;
  const schema = RecordType.create(
    NumberType.create().int(),
    EnumType.create(keys)
  );
  expect(() => schema.parse({
    north: 1,
    south: 2,
    west: 4,
  })).toThrow(ParseError);
});

test('throws errors with custom messages', () => {
  let schema: RecordType<
    Record<string, number>,
    Record<string, number>
  >;

  const typeError = 'must be a record';
  const requiredError = 'is required';
  schema = RecordType.create(
    NumberType.create(),
    { requiredError, typeError }
  );
  expect(() => schema.parse(null)).toThrow(requiredError);
  expect(() => schema.parse([])).toThrow(typeError);

  const keyError = 'invalid key';
  const valueError = 'invalid value';
  schema = RecordType.create(
    NumberType.create(),
    StringType.create().minLength(3),
    { keyError, valueError }
  );
  expect(() => schema.parse({ z: 0 })).toThrow(keyError);
  expect(() => schema.parse({ zero: '0' })).toThrow(valueError);

  schema = RecordType.create(
    NumberType.create(),
    StringType.create().minLength(3),
    {
      keyError: () => keyError,
      valueError: () => valueError,
    }
  );
  expect(() => schema.parse({ z: 0 })).toThrow(keyError);
  expect(() => schema.parse({ zero: '0' })).toThrow(valueError);

  const missingKeyError = 'must contain all keys';
  schema = RecordType.create(
    NumberType.create(),
    EnumType.create(['north', 'south', 'east', 'west'] as const),
    { missingKeyError }
  );
  expect(() => schema.parse({})).toThrow(missingKeyError);

  schema = RecordType.create(
    NumberType.create(),
    EnumType.create(['north', 'south', 'east', 'west'] as const),
    { missingKeyError: () => missingKeyError }
  );
  expect(() => schema.parse({
    north: 1,
    south: 2,
    east: 3,
  })).toThrow(missingKeyError);
});

describe('optional()', () => {
  const schema = RecordType.create(
    NumberType.create().int()
  ).optional();

  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('throws an error when a passed value is null', () => {
    expect(() => schema.parse(null)).toThrow(ParseError);
  });
});

describe('nullable()', () => {
  const schema = RecordType.create(
    NumberType.create().int()
  ).nullable();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(null)).toBe(null);
  });

  test('throws an error when a passed value is undefined', () => {
    expect(() => schema.parse(undefined)).toThrow(ParseError);
  });
});

describe('nullish()', () => {
  const schema = RecordType.create(
    NumberType.create().int()
  ).nullish();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });
});

describe('required()', () => {
  const schema = RecordType.create(NumberType.create().int()).optional();

  test('throws an error when a passed value is undefined', () => {
    expect(() => schema
      .required()
      .parse(undefined)).toThrow(ParseError);
  });

  test('throws an error when a passed value is null', () => {
    expect(() => schema
      .required()
      .parse(null)).toThrow(ParseError);
  });

  test('throws an error with custom error message', () => {
    const message = 'is required';
    expect(() => schema
      .required({ message })
      .parse(undefined)).toThrow(message);
  });
});

describe('map()', () => {
  test('returns a value from the `mapper` function', () => {
    const schema = RecordType.create(NumberType.create().int()).map(
      (obj) => JSON.stringify(obj)
    );
    expect(schema.parse({ one: 1 })).toBe('{"one":1}');
  });

  test('rethrows any error from the `mapper` function', () => {
    const error = new ParseError('invalid_state', 'Invalid state.');
    const schema = RecordType.create(NumberType.create().int()).map(
      () => {
        throw error;
      }
    );
    expect(() => schema.parse({ one: 1 })).toThrow(error);
  });
});
