import { type StringParams, StringType } from './string-type.js';
import { type NumberParams, NumberType } from './number-type.js';
import { type BooleanParams, BooleanType } from './boolean-type.js';

export function string<T extends StringParams>(params?: T) {
  return StringType.create(params);
}
string.ERROR_CODES = StringType.ErrorCodes;
string.PATTERNS = StringType.Patterns;

export function number<T extends NumberParams>(params?: T) {
  return NumberType.create(params);
}
number.ERROR_CODES = NumberType.ErrorCodes;

export function boolean<T extends BooleanParams>(params?: T) {
  return BooleanType.create(params);
}
boolean.ERROR_CODES = BooleanType.ErrorCodes;
