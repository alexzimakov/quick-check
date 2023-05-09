import { describe, expect, test, vi } from 'vitest';
import { integer } from './integer.js';

describe('positive cases', () => {
  const checkInteger = integer();
  const positiveCases = [
    0,
    10,
    -10,
    Number.MAX_SAFE_INTEGER,
    Number.MIN_SAFE_INTEGER,
  ];
  positiveCases.forEach((input) => {
    test(`integer(${input}) does not throw an error`, () => {
      expect(() => checkInteger(input)).not.toThrow();
    });
  });
});

describe('negative cases', () => {
  const checkInteger = integer();
  const negativeCases = [
    10.5,
    NaN,
    Infinity,
  ];
  negativeCases.forEach((input) => {
    test(`integer(${input}) throws an error`, () => {
      expect(() => checkInteger(input)).toThrow();
    });
  });
});

test('should throw an error with custom message', () => {
  const message = 'invalid integer';
  const checkInteger = integer({ message });
  expect(() => checkInteger(10.5)).toThrow(message);
});

test('should throw an error with formatted message', () => {
  const value = 10.5;
  const message = 'invalid integer';
  const messageFormatter = vi.fn(() => message);
  const checkInteger = integer({ message: messageFormatter });
  expect(() => checkInteger(value)).toThrow(message);
  expect(messageFormatter).toBeCalledWith({ value });
});
