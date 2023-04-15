import { AnySchema, InferOutput, TypeSchema } from '../types.js';
import { RequiredErrorMessage, Rule, Schema, TypeErrorMessage } from './schema.js';
import { EnumSchema } from './enum-schema.js';
import { ValidationError } from '../validation-error.js';
import { isPlainObject } from '../utils/is-plain-object.js';
import { formatList } from '../utils/format-list.js';
import { errorCodes } from '../error-codes.js';

type KeySchema = TypeSchema<symbol | string | number> | undefined;
type InferKeyType<T extends KeySchema> = T extends undefined
  ? string
  : InferOutput<T>;

type ValueSchema = AnySchema | undefined;
type InferValueType<T extends ValueSchema> = T extends undefined
  ? unknown
  : InferOutput<T>

type ObjectOf<
  K extends KeySchema,
  V extends ValueSchema
> = K extends EnumSchema<any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ? { [P in InferKeyType<K>]?: InferValueType<V> }
  : { [P in InferKeyType<K>]: InferValueType<V> };

type ObjectRule<T extends object> = Rule<T>;
type ObjectRules<
  K extends KeySchema,
  V extends ValueSchema
> = ObjectRule<ObjectOf<K, V>>[];

export class ObjectSchema<
  K extends KeySchema,
  V extends ValueSchema
> extends Schema<ObjectOf<K, V>> {
  protected readonly _keySchema?: K;
  protected readonly _valueSchema?: V;

  constructor(
    keySchema?: K,
    valueSchema?: V,
    rules?: ObjectRules<K, V>,
    typeError?: TypeErrorMessage,
    requiredError?: RequiredErrorMessage,
  ) {
    super(rules, typeError, requiredError);
    this._keySchema = keySchema;
    this._valueSchema = valueSchema;
  }

  protected _validate(maybeObject: unknown): ObjectOf<K, V> {
    if (!isPlainObject(maybeObject)) {
      this._throwTypeError(maybeObject, 'object');
    }

    const object: { [key: symbol | string | number]: unknown } = {};
    const errors = new Map<string, ValidationError[]>();
    const keySchema = this._keySchema;
    const valueSchema = this._valueSchema;
    for (const [key, value] of Object.entries(maybeObject)) {
      let checkedKey: symbol | string | number = key;
      let checkedValue: unknown = value;
      const keyErrors: ValidationError[] = [];
      if (keySchema) {
        try {
          checkedKey = keySchema.validate(key);
        } catch (e) {
          const error = ValidationError.from(e);
          error.path.unshift(key);
          keyErrors.push(error);
        }
      }
      if (valueSchema) {
        try {
          checkedValue = valueSchema.validate(value);
        } catch (e) {
          const error = ValidationError.from(e);
          error.path.unshift(key);
          keyErrors.push(error);
        }
      }
      if (keyErrors.length > 0) {
        errors.set(key, keyErrors);
      } else {
        object[checkedKey] = checkedValue;
      }
    }

    if (errors.size > 0) {
      const invalidProps: string[] = [];
      const subErrors: ValidationError[] = [];
      errors.forEach((keyErrors, key) => {
        invalidProps.push(`'${key}'`);
        subErrors.push(...keyErrors);
      });

      const message = invalidProps.length > 1
        ? `The object has invalid properties ${formatList(invalidProps)}.`
        : `The object has invalid property ${invalidProps[0]}.`;
      throw new ValidationError(message, {
        subErrors,
        code: errorCodes.invalidObject,
      });
    }

    return object as ObjectOf<K, V>;
  }
}

export type ObjectSchemaOptions<
  K extends KeySchema,
  V extends ValueSchema
> = {
  key?: K;
  value?: V;
  rules?: ObjectRules<K, V>;
  typeError?: TypeErrorMessage;
  requiredError?: RequiredErrorMessage;
};

export function createObjectSchema<
  K extends KeySchema = undefined,
  V extends ValueSchema = undefined
>(options: ObjectSchemaOptions<K, V> = {}) {
  return new ObjectSchema<K, V>(
    options.key,
    options.value,
    options.rules,
    options.typeError,
    options.requiredError,
  );
}
