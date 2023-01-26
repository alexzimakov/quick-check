import { type InputType, type OutputType } from './types.js';
import { StringType } from './type-aliases/string-type.js';
import { NumberType } from './type-aliases/number-type.js';
import { BooleanType } from './type-aliases/boolean-type.js';
import { EnumType } from './type-aliases/enum-type.js';
import { ArrayType } from './type-aliases/array-type.js';
import { ObjectType } from './type-aliases/object-type.js';

const StringPatterns = StringType.Patterns;
const StringErrorCodes = StringType.ErrorCodes;
const NumberErrorCodes = NumberType.ErrorCodes;
const BooleanErrorCodes = BooleanType.ErrorCodes;
const EnumErrorCodes = EnumType.ErrorCodes;
const ArrayErrorCodes = ArrayType.ErrorCodes;
const ObjectErrorCodes = ObjectType.ErrorCodes;

const stringFactory = StringType.create;
const numberFactory = NumberType.create;
const booleanFactory = BooleanType.create;
const enumFactory = EnumType.create;
const arrayFactory = ArrayType.create;
const objectFactory = ObjectType.create;

// noinspection ReservedWordAsName
export {
  // Types
  type InputType as input,
  type OutputType as output,
  type OutputType as infer,

  // Constants
  StringPatterns,
  StringPatterns as STRING_PATTERNS,
  StringErrorCodes,
  StringErrorCodes as STRING_ERROR_CODES,
  NumberErrorCodes,
  NumberErrorCodes as NUMBER_ERROR_CODES,
  BooleanErrorCodes,
  BooleanErrorCodes as BOOLEAN_ERROR_CODES,
  EnumErrorCodes,
  EnumErrorCodes as ENUM_ERROR_CODES,
  ArrayErrorCodes,
  ArrayErrorCodes as ARRAY_ERROR_CODES,
  ObjectErrorCodes,
  ObjectErrorCodes as OBJECT_ERROR_CODES,

  // Public methods
  stringFactory as string,
  numberFactory as number,
  booleanFactory as boolean,
  enumFactory as enum,
  arrayFactory as array,
  objectFactory as object,
};
