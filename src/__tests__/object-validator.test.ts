import assert from 'node:assert';
import { describe, test } from 'vitest';
import { validator, invalid, ValidationError } from '../index.js';
import { ObjectValidator } from '../object-validator.js';

describe('success cases', () => {
  const objectValidator = validator.object();
  const values = [
    {},
    { a: 1 },
    new Date(),
  ];

  describe('returns successful result when the given value is an object', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = objectValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('returns the given value when it is an object', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const actualValue = objectValidator.parse(value);
        assert.equal(actualValue, value);
      });
    });
  });
});

describe('fail cases', () => {
  const objectValidator = validator.object();
  const values = [
    null,
    undefined,
    true,
    '{}',
    1,
    1n,
    [],
    Symbol(),
    () => true,
  ];

  describe('returns failed result when the given value is not an object', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = objectValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });

  describe('throws an error when the given value is not an object', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        assert.throws(() => {
          objectValidator.parse(value);
        }, ValidationError);
      });
    });
  });
});

test('should accept `null` values', () => {
  const objectValidator = validator.object().nullable();
  assert.deepStrictEqual(
    objectValidator.validate(null),
    { ok: true, value: null },
  );
});

test('should accept `undefined` values', () => {
  const objectValidator = validator.object().optional();
  assert.deepStrictEqual(
    objectValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should accept `null` and `undefined` values', () => {
  const objectValidator = validator.object().optionalOrNullable();
  assert.deepStrictEqual(
    objectValidator.validate(null),
    { ok: true, value: null },
  );
  assert.deepStrictEqual(
    objectValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should check against the custom validator', () => {
  const customError = new ValidationError({
    code: ValidationError.Code.CUSTOM_ERROR,
    message: 'The value is invalid.',
  });
  const objectValidator = validator.object().custom(() => {
    return invalid(customError);
  });
  const result = objectValidator.validate({});
  assert(!result.ok);
  assert(result.error === customError);
});

test('should not throw an error when pass an invalid rule', () => {
  assert.doesNotThrow(() => {
    // @ts-expect-error: Pass unknown rule.
    const objectValidator = new ObjectValidator(new Map([
      ['unknown', { type: 'unknown' }],
    ]));
    const value = {};
    const result = objectValidator.validate(value);
    assert(result.ok);
    assert(result.value === value);
  });
});

describe('notEmpty()', () => {
  describe('validation succeeds when the given object contains at least 1 key', () => {
    const objectValidator = validator.object().notEmpty();
    const values = [
      { a: undefined },
      { a: 1 },
      { a: 1, b: 2 },
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = objectValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given object is empty', () => {
    const objectValidator = validator.object().notEmpty();
    const values = [
      {},
      Object.create(null),
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = objectValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('key validator', () => {
  describe('validation succeeds when all keys of the given object pass check of the key validator', () => {
    const objectValidator = validator.object({
      key: validator.string().pattern(/^key_[0-9]+/),
    });
    const values = [
      {},
      { key_1: 1 },
      { key_1: 1, key_2: 2 },
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = objectValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when any key of the given object does not pass check of the key validator', () => {
    const objectValidator = validator.object({
      key: validator.string().pattern(/^key_[0-9]+/),
    });
    const values = [
      { key_1: 1, b: 2 },
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = objectValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('value validator', () => {
  describe('validation succeeds when all values of the given object pass check of the value validator', () => {
    const objectValidator = validator.object({
      value: validator.number().int(),
    });
    const values = [
      {},
      { a: 1 },
      { a: 1, b: 2 },
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = objectValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when any value of the given object does not pass check of the value validator', () => {
    const objectValidator = validator.object({
      value: validator.number().int(),
    });
    const values = [
      { a: 'a' },
      { a: 1, b: 2.5 },
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = objectValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});
