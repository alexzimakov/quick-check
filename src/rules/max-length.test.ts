import { maxLength } from './max-length.js';
import { describe, expect, test, vi } from 'vitest';

describe('positive cases', () => {
  const checkMaxLength = maxLength(2);
  const positiveCases = [
    '',
    'a',
    'ab',
  ];
  positiveCases.forEach((input) => {
    test(`maxLength('${input}') does not throw an error`, () => {
      expect(() => checkMaxLength(input)).not.toThrow();
    });
  });
});

describe('negative cases', () => {
  const checkMaxLength = maxLength(2);
  const negativeCases = [
    'abc',
    'abcd',
  ];
  negativeCases.forEach((input) => {
    test(`maxLength('${input}') throws an error`, () => {
      expect(() => checkMaxLength(input)).toThrow();
    });
  });
});

test('should throw an error with custom message', () => {
  const message = 'must has length <= 2';
  const checkMaxLength = maxLength(2, message);
  expect(() => checkMaxLength('abc')).toThrow(message);
});

test('should throw an error with formatted message', () => {
  const value = 'abc';
  const limit = 2;
  const message = 'must has length <= 2';
  const messageFormat = vi.fn(() => message);
  const checkMaxLength = maxLength(limit, messageFormat);
  expect(() => checkMaxLength(value)).toThrow(message);
  expect(messageFormat).toBeCalledWith({
    value,
    limit,
    characterCount: value.length,
  });
});
