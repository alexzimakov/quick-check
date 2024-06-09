import { BooleanValidator } from './boolean-validator.js';
import { StringValidator } from './string-validator.js';
import { NumberValidator } from './number-validator.js';
import { BigintValidator } from './bigint-validator.js';
import { ArrayValidator } from './array-validator.js';
import { ObjectValidator } from './object-validator.js';
import { ShapeValidator } from './shape-validator.js';
import { EnumValidator } from './enum-validator.js';
import { UnionValidator } from './union-validator.js';
import { ObjectTypeValidator } from './object-type-validator.js';
import { DateValidator } from './date-validator.js';

export const validator = {
  boolean: BooleanValidator.create,
  string: StringValidator.create,
  number: NumberValidator.create,
  bigint: BigintValidator.create,
  date: DateValidator.create,
  array: ArrayValidator.create,
  object: ObjectValidator.create,
  shape: ShapeValidator.create,
  enum: EnumValidator.create,
  oneOf: UnionValidator.create,
  instanceOf: ObjectTypeValidator.create,
};
export default validator;

export { type Result, valid, invalid } from './result.js';
export { type Validator } from './validator.js';
export { BaseValidator } from './base-validator.js';
export { ValidationError } from './errors.js';
