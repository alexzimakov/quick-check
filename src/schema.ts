import { TypeAlias } from './type-aliases/type-alias.js';
import { StringType } from './type-aliases/string-type.js';
import { NumberType } from './type-aliases/number-type.js';
import { BooleanType } from './type-aliases/boolean-type.js';
import { EnumType } from './type-aliases/enum-type.js';
import { ArrayType } from './type-aliases/array-type.js';
import { ObjectType } from './type-aliases/object-type.js';

type infer<T extends TypeAlias<unknown>> = ReturnType<T['parse']>;

const STRING_PATTERNS = StringType.Patterns;
const STRING_ERROR_CODES = StringType.ErrorCodes;
const NUMBER_ERROR_CODES = NumberType.ErrorCodes;
const BOOLEAN_ERROR_CODES = BooleanType.ErrorCodes;
const ENUM_ERROR_CODES = EnumType.ErrorCodes;
const ARRAY_ERROR_CODES = ArrayType.ErrorCodes;
const OBJECT_ERROR_CODES = ObjectType.ErrorCodes;

const createStringType = StringType.create;
const createNumberType = NumberType.create;
const createBooleanType = BooleanType.create;
const createEnumType = EnumType.create;
const createArrayType = ArrayType.create;
const createObjectType = ObjectType.create;

// noinspection ReservedWordAsName
export {
  // Types
  type infer,

  // Constants
  STRING_PATTERNS,
  STRING_ERROR_CODES,
  NUMBER_ERROR_CODES,
  BOOLEAN_ERROR_CODES,
  ENUM_ERROR_CODES,
  ARRAY_ERROR_CODES,
  OBJECT_ERROR_CODES,

  // Public methods
  createStringType as string,
  createNumberType as number,
  createBooleanType as boolean,
  createEnumType as enum,
  createArrayType as array,
  createObjectType as object,
};
