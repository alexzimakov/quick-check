import { describe, expect, test } from 'vitest';
import { ObjectType } from '../type-aliases/object-type.js';
import { StringType } from '../type-aliases/string-type.js';
import { NumberType } from '../type-aliases/number-type.js';
import { BooleanType } from '../type-aliases/boolean-type.js';
import { EnumType } from '../type-aliases/enum-type.js';
import { ArrayType } from '../type-aliases/array-type.js';
import { ParseError } from '../parse-error.js';
import { format } from './test-util.js';

describe('positive cases', () => {
  class TestObject {
    str: string;
    num: number;

    constructor(str: string, num: number) {
      this.str = str;
      this.num = num;
    }
  }

  const testCases = [
    {
      input: { str: 'foo' },
      output: { str: 'foo' },
    },
    {
      input: { str: 'foo', num: 1, unknownProp: true },
      output: { str: 'foo', num: 1 },
    },
    {
      input: new TestObject('test', 10),
      output: { str: 'test', num: 10 },
    },
  ];
  const schema = ObjectType.create({
    str: StringType.create(),
    num: NumberType.create().optional(),
  });
  testCases.forEach(({ input, output }) => {
    test(
      `should return ${format(input)} when value is ${format(output)}`,
      () => expect(schema.parse(input)).toEqual(output)
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
    [],
    Symbol('Object'),
  ];
  const schema = ObjectType.create({});
  invalid.forEach((value) => {
    test(`should throw an error when value is ${format(value)}`, () => {
      expect(() => schema.parse(value)).toThrow(ParseError);
    });
  });
});

test('should allow unknown properties', () => {
  const schema = ObjectType.create({
    str: StringType.create(),
    num: NumberType.create(),
  }, { omitUnknownProps: false });
  const value = {
    str: 'lorem ipsum',
    num: 10,
    unknown: true,
    array: [1, 2, 3],
  };
  expect(schema.parse(value)).toEqual(value);
});

test(
  "throws an error when one or more props don't conform to the schema",
  () => {
    const schema = ObjectType.create({
      str: StringType.create(),
      num: NumberType.create(),
      bool: BooleanType.create(),
      enum: EnumType.create([1, 2, 3] as const),
      arr: ArrayType.create(StringType.create()),
      nested: ObjectType.create({
        foo: StringType.create(),
      }),
    });
    const value = {
      str: 'foo',
      num: NaN,
      bool: false,
      enum: -1,
      arr: ['a', 'b', 'c', 4],
      nested: {},
    };

    try {
      schema.parse(value);
    } catch (error) {
      expect(error).toBeInstanceOf(ParseError);

      const errors = (error as ParseError).details;
      expect(errors).toHaveLength(4);

      expect(errors[0]).toBeInstanceOf(ParseError);
      expect(errors[0]).toHaveProperty('path', ['num']);

      expect(errors[1]).toBeInstanceOf(ParseError);
      expect(errors[1]).toHaveProperty('path', ['enum']);

      expect(errors[2]).toBeInstanceOf(ParseError);
      expect(errors[2]).toHaveProperty('path', ['arr', 3]);

      expect(errors[3]).toBeInstanceOf(ParseError);
      expect(errors[3]).toHaveProperty('path', ['nested', 'foo']);
    }

    expect.assertions(10);
  }
);

test('casts to the object a passed value', () => {
  const schema = ObjectType.create({}, { cast: true });
  expect(schema.parse(null)).toEqual({});
  expect(schema.parse(undefined)).toEqual({});
});

test('throws errors with custom messages', () => {
  const requiredError = 'is required';
  const typeError = 'must be string';
  const schema = ObjectType.create({}, {
    requiredError,
    typeError,
  });
  expect(() => schema.parse(null)).toThrow(requiredError);
  expect(() => schema.parse(1)).toThrow(typeError);
});

describe('optional()', () => {
  const schema = ObjectType.create({}).optional();
  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('throws an error when a passed value is null', () => {
    expect(() => schema.parse(null)).toThrow(ParseError);
  });
});

describe('nullable()', () => {
  const schema = ObjectType.create({}).nullable();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(null)).toBe(null);
  });

  test('throws an error when a passed value is undefined', () => {
    expect(() => schema.parse(undefined)).toThrow(ParseError);
  });
});

describe('nullish()', () => {
  const schema = ObjectType.create({}).nullish();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });
});

