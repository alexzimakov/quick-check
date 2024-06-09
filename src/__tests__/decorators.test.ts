import assert from 'node:assert';
import { test } from 'vitest';
import {
  OptionalDecorator,
  NullableDecorator,
  NilDecorator,
} from '../decorators.js';
import { validator } from '../index.js';

const decorators = [
  OptionalDecorator,
  NullableDecorator,
  NilDecorator,
];
const stringValidator = validator.string();
decorators.forEach((Decorator) => {
  test(`creates ${Decorator.name} decorator`, () => {
    const value = 'test';
    const wrappedStringValidator = new Decorator(stringValidator);
    assert(wrappedStringValidator instanceof Decorator);
    assert(wrappedStringValidator.wrapped === stringValidator);
    assert(wrappedStringValidator.revoke() === stringValidator);
    assert(wrappedStringValidator.parse(value) === value);
    assert.deepStrictEqual(wrappedStringValidator.validate(value), {
      value,
      ok: true,
    });
  });
});
