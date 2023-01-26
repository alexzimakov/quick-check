import { type InputType, type OutputType } from './types.js';
import { StringSchema } from './type-schemas/string-schema.js';
import { NumberSchema } from './type-schemas/number-schema.js';
import { BooleanSchema } from './type-schemas/boolean-schema.js';
import { EnumSchema } from './type-schemas/enum-schema.js';
import { ArraySchema } from './type-schemas/array-schema.js';
import { ShapeSchema } from './type-schemas/shape-schema.js';
import { ObjectSchema } from './type-schemas/object-schema.js';

const StringErrorCodes = StringSchema.ErrorCodes;
const NumberErrorCodes = NumberSchema.ErrorCodes;
const BooleanErrorCodes = BooleanSchema.ErrorCodes;
const ArrayErrorCodes = ArraySchema.ErrorCodes;
const ObjectErrorCodes = ObjectSchema.ErrorCodes;
const EnumErrorCodes = EnumSchema.ErrorCodes;
const ShapeErrorCodes = ShapeSchema.ErrorCodes;

const stringFactory = StringSchema.create;
const numberFactory = NumberSchema.create;
const booleanFactory = BooleanSchema.create;
const arrayFactory = ArraySchema.create;
const objectFactory = ObjectSchema.create;
const enumFactory = EnumSchema.create;
const shapeFactory = ShapeSchema.create;

// noinspection ReservedWordAsName
export {
  // Types
  type InputType as input,
  type OutputType as output,
  type OutputType as infer,

  // Constants
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
  ShapeErrorCodes,
  ShapeErrorCodes as SHAPE_ERROR_CODES,
  ObjectErrorCodes,
  ObjectErrorCodes as OBJECT_ERROR_CODES,

  // Public methods
  stringFactory as string,
  numberFactory as number,
  booleanFactory as boolean,
  arrayFactory as array,
  objectFactory as object,
  enumFactory as enum,
  shapeFactory as shape,
};
