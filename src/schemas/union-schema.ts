import { AnySchema, InferOutput } from '../types.js';
import { RequiredErrorMessage, Rule, Schema } from './schema.js';
import { ValidationError } from '../validation-error.js';
import { Message, formatMessage } from '../utils/format-message.js';
import { formatList } from '../utils/format-list.js';
import { errorCodes } from '../error-codes.js';
import { ArraySchema } from './array-schema.js';
import { BooleanSchema } from './boolean-schema.js';
import { EnumSchema } from './enum-schema.js';
import { NumberSchema } from './number-schema.js';
import { ObjectSchema } from './object-schema.js';
import { ShapeSchema } from './shape-schema.js';
import { StringSchema } from './string-schema.js';
import { InstanceSchema } from './instance-schema.js';

type Schemas = AnySchema[];
type Union<T extends Schemas> = InferOutput<T[number]>;
type UnionRule<T extends Schemas> = Rule<Union<T>>;
type UnionRules<T extends Schemas> = UnionRule<T>[];

type UnionErrorMessage = Message<UnionErrorDetails>;
type UnionErrorDetails = {
  value: unknown;
  allowedTypes: string[];
};
const defaultUnionErrorMessage: UnionErrorMessage = ({ allowedTypes }) => {
  const types = formatList(allowedTypes, {
    type: 'or',
    quoteItems: true,
    quoteStyle: '`',
  });
  return `The value does not match any of the allowed types: ${types}.`;
};

export const mapSchemaToType = (schema: AnySchema) => {
  if (schema instanceof ArraySchema) {
    return 'array';
  }
  if (schema instanceof BooleanSchema) {
    return 'boolean';
  }
  if (schema instanceof EnumSchema) {
    return 'enum';
  }
  if (schema instanceof NumberSchema) {
    return 'number';
  }
  if (
    schema instanceof ObjectSchema ||
    schema instanceof ShapeSchema ||
    schema instanceof InstanceSchema
  ) {
    return 'object';
  }
  if (schema instanceof StringSchema) {
    return 'string';
  }
  if (schema instanceof UnionSchema) {
    return schema.type;
  }
  return 'unknown';
};

export class UnionSchema<T extends Schemas> extends Schema<Union<T>> {
  protected readonly _schemas: T;
  protected readonly _unionError: UnionErrorMessage;

  constructor(
    schemas: T,
    rules?: UnionRules<T>,
    unionError?: UnionErrorMessage,
    requiredError?: RequiredErrorMessage,
  ) {
    super(rules, undefined, requiredError);
    this._schemas = schemas;
    this._unionError = unionError || defaultUnionErrorMessage;
  }

  get type(): string {
    return this._schemas.map(mapSchemaToType).join(' | ');
  }

  protected _validate(value: unknown): Union<T> {
    let result: unknown;
    let subErrors: ValidationError[] = [];
    for (const schema of this._schemas) {
      try {
        result = schema.validate(value);
        subErrors = [];
        break;
      } catch (e) {
        subErrors.push(ValidationError.from(e));
      }
    }

    if (subErrors.length > 0) {
      const allowedTypes = this._schemas.map(mapSchemaToType);
      const details: UnionErrorDetails = { value, allowedTypes };
      const message = formatMessage(this._unionError, details);
      throw new ValidationError(message, {
        details,
        code: errorCodes.invalidUnion,
      });
    }

    return result as Union<T>;
  }
}

export type UnionSchemaOptions<T extends Schemas> = {
  rules?: UnionRules<T>;
  unionError?: UnionErrorMessage;
  requiredError?: RequiredErrorMessage;
};

export function createUnionSchema<T extends Schemas>(
  schemas: T,
  options?: UnionSchemaOptions<T>,
) {
  return new UnionSchema<T>(
    schemas,
    options?.rules,
    options?.unionError,
    options?.requiredError,
  );
}
