import { describe, expect, test, vi } from 'vitest';
import { minLength } from './min-length.js';

describe('positive cases', () => {
  const checkMinLength = minLength(2);
  const positiveCases = [
    'ab',
    'abc',
  ];
  positiveCases.forEach((input) => {
    test(`minLength('${input}') does not throw an error`, () => {
      expect(() => checkMinLength(input)).not.toThrow();
    });
  });
});

describe('negative cases', () => {
  const checkMinLength = minLength(2);
  const negativeCases = [
    '',
    'a',
  ];
  negativeCases.forEach((input) => {
    test(`minLength('${input}') throws an error`, () => {
      expect(() => checkMinLength(input)).toThrow();
    });
  });
});

test('should throw an error with custom message', () => {
  const message = 'must has length >= 2';
  const checkMinLength = minLength(2, message);
  expect(() => checkMinLength('a')).toThrow(message);
});

test('should throw an error with formatted message', () => {
  const value = 'a';
  const limit = 2;
  const message = 'must has length >= 2';
  const messageFormat = vi.fn(() => message);
  const checkMinLength = minLength(limit, messageFormat);
  expect(() => checkMinLength(value)).toThrow(message);
  expect(messageFormat).toBeCalledWith({
    value,
    limit,
    characterCount: value.length,
  });
});
