import { describe, expect, test, vi } from 'vitest';
import { min } from './min.js';

describe('positive cases', () => {
  const positiveCases = [4n, 4, 2.5, 2, 2n, Infinity];
  const limits: [string, number | bigint][] = [
    ['number', 2],
    ['bigint', 2n],
  ];
  limits.forEach(([type, limit]) => {
    describe(type, () => {
      const checkMin = min(limit);
      positiveCases.forEach((value) => {
        const arg = typeof value === 'bigint' ? `${value}n` : value;
        test(`max(${arg}) does not throw an error`, () => {
          expect(() => checkMin(value)).not.toThrow();
        });
      });
    });
  });
});

describe('negative cases', () => {
  const negativeCases = [0, 1n, 1, -1, NaN, -Infinity];
  const limits: [string, number | bigint][] = [
    ['number', 2],
    ['bigint', 2n],
  ];
  limits.forEach(([type, limit]) => {
    describe(type, () => {
      const checkMin = min(limit);
      negativeCases.forEach((value) => {
        const arg = typeof value === 'bigint' ? `${value}n` : value;
        test(`max(${arg}) throws an error`, () => {
          expect(() => checkMin(value)).toThrow();
        });
      });
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
