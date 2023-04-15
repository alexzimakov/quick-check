import { describe, expect, test } from 'vitest';
import { createStringSchema } from './string-schema.js';

describe('passes validation when value is:', () => {
  const schema = createStringSchema();
  const testCases: [string, string][] = [
    ['a string', 'lorem ipsum'],
    ['an empty string', ''],
    ['a multiline string', 'multiline\nand whitespace\tstring'],
  ];
  testCases.forEach(([message, value]) => {
    test(message, () => {
      expect(schema.validate(value)).toBe(value);
    });
  });
});

describe('fails validation when value is:', () => {
  const schema = createStringSchema();
  const testCases: [string, unknown][] = [
    ['null', null],
    ['undefined', undefined],
    ['a number', 1],
    ['a bigint', 1n],
    ['a boolean', true],
    ['a symbol', Symbol('test')],
    ['an array', ['t', 'e', 's', 't']],
    ['an object', { key: 'value' }],
    ['a class instance', new Date()],
    ['a function', () => 'test'],
  ];
  testCases.forEach(([message, value]) => {
    test(message, () => {
      expect(() => schema.validate(value)).toThrow();
    });
  });
});

describe('coercing rules:', () => {
  type TestCase = [message: string, input: unknown, output: string];
  const testCases: TestCase[] = [
    ['undefined → ""', undefined, ''],
    ['null → ""', null, ''],
    ['true → "true"', true, 'true'],
    ['false → "false"', false, 'false'],
    ['10 → "10"', 10, '10'],
    ['10n → "10"', 10n, '10'],
    ['"test" → "test"', 'test', 'test'],
  ];
  const schema = createStringSchema({
    coerceType: true,
  });
  testCases.forEach(([message, input, output]) => {
    test(message, () => {
      expect(schema.validate(input)).toBe(output);
    });
  });
});

test('trims a given string', () => {
  const schema = createStringSchema({
    trimValue: true,
  });
  expect(schema.validate('\ttest  ')).toBe('test');
  expect(() => schema.validate(null)).toThrow();
});
