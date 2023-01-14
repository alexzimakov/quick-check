import { describe, expect, test } from 'vitest';
import { StringType } from '../string-type.js';
import { RapidCheckError } from '../errors.js';
import { format } from './util.js';

describe('type validator', () => {
  describe('positive cases', () => {
    const valid = ['', '1', ' ', 'abc', 'multi\nline'];
    const schema = StringType.create();
    valid.forEach((value) => {
      test(`should return "${value}" when value is "${value}"`, () => {
        expect(schema.parse(value)).toBe(value);
      });
    });
  });

  describe('negative cases', () => {
    const invalid = [true, 1, 1n, Symbol('test'), [], {}, null, undefined];
    const schema = StringType.create();
    invalid.forEach((value) => {
      test(`should throw an error when value is ${format(value)}`, () => {
        expect(() => schema.parse(value)).toThrow(RapidCheckError);
      });
    });
  });

  test('should accept `undefined`', () => {
    const schema = StringType.create().optional();
    expect(schema.parse(undefined)).toBe(undefined);
    expect(() => schema.parse(null)).toThrow(RapidCheckError);
  });

  test('should accept `null`', () => {
    const schema = StringType.create().nullable();
    expect(schema.parse(null)).toBe(null);
    expect(() => schema.parse(undefined)).toThrow(RapidCheckError);
  });

  test('should accept a `null` and `undefined` value', () => {
    const schema = StringType.create().optional().nullable();
    expect(schema.parse(undefined)).toBe(undefined);
    expect(schema.parse(null)).toBe(null);
    expect(() => schema.parse(1)).toThrow(RapidCheckError);
  });

  test('should not accept a `null` and `undefined` value', () => {
    const optionalSchema = StringType.create().optional().nullable();
    const requiredSchema = optionalSchema.required();
    expect(() => requiredSchema.parse(undefined)).toThrow();
    expect(() => requiredSchema.parse(null)).toThrow(RapidCheckError);
  });
});
