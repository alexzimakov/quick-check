import { describe, expect, test } from 'vitest';
import { ArrayType } from '../type-aliases/array-type.js';
import { StringType } from '../type-aliases/string-type.js';
import { ParseError } from '../parse-error.js';
import { format } from './test-util.js';

describe('positive cases', () => {
  const valid = [
    [],
    ['a'],
    ['a', 'b', 'c'],
  ];
  const schema = ArrayType.create(StringType.create());
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
    "['a', 'b', 'c']",
    1,
    1n,
    {},
    Symbol('Array'),
  ];
  const schema = ArrayType.create(StringType.create());
  invalid.forEach((value) => {
    test(`should throw an error when value is ${format(value)}`, () => {
      expect(() => schema.parse(value)).toThrow(ParseError);
    });
  });
});

test(
  "throws an error when one or more items don't conform to the item schema",
  () => {
    const values = [[], 'a', 2, 'b', null, undefined];
    const invalidItemsCount = 4;
    const schema = ArrayType.create(StringType.create());

    try {
      schema.parse(values);
    } catch (error) {
      expect(error).toBeInstanceOf(ParseError);
      expect((error as ParseError).details).toHaveLength(invalidItemsCount);
    }

    expect.assertions(2);
  }
);

test('validate and parses nested arrays', () => {
  const items = [
    null,
    ['a', 'b'],
    ['a', 2, 'c'],
  ];
  const schema = ArrayType.create(ArrayType.create(StringType.create()));

  try {
    schema.parse(items);
  } catch (error) {
    expect(error).toBeInstanceOf(ParseError);

    const errors = (error as ParseError).details;
    expect(errors).toHaveLength(2);
    expect(errors[0]).toBeInstanceOf(ParseError);
    expect(errors[0]).toHaveProperty('path', [0]);
    expect(errors[1]).toBeInstanceOf(ParseError);
    expect(errors[1]).toHaveProperty('path', [2, 1]);
  }
  expect.assertions(6);
});

test('casts to array a passed value', () => {
  const schema = ArrayType.create(StringType.create(), { cast: true });
  expect(schema.parse(null)).toEqual([]);
  expect(schema.parse(undefined)).toEqual([]);
});

test('throws errors with custom messages', () => {
  const requiredError = 'is required';
  const typeError = 'must be string';
  const schema = ArrayType.create(StringType.create(), {
    requiredError,
    typeError,
  });
  expect(() => schema.parse(null)).toThrow(requiredError);
  expect(() => schema.parse(1)).toThrow(typeError);
});

describe('optional()', () => {
  const schema = ArrayType.create(StringType.create()).optional();
  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('throws an error when a passed value is null', () => {
    expect(() => schema.parse(null)).toThrow(ParseError);
  });
});

describe('nullable()', () => {
  const schema = ArrayType.create(StringType.create()).nullable();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(null)).toBe(null);
  });

  test('throws an error when a passed value is undefined', () => {
    expect(() => schema.parse(undefined)).toThrow(ParseError);
  });
});

describe('nullish()', () => {
  const schema = ArrayType.create(StringType.create()).nullish();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });
});

describe('required()', () => {
  const optionalSchema = ArrayType.create(StringType.create())
    .optional()
    .nullable();
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
    const items = ['a', 'b', 'c'];
    const schema = ArrayType.create(StringType.create()).map(
      (items) => items.join()
    );
    expect(schema.parse(items)).toBe(items.join());
  });

  test('rethrows any error from the `mapper` function', () => {
    const error = new ParseError('invalid_state', 'Invalid state.');
    const schema = ArrayType.create(StringType.create()).map(() => {
      throw error;
    });
    expect(() => schema.parse([])).toThrow(error);
  });
});

