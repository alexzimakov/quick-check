import assert from 'node:assert';
import { describe, test } from 'vitest';
import { validator, invalid, ValidationError } from '../index.js';
import { ArrayValidator } from '../array-validator.js';

describe('success cases', () => {
  const arrayValidator = validator.array();
  const values = [
    [],
    [1],
    ['a', 'b', 'c'],
  ];

  describe('returns successful result when the given value is an array', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = arrayValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('returns the given value when it is an array', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const actualValue = arrayValidator.parse(value);
        assert.equal(actualValue, value);
      });
    });
  });
});

describe('success cases (typed array)', () => {
  const arrayValidator = validator.array(validator.number());
  const values = [
    [],
    [1],
    [1, 2],
    [0.5, 0.75, 1],
  ];

  describe('returns successful result when the given value is an array and '
  + 'every element conforms the item schema', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = arrayValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('returns the given value when it is an array and '
  + 'every element conforms the item schema', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const actualValue = arrayValidator.parse(value);
        assert.equal(actualValue, value);
      });
    });
  });
});

describe('fail cases', () => {
  const arrayValidator = validator.array();
  const values = [
    null,
    undefined,
    true,
    1,
    1n,
    '[]',
    {},
    Symbol(),
    () => true,
  ];

  describe('returns failed result when the given value is not an array', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = arrayValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });

  describe('throws an error when the given value is not an array', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        assert.throws(() => {
          arrayValidator.parse(value);
        }, ValidationError);
      });
    });
  });
});

describe('fail cases (typed array)', () => {
  const arrayValidator = validator.array(validator.number());
  const values = [
    ['a'],
    [1, '2', 3],
    [1, 2, NaN, Infinity],
  ];

  describe('returns failed result when any element in the given array '
  + 'does not conform item schema', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = arrayValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });

  describe('throws an error when any element in the given array '
  + 'does not conform item schema', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        assert.throws(() => {
          arrayValidator.parse(value);
        }, ValidationError);
      });
    });
  });
});

test('should accept `null` values', () => {
  const arrayValidator = validator.array().nullable();
  assert.deepStrictEqual(
    arrayValidator.validate(null),
    { ok: true, value: null },
  );
});

test('should accept `undefined` values', () => {
  const arrayValidator = validator.array().optional();
  assert.deepStrictEqual(
    arrayValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should accept `null` and `undefined` values', () => {
  const arrayValidator = validator.array().optionalOrNullable();
  assert.deepStrictEqual(
    arrayValidator.validate(null),
    { ok: true, value: null },
  );
  assert.deepStrictEqual(
    arrayValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should check against the custom validator', () => {
  const customError = new ValidationError({
    code: ValidationError.Code.CUSTOM_ERROR,
    message: 'The value is invalid.',
  });
  const arrayValidator = validator.array().custom(() => {
    return invalid(customError);
  });
  const result = arrayValidator.validate([]);
  assert(!result.ok);
  assert(result.error === customError);
});

test('should not throw an error when pass an invalid rule', () => {
  assert.doesNotThrow(() => {
    // @ts-expect-error: Pass unknown rule.
    const numberValidator = new ArrayValidator(null, new Map([
      ['unknown', { type: 'unknown' }],
    ]));
    const value = [];
    const result = numberValidator.validate(value);
    assert(result.ok);
    assert(result.value === value);
  });
});

describe('unique()', () => {
  describe('validation succeeds when the given array contains unique elements', () => {
    const arrayValidator = validator.array().unique();
    const values = [
      [],
      [1],
      [1, 2, 3],
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = arrayValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given array contains repeatable elements', () => {
    const arrayValidator = validator.array().unique();
    const values = [
      [1, 1],
      [1, 2, 2, 3],
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = arrayValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('unique() with custom comparator', () => {
  describe('validation succeeds when the given array contains unique elements', () => {
    const arrayValidator = validator.array().unique({
      comparator: (a: unknown, b: unknown) => Object.is(a, b),
    });
    const values = [
      [],
      [1],
      [1, 2, 3],
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = arrayValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given array contains repeatable elements', () => {
    const arrayValidator = validator.array().unique({
      comparator: (a: unknown, b: unknown) => Object.is(a, b),
    });
    const values = [
      [1, 1],
      [1, 2, 2, 3],
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = arrayValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('notEmpty()', () => {
  describe('validation succeeds when the given array contains at least 1 element', () => {
    const arrayValidator = validator.array().notEmpty();
    const values = [
      [1],
      [1, 2],
      [1, 2, 3],
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = arrayValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given array is empty', () => {
    const arrayValidator = validator.array().notEmpty();
    const values = [
      [],
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = arrayValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('minLength()', () => {
  test('throws an error when `minLength` argument < 0', () => {
    assert.throws(() => {
      validator.array().minLength(-1);
    }, RangeError);
  });

  describe('validation succeeds when the given array has at least `minLength` elements', () => {
    const minLengthValidator = validator.array().minLength(3);
    const values = [
      [1, 2, 3],
      [1, 2, 3, 4],
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = minLengthValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given array has less than `minLength` elements', () => {
    const minLengthValidator = validator.array().minLength(3);
    const values = [
      [],
      [1],
      [1, 2],
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = minLengthValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('maxLength()', () => {
  test('throws an error when `maxLength` argument < 0', () => {
    assert.throws(() => {
      validator.array().maxLength(-1);
    }, RangeError);
  });

  describe('validation succeeds when the given array has at most `maxLength` elements', () => {
    const maxLengthValidator = validator.array().maxLength(3);
    const values = [
      [],
      [1],
      [1, 2],
      [1, 2, 3],
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = maxLengthValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given array has more than `maxLength` elements', () => {
    const maxLengthValidator = validator.array().maxLength(3);
    const values = [
      [1, 2, 3, 4],
      [1, 2, 3, 4, 5],
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = maxLengthValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('length()', () => {
  test('throws an error when `min` < 0', () => {
    assert.throws(() => {
      validator.array().length({ min: -1, max: 3 });
    }, RangeError);
  });

  test('throws an error when `min` > `max`', () => {
    assert.throws(() => {
      validator.array().length({ min: 3, max: 2 });
    }, RangeError);
  });

  test('throws an error when `min` === `max`', () => {
    assert.throws(() => {
      validator.array().length({ min: 2, max: 2 });
    }, RangeError);
  });

  describe('validation succeeds when the given array length in the given range', () => {
    const lengthValidator = validator.array().length({ min: 0, max: 3 });
    const values = [
      [],
      [1],
      [1, 2],
      [1, 2, 3],
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = lengthValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given array length is not in the given range', () => {
    const lengthValidator = validator.array().length({ min: 0, max: 3 });
    const values = [
      [1, 2, 3, 4],
      [1, 2, 3, 4, 5],
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = lengthValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});