describe('required()', () => {
  const optionalSchema = ObjectType.create({})
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
    const schema = ObjectType.create({
      foo: StringType.create(),
    }).map((obj) => JSON.stringify(obj));
    const value = { foo: 'bar' };
    expect(schema.parse(value)).toBe(JSON.stringify(value));
  });

  test('rethrows any error from the `mapper` function', () => {
    const error = new ParseError('invalid_state', 'Invalid state.');
    const schema = ObjectType.create({}).map(() => {
      throw error;
    });
    expect(() => schema.parse({})).toThrow(error);
  });
});


describe('onlyKnownProps()', () => {
  test("returns a passed object when it doesn't have unknown props", () => {
    const schema = ObjectType.create({
      a: NumberType.create().optional(),
      b: NumberType.create().optional(),
    }).onlyKnownProps();
    expect(schema.parse({})).toEqual({});
    expect(schema.parse({ a: 1 })).toEqual({ a: 1 });
    expect(schema.parse({ a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
  });

  test('throws an error when the object has unknown properties', () => {
    const schema = ObjectType.create({
      a: NumberType.create().optional(),
      b: NumberType.create().optional(),
    }, { omitUnknownProps: false }).onlyKnownProps();
    expect(() => schema.parse({
      a: 1,
      b: 2,
      c: 3,
    })).toThrow(ParseError);
  });

  test('throws an error with custom error message', () => {
    const message = 'must have only known props';
    const obj = { a: 'foo', b: 2 };
    expect(
      () => ObjectType.create(
        { a: StringType.create() },
        { omitUnknownProps: false }
      )
        .onlyKnownProps({ message })
        .parse(obj)
    ).toThrow(message);
    expect(
      () => ObjectType.create(
        { a: StringType.create() },
        { omitUnknownProps: false }
      )
        .onlyKnownProps({ message: () => message })
        .parse(obj)
    ).toThrow(message);
  });
});

describe('custom()', () => {
  const propsSchema = {
    a: NumberType.create(),
    b: NumberType.create(),
  };
  const sumError = new ParseError('invalid_sum', 'Invalid sum');
  const validateSum = (value: { a: number, b: number }) => {
    if (value.a + value.b !== 10) {
      throw sumError;
    }
    return value;
  };

  test('returns a value from custom validator', () => {
    const schema = ObjectType
      .create(propsSchema)
      .custom(validateSum);
    const obj = { a: 5, b: 5 };
    expect(schema.parse(obj)).toEqual(obj);
  });

  test(
    "throws an error when a passed value doesn't pass custom validator",
    () => {
      const schema = ObjectType
        .create(propsSchema)
        .custom(validateSum);
      expect(() => schema.parse({ a: 5, b: 3 })).toThrow(sumError);
    }
  );
});

describe('ObjectType.isObject', () => {
  test('returns true when the value is an object', () => {
    expect(ObjectType.isObject({})).toBe(true);
    expect(ObjectType.isObject(Object.create(null))).toBe(true);
    expect(ObjectType.isObject({ foo: 'bar' })).toBe(true);
    expect(ObjectType.isObject(new Date())).toBe(true);
  });

  test('returns false when the value is not an object', () => {
    expect(ObjectType.isObject(null)).toBe(false);
    expect(ObjectType.isObject(undefined)).toBe(false);
    expect(ObjectType.isObject('foo')).toBe(false);
    expect(ObjectType.isObject(1)).toBe(false);
    expect(ObjectType.isObject(1n)).toBe(false);
    expect(ObjectType.isObject(true)).toBe(false);
    expect(ObjectType.isObject([])).toBe(false);
    expect(ObjectType.isObject(Symbol('test'))).toBe(false);
  });
});

describe('ObjectType.formatProperties()', () => {
  test('returns empty string when the props count is 0', () => {
    expect(ObjectType.formatProps([])).toBe('');
  });

  test('returns first property when the props count is 1', () => {
    expect(ObjectType.formatProps(['sum'])).toBe('sum');
  });

  test('returns props joined using " and " when the props count is 2', () => {
    expect(ObjectType.formatProps(['a', 'b'])).toBe('a and b');
  });

  test(
    'returns props conjunction when the props count is greater than 2',
    () => {
      expect(
        ObjectType.formatProps(['a', 'b', 'c', 'd'])
      ).toBe('a, b, c, and d');
    }
  );
});
