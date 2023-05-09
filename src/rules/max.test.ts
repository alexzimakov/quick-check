import { describe, expect, test, vi } from 'vitest';
import { max } from './max.js';

describe('positive cases', () => {
  const positiveCases = [3n, 0, 2.5, 5, 5n, -5, -Infinity];
  const limits: [string, number | bigint][] = [
    ['number', 5],
    ['bigint', 5n],
  ];
  limits.forEach(([type, limit]) => {
    describe(type, () => {
      const checkMax = max({ limit });
      positiveCases.forEach((value) => {
        const arg = typeof value === 'bigint' ? `${value}n` : value;
        test(`max(${arg}) does not throw an error`, () => {
          expect(() => checkMax(value)).not.toThrow();
        });
      });
    });
  });
});

describe('negative cases', () => {
  const negativeCases = [NaN, Infinity, 6, 6.5, 6n];
  const limits: [string, number | bigint][] = [
    ['number', 5],
    ['bigint', 5n],
  ];
  limits.forEach(([type, limit]) => {
    describe(type, () => {
      const checkMax = max({ limit });
      negativeCases.forEach((value) => {
        const arg = typeof value === 'bigint' ? `${value}n` : value;
        test(`max(${arg}) throws an error`, () => {
          expect(() => checkMax(value)).toThrow();
        });
      });
    });
  });
});

test('should throw an error with custom message', () => {
  const message = 'must be <= 5';
  const checkMax = max({ limit: 5, message });
  expect(() => checkMax(6)).toThrow(message);
});

test('should throw an error with formatted message', () => {
  const value = 10.5;
  const limit = 5;
  const message = 'must be <= 10.5';
  const messageFormatter = vi.fn(() => message);
  const checkMax = max({ limit, message: messageFormatter });
  expect(() => checkMax(value)).toThrow(message);
  expect(messageFormatter).toBeCalledWith({ value, limit });
});
