import { describe, expect, test, vi } from 'vitest';
import { max } from './max.js';

describe('positive cases', () => {
  const checkMax = max(5);
  const positiveCases = [
    0,
    2.5,
    5,
    -5,
    -Infinity,
  ];
  positiveCases.forEach((input) => {
    test(`max(${input}) does not throw an error`, () => {
      expect(() => checkMax(input)).not.toThrow();
    });
  });
});

describe('negative cases', () => {
  const checkMax = max(5);
  const negativeCases = [
    NaN,
    Infinity,
    6,
  ];
  negativeCases.forEach((input) => {
    test(`max(${input}) throws an error`, () => {
      expect(() => checkMax(input)).toThrow();
    });
  });
});

test('should throw an error with custom message', () => {
  const message = 'must be <= 5';
  const checkMax = max(5, message);
  expect(() => checkMax(6)).toThrow(message);
});

test('should throw an error with formatted message', () => {
  const value = 10.5;
  const limit = 5;
  const message = 'must be <= 10.5';
  const messageFormat = vi.fn(() => message);
  const checkMax = max(limit, messageFormat);
  expect(() => checkMax(value)).toThrow(message);
  expect(messageFormat).toBeCalledWith({ value, limit });
});
