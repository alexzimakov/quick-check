import { describe, expect, test } from 'vitest';
import { createBooleanSchema } from './boolean-schema.js';

describe('passes validation when value is:', () => {
  const schema = createBooleanSchema();
  const testCases: [string, boolean][] = [
    ['true', true],
    ['false', false],
  ];
  testCases.forEach(([message, value]) => {
    test(message, () => {
      expect(schema.validate(value)).toBe(value);
    });
  });
});

describe('fails validation when value is:', () => {
  const schema = createBooleanSchema();
  const testCases: [string, unknown][] = [
    ['null', null],
    ['undefined', undefined],
    ['a number', 1],
    ['a bigint', 1n],
    ['a string', 'true'],
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
  type TestCase = [message: string, input: unknown, output: boolean];
  const testCases: TestCase[] = [
    ['true → true', true, true],
    ['1 → true', 1, true],
    ['"true" → true', 'true', true],
    ['false → false', false, false],
    ['undefined → false', undefined, false],
    ['null → false', null, false],
    ['0 → false', 0, false],
    ['"false" → false', 'false', false],
  ];
  const schema = createBooleanSchema({
    coerceType: true,
  });
  testCases.forEach(([message, input, output]) => {
    test(message, () => {
      expect(schema.validate(input)).toBe(output);
    });
  });
});
