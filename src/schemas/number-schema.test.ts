import { describe, expect, test } from 'vitest';
import { createNumberSchema } from './number-schema.js';

describe('passes validation when value is:', () => {
  const schema = createNumberSchema();
  const testCases: [string, number][] = [
    ['zero', 0],
    ['integer', 10],
    ['float', 10.5],
    ['positive number', 4],
    ['negative number', -4],
  ];
  testCases.forEach(([message, value]) => {
    test(message, () => {
      expect(schema.validate(value)).toBe(value);
    });
  });
});

describe('fails validation when value is:', () => {
  const schema = createNumberSchema();
  const testCases: [string, unknown][] = [
    ['null', null],
    ['undefined', undefined],
    ['NaN', NaN],
    ['non-finite number', 1 / 0],
    ['a string', '4'],
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
  type TestCase = [message: string, input: unknown, output: number];
  const testCases: TestCase[] = [
    ['10 → 10', 10, 10],
    ['"10.5" → 10.5', '10.5', 10.5],
    ['true → 1', true, 1],
    ['undefined → 0', undefined, 0],
    ['null → 0', null, 0],
    ['false → 0', false, 0],
  ];
  const schema = createNumberSchema({
    coerceType: true,
  });
  testCases.forEach(([message, input, output]) => {
    test(message, () => {
      expect(schema.validate(input)).toBe(output);
    });
  });
});
