import { describe, expect, test, vi } from 'vitest';
import { isoDate } from './iso-date.js';

describe('positive cases', () => {
  const checkISODate = isoDate();
  const positiveCases = [
    '2010',
    '2010-08',
    '2010-08-20',
    '0000',
    '9999',
  ];
  positiveCases.forEach((input) => {
    test(`isoDate('${input}') does not throw an error`, () => {
      expect(() => checkISODate(input)).not.toThrow();
    });
  });
});

describe('negative cases', () => {
  const checkISODate = isoDate();
  const negativeCases = [
    '',
    '1',
    '10',
    '100',
    '10000',
    '-2010',
    '2010-00',
    '2010-13',
    '2010-08-00',
    '2010-08-32',
  ];
  negativeCases.forEach((input) => {
    test(`isoDate('${input}') throws an error`, () => {
      expect(() => checkISODate(input)).toThrow();
    });
  });
});

test('should throw an error with custom message', () => {
  const message = 'invalid ISO date';
  const checkISODate = isoDate(message);
  expect(() => checkISODate('')).toThrow(message);
});

test('should throw an error with formatted message', () => {
  const value = '2010-13';
  const message = 'invalid ISO date';
  const messageFormat = vi.fn(() => message);
  const checkISODate = isoDate(messageFormat);
  expect(() => checkISODate(value)).toThrow(message);
  expect(messageFormat).toBeCalledWith({ value });
});
