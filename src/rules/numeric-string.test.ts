import { describe, expect, test, vi } from 'vitest';
import { numericString } from './numeric-string.js';

describe('positive cases', () => {
  const checkNumericString = numericString();
  const positiveCases = ['0', '1', '10', '10987654321'];
  positiveCases.forEach((input) => {
    test(`numericString('${input}') does not throw an error`, () => {
      expect(() => checkNumericString(input)).not.toThrow();
    });
  });
});

describe('negative cases', () => {
  const checkNumericString = numericString();
  const negativeCases = ['', 'abc', '01', '-100'];
  negativeCases.forEach((input) => {
    test(`numericString('${input}') throws an error`, () => {
      expect(() => checkNumericString(input)).toThrow();
    });
  });
});

test('should throw an error with custom message', () => {
  const message = 'invalid value';
  const checkNumericString = numericString({ message });
  expect(() => checkNumericString('')).toThrow(message);
});

test('should throw an error with formatted message', () => {
  const value = 'abc';
  const message = 'invalid value';
  const messageFormatter = vi.fn(() => message);
  const checkNumericString = numericString({ message: messageFormatter });
  expect(() => checkNumericString(value)).toThrow(message);
  expect(messageFormatter).toBeCalledWith({ value });
});
