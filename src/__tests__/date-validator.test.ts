import assert from 'node:assert';
import { describe, test } from 'vitest';
import { validator, invalid, ValidationError } from '../index.js';
import { DateValidator } from '../date-validator.js';

describe('success cases', () => {
  const dateValidator = validator.date();
  const values = [
    new Date(),
    new Date('2000-01-15'),
  ];

  describe('returns successful result when the given value is a valid date', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = dateValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('returns the given value when it is a valid date', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const actualValue = dateValidator.parse(value);
        assert.equal(actualValue, value);
      });
    });
  });
});

describe('fail cases', () => {
  const dateValidator = validator.date();
  const values = [
    null,
    undefined,
    '2024-01-15',
    true,
    1,
    1n,
    {},
    [],
    Symbol(),
    () => true,
    new Date(NaN),
  ];

  describe('returns failed result when the given value is not a valid date', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = dateValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });

  describe('throws an error when the given value is not a valid date', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        assert.throws(() => {
          dateValidator.parse(value);
        }, ValidationError);
      });
    });
  });
});

test('should accept `null` values', () => {
  const dateValidator = validator.date().nullable();
  assert.deepStrictEqual(
    dateValidator.validate(null),
    { ok: true, value: null },
  );
});

test('should accept `undefined` values', () => {
  const dateValidator = validator.date().optional();
  assert.deepStrictEqual(
    dateValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should accept `null` and `undefined` values', () => {
  const dateValidator = validator.date().optionalOrNullable();
  assert.deepStrictEqual(
    dateValidator.validate(null),
    { ok: true, value: null },
  );
  assert.deepStrictEqual(
    dateValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should check against the custom validator', () => {
  const customError = new ValidationError({
    code: ValidationError.Code.CUSTOM_ERROR,
    message: 'The value is invalid.',
  });
  const dateValidator = validator.date().custom(() => {
    return invalid(customError);
  });
  const result = dateValidator.validate(new Date());
  assert(!result.ok);
  assert(result.error === customError);
});

test('should parse ISO date string', () => {
  const dateValidator = validator.date({ tryParseISO: true });
  const value = '2024-01-15T12:40:37.861Z';
  const expectedValue = new Date(value);
  const actualValue = dateValidator.parse(value);
  assert.deepStrictEqual(expectedValue, actualValue);
});

test('should not throw an error when pass an invalid rule', () => {
  assert.doesNotThrow(() => {
    // @ts-expect-error: Pass unknown rule.
    const numberValidator = new DateValidator(new Map([
      ['unknown', { type: 'unknown' }],
    ]));
    const value = new Date();
    const result = numberValidator.validate(value);
    assert(result.ok);
    assert(result.value === value);
  });
});

describe('past()', () => {
  describe('validation succeeds when the given date in the past', () => {
    const pastValidator = validator.date().past();
    const now = new Date();
    const values = [
      (() => new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate(),
      ))(),
      (() => new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate(),
      ))(),
      (() => new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1,
      ))(),
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = pastValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given date in the future', () => {
    const pastValidator = validator.date().past();
    const now = new Date();
    const values = [
      (() => new Date(
        now.getFullYear() + 1,
        now.getMonth(),
        now.getDate(),
      ))(),
      (() => new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
      ))(),
      (() => new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      ))(),
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = pastValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('future()', () => {
  describe('validation succeeds when the given date in the future', () => {
    const futureValidator = validator.date().future();
    const now = new Date();
    const values = [
      (() => new Date(
        now.getFullYear() + 1,
        now.getMonth(),
        now.getDate(),
      ))(),
      (() => new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
      ))(),
      (() => new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      ))(),
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = futureValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given date in the past', () => {
    const futureValidator = validator.date().future();
    const now = new Date();
    const values = [
      (() => new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate(),
      ))(),
      (() => new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate(),
      ))(),
      (() => new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1,
      ))(),
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = futureValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('lessThan()', () => {
  describe('validation succeeds when the given date < `max` argument', () => {
    const lessThanValidator = validator.date().lessThan(new Date('2024-02-15'));
    const values = [
      new Date('2024-02-14'),
      new Date('2024-01-15'),
      new Date('2023-02-15'),
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = lessThanValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given date ≥ `max` argument', () => {
    const lessThanValidator = validator.date().lessThan(new Date('2024-02-15'));
    const values = [
      new Date('2024-02-15'),
      new Date('2024-02-16'),
      new Date('2024-03-15'),
      new Date('2025-02-15'),
    ];
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
  describe('validation succeeds when the given date <= `max` argument', () => {
    const lessThanOrEqualValidator = validator
      .date()
      .lessThanOrEqualTo(new Date('2024-02-15'));
    const values = [
      new Date('2024-02-15'),
      new Date('2024-02-14'),
      new Date('2024-01-15'),
      new Date('2023-02-15'),
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = lessThanOrEqualValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value > `max` argument', () => {
    const lessThanOrEqualValidator = validator.date().lessThanOrEqualTo(new Date('2024-02-15'));
    const values = [
      new Date('2024-02-16'),
      new Date('2024-03-15'),
      new Date('2025-02-15'),
    ];
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
  describe('validation succeeds when the given date > `max` argument', () => {
    const greaterThanValidator = validator.date().greaterThan(new Date('2024-05-10'));
    const values = [
      new Date('2024-05-11'),
      new Date('2024-06-10'),
      new Date('2025-05-10'),
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = greaterThanValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given date ≤ `max` argument', () => {
    const greaterThanValidator = validator.date().greaterThan(new Date('2024-05-10'));
    const values = [
      new Date('2024-05-10'),
      new Date('2024-05-09'),
      new Date('2024-04-10'),
      new Date('2023-06-10'),
    ];
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
  describe('validation succeeds when the given date ≥ `max` argument', () => {
    const greaterThanOrEqualToValidator = validator
      .date()
      .greaterThanOrEqualTo(new Date('2024-05-10'));
    const values = [
      new Date('2024-05-10'),
      new Date('2024-05-11'),
      new Date('2024-06-10'),
      new Date('2025-06-10'),
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = greaterThanOrEqualToValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given date < `max` argument', () => {
    const greaterThanOrEqualToValidator = validator
      .date()
      .greaterThanOrEqualTo(new Date('2024-05-10'));
    const values = [
      new Date('2024-05-09'),
      new Date('2024-04-10'),
      new Date('2023-05-10'),
    ];
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
      validator.date().range({
        min: new Date('2024-01-13'),
        max: new Date('2024-01-10'),
      });
    }, RangeError);
  });

  test('throws an error when `min` === `max`', () => {
    assert.throws(() => {
      validator.date().range({
        min: new Date('2024-01-10'),
        max: new Date('2024-01-10'),
      });
    }, RangeError);
  });

  describe('validation succeeds when the given value in the given range', () => {
    const greaterThanOrEqualToValidator = validator.date().range({
      min: new Date('2024-01-10'),
      max: new Date('2024-01-13'),
    });
    const values = [
      new Date('2024-01-10'),
      new Date('2024-01-11'),
      new Date('2024-01-12'),
      new Date('2024-01-13'),
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = greaterThanOrEqualToValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value is out of the given range', () => {
    const greaterThanOrEqualToValidator = validator.date().range({
      min: new Date('2024-01-10'),
      max: new Date('2024-01-13'),
    });
    const values = [
      new Date('2024-01-09'),
      new Date('2024-01-14'),
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = greaterThanOrEqualToValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('sameDay()', () => {
  describe('validation succeeds when the given date is same day as the target date', () => {
    const sameDayValidator = validator.date().sameDay(new Date('2024-05-10'));
    const values = [
      new Date('2024-05-10'),
      new Date('2024-05-10T14:30'),
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = sameDayValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given date is not same day as the target date', () => {
    const sameDayValidator = validator.date().sameDay(new Date('2024-05-10'));
    const values = [
      new Date('2024-05-09'),
      new Date('2024-05-11'),
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = sameDayValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});
