import assert from 'node:assert';
import { describe, test } from 'vitest';
import { validator, invalid, ValidationError } from '../index.js';

describe('success cases', () => {
  type Person = {
    name: string;
    age: number;
    bio?: string;
    birthDate?: Date | null;
  };
  const personValidator = validator.shape<Person>({
    name: validator.string().notEmpty(),
    age: validator.number().int(),
    bio: validator.string().optional(),
    birthDate: validator.date().optionalOrNullable(),
  });
  const values = [
    {
      name: 'John Doe',
      age: 18,
      birthDate: null,
    },
    {
      name: 'John Doe',
      age: 18,
      bio: 'test user',
    },
    {
      name: 'John Doe',
      age: 18,
      bio: 'test user',
      birthDate: new Date(),
    },
  ];

  describe('returns successful result when the given value conforms to the shape schema', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = personValidator.validate(value);
        assert(result.ok);
        assert(result.value !== value);
        assert.deepStrictEqual(result.value, value);
      });
    });
  });

  describe('returns the given value when it conforms to the shape schema', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const actualValue = personValidator.parse(value);
        assert(actualValue !== value);
        assert.deepStrictEqual(actualValue, value);
      });
    });
  });
});

describe('fail cases', () => {
  type Person = {
    name: string;
    age: number;
  };
  const personValidator = validator.shape<Person>({
    name: validator.string().notEmpty(),
    age: validator.number().int(),
  });
  const values = [
    null,
    undefined,
    true,
    '{ name: "John Doe" }',
    1,
    1n,
    {},
    { name: 123 },
    { name: 'John Doe', age: NaN },
    { name: '', age: NaN },
    [],
    Symbol(),
    () => true,
  ];

  describe('returns failed result when the given value does not conform to the shape schema', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        const result = personValidator.validate(value);
        assert(!result.ok);
        assert(result.error instanceof ValidationError);
      });
    });
  });

  describe('throws an error when the given value does not conform to the shape schema', () => {
    values.forEach((value, index) => {
      test(`test ${index + 1}`, () => {
        assert.throws(() => {
          personValidator.parse(value);
        }, ValidationError);
      });
    });
  });
});

test('should accept `null` values', () => {
  type Person = { name: string };
  const personValidator = validator.shape<Person>({
    name: validator.string(),
  }).nullable();
  assert.deepStrictEqual(
    personValidator.validate(null),
    { ok: true, value: null },
  );
});

test('should accept `undefined` values', () => {
  type Person = { name: string };
  const personValidator = validator.shape<Person>({
    name: validator.string(),
  }).optional();
  assert.deepStrictEqual(
    personValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should accept `null` and `undefined` values', () => {
  type Person = { name: string };
  const personValidator = validator.shape<Person>({
    name: validator.string(),
  }).optionalOrNullable();
  assert.deepStrictEqual(
    personValidator.validate(null),
    { ok: true, value: null },
  );
  assert.deepStrictEqual(
    personValidator.validate(undefined),
    { ok: true, value: undefined },
  );
});

test('should check against the custom validator', () => {
  const customError = new ValidationError({
    code: ValidationError.Code.CUSTOM_ERROR,
    message: 'The value is invalid.',
  });
  type Person = { name: string };
  const personValidator = validator.shape<Person>({
    name: validator.string(),
  }).custom(() => {
    return invalid(customError);
  });
  const result = personValidator.validate({ name: 'John Doe' });
  assert(!result.ok);
  assert(result.error === customError);
});

test('should return the key validator', () => {
  type Person = { name: string; age: number };
  const nameValidator = validator.string();
  const ageValidator = validator.number();
  const personValidator = validator.shape<Person>({
    name: nameValidator,
    age: ageValidator,
  });
  assert(personValidator.get('name') === nameValidator);
  assert(personValidator.get('age') === ageValidator);
});

test('should omit unknown keys', () => {
  type Person = {
    name: string;
    age: number;
  };
  const personSchema = validator.shape<Person>({
    name: validator.string(),
    age: validator.number(),
  }).omitUnknownProps();
  const value = {
    name: 'John Doe',
    age: 18,
    dateBirth: new Date(),
  };
  const actualValue = personSchema.parse(value);
  const expectedValue = {
    name: value.name,
    age: value.age,
  };
  assert(actualValue !== expectedValue);
  assert.deepStrictEqual(actualValue, expectedValue);
});

test('should allow unknown keys', () => {
  type Person = {
    name: string;
    age: number;
  };
  const personSchema = validator.shape<Person>({
    name: validator.string(),
    age: validator.number(),
  }).omitUnknownProps().allowUnknownProps();
  const value = {
    name: 'John Doe',
    age: 18,
    dateBirth: new Date(),
  };
  const actualValue = personSchema.parse(value);
  const expectedValue = {
    name: value.name,
    age: value.age,
    dateBirth: value.dateBirth,
  };
  assert(actualValue !== expectedValue);
  assert.deepStrictEqual(actualValue, expectedValue);
});
