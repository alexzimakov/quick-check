import { describe, expect, test } from 'vitest';
import { EnumType } from '../type-aliases/enum-type.js';
import { RapidCheckError } from '../error.js';
import { format } from './test-util.js';

describe('positive cases', () => {
  const values = ['north', 'south', 'east', 'west'] as const;
  const valid = values;
  const schema = EnumType.create(values);
  valid.forEach((value) => {
    test(
      `should return ${format(value)} when value is ${format(value)}`,
      () => expect(schema.parse(value)).toBe(value)
    );
  });
});

describe('negative cases', () => {
  const values = ['north', 'south', 'east', 'west'] as const;
  const invalid = ['North', '', 1, null, undefined];
  const schema = EnumType.create(values);
  invalid.forEach((value) => {
    test(`should throw an error when value is ${format(value)}`, () => {
      expect(() => schema.parse(value)).toThrow(RapidCheckError);
    });
  });
});

test('throws errors with custom messages', () => {
  const values = ['north', 'south', 'east', 'west'] as const;
  const requiredError = 'is required';
  const typeError = 'invalid value';
  const schema = EnumType.create(values, { requiredError, typeError });
  expect(() => schema.parse(null)).toThrow(requiredError);
  expect(() => schema.parse('North')).toThrow(typeError);
});

describe('optional()', () => {
  const values = ['north', 'south', 'east', 'west'] as const;
  const schema = EnumType.create(values).optional();
  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('throws an error when a passed value is null', () => {
    expect(() => schema.parse(null)).toThrow(RapidCheckError);
  });
});

describe('nullable()', () => {
  const values = ['north', 'south', 'east', 'west'] as const;
  const schema = EnumType.create(values).nullable();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(null)).toBe(null);
  });

  test('throws an error when a passed value is undefined', () => {
    expect(() => schema.parse(undefined)).toThrow(RapidCheckError);
  });
});

describe('nullish()', () => {
  const values = ['north', 'south', 'east', 'west'] as const;
  const schema = EnumType.create(values).nullish();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });
});

describe('required()', () => {
  const values = ['north', 'south', 'east', 'west'] as const;
  const optionalSchema = EnumType.create(values).optional().nullable();
  const schema = optionalSchema.required();

  test('throws an error when a passed value is undefined', () => {
    expect(() => schema.parse(undefined)).toThrow(RapidCheckError);
  });

  test('throws an error when a passed value is null', () => {
    expect(() => schema.parse(null)).toThrow(RapidCheckError);
  });
});

describe('map()', () => {
  test('returns a value from the `mapper` function', () => {
    const values = ['north', 'south', 'east', 'west'] as const;
    const schema = EnumType.create(values).map(
      (value) => value.toUpperCase()
    );
    expect(schema.parse(values[1])).toBe(values[1].toUpperCase());
  });

  test('rethrows any error from the `mapper` function', () => {
    const error = new RapidCheckError('invalid_state', 'Invalid state.');
    const values = ['north', 'south', 'east', 'west'] as const;
    const schema = EnumType.create(values).map((value) => {
      if (value !== 'north' && value !== 'south') {
        throw error;
      }
      return value;
    });
    expect(() => schema.parse(values[2])).toThrow(error);
  });
});

describe('EnumType.formatValues()', () => {
  test('returns formatted values', () => {
    expect(EnumType.formatValues([
      null,
      undefined,
      true,
      'foo',
      10,
      20n,
      [1, 2, 3],
      { foo: 'bar' },
    ])).toBe(
      '[' +
        'null, ' +
        'undefined, ' +
        'true, ' +
        "'foo', " +
        '10, ' +
        '20n, ' +
        '[1,2,3], ' +
        '{"foo":"bar"}' +
      ']'
    );
  });
});
