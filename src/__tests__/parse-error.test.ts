import { expect, test } from 'vitest';
import { ParseError } from '../parse-error.js';

test('creates a new ParseError', () => {
  const code = 'INVALID_TYPE';
  const message = 'Invalid type: expected string, received number.';
  const cause = new TypeError();

  const error = new ParseError(code, message, { cause });

  expect(error).toBeInstanceOf(Error);
  expect(error).toBeInstanceOf(ParseError);
  expect(error).toHaveProperty('code', code);
  expect(error).toHaveProperty('message', message);
  expect(error).toHaveProperty('cause', cause);
  expect(error).toHaveProperty('path', []);
  expect(error).toHaveProperty('params', {});
  expect(error).toHaveProperty('details', []);
});

test('creates ParseError instance from an any argument type', () => {
  const code = 'INVALID_TYPE';
  const message = 'Invalid type: expected string, received number.';
  const errorLikeObject = { code, message, foo: 'bar' };
  const typeError = new TypeError(message);
  const parseError = new ParseError(code, message);

  expect(ParseError.of(message)).toEqual(new ParseError(
    ParseError.Codes.unknown,
    message,
    { cause: message }
  ));

  expect(ParseError.of(errorLikeObject)).toEqual(new ParseError(
    code,
    message,
    { cause: errorLikeObject }
  ));

  expect(ParseError.of(typeError)).toEqual(new ParseError(
    ParseError.Codes.unknown,
    typeError.message,
    { cause: typeError }
  ));

  expect(ParseError.of(parseError)).toBe(parseError);
});

test('return a string representation of the error', () => {
  const code = 'INVALID_TYPE';
  const message = 'Invalid type: expected string, received number.';

  const error = new ParseError(code, message);

  expect(String(error)).toBe(`ParseError [${code}]: ${message}`);
});

test('returns a JSON representation of the error', () => {
  const code = 'INVALID_TYPE';
  const message = 'Invalid type: expected string, received number.';

  const error = new ParseError(code, message);
  const json = JSON.parse(JSON.stringify(error));

  expect(json).toEqual({
    code,
    message,
    name: 'ParseError',
    params: {},
    path: [],
    details: [],
  });
});

test('can store additional errors', () => {
  const code = 'INVALID_ITEMS';
  const message = 'The array contain invalid items';
  const error1 = new TypeError('type error 1');
  const error2 = new TypeError('type error 2');

  const parseError = new ParseError(code, message, {
    details: [error1, error2],
  });

  expect(parseError.details).toEqual([error1, error2]);
});
