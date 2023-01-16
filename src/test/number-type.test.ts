import { describe, expect, test } from 'vitest';
import { RapidCheckError } from '../errors.js';
import { NumberType } from '../number-type.js';
import { format } from './util.js';

describe('positive cases', () => {
  const valid = [0, 1, -1, 0.189, 1e3];
  const schema = NumberType.create();
  valid.forEach((value) => {
    test(
      `should return ${format(value)} when value is ${format(value)}`,
      () => expect(schema.parse(value)).toBe(value)
    );
  });
});

describe('negative cases', () => {
  const invalid = [
    undefined,
    null,
    true,
    false,
    1n,
    NaN,
    Infinity,
    '1',
    Symbol('test'),
    [],
    {},
  ];
  const schema = NumberType.create();
  invalid.forEach((value) => {
    test(`should throw an error when value is ${format(value)}`, () => {
      expect(() => schema.parse(value)).toThrow(RapidCheckError);
    });
  });
});

test('casts to number a passed value', () => {
  const schema = NumberType.create({ cast: true });
  const date = new Date(2023, 0, 1);

  expect(schema.parse(null)).toBe(0);
  expect(schema.parse(undefined)).toBe(0);


  expect(schema.parse(12n)).toBe(12);

  expect(schema.parse('12')).toBe(12);
  expect(schema.parse('12.5')).toBe(12.5);

  expect(schema.parse(true)).toBe(1);
  expect(schema.parse(false)).toBe(0);

  expect(schema.parse(date)).toBe(date.getTime());
});

test('throws errors with custom messages', () => {
  const requiredError = 'is required';
  const typeError = 'must be string';
  const schema = NumberType.create({ requiredError, typeError });
  expect(() => schema.parse(null)).toThrow(requiredError);
  expect(() => schema.parse('1')).toThrow(typeError);
});

describe('optional()', () => {
  const schema = NumberType.create().optional();
  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('throws an error when a passed value is null', () => {
    expect(() => schema.parse(null)).toThrow(RapidCheckError);
  });
});

describe('nullable()', () => {
  const schema = NumberType.create().nullable();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(null)).toBe(null);
  });

  test('throws an error when a passed value is undefined', () => {
    expect(() => schema.parse(undefined)).toThrow(RapidCheckError);
  });
});

describe('nullish()', () => {
  const schema = NumberType.create().nullish();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });
});

describe('required()', () => {
  const optionalSchema = NumberType.create().optional().nullable();
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
    const schema = NumberType.create().map((value) => String(value));
    expect(schema.parse(105)).toBe('105');
  });

  test('rethrows any error from the `mapper` function', () => {
    const error = new RapidCheckError('invalid_state', 'Invalid state.');
    const schema = NumberType.create().map((value) => {
      if (value < 10) {
        throw error;
      }
      return value;
    });
    expect(() => schema.parse(5)).toThrow(error);
  });
});

describe('int()', () => {
  test('returns a passed value when it is an integer', () => {
    const schema = NumberType.create().int();
    const value = 10;
    expect(schema.parse(value)).toBe(value);
  });

  test('throws an error when a passed value is not an integer', () => {
    const schema = NumberType.create().int();
    expect(() => schema.parse(10.5)).toThrow(RapidCheckError);
  });

  test('throws an error with custom error message', () => {
    const message = 'integer required';
    const schema = NumberType.create().int({ message });
    expect(() => schema.parse(10.5)).toThrow(message);
  });
});

describe('positive()', () => {
  test('returns a passed value when it is a positive number', () => {
    const schema = NumberType.create().positive();
    expect(schema.parse(0)).toBe(0);
    expect(schema.parse(1)).toBe(1);
    expect(schema.parse(1.5)).toBe(1.5);
  });

  test('throws an error when the a passed value is less than 0', () => {
    const schema = NumberType.create().positive();
    expect(() => schema.parse(-1)).toThrow(RapidCheckError);
  });

  test('throws an error with custom error message', () => {
    const message = 'invalid value';
    expect(
      () => NumberType.create()
        .positive({ message })
        .parse(-1)
    ).toThrow(message);
  });
});

