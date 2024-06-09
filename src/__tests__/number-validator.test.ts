import assert from 'node:assert';
import { describe, test } from 'vitest';
import { validator, invalid, ValidationError } from '../index.js';
import { NumberValidator } from '../number-validator.js';

describe('success cases', () => {
  const numberValidator = validator.number();
  const values = [0, 1, -1, 10.5, -10.5];

  describe('returns successful result when the given value is a number', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = numberValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('returns the given value when it is a number', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const actualValue = numberValidator.parse(value);
        assert.equal(actualValue, value);
      });
    });
  });
});

describe('fail cases', () => {
  const numberValidator = validator.number();
  const values = [
    null,
    undefined,
    true,
    '1',
    NaN,
    Infinity,
    1n,
    {},
    [],
    Symbol(),
    () => true,
  ];

  describe('returns failed result when the given value is not a number', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = numberValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });

  describe('throws an error when the given value is not a number', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        assert.throws(() => {
          numberValidator.parse(value);
        }, ValidationError);
      });
    });
  });
});

test('should accept `null` values', () => {
  const numberValidator = validator.number().nullable();
  assert.deepStrictEqual(
    numberValidator.validate(null),
    { ok: true, value: null },
  );
});

test('should accept `undefined` values', () => {
  const numberValidator = validator.number().optional();
  assert.deepStrictEqual(
    numberValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should accept `null` and `undefined` values', () => {
  const numberValidator = validator.number().optionalOrNullable();
  assert.deepStrictEqual(
    numberValidator.validate(null),
    { ok: true, value: null },
  );
  assert.deepStrictEqual(
    numberValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should check against the custom validator', () => {
  const customError = new ValidationError({
    code: ValidationError.Code.CUSTOM_ERROR,
    message: 'The value is invalid.',
  });
  const numberValidator = validator.number().custom(() => {
    return invalid(customError);
  });
  const result = numberValidator.validate(4);
  assert(!result.ok);
  assert(result.error === customError);
});

test('should not throw an error when pass an invalid rule', () => {
  assert.doesNotThrow(() => {
    // @ts-expect-error: Pass unknown rule.
    const numberValidator = new NumberValidator(new Map([
      ['unknown', { type: 'unknown' }],
    ]));
    const value = 5;
    const result = numberValidator.validate(value);
    assert(result.ok);
    assert(result.value === value);
  });
});

describe('int()', () => {
  describe('validation succeeds when the given value is an integer', () => {
    const intValidator = validator.number().int();
    const values = [0, 5, -5, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = intValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value is not an integer', () => {
    const intValidator = validator.number().int();
    const values = [0.5, -10.1, 10.0000001];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = intValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('positive()', () => {
  describe('validation succeeds when the given value > 0', () => {
    const positiveValidator = validator.number().positive();
    const values = [0.1, 1, 15];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = positiveValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value ≤ 0', () => {
    const positiveValidator = validator.number().positive();
    const values = [0, -0.1, -1, -15];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = positiveValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('negative()', () => {
  describe('validation succeeds when the given value < 0', () => {
    const negativeValidator = validator.number().negative();
    const values = [-0.1, -1, -15];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = negativeValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value ≥ 0', () => {
    const negativeValidator = validator.number().negative();
    const values = [0, 0.1, 1, 15];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = negativeValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('lessThan()', () => {
  describe('validation succeeds when the given value < `max` argument', () => {
    const lessThanValidator = validator.number().lessThan(5);
    const values = [4, 3, -1];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = lessThanValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value ≥ `max` argument', () => {
    const lessThanValidator = validator.number().lessThan(5);
    const values = [5, 7, 100];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = lessThanValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('lessThanOrEqualTo()', () => {
  describe('validation succeeds when the given value <= `max` argument', () => {
    const lessThanOrEqualValidator = validator.number().lessThanOrEqualTo(5);
    const values = [5, 4, 3, -1];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = lessThanOrEqualValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value > `max` argument', () => {
    const lessThanOrEqualValidator = validator.number().lessThanOrEqualTo(5);
    const values = [5.1, 6, 7, 100];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = lessThanOrEqualValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('greaterThan()', () => {
  describe('validation succeeds when the given value > `max` argument', () => {
    const greaterThanValidator = validator.number().greaterThan(5);
    const values = [5.1, 6, 10];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = greaterThanValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value ≤ `max` argument', () => {
    const greaterThanValidator = validator.number().greaterThan(5);
    const values = [5, 4, 0, -10];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = greaterThanValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('greaterThanOrEqualTo()', () => {
  describe('validation succeeds when the given value ≥ `max` argument', () => {
    const greaterThanOrEqualToValidator = validator.number().greaterThanOrEqualTo(5);
    const values = [5, 5.1, 6, 10];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = greaterThanOrEqualToValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value < `max` argument', () => {
    const greaterThanOrEqualToValidator = validator.number().greaterThanOrEqualTo(5);
    const values = [4.99, 4, 0, -10];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = greaterThanOrEqualToValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('range()', () => {
  test('throws an error when `min` > `max`', () => {
    assert.throws(() => {
      validator.number().range({ min: 5, max: 1 });
    }, RangeError);
  });

  test('throws an error when `min` === `max`', () => {
    assert.throws(() => {
      validator.number().range({ min: 1, max: 1 });
    }, RangeError);
  });

  describe('validation succeeds when the given value in the given range', () => {
    const greaterThanOrEqualToValidator = validator.number().range({
      min: 1,
      max: 5,
    });
    const values = [1, 2, 3, 4, 5];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = greaterThanOrEqualToValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value is out of the given range', () => {
    const greaterThanOrEqualToValidator = validator.number().range({
      min: 1,
      max: 5,
    });
    const values = [0.99, 5.01, -1, 10];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = greaterThanOrEqualToValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('divisibleBy()', () => {
  describe('validation succeeds when the given value is divisible to the given number', () => {
    const greaterThanOrEqualToValidator = validator.number().divisibleBy(5);
    const values = [0, 5, 10, -15];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = greaterThanOrEqualToValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation succeeds when the given value is not divisible to the given number', () => {
    const greaterThanOrEqualToValidator = validator.number().divisibleBy(5);
    const values = [1, 6, 10.5];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = greaterThanOrEqualToValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});
