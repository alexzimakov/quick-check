import assert from 'node:assert';
import { describe, test } from 'vitest';
import { validator, invalid, ValidationError } from '../index.js';

describe('success cases', () => {
  const objectTypeValidator = validator.instanceOf(Date);
  const values = [
    new Date(),
    new Date(NaN),
    new Date('2024-02-01'),
  ];

  describe('returns successful result when the given value is a Date instance', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = objectTypeValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('returns the given value when it is a Date instance', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const actualValue = objectTypeValidator.parse(value);
        assert.equal(actualValue, value);
      });
    });
  });
});

describe('fail cases', () => {
  const objectTypeValidator = validator.instanceOf(Date);
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
    new Map(),
  ];

  describe('returns failed result when the given value is not a Date instance', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = objectTypeValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });

  describe('throws an error when the given value is not a Date instance', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        assert.throws(() => {
          objectTypeValidator.parse(value);
        }, ValidationError);
      });
    });
  });
});

test('should accept `null` values', () => {
  const objectTypeValidator = validator.instanceOf(Date).nullable();
  assert.deepStrictEqual(
    objectTypeValidator.validate(null),
    { ok: true, value: null },
  );
});

test('should accept `undefined` values', () => {
  const objectTypeValidator = validator.instanceOf(Date).optional();
  assert.deepStrictEqual(
    objectTypeValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should accept `null` and `undefined` values', () => {
  const objectTypeValidator = validator.instanceOf(Date).optionalOrNullable();
  assert.deepStrictEqual(
    objectTypeValidator.validate(null),
    { ok: true, value: null },
  );
  assert.deepStrictEqual(
    objectTypeValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should check against the custom validator', () => {
  const customError = new ValidationError({
    code: ValidationError.Code.CUSTOM_ERROR,
    message: 'The value is invalid.',
  });
  const objectTypeValidator = validator.instanceOf(Date).custom(() => {
    return invalid(customError);
  });
  const result = objectTypeValidator.validate(new Date());
  assert(!result.ok);
  assert(result.error === customError);
});
