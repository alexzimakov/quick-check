import { expect, test } from 'vitest';
import { createInstanceSchema } from './instance-schema.js';

class User {}

class Employee extends User {}

test('passes validation when value is instance of the given class', () => {
  const schema = createInstanceSchema(User);
  const user = new User();
  const employee = new Employee();
  expect(schema.validate(user)).toBe(user);
  expect(schema.validate(employee)).toBe(employee);
});

test('fails validation when value is not instance of the given class', () => {
  const schema = createInstanceSchema(Employee);
  const date = new Date();
  const user = new User();
  expect(() => schema.validate(date)).toThrow();
  expect(() => schema.validate(user)).toThrow();
});
