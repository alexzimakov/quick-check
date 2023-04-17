import { AbstractSchema, AnySchema, InferInput, InferOutput } from '../abstract-schema.js';
import { AbstractTypeSchema, RequiredErrorMessage, Rule, TypeErrorMessage } from '../abstract-type-schema.js';
import { ValidationError } from '../validation-error.js';
import { isPlainObject } from '../utils/is-plain-object.js';
import { formatList } from '../utils/format-list.js';
import { errorCodes } from '../error-codes.js';

type OptionalEnumKeys<T extends object> = [keyof T] extends [string]
  ? { [K in keyof T]?: T[K] }
  : { [K in keyof T]: T[K] };

type KeySchema = AbstractSchema<symbol | string | number> | undefined;
type ValueSchema = AnySchema | undefined;

type KeyInput<T extends KeySchema> = T extends AnySchema
  ? InferInput<T>
  : string;
type ValueInput<T extends ValueSchema> = T extends AnySchema
  ? InferInput<T>
  : unknown;
type ObjectInput<
  K extends KeySchema,
  V extends ValueSchema,
> = OptionalEnumKeys<{ [P in KeyInput<K>]: ValueInput<V> }>;

type KeyOutput<T extends KeySchema> = T extends AnySchema
  ? InferOutput<T>
  : string;
type ValueOutput<T extends ValueSchema> = T extends AnySchema
  ? InferOutput<T>
  : unknown;
type ObjectOutput<
  K extends KeySchema,
  V extends ValueSchema
> = OptionalEnumKeys<{ [P in KeyOutput<K>]: ValueOutput<V> }>

type ObjectRule<T extends object> = Rule<T>;
type ObjectRules<
  K extends KeySchema,
  V extends ValueSchema
> = ObjectRule<ObjectOutput<K, V>>[];

export class ObjectSchema<
  K extends KeySchema,
  V extends ValueSchema
> extends AbstractTypeSchema<
  ObjectOutput<K, V>,
  ObjectInput<K, V>
> {
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

  protected _validate(maybeObject: unknown): ObjectOutput<K, V> {
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

    return object as ObjectOutput<K, V>;
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
