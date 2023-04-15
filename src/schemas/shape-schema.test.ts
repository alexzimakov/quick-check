import { describe, expect, test } from 'vitest';
import { createShapeSchema } from './shape-schema.js';
import { StringSchema, createStringSchema } from './string-schema.js';
import { NumberSchema, createNumberSchema } from './number-schema.js';
import { createInstanceSchema } from './instance-schema.js';

test(
  'passes validation when value is an object with properties ' +
  'that conform properties schema',
  () => {
    const schema = createShapeSchema({
      name: createStringSchema(),
      password: createStringSchema(),
      age: createNumberSchema(),
      addedAt: createInstanceSchema(Date),
    });
    const userData = {
      name: 'John Doe',
      password: 'Qwerty123',
      age: 25,
      bio: '',
      isNew: true,
      addedAt: new Date(),
    };
    const user = {
      name: userData.name,
      password: userData.password,
      age: userData.age,
      addedAt: userData.addedAt,
    };
    expect(schema.validate(userData)).toStrictEqual(user);
  },
);

test(
  'fails validation when value is not an object or some properties ' +
  'do not conform properties schema',
  () => {
    const schema = createShapeSchema({
      name: createStringSchema(),
      age: createNumberSchema(),
    });
    expect(() => schema.validate(null)).toThrow();
    expect(() => schema.validate(JSON.stringify({
      name: 'John Doe',
      age: 25,
    }))).toThrow();
    expect(() => schema.validate({
      name: 'John Doe',
      age: NaN,
    })).toThrow();
    expect(() => schema.validate({
      name: ['J', 'o', 'h', 'n'],
      age: NaN,
    })).toThrow();
  },
);

describe('get()', () => {
  test('returns a property schema', () => {
    const schema = createShapeSchema({
      name: createStringSchema(),
      age: createNumberSchema(),
    });
    expect(schema.get('name')).toBeInstanceOf(StringSchema);
    expect(schema.get('age')).toBeInstanceOf(NumberSchema);
  });

  test('throws an error when property does not exist', () => {
    const schema = createShapeSchema({
      name: createStringSchema(),
      age: createNumberSchema(),
    });
    // @ts-expect-error trying to get schema for an unknown property
    expect(() => schema.get('password')).toThrow();
  });
});
