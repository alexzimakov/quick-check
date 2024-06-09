import assert from 'node:assert';
import { test, describe } from 'vitest';
import {
  parseISODateString,
  parseISODateTimeString,
  isValidDate,
  getDaysInMonth,
} from '../date-utils.js';

describe('parseISOString()', () => {
  describe('success cases', () => {
    const successCases = [
      '2024-01-01',
      '2024-01-31',
      '2024-01-20',
      '2023-02-28',
      '2024-02-29',
    ];
    for (const dateString of successCases) {
      test(`parse '${dateString}'`, async () => {
        const actualDate = parseISODateString(dateString);
        const expectedDate = new Date(dateString);
        assert.deepStrictEqual(actualDate, expectedDate);
      });
    }
  });

  describe('failure cases', () => {
    const failureCases = [
      { message: 'empty string', value: '' },
      { message: 'invalid year: not a number', value: 'yyyy-00-20' },
      { message: 'invalid month: not a number', value: '2024-MM-20' },
      { message: 'invalid month: < 0', value: '2024-00-20' },
      { message: 'invalid month: > 12', value: '2024-13-20' },
      { message: 'invalid day: not a number', value: '2024-05-dd' },
      { message: 'invalid day: too small', value: '2024-05-00' },
      { message: 'invalid day: too large', value: '2024-05-32' },
      { message: 'invalid day: too large (leap year)', value: '2023-02-29' },
    ];
    for (const { message, value } of failureCases) {
      test(message, async () => {
        const actualDate = parseISODateString(value);
        assert.strictEqual(actualDate, null);
      });
    }
  });
});

describe('parseISODateTimeString()', () => {
  describe('success cases', () => {
    const successCases = [
      '2023-02-28',
      '2024-02-29',
      '2024-02-20',
      '2024-02-20T08:36',
      '2024-02-20T08:36Z',
      '2024-02-20T08:36+0200',
      '2024-02-20T08:36-0200',
      '2024-02-20T08:36+02:30',
      '2024-02-20T08:36-02:30',
      '2024-02-20T08:36:22',
      '2024-02-20T08:36:22Z',
      '2024-02-20T08:36:49+0200',
      '2024-02-20T08:36:49-0200',
      '2024-02-20T08:36:49+02:30',
      '2024-02-20T08:36:49-02:30',
      '2024-02-20T08:36:49.798',
      '2024-02-20T08:36:49.798Z',
      '2024-02-20T08:36:49.798+0200',
      '2024-02-20T08:36:49.798-0200',
      '2024-02-20T08:36:49.798+02:30',
      '2024-02-20T08:36:49.798-02:30',
    ];
    for (const dateTimeString of successCases) {
      test(`parse '${dateTimeString}'`, () => {
        const actualDate = parseISODateTimeString(dateTimeString);
        const expectedDate = new Date(dateTimeString);
        assert.deepStrictEqual(actualDate, expectedDate);
      });
    }
  });

  describe('failure cases', () => {
    const failureCases = [
      { message: 'empty string', value: '' },
      { message: 'invalid year: not a number', value: 'yyyy-00-20' },
      { message: 'invalid month: not a number', value: '2024-MM-20' },
      { message: 'invalid month: < 0', value: '2024-00-20' },
      { message: 'invalid month: > 12', value: '2024-13-20' },
      { message: 'invalid day: not a number', value: '2024-05-dd' },
      { message: 'invalid day: too small', value: '2024-05-00' },
      { message: 'invalid day: too large', value: '2024-05-32' },
      { message: 'invalid day: too large (leap year)', value: '2023-02-29' },
      { message: 'invalid hour: not a number', value: '2024-05-20THH:45' },
      { message: 'invalid hour: > 23', value: '2024-05-20T24:45' },
      { message: 'invalid minute: not a number', value: '2024-05-20T12:HH' },
      { message: 'invalid minute: > 59', value: '2024-05-20T12:60' },
      { message: 'invalid second: not a number', value: '2024-05-20T12:20:SS' },
      { message: 'invalid second: > 59', value: '2024-05-20T12:20:60' },
      { message: 'invalid ms: not a number', value: '2024-05-20T12:20:00.sss' },
      { message: 'invalid time zone 1', value: '2024-05-20T12:20:00.000X' },
      { message: 'invalid time zone 2', value: '2024-05-20T12:20:00.000+04' },
      { message: 'invalid time zone 3', value: '2024-05-20T12:20:00.000+0470' },
    ];
    for (const { message, value } of failureCases) {
      test(message, () => {
        const actualDate = parseISODateTimeString(value);
        assert.strictEqual(actualDate, null);
      });
    }
  });
});

describe('isValidDate()', () => {
  test('returns true then a given date is valid', () => {
    const validDates = [
      new Date(),
      new Date('2024-02-20'),
      new Date('2024-02-20T14:32:12Z'),
    ];
    for (const date of validDates) {
      assert.equal(isValidDate(date), true);
    }
  });

  test('returns false when a given argument is not a Date object', () => {
    assert.equal(isValidDate({}), false);
    assert.equal(isValidDate([]), false);
  });

  test('returns false when a given date is invalid', () => {
    const invalidDates = [
      new Date(NaN),
      new Date('invalid date'),
      new Date('2024-02-40'),
    ];
    for (const date of invalidDates) {
      assert.equal(isValidDate(date), false);
    }
  });
});

describe('getDaysInMonth()', () => {
  const testCases = [
    { year: 2023, month: 1, expectedDays: 31 },
    { year: 2023, month: 2, expectedDays: 28 },
    { year: 2023, month: 3, expectedDays: 31 },
    { year: 2023, month: 4, expectedDays: 30 },
    { year: 2023, month: 5, expectedDays: 31 },
    { year: 2023, month: 6, expectedDays: 30 },
    { year: 2023, month: 7, expectedDays: 31 },
    { year: 2023, month: 8, expectedDays: 31 },
    { year: 2023, month: 9, expectedDays: 30 },
    { year: 2023, month: 10, expectedDays: 31 },
    { year: 2023, month: 11, expectedDays: 30 },
    { year: 2023, month: 12, expectedDays: 31 },
  ];
  for (const { year, month, expectedDays } of testCases) {
    const message = `returns ${expectedDays} for ${year}-${String(month).padStart(2, '0')}`;
    test(message, () => {
      const actualDays = getDaysInMonth(year, month);
      assert.equal(actualDays, expectedDays);
    });
  }

  test('returns 28 for February when a given year is not leap', () => {
    const leapYears = [1601, 1989, 1993, 1997, 2001, 2401];
    const expectedDays = 28;
    for (const year of leapYears) {
      const actualDays = getDaysInMonth(year, 2);
      assert.equal(actualDays, expectedDays);
    }
  });

  test('returns 29 for February when a given year is leap', () => {
    const leapYears = [1600, 1988, 1992, 1996, 2000, 2400];
    const expectedDays = 29;
    for (const year of leapYears) {
      const actualDays = getDaysInMonth(year, 2);
      assert.equal(actualDays, expectedDays);
    }
  });
});
