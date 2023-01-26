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
  NumberErrorCodes,
  BooleanErrorCodes,
  EnumErrorCodes,
  ArrayErrorCodes,
  ShapeErrorCodes,
  ObjectErrorCodes,

  // Public methods
  stringFactory as string,
  numberFactory as number,
  booleanFactory as boolean,
  arrayFactory as array,
  objectFactory as object,
  enumFactory as enum,
  shapeFactory as shape,
};
