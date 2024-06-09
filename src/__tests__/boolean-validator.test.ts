import assert from 'node:assert';
import { describe, test } from 'vitest';
import { validator, invalid, ValidationError } from '../index.js';

describe('success cases', () => {
  const booleanValidator = validator.boolean();
  const values = [true, false];

  describe('returns successful result when the given value is a boolean', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = booleanValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('returns the given value when it is a boolean', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const actualValue = booleanValidator.parse(value);
        assert.equal(actualValue, value);
      });
    });
  });
});

describe('fail cases', () => {
  const booleanValidator = validator.boolean();
  const values = [
    null,
    undefined,
    'true',
    1,
    1n,
    {},
    [],
    Symbol(),
    () => true,
  ];

  describe('returns failed result when the given value is not a boolean', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = booleanValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });

  describe('throws an error when the given value is not a boolean', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        assert.throws(() => {
          booleanValidator.parse(value);
        }, ValidationError);
      });
    });
  });
});

test('should accept `null` values', () => {
  const booleanValidator = validator.boolean().nullable();
  assert.deepStrictEqual(
    booleanValidator.validate(null),
    { ok: true, value: null },
  );
});

test('should accept `undefined` values', () => {
  const booleanValidator = validator.boolean().optional();
  assert.deepStrictEqual(
    booleanValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should accept `null` and `undefined` values', () => {
  const booleanValidator = validator.boolean().optionalOrNullable();
  assert.deepStrictEqual(
    booleanValidator.validate(null),
    { ok: true, value: null },
  );
  assert.deepStrictEqual(
    booleanValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should check against the custom validator', () => {
  const customError = new ValidationError({
    code: ValidationError.Code.CUSTOM_ERROR,
    message: 'The value is invalid.',
  });
  const booleanValidator = validator.boolean().custom(() => {
    return invalid(customError);
  });
  const result = booleanValidator.validate(false);
  assert(!result.ok);
  assert(result.error === customError);
});
