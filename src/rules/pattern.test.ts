import { describe, expect, test, vi } from 'vitest';
import { pattern } from './pattern.js';

describe('positive cases', () => {
  const checkPattern = pattern({ pattern: /^\d+$/ });
  const positiveCases = ['1', '25'];
  positiveCases.forEach((input) => {
    test(`pattern('${input}') does not throw an error`, () => {
      expect(() => checkPattern(input)).not.toThrow();
    });
  });
});

describe('negative cases', () => {
  const checkPattern = pattern({ pattern: /^\d+$/ });
  const negativeCases = ['', 'abc'];
  negativeCases.forEach((input) => {
    test(`pattern('${input}') throws an error`, () => {
      expect(() => checkPattern(input)).toThrow();
    });
  });
});

test('should throw an error with custom message', () => {
  const message = 'invalid value';
  const checkPattern = pattern({ pattern: /^\d+$/, message });
  expect(() => checkPattern('')).toThrow(message);
});

test('should throw an error with formatted message', () => {
  const value = 'abc';
  const message = 'invalid value';
  const messageFormatter = vi.fn(() => message);
  const checkPattern = pattern({
    pattern: /^\d+$/,
    message: messageFormatter,
  });
  expect(() => checkPattern(value)).toThrow(message);
  expect(messageFormatter).toBeCalledWith({
    value,
    pattern: String(/^\d+$/),
  });
});
