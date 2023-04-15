import { afterEach, describe, expect, test, vi } from 'vitest';
import { createStringSchema } from './string-schema.js';
import { createNumberSchema } from './number-schema.js';
import { createBooleanSchema } from './boolean-schema.js';
import { createEnumSchema } from './enum-schema.js';
import { createArraySchema } from './array-schema.js';
import { createObjectSchema } from './object-schema.js';
import { createShapeSchema } from './shape-schema.js';
import { createInstanceSchema } from './instance-schema.js';
import { createUnionSchema } from './union-schema.js';
import { ResultTransformer } from '../result-transformer.js';
import { NullableModifier, NullishModifier, OptionalModifier } from '../result-modifier.js';

const transformedValue = Symbol('transformed');
const ruleA = vi.fn();
const ruleB = vi.fn();
const rules = [ruleA, ruleB];
const testCases = [
  [createStringSchema({ rules }), 'lorem ipsum'],
  [createNumberSchema({ rules }), 10],
  [createBooleanSchema({ rules }), true],
  [createEnumSchema(['a', 'b', 'c'], { rules }), 'a'],
  [createArraySchema({ rules }), [1, 2, 3]],
  [createObjectSchema({ rules }), { key: 'value' }],
  [createInstanceSchema(Date, { rules }), new Date()],
  [createShapeSchema({ name: createStringSchema() }, {
    rules,
  }), { name: 'John' }],
  [createUnionSchema([
    createBooleanSchema(),
    createEnumSchema([0, 1] as const),
  ], {
    rules,
  }), true],
] as const;

testCases.forEach(([schema, value]) => {
  describe(schema.constructor.name, () => {
    afterEach(() => {
      ruleA.mockClear();
      ruleB.mockClear();
    });

    describe('nullable()', () => {
      const nullableSchema = schema.nullable();

      test('should accept `null`', () => {
        expect(nullableSchema.validate(null)).toBe(null);
        expect(nullableSchema.validate(value)).toStrictEqual(value);
      });

      test('throws an error when value is `undefined`', () => {
        expect(() => nullableSchema.validate(undefined)).toThrow();
      });

      test('should restore the wrapped schema', () => {
        expect(nullableSchema.unwrap()).toBe(schema);
      });

      test('should create optional modifier', () => {
        const optionalSchema = nullableSchema.optional();
        expect(optionalSchema).toBeInstanceOf(OptionalModifier);
        expect(optionalSchema.unwrap()).toBe(schema);
      });

      test('should create nullish modifier', () => {
        const nullishSchema = nullableSchema.nullish();
        expect(nullishSchema).toBeInstanceOf(NullishModifier);
        expect(nullishSchema.unwrap()).toBe(schema);
      });

      test('should create nullish modifier', () => {
        expect(
          nullableSchema.transform(() => transformedValue),
        ).toBeInstanceOf(ResultTransformer);
      });
    });

    describe('optional()', () => {
      const optionalSchema = schema.optional();

      test('should accept `undefined`', () => {
        expect(optionalSchema.validate(undefined)).toBe(undefined);
        expect(optionalSchema.validate(value)).toStrictEqual(value);
      });

      test('throws an error when value is `null`', () => {
        expect(() => optionalSchema.validate(null)).toThrow();
      });

      test('should restore the wrapped schema', () => {
        expect(optionalSchema.unwrap()).toBe(schema);
      });

      test('should create nullable modifier', () => {
        const nullableSchema = optionalSchema.nullable();
        expect(nullableSchema).toBeInstanceOf(NullableModifier);
        expect(nullableSchema.unwrap()).toBe(schema);
      });

      test('should create nullish modifier', () => {
        const nullishSchema = optionalSchema.nullish();
        expect(nullishSchema).toBeInstanceOf(NullishModifier);
        expect(nullishSchema.unwrap()).toBe(schema);
      });

      test('should create nullish modifier', () => {
        expect(
          optionalSchema.transform(() => transformedValue),
        ).toBeInstanceOf(ResultTransformer);
      });
    });

    describe('nullish()', () => {
      const nullishSchema = schema.nullish();

      test('should accept `null`', () => {
        expect(nullishSchema.validate(null)).toBe(null);
        expect(nullishSchema.validate(value)).toStrictEqual(value);
      });

      test('should accept `undefined`', () => {
        expect(nullishSchema.validate(undefined)).toBe(undefined);
        expect(nullishSchema.validate(value)).toStrictEqual(value);
      });

      test('should restore the wrapped schema', () => {
        expect(nullishSchema.unwrap()).toBe(schema);
      });

      test('should create nullable modifier', () => {
        const nullableSchema = nullishSchema.nullable();
        expect(nullableSchema).toBeInstanceOf(NullableModifier);
        expect(nullableSchema.unwrap()).toBe(schema);
      });

      test('should create optional modifier', () => {
        const optionalSchema = nullishSchema.optional();
        expect(optionalSchema).toBeInstanceOf(OptionalModifier);
        expect(optionalSchema.unwrap()).toBe(schema);
      });

      test('should create nullish modifier', () => {
        expect(
          nullishSchema.transform(() => transformedValue),
        ).toBeInstanceOf(ResultTransformer);
      });
    });

    describe('transform()', () => {
      const transform = vi.fn(() => transformedValue);
      const transformedSchema = schema.transform(transform);

      test('returns wrapped schema', () => {
        expect(transformedSchema.initialType).toBe(schema);
      });

      test('should transform value after success validation', () => {
        expect(transformedSchema.validate(value)).toBe(transformedValue);
      });

      test('should create optional modifier', () => {
        const optionalSchema = transformedSchema.optional();
        expect(optionalSchema).toBeInstanceOf(OptionalModifier);
        expect(optionalSchema.unwrap()).toBe(transformedSchema);
      });

      test('should create nullable modifier', () => {
        const nullableModifier = transformedSchema.nullable();
        expect(nullableModifier).toBeInstanceOf(NullableModifier);
        expect(nullableModifier.unwrap()).toBe(transformedSchema);
      });

      test('should create nullish modifier', () => {
        const nullishSchema = transformedSchema.nullish();
        expect(nullishSchema).toBeInstanceOf(NullishModifier);
        expect(nullishSchema.unwrap()).toBe(transformedSchema);
      });

      test('should create new transformed schema', () => {
        const newTransformedSchema = transformedSchema.transform(transform);
        expect(newTransformedSchema).toBeInstanceOf(ResultTransformer);
        expect(newTransformedSchema.initialType).toBe(transformedSchema);
      });
    });

    test('invoke rules after value validation', () => {
      schema.validate(value);
      expect(ruleA).toHaveBeenCalledTimes(1);
      expect(ruleA).toHaveBeenCalledWith(value);
      expect(ruleB).toHaveBeenCalledTimes(1);
      expect(ruleB).toHaveBeenCalledWith(value);
    });
  });
});
