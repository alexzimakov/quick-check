import { describe, expect, test } from 'vitest';
import { ObjectSchema } from '../type-schemas/object-schema.js';
import { NumberSchema } from '../type-schemas/number-schema.js';
import { StringSchema } from '../type-schemas/string-schema.js';
import { EnumSchema } from '../type-schemas/enum-schema.js';
import { ParseError } from '../parse-error.js';
import { format } from '../util.js';

describe('positive cases', () => {
  const valid = [
    { one: 1, two: 2, three: 3 },
    {},
  ];
  const schema = ObjectSchema.create(NumberSchema.create().int());
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
  const schema = ObjectSchema.create(NumberSchema.create().int());
  invalid.forEach((value) => {
    test(`should throw an error when value is ${format(value)}`, () => {
      expect(() => schema.parse(value)).toThrow(ParseError);
    });
  });
});

test('should validate keys', () => {
  const schema = ObjectSchema.create(
    NumberSchema.create().int(),
    StringSchema.create().minLength(2)
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
  const schema = ObjectSchema.create(
    NumberSchema.create().int(),
    EnumSchema.create(['north', 'south', 'east', 'west'] as const)
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
    _east: 3,
  })).toThrow(ParseError);
});

test('throws errors with custom messages', () => {
  let schema: ObjectSchema<
    unknown,
    Record<string, number>,
    Record<string, number>
  >;

  const typeError = 'must be a record';
  const requiredError = 'is required';
  schema = ObjectSchema.create(
    NumberSchema.create(),
    { requiredError, typeError }
  );
  expect(() => schema.parse(null)).toThrow(requiredError);
  expect(() => schema.parse([])).toThrow(typeError);

  const keyError = 'invalid key';
  const valueError = 'invalid value';
  schema = ObjectSchema.create(
    NumberSchema.create(),
    StringSchema.create().minLength(3),
    { keyError, valueError }
  );
  expect(() => schema.parse({ z: 0 })).toThrow(keyError);
  expect(() => schema.parse({ zero: '0' })).toThrow(valueError);

  schema = ObjectSchema.create(
    NumberSchema.create(),
    StringSchema.create().minLength(3),
    {
      keyError: () => keyError,
      valueError: () => valueError,
    }
  );
  expect(() => schema.parse({ z: 0 })).toThrow(keyError);
  expect(() => schema.parse({ zero: '0' })).toThrow(valueError);
});

describe('optional()', () => {
  const schema = ObjectSchema.create(
    NumberSchema.create().int()
  ).optional();

  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('throws an error when a passed value is null', () => {
    expect(() => schema.parse(null)).toThrow(ParseError);
  });
});

describe('nullable()', () => {
  const schema = ObjectSchema.create(
    NumberSchema.create().int()
  ).nullable();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(null)).toBe(null);
  });

  test('throws an error when a passed value is undefined', () => {
    expect(() => schema.parse(undefined)).toThrow(ParseError);
  });
});

describe('nullish()', () => {
  const schema = ObjectSchema.create(
    NumberSchema.create().int()
  ).nullish();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });
});

describe('required()', () => {
  const schema = ObjectSchema.create(NumberSchema.create().int()).optional();

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
    const schema = ObjectSchema.create(NumberSchema.create().int()).map(
      (obj) => JSON.stringify(obj)
    );
    expect(schema.parse({ one: 1 })).toBe('{"one":1}');
  });

  test('rethrows any error from the `mapper` function', () => {
    const error = new ParseError('invalid_state', 'Invalid state.');
    const schema = ObjectSchema.create(NumberSchema.create().int()).map(
      () => {
        throw error;
      }
    );
    expect(() => schema.parse({ one: 1 })).toThrow(error);
  });
});
