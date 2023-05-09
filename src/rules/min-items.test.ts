import { describe, expect, test, vi } from 'vitest';
import { minItems } from './min-items.js';

describe('positive cases', () => {
  const checkMinItems = minItems({ limit: 2 });
  const positiveCases = [
    [1, 2],
    [1, 2, 3],
  ];
  positiveCases.forEach((input) => {
    test(`minItems(${JSON.stringify(input)}) does not throw an error`, () => {
      expect(() => checkMinItems(input)).not.toThrow();
    });
  });
});

describe('negative cases', () => {
  const checkMinItems = minItems({ limit: 2 });
  const negativeCases = [
    [],
    [1],
  ];
  negativeCases.forEach((input) => {
    test(`minItems(${JSON.stringify(input)}) throws an error`, () => {
      expect(() => checkMinItems(input)).toThrow();
    });
  });
});

test('should throw an error with custom message', () => {
  const message = 'must contain at least 2 items';
  const checkMinItems = minItems({ limit: 2, message });
  expect(() => checkMinItems([1])).toThrow(message);
});

test('should throw an error with formatted message', () => {
  const value = [1];
  const limit = 2;
  const message = 'must contain at least 2 items';
  const messageFormatter = vi.fn(() => message);
  const checkMinItems = minItems({ limit, message: messageFormatter });
  expect(() => checkMinItems(value)).toThrow(message);
  expect(messageFormatter).toBeCalledWith({
    value,
    limit,
    itemCount: value.length,
  });
});
