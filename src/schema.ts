import { StringType, type StringTypeParams } from './string-type.js';
import { type BooleanParams, BooleanType } from './boolean-type.js';

export function string<T extends StringTypeParams>(params?: T) {
  return StringType.create(params);
}
string.ERROR_CODES = StringType.ErrorCodes;
string.PATTERNS = StringType.Patterns;

export function boolean<T extends BooleanParams>(params?: T) {
  return BooleanType.create(params);
}
boolean.ERROR_CODES = BooleanType.ErrorCodes;
