import { StringType } from './string-type.js';
import { NumberType } from './number-type.js';
import { BooleanType } from './boolean-type.js';
import { EnumType } from './enum-type.js';
import { ArrayType } from './array-type.js';

const STRING_PATTERNS = StringType.Patterns;
const STRING_ERROR_CODES = StringType.ErrorCodes;
const NUMBER_ERROR_CODES = NumberType.ErrorCodes;
const BOOLEAN_ERROR_CODES = BooleanType.ErrorCodes;
const ENUM_ERROR_CODES = EnumType.ErrorCodes;
const ARRAY_ERROR_CODES = ArrayType.ErrorCodes;

const createStringType = StringType.create;
const createNumberType = NumberType.create;
const createBooleanType = BooleanType.create;
const createEnumType = EnumType.create;
const createArrayType = ArrayType.create;

// noinspection ReservedWordAsName
export {
  // Constants
  STRING_PATTERNS,
  STRING_ERROR_CODES,
  NUMBER_ERROR_CODES,
  BOOLEAN_ERROR_CODES,
  ENUM_ERROR_CODES,
  ARRAY_ERROR_CODES,

  // Public methods
  createStringType as string,
  createNumberType as number,
  createBooleanType as boolean,
  createEnumType as enum,
  createArrayType as array,
};
