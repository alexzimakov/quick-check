import { describe, expect, test, vi } from 'vitest';
import { range } from './range.js';

describe('positive cases', () => {
  const checkRange = range({ min: 1, max: 5 });
  const positiveCases = [
    1,
    5,
    2.5,
  ];
  positiveCases.forEach((input) => {
    test(`range(${input}) does not throw an error`, () => {
      expect(() => checkRange(input)).not.toThrow();
    });
  });
});

describe('negative cases', () => {
  const checkRange = range({ min: 1, max: 5 });
  const negativeCases = [
    0,
    6,
    NaN,
    Infinity,
    -Infinity,
  ];
  negativeCases.forEach((input) => {
    test(`range(${input}) throws an error`, () => {
      expect(() => checkRange(input)).toThrow();
    });
  });
});

test('throws RangeError when min >= max', () => {
  expect(() => range({ min: 1, max: 1 })).toThrow(RangeError);
  expect(() => range({ min: 2, max: 1 })).toThrow(RangeError);
});

test('should throw an error with custom message', () => {
  const message = 'must be >= 1 and <= 5';
  const checkRange = range({
    min: 1,
    max: 5,
    message,
  });
  expect(() => checkRange(0)).toThrow(message);
});

test('should throw an error with formatted message', () => {
  const value = 6;
  const min = 1;
  const max = 5;
  const message = 'must be >= 1 and <= 5';
  const messageFormatter = vi.fn(() => message);
  const checkRange = range({
    min,
    max,
    message: messageFormatter,
  });
  expect(() => checkRange(value)).toThrow(message);
  expect(messageFormatter).toBeCalledWith({
    value,
    min,
    max,
  });
});
