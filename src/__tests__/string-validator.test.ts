import assert from 'node:assert';
import { describe, test } from 'vitest';
import { validator, invalid, ValidationError } from '../index.js';
import { StringValidator } from '../string-validator.js';

describe('success cases', () => {
  const stringValidator = validator.string();
  const values = ['', '\n', 'hello world', '1'];

  describe('returns successful result when the given value is a string', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = stringValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('returns the given value when it is a string', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const actualValue = stringValidator.parse(value);
        assert.equal(actualValue, value);
      });
    });
  });
});

describe('fail cases', () => {
  const stringValidator = validator.string();
  const values = [
    null,
    undefined,
    true,
    1,
    1n,
    {},
    [],
    Symbol(),
    () => true,
  ];

  describe('returns failed result when the given value is not a string', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = stringValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });

  describe('throws an error when the given value is not a string', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        assert.throws(() => {
          stringValidator.parse(value);
        }, ValidationError);
      });
    });
  });
});

test('should accept `null` values', () => {
  const stringValidator = validator.string().nullable();
  assert.deepStrictEqual(
    stringValidator.validate(null),
    { ok: true, value: null },
  );
});

test('should accept `undefined` values', () => {
  const stringValidator = validator.string().optional();
  assert.deepStrictEqual(
    stringValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should accept `null` and `undefined` values', () => {
  const stringValidator = validator.string().optionalOrNullable();
  assert.deepStrictEqual(
    stringValidator.validate(null),
    { ok: true, value: null },
  );
  assert.deepStrictEqual(
    stringValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should check against the custom validator', () => {
  const customError = new ValidationError({
    code: ValidationError.Code.CUSTOM_ERROR,
    message: 'The value is invalid.',
  });
  const stringValidator = validator.string().custom(() => {
    return invalid(customError);
  });
  const result = stringValidator.validate('string');
  assert(!result.ok);
  assert(result.error === customError);
});

test('should not throw an error when pass an invalid rule', () => {
  assert.doesNotThrow(() => {
    // @ts-expect-error: Pass unknown rule.
    const stringValidator = new StringValidator(new Map([
      ['unknown', { type: 'unknown' }],
    ]));
    const value = 'test';
    const result = stringValidator.validate(value);
    assert(result.ok);
    assert(result.value === value);
  });
});

describe('notEmpty()', () => {
  describe('validation succeeds when the given value is not an empty string', () => {
    const notEmptyValidator = validator.string().notEmpty();
    const values = ['not empty', ' '];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = notEmptyValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value is an empty string', () => {
    const notEmptyValidator = validator.string().notEmpty();
    const values = [''];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = notEmptyValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('notEmpty({ ignoreWhitespace: true })', () => {
  describe('validation succeeds when the given value is not an empty string', () => {
    const notEmptyValidator = validator.string().notEmpty({ ignoreWhitespace: true });
    const values = ['not empty', ' string '];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = notEmptyValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value is an empty string', () => {
    const notEmptyValidator = validator.string().notEmpty({ ignoreWhitespace: true });
    const values = ['', '  ', '\n '];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = notEmptyValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('minLength()', () => {
  test('throws an error when `minLength` argument < 0', () => {
    assert.throws(() => {
      validator.string().minLength(-1);
    }, RangeError);
  });

  describe('validation succeeds when the given value contains at least `minLength` characters', () => {
    const minLengthValidator = validator.string().minLength(3);
    const values = ['abc', 'abcd', 'abcde'];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = minLengthValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value contains less than `minLength` characters', () => {
    const minLengthValidator = validator.string().minLength(3);
    const values = ['', 'a', 'ab'];
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
      validator.string().maxLength(-1);
    }, RangeError);
  });

  describe('validation succeeds when the given value contains at most `maxLength` characters', () => {
    const maxLengthValidator = validator.string().maxLength(3);
    const values = ['', 'a', 'ab', 'abc'];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = maxLengthValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value contains less than `maxLength` characters', () => {
    const maxLengthValidator = validator.string().maxLength(3);
    const values = ['abcd', 'abcde'];
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
      validator.string().length({ min: -1, max: 3 });
    }, RangeError);
  });

  test('throws an error when `min` > `max`', () => {
    assert.throws(() => {
      validator.string().length({ min: 3, max: 2 });
    }, RangeError);
  });

  test('throws an error when `min` === `max`', () => {
    assert.throws(() => {
      validator.string().length({ min: 2, max: 2 });
    }, RangeError);
  });

  describe('validation succeeds when the given value length in the given range', () => {
    const lengthValidator = validator.string().length({ min: 0, max: 3 });
    const values = ['', 'a', 'ab', 'abc'];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = lengthValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value length is not in the given range', () => {
    const lengthValidator = validator.string().length({ min: 0, max: 3 });
    const values = ['abcd', 'abcde'];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = lengthValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('pattern()', () => {
  describe('validation succeeds when the given value matches the given pattern', () => {
    const patternValidator = validator.string().pattern(/^Test$/i);
    const values = ['test', 'TeSt'];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = patternValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value does not match the given pattern', () => {
    const patternValidator = validator.string().pattern(/^Test$/i);
    const values = [' test', 'teSst'];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = patternValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('ISODate()', () => {
  describe('validation succeeds when the given is valid ISO date string', () => {
    const ISODateValidator = validator.string().ISODate();
    const values = [
      '2024-06-08',
      '2024-02-29',
      '2023-02-28',
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = ISODateValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value is not valid ISO date string', () => {
    const ISODateValidator = validator.string().ISODate();
    const values = [
      'June 8, 2024',
      '2024-00-01',
      '2024-06-31',
      '2023-02-29',
      '2024-06-15T13:40',
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = ISODateValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});

describe('ISODateTime()', () => {
  describe('validation succeeds when the given is valid ISO date time string', () => {
    const ISODateValidator = validator.string().ISODateTime();
    const values = [
      '2024-06-08',
      '2024-02-29',
      '2023-02-28',
      '2024-06-08T13:40',
      '2024-06-08T13:40Z',
      '2024-06-08T13:40+0700',
      '2024-06-08T13:40-0730',
      '2024-06-08T13:40:25',
      '2024-06-08T13:40:25Z',
      '2024-06-08T13:40:25+0700',
      '2024-06-08T13:40:25-0730',
      '2024-06-08T13:40:25.087',
      '2024-06-08T13:40:25.087Z',
      '2024-06-08T13:40:25.087+0700',
      '2024-06-08T13:40:25.087-0730',
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = ISODateValidator.validate(value);
        assert(result.ok);
        assert.equal(result.value, value);
      });
    });
  });

  describe('validation failed when the given value is not valid ISO date time string', () => {
    const ISODateValidator = validator.string().ISODateTime();
    const values = [
      'June 8, 2024',
      '2024-00-01',
      '2024-06-31',
      '2023-02-29',
      '2024-06-15T',
      '2024-06-15T24:40',
      '2024-06-15T14:60',
      '2024-06-15T14:40:60',
      '2024-06-15T14:40:20+5',
    ];
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = ISODateValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });
});
