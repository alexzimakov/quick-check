import { describe, expect, test } from 'vitest';
import { ParseError } from '../parse-error.js';
import { UnknownTypeSchema } from '../type-schemas/unknown-type-schema.js';
import { format } from '../util.js';

describe('positive cases', () => {
  const valid = [
    true,
    1,
    100n,
    'string',
    Symbol('test'),
    [],
    {},
  ];
  const schema = UnknownTypeSchema.create();
  valid.forEach((value) => {
    test(
      `should return ${format(value)} when value is ${format(value)}`,
      () => expect(schema.parse(value)).toBe(value)
    );
  });
});

describe('negative cases', () => {
  const invalid = [null, undefined];
  const schema = UnknownTypeSchema.create();
  invalid.forEach((value) => {
    test(`should throw an error when value is ${format(value)}`, () => {
      expect(() => schema.parse(value)).toThrow(ParseError);
    });
  });
});

test('throws errors with custom messages', () => {
  const requiredError = 'is required';
  const schema = UnknownTypeSchema.create({ requiredError });
  expect(() => schema.parse(null)).toThrow(requiredError);
});

describe('optional()', () => {
  const schema = UnknownTypeSchema.create().optional();
  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('throws an error when a passed value is null', () => {
    expect(() => schema.parse(null)).toThrow(ParseError);
  });
});

describe('nullable()', () => {
  const schema = UnknownTypeSchema.create().nullable();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(null)).toBe(null);
  });

  test('throws an error when a passed value is undefined', () => {
    expect(() => schema.parse(undefined)).toThrow(ParseError);
  });
});

describe('nullish()', () => {
  const schema = UnknownTypeSchema.create().nullish();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });
});

describe('required()', () => {
  const optionalSchema = UnknownTypeSchema.create().optional().nullable();
  const schema = optionalSchema.required();

  test('throws an error when a passed value is undefined', () => {
    expect(() => schema.parse(undefined)).toThrow(ParseError);
  });

  test('throws an error when a passed value is null', () => {
    expect(() => schema.parse(null)).toThrow(ParseError);
  });
});

describe('map()', () => {
  test('returns a value from the `mapper` function', () => {
    const schema = UnknownTypeSchema.create().map(
      (value) => String(value)
    );
    expect(schema.parse(1)).toBe('1');
    expect(schema.parse(false)).toBe('false');
  });

  test('rethrows any error from the `mapper` function', () => {
    const error = new ParseError('invalid_state', 'Invalid state.');
    const schema = UnknownTypeSchema.create().map((value) => {
      if (!value) {
        throw error;
      }
      return null;
    });
    expect(() => schema.parse(false)).toThrow(error);
  });
});

describe('custom()', () => {
  const invalidStateError = new ParseError(
    'invalidState',
    'Must be truthy.'
  );
  const validate = (value: unknown) => {
    if (!value) {
      throw invalidStateError;
    }
    return value;
  };
  test('returns a value from custom validator', () => {
    const schema = UnknownTypeSchema.create().custom(validate);
    const value = true;
    expect(schema.parse(value)).toBe(value);
  });

  test(
    "throws an error when a passed value doesn't pass custom validator",
    () => {
      const schema = UnknownTypeSchema.create().custom(validate);
      expect(() => schema.parse(false)).toThrow(invalidStateError);
    }
  );
});
