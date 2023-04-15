import { maxItems } from './max-items.js';
import { describe, expect, test, vi } from 'vitest';

describe('positive cases', () => {
  const checkMaxItems = maxItems(2);
  const positiveCases = [
    [],
    [1],
    [1, 2],
  ];
  positiveCases.forEach((input) => {
    test(`maxItems(${JSON.stringify(input)}) does not throw an error`, () => {
      expect(() => checkMaxItems(input)).not.toThrow();
    });
  });
});

describe('negative cases', () => {
  const checkMaxItems = maxItems(2);
  const negativeCases = [
    [1, 2, 3],
    [1, 2, 3, 4],
  ];
  negativeCases.forEach((input) => {
    test(`maxItems(${JSON.stringify(input)}) throws an error`, () => {
      expect(() => checkMaxItems(input)).toThrow();
    });
  });
});

test('should throw an error with custom message', () => {
  const message = 'must contain at most 2 items';
  const checkMaxItems = maxItems(2, message);
  expect(() => checkMaxItems([1, 2, 3])).toThrow(message);
});

test('should throw an error with formatted message', () => {
  const value = [1, 2, 3];
  const limit = 2;
  const message = 'must contain at most 2 items';
  const messageFormat = vi.fn(() => message);
  const checkMaxItems = maxItems(limit, messageFormat);
  expect(() => checkMaxItems(value)).toThrow(message);
  expect(messageFormat).toBeCalledWith({
    value,
    limit,
    itemCount: value.length,
  });
});
