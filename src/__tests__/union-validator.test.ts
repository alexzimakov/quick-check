import assert from 'node:assert';
import { describe, test } from 'vitest';
import { validator, invalid, ValidationError } from '../index.js';

describe('success cases', () => {
  const oneOfValidator = validator.oneOf([
    validator.number(),
    validator.string(),
  ]);
  const values = [1, 'test'];

  describe('returns successful result when the given value passes check at least 1 validator', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = oneOfValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('returns the given value when it passes check at least 1 validator', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const actualValue = oneOfValidator.parse(value);
        assert.equal(actualValue, value);
      });
    });
  });
});

describe('fail cases', () => {
  const oneOfValidator = validator.oneOf([
    validator.number(),
    validator.string(),
  ]);
  const values = [
    null,
    undefined,
    true,
    1n,
    {},
    [],
    Symbol(),
    () => true,
  ];

  describe('returns failed result when the given value does not pass check any validator', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = oneOfValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });

  describe('throws an error when the given value does not pass check any validator', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        assert.throws(() => {
          oneOfValidator.parse(value);
        }, ValidationError);
      });
    });
  });
});

test('should accept `null` values', () => {
  const oneOfValidator = validator.oneOf([
    validator.number(),
    validator.string(),
  ]).nullable();
  assert.deepStrictEqual(
    oneOfValidator.validate(null),
    { ok: true, value: null },
  );
});

test('should accept `undefined` values', () => {
  const oneOfValidator = validator.oneOf([
    validator.number(),
    validator.string(),
  ]).optional();
  assert.deepStrictEqual(
    oneOfValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should accept `null` and `undefined` values', () => {
  const oneOfValidator = validator.oneOf([
    validator.number(),
    validator.string(),
  ]).optionalOrNullable();
  assert.deepStrictEqual(
    oneOfValidator.validate(null),
    { ok: true, value: null },
  );
  assert.deepStrictEqual(
    oneOfValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should check against the custom validator', () => {
  const customError = new ValidationError({
    code: ValidationError.Code.CUSTOM_ERROR,
    message: 'The value is invalid.',
  });
  const oneOfValidator = validator.oneOf([
    validator.number(),
    validator.string(),
  ]).custom(() => {
    return invalid(customError);
  });
  const result = oneOfValidator.validate(3);
  assert(!result.ok);
  assert(result.error === customError);
});

test('throws an error when passing an empty validator list', () => {
  assert.throws(() => {
    validator.oneOf([]);
  }, RangeError);
});
