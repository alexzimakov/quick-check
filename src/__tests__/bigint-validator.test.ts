import assert from 'node:assert';
import { describe, test } from 'vitest';
import { validator, invalid, ValidationError } from '../index.js';
import { BigintValidator } from '../bigint-validator.js';

describe('success cases', () => {
  const bigintValidator = validator.bigint();
  const values = [0n, 4n, -4n];

  describe('returns successful result when the given value is a bigint', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = bigintValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('returns the given value when it is a bigint', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const actualValue = bigintValidator.parse(value);
        assert.equal(actualValue, value);
      });
    });
  });
});

describe('fail cases', () => {
  const bigintValidator = validator.bigint();
  const values = [
    null,
    undefined,
    true,
    '1n',
    NaN,
    Infinity,
    1,
    {},
    [],
    Symbol(),
    () => true,
  ];

  describe('returns failed result when the given value is not a bigint', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = bigintValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });

  describe('throws an error when the given value is not a bigint', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        assert.throws(() => {
          bigintValidator.parse(value);
        }, ValidationError);
      });
    });
  });
});

test('should accept `null` values', () => {
  const bigintValidator = validator.bigint().nullable();
  assert.deepStrictEqual(
    bigintValidator.validate(null),
    { ok: true, value: null },
  );
});

test('should accept `undefined` values', () => {
  const bigintValidator = validator.bigint().optional();
  assert.deepStrictEqual(
    bigintValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should accept `null` and `undefined` values', () => {
  const bigintValidator = validator.bigint().optionalOrNullable();
  assert.deepStrictEqual(
    bigintValidator.validate(null),
    { ok: true, value: null },
  );
  assert.deepStrictEqual(
    bigintValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should check against the custom validator', () => {
  const customError = new ValidationError({
    code: ValidationError.Code.CUSTOM_ERROR,
    message: 'The value is invalid.',
  });
  const bigintValidator = validator.bigint().custom(() => {
    return invalid(customError);
  });
  const result = bigintValidator.validate(4n);
  assert(!result.ok);
  assert(result.error === customError);
});

test('should not throw an error when pass an invalid rule', () => {
  assert.doesNotThrow(() => {
    // @ts-expect-error: Pass unknown rule.
    const numberValidator = new BigintValidator(new Map([
      ['unknown', { type: 'unknown' }],
    ]));
    const value = 5n;
    const result = numberValidator.validate(value);
    assert(result.ok);
    assert(result.value === value);
  });
});

describe('positive()', () => {
  describe('validation succeeds when the given value > 0n', () => {
    const positiveValidator = validator.bigint().positive();
    const values = [1n, 10n];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = positiveValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value ≤ 0n', () => {
    const positiveValidator = validator.bigint().positive();
    const values = [0n, -1n];
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
  describe('validation succeeds when the given value < 0n', () => {
    const negativeValidator = validator.bigint().negative();
    const values = [-1n, -10n];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = negativeValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value ≥ 0', () => {
    const negativeValidator = validator.bigint().negative();
    const values = [0n, 1n, 10n];
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
    const lessThanValidator = validator.bigint().lessThan(5n);
    const values = [4n, 3n, -1n];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = lessThanValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value ≥ `max` argument', () => {
    const lessThanValidator = validator.bigint().lessThan(5n);
    const values = [5n, 7n, 100n];
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
    const lessThanOrEqualValidator = validator.bigint().lessThanOrEqualTo(5n);
    const values = [5n, 4n, 3n, -1n];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = lessThanOrEqualValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value > `max` argument', () => {
    const lessThanOrEqualValidator = validator.bigint().lessThanOrEqualTo(5n);
    const values = [6n, 7n, 100n];
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
    const greaterThanValidator = validator.bigint().greaterThan(5n);
    const values = [6n, 10n];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = greaterThanValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value ≤ `max` argument', () => {
    const greaterThanValidator = validator.bigint().greaterThan(5n);
    const values = [5n, 4n, 0n, -10n];
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
    const greaterThanOrEqualToValidator = validator.bigint().greaterThanOrEqualTo(5n);
    const values = [5n, 6n, 10n];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = greaterThanOrEqualToValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value < `max` argument', () => {
    const greaterThanOrEqualToValidator = validator.bigint().greaterThanOrEqualTo(5n);
    const values = [4n, 0n, -10n];
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
      validator.bigint().range({ min: 5n, max: 1n });
    }, RangeError);
  });

  test('throws an error when `min` === `max`', () => {
    assert.throws(() => {
      validator.bigint().range({ min: 1n, max: 1n });
    }, RangeError);
  });

  describe('validation succeeds when the given value in the given range', () => {
    const greaterThanOrEqualToValidator = validator.bigint().range({
      min: 1n,
      max: 5n,
    });
    const values = [1n, 2n, 3n, 4n, 5n];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = greaterThanOrEqualToValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value is out of the given range', () => {
    const greaterThanOrEqualToValidator = validator.bigint().range({
      min: 1n,
      max: 5n,
    });
    const values = [-1n, 0n, 6n, 10n];
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
