import { expect, test } from 'vitest';
import { RapidCheckError } from '../error.js';

test('creates a new RapidCheckError', () => {
  const code = 'INVALID_TYPE';
  const message = 'Invalid type: expected string, received number.';
  const cause = new TypeError();

  const error = new RapidCheckError(code, message, { cause });

  expect(error).toBeInstanceOf(Error);
  expect(error).toBeInstanceOf(RapidCheckError);
  expect(error).toHaveProperty('code', code);
  expect(error).toHaveProperty('message', message);
  expect(error).toHaveProperty('cause', cause);
  expect(error).toHaveProperty('path', []);
  expect(error).toHaveProperty('params', {});
  expect(error).toHaveProperty('details', []);
});

test('creates RapidCheckError instance from an any argument type', () => {
  const code = 'INVALID_TYPE';
  const message = 'Invalid type: expected string, received number.';
  const errorLikeObject = { code, message, foo: 'bar' };
  const typeError = new TypeError(message);
  const rapidCheckError = new RapidCheckError(code, message);

  expect(RapidCheckError.of(message)).toEqual(new RapidCheckError(
    RapidCheckError.Codes.unknown,
    message,
    { cause: message }
  ));

  expect(RapidCheckError.of(errorLikeObject)).toEqual(new RapidCheckError(
    code,
    message,
    { cause: errorLikeObject }
  ));

  expect(RapidCheckError.of(typeError)).toEqual(new RapidCheckError(
    RapidCheckError.Codes.unknown,
    typeError.message,
    { cause: typeError }
  ));

  expect(RapidCheckError.of(rapidCheckError)).toBe(rapidCheckError);
});

test('return a string representation of the error', () => {
  const code = 'INVALID_TYPE';
  const message = 'Invalid type: expected string, received number.';

  const error = new RapidCheckError(code, message);

  expect(String(error)).toBe(`${RapidCheckError.name} [${code}]: ${message}`);
});

test('returns a JSON representation of the error', () => {
  const code = 'INVALID_TYPE';
  const message = 'Invalid type: expected string, received number.';

  const error = new RapidCheckError(code, message);
  const json = JSON.parse(JSON.stringify(error));

  expect(json).toEqual({
    code,
    message,
    name: 'RapidCheckError',
    params: {},
    path: [],
    details: [],
  });
});

test('should return nested errors', () => {
  const code = 'INVALID_ITEMS';
  const message = 'The array contain invalid items';
  const error1 = new TypeError('type error 1');
  const error2 = new TypeError('type error 2');

  const rapidCheckError = new RapidCheckError(code, message, {
    details: [error1, error2],
  });

  expect(rapidCheckError.getErrors()).toEqual([error1, error2]);
});

test('should add nested error', () => {
  const code = 'INVALID_ITEMS';
  const message = 'The array contain invalid items';
  const typeError = new TypeError('type error 1');

  const rapidCheckError = new RapidCheckError(code, message);

  expect(rapidCheckError.getErrors()).toEqual([]);
  rapidCheckError.addError(typeError);
  expect(rapidCheckError.getErrors()).toEqual([typeError]);
});

test('should return `true` when there are nested errors', () => {
  const code = 'INVALID_ITEMS';
  const message = 'The array contain invalid items';
  const typeError = new TypeError('type error 1');

  const rapidCheckError = new RapidCheckError(code, message, {
    details: [typeError],
  });

  expect(rapidCheckError.hasErrors()).toBe(true);
});
