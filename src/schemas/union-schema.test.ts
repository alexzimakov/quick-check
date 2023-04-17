import { describe, expect, test } from 'vitest';
import { AnySchema } from '../abstract-schema.js';
import { AbstractTypeSchema } from '../abstract-type-schema.js';
import { createUnionSchema, mapSchemaToType } from './union-schema.js';
import { createStringSchema } from './string-schema.js';
import { createNumberSchema } from './number-schema.js';
import { createBooleanSchema } from './boolean-schema.js';
import { createEnumSchema } from './enum-schema.js';
import { createArraySchema } from './array-schema.js';
import { createObjectSchema } from './object-schema.js';
import { createShapeSchema } from './shape-schema.js';
import { createInstanceSchema } from './instance-schema.js';

test('passes validation when a value conforms at least one schema', () => {
  const schema = createUnionSchema([
    createStringSchema(),
    createNumberSchema(),
  ]);
  expect(schema.validate('string')).toBe('string');
  expect(schema.validate(10)).toBe(10);
});

test('fails validation when a value conforms to no one schema', () => {
  const schema = createUnionSchema([
    createStringSchema(),
    createNumberSchema(),
  ]);
  expect(() => schema.validate(null)).toThrow();
  expect(() => schema.validate(undefined)).toThrow();
  expect(() => schema.validate(true)).toThrow();
  expect(() => schema.validate(Symbol('test'))).toThrow();
  expect(() => schema.validate([])).toThrow();
  expect(() => schema.validate({})).toThrow();
});

describe('`mapSchemaToType` maps schema instance to a type:', () => {
  class UnknownSchema extends AbstractTypeSchema<unknown> {
    constructor() {
      super();
    }

    protected _validate(value: unknown): unknown {
      return value;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const testCases: [string, string, () => AnySchema][] = [
    ['StringSchema', 'string', () => createStringSchema()],
    ['NumberSchema', 'number', () => createNumberSchema()],
    ['BooleanSchema', 'boolean', () => createBooleanSchema()],
    ['ArraySchema', 'array', () => createArraySchema()],
    ['ObjectSchema', 'object', () => createObjectSchema()],
    ['ShapeSchema', 'object', () => createShapeSchema({})],
    ['InstanceSchema', 'object', () => createInstanceSchema(Date)],
    ['EnumSchema', 'enum', () => createEnumSchema(['a', 'b'])],
    ['UnionSchema', 'string | number', () => createUnionSchema([
      createStringSchema(),
      createNumberSchema(),
    ])],
    ['*', 'unknown', () => new UnknownSchema()],
  ];
  testCases.forEach(([schema, type, createSchema]) => {
    test(`${schema} → ${type}`, () => {
      expect(mapSchemaToType(createSchema())).toBe(type);
    });
  });
});
