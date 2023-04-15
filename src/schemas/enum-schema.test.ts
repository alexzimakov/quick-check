import { expect, test } from 'vitest';
import { createEnumSchema } from './enum-schema.js';

test('passes validation when value in the set of allowed values', () => {
  const values = [
    'north',
    'south',
    'east',
    'west',
  ] as const;
  const schema = createEnumSchema(values);
  for (const value of values) {
    expect(schema.validate(value)).toBe(value);
  }
});

test('fails validation when value not in the set of allowed values', () => {
  const values = [
    'north',
    'south',
    'east',
    'west',
  ] as const;
  const schema = createEnumSchema(values);
  const invalidValues = [
    '',
    'North',
    Symbol('north'),
    true,
    1,
    1n,
    [],
    {},
    new Date(),
  ];
  for (const value of invalidValues) {
    expect(() => schema.validate(value)).toThrow();
  }
});
