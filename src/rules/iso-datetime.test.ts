import { describe, expect, test, vi } from 'vitest';
import { isoDatetime } from './iso-datetime.js';

const validDates = [
  '2010',
  '2010-08',
  '2010-08-20',
  '0000',
  '9999',
];
const validTimes = [
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

describe('positive cases', () => {
  const checkISODatetime = isoDatetime();
  const positiveCases: string[] = [];
  for (const date of validDates) {
    for (const time of validTimes) {
      positiveCases.push(`${date}T${time}`);
    }
  }
  positiveCases.forEach((input) => {
    test(`isoDatetime('${input}') does not throw an error`, () => {
      expect(() => checkISODatetime(input)).not.toThrow();
    });
  });
});

const invalidDates = [
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
const invalidTimes = [
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
describe('negative cases', () => {
  const checkISOTime = isoDatetime();
  const negativeCases = [
    '',
    '2010-08-20 17:21',
    '2010-08-20t17:21',
  ];
  for (const date of validDates) {
    for (const time of invalidTimes) {
      negativeCases.push(`${date}T${time}`);
    }
  }
  for (const date of invalidDates) {
    for (const time of validTimes) {
      negativeCases.push(`${date}T${time}`);
    }
  }
  negativeCases.forEach((input) => {
    test(`isoDatetime('${input}') throws an error`, () => {
      expect(() => checkISOTime(input)).toThrow();
    });
  });
});

test('should throw an error with custom message', () => {
  const message = 'invalid ISO datetime';
  const checkISODatetime = isoDatetime(message);
  expect(() => checkISODatetime('')).toThrow(message);
});

test('should throw an error with formatted message', () => {
  const value = '2010-08-20 17:21';
  const message = 'invalid ISO time';
  const formatter = vi.fn(() => message);
  const checkISODatetime = isoDatetime(formatter);
  expect(() => checkISODatetime(value)).toThrow(message);
  expect(formatter).toBeCalledWith({ value });
});
