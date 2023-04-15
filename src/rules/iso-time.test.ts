import { describe, expect, test, vi } from 'vitest';
import { isoTime } from './iso-time.js';

describe('positive cases', () => {
  const checkISOTime = isoTime();
  const positiveCases = [
    '17:21',
    '17:21Z',
    '17:21+0300',
    '17:21+03:00',
    '17:21:08',
    '17:21:08Z',
    '17:21:08-0200',
    '17:21:08-02:00',
    '17:21:08.234',
    '17:21:08.234Z',
    '17:21:08.234+0030',
    '17:21:08.234-0030',
    '00:00',
    '23:59',
  ];
  positiveCases.forEach((input) => {
    test(`isoTime('${input}') does not throw an error`, () => {
      expect(() => checkISOTime(input)).not.toThrow();
    });
  });
});

describe('negative cases', () => {
  const checkISOTime = isoTime();
  const negativeCases = [
    '',
    '-17:21',
    '1721',
    '17:21 08',
    '17:21z',
    '17:21+3',
    '17:21+300',
    '17:21+3:00',
    '17:60',
    '24:00',
  ];
  negativeCases.forEach((input) => {
    test(`isoTime('${input}') throws an error`, () => {
      expect(() => checkISOTime(input)).toThrow();
    });
  });
});

test('should throw an error with custom message', () => {
  const message = 'invalid ISO time';
  const checkISOTime = isoTime(message);
  expect(() => checkISOTime('')).toThrow(message);
});

test('should throw an error with formatted message', () => {
  const value = '17 21';
  const message = 'invalid ISO time';
  const formatter = vi.fn(() => message);
  const checkISOTime = isoTime(formatter);
  expect(() => checkISOTime(value)).toThrow(message);
  expect(formatter).toBeCalledWith({ value });
});
