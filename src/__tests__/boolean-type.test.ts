import { describe, expect, test } from 'vitest';
import { BooleanType } from '../boolean-type.js';
import { RapidCheckError } from '../error.js';
import { format } from './test-util.js';

describe('positive cases', () => {
  const valid = [true];
  const schema = BooleanType.create();
  valid.forEach((value) => {
    test(
      `should return ${format(value)} when value is ${format(value)}`,
      () => expect(schema.parse(value)).toBe(value)
    );
  });
});

describe('negative cases', () => {
  const invalid = [null, undefined, 'foo', 1, Symbol('test'), [], {}, NaN];
  const schema = BooleanType.create();
  invalid.forEach((value) => {
    test(`should throw an error when value is ${format(value)}`, () => {
      expect(() => schema.parse(value)).toThrow(RapidCheckError);
    });
  });
});

test('casts to boolean a passed value', () => {
  const schema = BooleanType.create({ cast: true });

  expect(schema.parse('true')).toBe(true);
  expect(schema.parse('yes')).toBe(true);
  expect(schema.parse('1')).toBe(true);
  expect(schema.parse(1n)).toBe(true);
  expect(schema.parse(1)).toBe(true);

  expect(schema.parse(undefined)).toBe(false);
  expect(schema.parse(null)).toBe(false);
  expect(schema.parse('false')).toBe(false);
  expect(schema.parse('no')).toBe(false);
  expect(schema.parse('0')).toBe(false);
  expect(schema.parse(0n)).toBe(false);
  expect(schema.parse(0)).toBe(false);
});

test('throws errors with custom messages', () => {
  const requiredError = 'is required';
  const typeError = 'must be string';
  const schema = BooleanType.create({ requiredError, typeError });
  expect(() => schema.parse(null)).toThrow(requiredError);
  expect(() => schema.parse(1)).toThrow(typeError);
});

describe('optional()', () => {
  const schema = BooleanType.create().optional();
  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('throws an error when a passed value is null', () => {
    expect(() => schema.parse(null)).toThrow(RapidCheckError);
  });
});

describe('nullable()', () => {
  const schema = BooleanType.create().nullable();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(null)).toBe(null);
  });

  test('throws an error when a passed value is undefined', () => {
    expect(() => schema.parse(undefined)).toThrow(RapidCheckError);
  });
});

describe('nullish()', () => {
  const schema = BooleanType.create().nullish();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });
});

describe('required()', () => {
  const optionalSchema = BooleanType.create().optional().nullable();
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
    const ENABLED = 'ENABLED';
    const DISABLED = 'DISABLED';
    const schema = BooleanType.create().map(
      (value) => (value ? ENABLED : DISABLED)
    );
    expect(schema.parse(true)).toBe(ENABLED);
    expect(schema.parse(false)).toBe(DISABLED);
  });

  test('rethrows any error from the `mapper` function', () => {
    const error = new RapidCheckError('invalid_state', 'Invalid state.');
    const schema = BooleanType.create().map((value) => {
      if (!value) {
        throw error;
      }
      return 'ENABLED';
    });
    expect(() => schema.parse(false)).toThrow(error);
  });
});

describe('truthy()', () => {
  test('returns a passed value when it is `true`', () => {
    const schema = BooleanType.create().truthy();
    const value = true;
    expect(schema.parse(value)).toBe(value);
  });

  test('throws an error when a passed value is `false`', () => {
    const schema = BooleanType.create().truthy();
    expect(() => schema.parse(false)).toThrow(RapidCheckError);
  });

  test('throws an error with custom error message', () => {
    const message = 'invalid value';
    expect(
      () => BooleanType.create()
        .truthy({ message })
        .parse(false)
    ).toThrow(message);
  });
});

describe('falsy()', () => {
  test('returns a passed value when it is `false`', () => {
    const schema = BooleanType.create().falsy();
    const value = false;
    expect(schema.parse(value)).toBe(value);
  });

  test('throws an error when a passed value is `true`', () => {
    const schema = BooleanType.create().falsy();
    expect(() => schema.parse(true)).toThrow(RapidCheckError);
  });

  test('throws an error with custom error message', () => {
    const message = 'invalid value';
    expect(
      () => BooleanType.create()
        .falsy({ message })
        .parse(true)
    ).toThrow(message);
  });
});

describe('custom()', () => {
  const invalidStateError = new RapidCheckError(
    'invalidState',
    'Must be `true`.'
  );
  const validate = (value: boolean) => {
    if (!value) {
      throw invalidStateError;
    }
    return value;
  };
  test('returns a value from custom validator', () => {
    const schema = BooleanType.create().custom(validate);
    const value = true;
    expect(schema.parse(value)).toBe(value);
  });

  test(
    "throws an error when a passed value doesn't pass custom validator",
    () => {
      const schema = BooleanType.create().custom(validate);
      expect(() => schema.parse(false)).toThrow(invalidStateError);
    }
  );
});
