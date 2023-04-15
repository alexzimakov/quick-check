import { min } from './min.js';
import { describe, expect, test, vi } from 'vitest';

describe('positive cases', () => {
  const checkMin = min(2);
  const positiveCases = [
    4,
    2.5,
    Infinity,
  ];
  positiveCases.forEach((input) => {
    test(`min(${input}) does not throw an error`, () => {
      expect(() => checkMin(input)).not.toThrow();
    });
  });
});

describe('negative cases', () => {
  const checkMin = min(2);
  const negativeCases = [
    0,
    1,
    -1,
    NaN,
    -Infinity,
  ];
  negativeCases.forEach((input) => {
    test(`min(${input}) throws an error`, () => {
      expect(() => checkMin(input)).toThrow();
    });
  });
});

test('should throw an error with custom message', () => {
  const message = 'must be >= 2';
  const checkMin = min(2, message);
  expect(() => checkMin(1)).toThrow(message);
});

test('should throw an error with formatted message', () => {
  const value = 1;
  const limit = 2;
  const message = 'must be >= 2';
  const messageFormat = vi.fn(() => message);
  const checkMin = min(limit, messageFormat);
  expect(() => checkMin(value)).toThrow(message);
  expect(messageFormat).toBeCalledWith({ value, limit });
});
