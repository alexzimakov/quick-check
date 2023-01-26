import { type OutputType, type ResultMapper } from '../types.js';
import { AbstractSchema } from '../abstract-schema.js';
import { EnumSchema } from './enum-schema.js';
import { ParseError } from '../parse-error.js';
import { hasMessage, isObject } from '../guards.js';

type KeyErrorFormatter = (params: { key: string }) => string;
type ValueErrorFormatter = (params: { key: string, value: unknown }) => string;
type ObjectSchemaOptions = {
  valueSchema: AbstractSchema<unknown>;
  keySchema?: AbstractSchema<string>;
  isOptional: boolean;
  isNullable: boolean;
  typeError?: string;
  requiredError?: string;
  missingKeyError?: string | KeyErrorFormatter;
  keyError?: string | KeyErrorFormatter;
  valueError?: string | ValueErrorFormatter;
};

export type ObjectParams = Pick<ObjectSchemaOptions,
  | 'typeError'
  | 'requiredError'
  | 'missingKeyError'
  | 'keyError'
  | 'valueError'>;

export class ObjectSchema<Obj, Result> extends AbstractSchema<Obj, Result> {
  protected readonly options: ObjectSchemaOptions;
  protected readonly mapper: ResultMapper | undefined;

  protected constructor(
    options: ObjectSchemaOptions,
    mapper: ResultMapper | undefined
  ) {
    super();
    this.options = options;
    this.mapper = mapper;
  }

  static ErrorCodes = {
    type: 'OBJECT_TYPE',
    required: 'OBJECT_REQUIRED',
    invalidKey: 'OBJECT_KEY_INVALID',
    invalidValue: 'OBJECT_VALUE_INVALID',
    missingKey: 'OBJECT_MISSING_KEY',
  };

  static create<
    Value extends AbstractSchema<unknown>
  >(valueSchema: Value, params?: ObjectParams): ObjectSchema<
    Record<string, OutputType<Value>>,
    Record<string, OutputType<Value>>
  >;

  static create<
    Value extends AbstractSchema<unknown>,
    Key extends AbstractSchema<string>,
  >(valueSchema: Value, keySchema: Key, params?: ObjectParams): ObjectSchema<
    Record<OutputType<Key>, OutputType<Value>>,
    Record<OutputType<Key>, OutputType<Value>>
  >;

  static create(
    valueSchema: AbstractSchema<unknown>,
    arg1: ObjectParams | AbstractSchema<string> | undefined,
    arg2?: ObjectParams | undefined
  ): unknown {
    let keySchema: AbstractSchema<string> | undefined;
    let params: ObjectParams | undefined;
    if (arg1 instanceof AbstractSchema) {
      keySchema = arg1;
      if (arg2) {
        params = arg2;
      }
    } else if (arg1) {
      params = arg1;
    }

    return new ObjectSchema({
      ...params,
      keySchema,
      valueSchema,
      isOptional: false,
      isNullable: false,
    }, undefined);
  }

  optional(): ObjectSchema<Obj, Result | undefined> {
    return new ObjectSchema(
      { ...this.options, isOptional: true },
      this.mapper
    );
  }

  nullable(): ObjectSchema<Obj, Result | null> {
    return new ObjectSchema(
      { ...this.options, isNullable: true },
      this.mapper
    );
  }

  nullish(): ObjectSchema<Obj, Result | null | undefined> {
    return new ObjectSchema(
      { ...this.options, isOptional: true, isNullable: true },
      this.mapper
    );
  }

  required(params?: { message: string }): ObjectSchema<
    Obj,
    Exclude<Result, null | undefined>
  > {
    return new ObjectSchema({
      ...this.options,
      isOptional: false,
      isNullable: false,
      requiredError: params?.message || this.options.requiredError,
    }, this.mapper);
  }

  map<Mapped>(mapper: (value: Obj) => Mapped): ObjectSchema<Obj, Mapped> {
    return new ObjectSchema({ ...this.options }, mapper);
  }

  parse(value: unknown): Result;
  parse(value: unknown): unknown {
    const ErrorCodes = ObjectSchema.ErrorCodes;
    const options = this.options;
    const mapper = this.mapper;
    const typeError = 'The value must be an object.';

    if (value == null) {
      if (value === undefined && options.isOptional) {
        return value;
      }
      if (value === null && options.isNullable) {
        return value;
      }
      throw new ParseError(
        ErrorCodes.required,
        options.requiredError || typeError
      );
    }

    if (!isObject(value) || Array.isArray(value)) {
      throw new ParseError(
        ErrorCodes.type,
        options.typeError || typeError
      );
    }

    const res = { ...value };
    const keySchema = options.keySchema;
    const valueSchema = options.valueSchema;

    // noinspection SuspiciousTypeOfGuard
    if (keySchema && keySchema instanceof EnumSchema) {
      for (const value of keySchema.values) {
        if (!(value in res)) {
          const code = ErrorCodes.missingKey;
          const params = { key: value };

          let message: string;
          if (options.missingKeyError) {
            if (typeof options.missingKeyError === 'function') {
              message = options.missingKeyError(params);
            } else {
              message = options.missingKeyError;
            }
          } else {
            message = `The object must contain the key '${value}'`;
          }

          throw new ParseError(code, message, { params });
        }
      }
    }

    for (const key of Object.keys(res)) {
      const value = res[key];
      const params = { key };

      if (keySchema) {
        try {
          keySchema.parse(key);
        } catch (cause) {
          const code = ErrorCodes.invalidKey;

          let message: string;
          if (options.keyError) {
            if (typeof options.keyError === 'function') {
              message = options.keyError(params);
            } else {
              message = options.keyError;
            }
          } else {
            message = `Invalid object key '${key}'`;
            if (hasMessage(cause)) {
              message += `: ${cause.message}`;
            }
          }

          throw new ParseError(code, message, { cause, params });
        }
      }

      try {
        res[key] = valueSchema.parse(value);
      } catch (cause) {
        const code = ErrorCodes.invalidKey;
        const params = { key, value };

        let message: string;
        if (options.valueError) {
          if (typeof options.valueError === 'function') {
            message = options.valueError(params);
          } else {
            message = options.valueError;
          }
        } else {
          message = `Invalid value of '${key}' key`;
          if (hasMessage(cause)) {
            message += `: ${cause.message}`;
          }
        }

        throw new ParseError(code, message, { cause, params });
      }
    }

    if (typeof mapper === 'function') {
      return mapper(res);
    }

    return res;
  }
}
