import { describe, expect, test } from 'vitest';
import { RapidCheckError } from '../errors.js';
import { StringType } from '../string-type.js';
import { format } from './util.js';

describe('positive cases', () => {
  const valid = ['', '1', ' ', 'abc', 'multi\nline'];
  const schema = StringType.create();
  valid.forEach((value) => {
    test(
      `should return ${format(value)} when value is ${format(value)}`,
      () => expect(schema.parse(value)).toBe(value)
    );
  });
});

describe('negative cases', () => {
  const invalid = [true, 1, 1n, Symbol('test'), [], {}];
  const schema = StringType.create();
  invalid.forEach((value) => {
    test(`should throw an error when value is ${format(value)}`, () => {
      expect(() => schema.parse(value)).toThrow(RapidCheckError);
    });
  });
});

test('casts to string a passed value', () => {
  const schema = StringType.create({ cast: true });
  expect(schema.parse(null)).toBe('');
  expect(schema.parse(undefined)).toBe('');
  expect(schema.parse(0)).toBe('0');
});

test('trims a passed value', () => {
  const schema = StringType.create({ trim: true });
  expect(schema.parse('  ')).toBe('');
  expect(schema.parse('\n')).toBe('');
  expect(schema.parse('\t')).toBe('');
  expect(schema.parse(' abc ')).toBe('abc');
});

test('throws errors with custom messages', () => {
  const requiredError = 'is required';
  const invalidTypeError = 'must be string';
  const schema = StringType.create({ requiredError, invalidTypeError });
  expect(() => schema.parse(null)).toThrow(requiredError);
  expect(() => schema.parse(1)).toThrow(invalidTypeError);
});

describe('optional()', () => {
  const schema = StringType.create().optional();
  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('throws an error when a passed value is null', () => {
    expect(() => schema.parse(null)).toThrow(RapidCheckError);
  });
});

describe('nullable()', () => {
  const schema = StringType.create().nullable();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(null)).toBe(null);
  });

  test('throws an error when a passed value is undefined', () => {
    expect(() => schema.parse(undefined)).toThrow(RapidCheckError);
  });
});

describe('nullish()', () => {
  const schema = StringType.create().nullish();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });
});

describe('required()', () => {
  const optionalSchema = StringType.create().optional().nullable();
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
    const schema = StringType.create().map((value) => parseInt(value, 10));
    expect(schema.parse('105')).toBe(105);
  });

  test('rethrows any error from the `mapper` function', () => {
    const error = new RapidCheckError('integer', 'Must be an integer.');
    const schema = StringType.create().map((value) => {
      const int = parseInt(value, 10);
      if (Number.isNaN(int)) {
        throw error;
      }
      return int;
    });
    expect(() => schema.parse('abc')).toThrow(error);
  });
});
