import { test } from 'vitest';
import { ArraySchema } from '../type-schemas/array-schema.js';
import { BooleanSchema } from '../type-schemas/boolean-schema.js';
import { EnumSchema } from '../type-schemas/enum-schema.js';
import { NumberSchema } from '../type-schemas/number-schema.js';
import { ObjectSchema } from '../type-schemas/object-schema.js';
import { ShapeSchema } from '../type-schemas/shape-schema.js';
import { StringSchema } from '../type-schemas/string-schema.js';

test('all error codes are unique', () => {
  const errorCodes = [
    ...Object.values(ArraySchema.ErrorCodes),
    ...Object.values(BooleanSchema.ErrorCodes),
    ...Object.values(EnumSchema.ErrorCodes),
    ...Object.values(NumberSchema.ErrorCodes),
    ...Object.values(ObjectSchema.ErrorCodes),
    ...Object.values(ShapeSchema.ErrorCodes),
    ...Object.values(StringSchema.ErrorCodes),
  ];
  for (let i = 0; i < errorCodes.length; i += 1) {
    const code = errorCodes[i];
    for (let j = i + 1; j < errorCodes.length; j += 1) {
      if (code === errorCodes[j]) {
        throw new Error(`${code} is not unique`);
      }
    }
  }
});
