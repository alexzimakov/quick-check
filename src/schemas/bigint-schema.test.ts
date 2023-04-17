import { describe, expect, test } from 'vitest';
import { createBigIntSchema } from './bigint-schema.js';

describe('passes validation when value is:', () => {
  const schema = createBigIntSchema();
  const testCases: [string, bigint][] = [
    ['zero bigint', 0n],
    ['bigint', 10n],
    ['positive bigint', 4n],
    ['negative bigint', -4n],
  ];
  testCases.forEach(([message, value]) => {
    test(message, () => {
      expect(schema.validate(value)).toBe(value);
    });
  });
});

describe('fails validation when value is:', () => {
  const schema = createBigIntSchema();
  const testCases: [string, unknown][] = [
    ['null', null],
    ['undefined', undefined],
    ['NaN', NaN],
    ['non-finite number', 1 / 0],
    ['a string', '4'],
    ['an integer', 1],
    ['a float', 3.5],
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
  type TestCase = [message: string, input: unknown, output: bigint];
  const testCases: TestCase[] = [
    ['10n → 10n', 10n, 10n],
    ['10 → 10n', 10, 10n],
    ['"10" → 10n', '10', 10n],
    ['"+10" → 10n', '+10', 10n],
    ['"-10" → -10n', '-10', -10n],
    ['true → 1n', true, 1n],
    ['undefined → 0n', undefined, 0n],
    ['null → 0n', null, 0n],
    ['false → 0n', false, 0n],
  ];
  const schema = createBigIntSchema({
    coerceType: true,
  });
  testCases.forEach(([message, input, output]) => {
    test(message, () => {
      expect(schema.validate(input)).toBe(output);
    });
  });
});
