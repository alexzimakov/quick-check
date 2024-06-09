import assert from 'node:assert';
import { describe, test } from 'vitest';
import { validator, invalid, ValidationError } from '../index.js';

describe('success cases (enum)', () => {
  enum CompassPoint {
    NORTH = 'N',
    SOUTH = 'S',
    EAST = 'E',
    WEST = 'W',
  }
  const enumValidator = validator.enum(CompassPoint);
  const values = [
    CompassPoint.NORTH,
    CompassPoint.SOUTH,
    CompassPoint.EAST,
    CompassPoint.WEST,
  ];

  describe('returns successful result when the given value is a CompassPoint', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = enumValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('returns the given value when it is a CompassPoint', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const actualValue = enumValidator.parse(value);
        assert.equal(actualValue, value);
      });
    });
  });
});

describe('success cases (array)', () => {
  const allowedValues = ['north', 'south', 'west', 'east'];
  const enumValidator = validator.enum(allowedValues);
  const values = [...allowedValues];

  describe('returns successful result when the given value in allowed values', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = enumValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('returns the given value when it in allowed values', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const actualValue = enumValidator.parse(value);
        assert.equal(actualValue, value);
      });
    });
  });
});

describe('fail cases (enum)', () => {
  enum CompassPoint {
    NORTH = 'N',
    SOUTH = 'S',
    EAST = 'E',
    WEST = 'W',
  }
  const enumValidator = validator.enum(CompassPoint);
  const values = [
    null,
    undefined,
    true,
    1,
    1n,
    'North',
    {},
    [],
    Symbol(),
    () => true,
  ];

  describe('returns failed result when the given value is not a CompassPoint', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = enumValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });

  describe('throws an error when the given value is not a CompassPoint', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        assert.throws(() => {
          enumValidator.parse(value);
        }, ValidationError);
      });
    });
  });
});

describe('fail cases (array)', () => {
  const allowedValues = ['north', 'south', 'west', 'east'];
  const enumValidator = validator.enum(allowedValues);
  const values = [
    null,
    undefined,
    true,
    1,
    1n,
    'N',
    {},
    [],
    Symbol(),
    () => true,
  ];

  describe('returns failed result when the given value is not in allowed values', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = enumValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });

  describe('throws an error when the given value is not in allowed values', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        assert.throws(() => {
          enumValidator.parse(value);
        }, ValidationError);
      });
    });
  });
});

test('should accept `null` values', () => {
  const enumValidator = validator.enum([1, 2, 3]).nullable();
  assert.deepStrictEqual(
    enumValidator.validate(null),
    { ok: true, value: null },
  );
});

test('should accept `undefined` values', () => {
  const enumValidator = validator.enum([1, 2, 3]).optional();
  assert.deepStrictEqual(
    enumValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should accept `null` and `undefined` values', () => {
  const enumValidator = validator.enum([1, 2, 3]).optionalOrNullable();
  assert.deepStrictEqual(
    enumValidator.validate(null),
    { ok: true, value: null },
  );
  assert.deepStrictEqual(
    enumValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should check against the custom validator', () => {
  const customError = new ValidationError({
    code: ValidationError.Code.CUSTOM_ERROR,
    message: 'The value is invalid.',
  });
  const enumValidator = validator.enum([1, 2, 3]).custom(() => {
    return invalid(customError);
  });
  const result = enumValidator.validate(3);
  assert(!result.ok);
  assert(result.error === customError);
});