describe('min()', () => {
  test('returns a passed value when it >= limit', () => {
    const schema = NumberType.create().min(1);
    expect(schema.parse(1)).toBe(1);
    expect(schema.parse(2)).toBe(2);
    expect(schema.parse(1.5)).toBe(1.5);
  });

  test('throws an error when the a passed value < limit', () => {
    const schema = NumberType.create().min(1);
    expect(() => schema.parse(0)).toThrow(RapidCheckError);
  });

  test('throws an error with custom error message', () => {
    const message = 'invalid value';
    expect(
      () => NumberType.create()
        .min(10, { message })
        .parse(5)
    ).toThrow(message);
    expect(
      () => NumberType.create()
        .min(10, { message: () => message })
        .parse(5)
    ).toThrow(message);
  });
});

describe('max()', () => {
  test('returns a passed value when it <= limit', () => {
    const schema = NumberType.create().max(10);
    expect(schema.parse(10)).toBe(10);
    expect(schema.parse(8)).toBe(8);
    expect(schema.parse(5.5)).toBe(5.5);
  });

  test('throws an error when the a passed value > limit', () => {
    const schema = NumberType.create().max(10);
    expect(() => schema.parse(11)).toThrow(RapidCheckError);
  });

  test('throws an error with custom error message', () => {
    const message = 'invalid value';
    expect(
      () => NumberType.create()
        .max(10, { message })
        .parse(15)
    ).toThrow(message);
    expect(
      () => NumberType.create()
        .max(10, { message: () => message })
        .parse(15)
    ).toThrow(message);
  });
});

describe('greaterThan()', () => {
  test('returns a passed value when it > limit', () => {
    const schema = NumberType.create().greaterThan(5);
    expect(schema.parse(8)).toBe(8);
    expect(schema.parse(5.5)).toBe(5.5);
  });

  test('throws an error when the a passed value <= limit', () => {
    const schema = NumberType.create().greaterThan(10);
    expect(() => schema.parse(10)).toThrow(RapidCheckError);
    expect(() => schema.parse(9)).toThrow(RapidCheckError);
  });

  test('throws an error with custom error message', () => {
    const message = 'invalid value';
    expect(
      () => NumberType.create()
        .greaterThan(10, { message })
        .parse(5)
    ).toThrow(message);
    expect(
      () => NumberType.create()
        .greaterThan(10, { message: () => message })
        .parse(5)
    ).toThrow(message);
  });
});

describe('lessThan()', () => {
  test('returns a passed value when it < limit', () => {
    const schema = NumberType.create().lessThan(10);
    expect(schema.parse(5)).toBe(5);
    expect(schema.parse(9.5)).toBe(9.5);
  });

  test('throws an error when the a passed value >= limit', () => {
    const schema = NumberType.create().lessThan(10);
    expect(() => schema.parse(10)).toThrow(RapidCheckError);
    expect(() => schema.parse(11)).toThrow(RapidCheckError);
  });

  test('throws an error with custom error message', () => {
    const message = 'invalid value';
    expect(
      () => NumberType.create()
        .lessThan(10, { message })
        .parse(15)
    ).toThrow(message);
    expect(
      () => NumberType.create()
        .lessThan(10, { message: () => message })
        .parse(15)
    ).toThrow(message);
  });
});

describe('custom()', () => {
  const rangeError = new RapidCheckError(
    'range',
    'The number must be between 0 to 10.'
  );
  const inRange = (value: number) => {
    if (value < 0 || value > 10) {
      throw rangeError;
    }
    return value;
  };

  test('returns a value from custom validator', () => {
    const schema = NumberType.create().custom(inRange);
    const value = 5;
    expect(schema.parse(value)).toBe(value);
  });

  test(
    "throws an error when a passed value doesn't pass custom validator",
    () => {
      const schema = NumberType.create().custom(inRange);
      expect(() => schema.parse(12)).toThrow(rangeError);
    }
  );
});
