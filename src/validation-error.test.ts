import { describe, expect, test } from 'vitest';
import { ValidationError } from './validation-error.js';

test('creates a ValidationError instance', () => {
  const message = 'invalid value';
  const cause = new Error();
  const code = 'test';
  const path = ['parent', 1];
  const details = { value: null };
  const error = new ValidationError(message, {
    cause,
    code,
    path,
    details,
  });
  expect(error.message).toBe(message);
  expect(error.cause).toBe(cause);
  expect(error.code).toBe(code);
  expect(error.details).toBe(details);
  expect(error.path).toBe(path);
});

test('should create copy of error', () => {
  const subError = new ValidationError('sub error');
  const error = new ValidationError('error message', {
    cause: new Error(),
    code: 'test',
    path: ['parent', 1],
    details: { value: null },
    subErrors: [subError],
  });
  const errorCopy = error.clone();
  expect(errorCopy).toBeInstanceOf(ValidationError);
  expect(errorCopy).not.toBe(error);
  expect(errorCopy.message).toBe(error.message);
  expect(errorCopy.stack).toBe(error.stack);
  expect(errorCopy.cause).toBe(error.cause);
  expect(errorCopy.code).toBe(error.code);
  expect(errorCopy.path).not.toBe(error.path);
  expect(errorCopy.path).toStrictEqual(error.path);
  expect(errorCopy.details).not.toBe(error.details);
  expect(errorCopy.details).toStrictEqual(error.details);
  expect(errorCopy.subErrors).not.toBe(error.subErrors);
  expect(errorCopy.subErrors).toStrictEqual(error.subErrors);
});

test('toJSON() returns JSON representation of error', () => {
  const error = new ValidationError('error message', {
    cause: new Error(),
    code: 'test',
    path: ['parent', 1],
    details: { value: null },
  });
  expect(error.toJSON()).toStrictEqual({
    name: 'ValidationError',
    message: error.message,
    code: error.code,
    path: error.path,
    details: error.details,
    subErrors: error.subErrors,
  });
});

test('toArray() returns flat array of errors', () => {
  /*
  Error graph:
    userError
    ├── nameError
    ├── ageError
    └── accountsError
        └── secondAccountError
            └── linkError

  Expected result:
    1. userError
    2. nameError
    3. ageError
    4. accountsError
    5. secondAccountError
    6. linkError
  */

  // Level 1
  const userError = new ValidationError('invalid user data', {});
  // Level 2
  const nameError = new ValidationError('must be a string', {
    path: ['name'],
  });
  const ageError = new ValidationError('must be greater than 20', {
    path: ['age'],
  });
  const accountsError = new ValidationError('invalid accounts list', {
    path: ['accounts'],
  });
  userError.subErrors.push(nameError);
  userError.subErrors.push(ageError);
  userError.subErrors.push(accountsError);
  // Level 3
  const secondAccountError = new ValidationError('invalid account', {
    path: [1],
  });
  accountsError.subErrors.push(secondAccountError);
  // Level 4
  const linkError = new ValidationError('invalid URL', {
    path: ['url'],
  });
  secondAccountError.subErrors.push(linkError);

  const errors = userError.toArray();
  expect(errors).toStrictEqual([
    userError,
    nameError,
    ageError,
    accountsError,
    secondAccountError,
    linkError,
  ]);
  expect(errors[0]).not.toBe(userError);
  expect(errors[1]).not.toBe(nameError);
  expect(errors[2]).not.toBe(ageError);
  expect(errors[3]).not.toBe(accountsError);
  expect(errors[4]).not.toBe(secondAccountError);
  expect(errors[5]).not.toBe(linkError);
});

describe('ValidationError.from()', () => {
  test('ValidationError', () => {
    const initialError = new ValidationError('invalid value');
    const error = ValidationError.from(initialError);
    expect(error).toStrictEqual(initialError);
  });

  test('Error', () => {
    const initialError = new Error('invalid value');
    const error = ValidationError.from(initialError);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.cause).toBe(initialError);
    expect(error.code).toBe('');
  });

  test('Error with code property', () => {
    const initialError = new Error('invalid value');
    const code = 'test';
    Object.assign(initialError, { code });
    const error = ValidationError.from(initialError);

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.cause).toBe(initialError);
    expect(error.code).toBe(code);
  });

  test('string', () => {
    const initialError = 'invalid value';
    const error = ValidationError.from(initialError);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe(initialError);
  });

  test('from unknown value', () => {
    const initialError = {};
    const error = ValidationError.from(initialError);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe('An unknown error occurred.');
    expect(error.cause).toBe(initialError);
  });
});
