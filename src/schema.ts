import { StringType, type StringTypeParams } from './string-type.js';

export function string<T extends StringTypeParams>(params: T) {
  return StringType.create<T>(params);
}
string.ERROR_CODES = StringType.ErrorCodes;
string.PATTERNS = StringType.Patterns;