describe('unique()', () => {
  test('returns a passed items when they are unique', () => {
    const schema = ArrayType.create(StringType.create()).unique();
    const items = ['a', 'b', 'c'];
    expect(schema.parse(items)).toEqual(items);
  });

  test("throws an error when a passed items aren't unique", () => {
    const schema = ArrayType.create(StringType.create()).unique();
    const items = ['a', 'b', 'a'];
    expect(() => schema.parse(items)).toThrow(ParseError);
  });

  test('throws an error with custom error message', () => {
    const message = 'not unique';
    const schema = ArrayType.create(StringType.create()).unique({ message });
    const items = ['a', 'b', 'a'];
    expect(() => schema.parse(items)).toThrow(message);
  });
});

describe('length()', () => {
  test('returns a passed array when it has required length', () => {
    const schema = ArrayType.create(StringType.create()).length(3);
    const items = ['a', 'b', 'c'];
    expect(schema.parse(items)).toEqual(items);
  });

  test(
    "throws an error when a passed array doesn't have required length",
    () => {
      const schema = ArrayType.create(StringType.create()).length(2);
      const items = ['a', 'b', 'a'];
      expect(() => schema.parse(items)).toThrow(ParseError);
    }
  );

  test('throws an error with custom error message', () => {
    const message = 'must have length: 2';
    const items = ['a', 'b', 'a'];
    expect(
      () => ArrayType.create(StringType.create())
        .length(2, { message })
        .parse(items)
    ).toThrow(message);
    expect(
      () => ArrayType.create(StringType.create())
        .length(2, { message: () => message })
        .parse(items)
    ).toThrow(message);
  });
});

describe('maxItems()', () => {
  test('returns a passed array when it has length <= limit', () => {
    const schema = ArrayType.create(StringType.create()).maxItems(3);
    expect(schema.parse(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    expect(schema.parse(['a', 'b'])).toEqual(['a', 'b']);
  });

  test('throws an error when a passed array length > limit', () => {
    const schema = ArrayType.create(StringType.create()).maxItems(3);
    const items = ['a', 'b', 'c', 'd'];
    expect(() => schema.parse(items)).toThrow(ParseError);
  });

  test('throws an error with custom error message', () => {
    const message = 'must have at most 3 items';
    const items = ['a', 'b', 'c', 'd'];
    expect(
      () => ArrayType.create(StringType.create())
        .maxItems(3, { message })
        .parse(items)
    ).toThrow(message);
    expect(
      () => ArrayType.create(StringType.create())
        .maxItems(3, { message: () => message })
        .parse(items)
    ).toThrow(message);
  });
});

describe('minItems()', () => {
  test('returns a passed array when it has length >= limit', () => {
    const schema = ArrayType.create(StringType.create()).minItems(3);
    expect(schema.parse(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    expect(schema.parse(['a', 'b', 'c', 'd'])).toEqual(['a', 'b', 'c', 'd']);
  });

  test('throws an error when a passed array length < limit', () => {
    const schema = ArrayType.create(StringType.create()).minItems(3);
    const items = ['a', 'b'];
    expect(() => schema.parse(items)).toThrow(ParseError);
  });

  test('throws an error with custom error message', () => {
    const message = 'must have at least 3 items';
    const items = ['a', 'b'];
    expect(
      () => ArrayType.create(StringType.create())
        .minItems(3, { message })
        .parse(items)
    ).toThrow(message);
    expect(
      () => ArrayType.create(StringType.create())
        .minItems(3, { message: () => message })
        .parse(items)
    ).toThrow(message);
  });
});

describe('custom()', () => {
  const lengthError = new ParseError(
    'invalid_length',
    'must contain 3 items'
  );
  const validateArrayLength = (value: string[]) => {
    if (value.length !== 3) {
      throw lengthError;
    }
    return value;
  };

  test('returns a value from custom validator', () => {
    const schema = ArrayType
      .create(StringType.create())
      .custom(validateArrayLength);
    const items = ['a', 'b', 'c'];
    expect(schema.parse(items)).toEqual(items);
  });

  test(
    "throws an error when a passed value doesn't pass custom validator",
    () => {
      const schema = ArrayType
        .create(StringType.create())
        .custom(validateArrayLength);
      expect(() => schema.parse(['a', 'b'])).toThrow(lengthError);
    }
  );
});
