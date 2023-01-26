import { type OutputType, type ResultMapper } from '../types.js';
import { EnumType } from './enum-type.js';
import { TypeAlias } from './type-alias.js';
import { ParseError } from '../parse-error.js';
import { hasMessage, isObject } from '../guards.js';

type KeyErrorFormatter = (params: { key: string }) => string;
type ValueErrorFormatter = (params: { key: string, value: unknown }) => string;
type RecordTypeOptions = {
  valueSchema: TypeAlias<unknown>;
  keySchema?: TypeAlias<string>;
  isOptional: boolean;
  isNullable: boolean;
  typeError?: string;
  requiredError?: string;
  missingKeyError?: string | KeyErrorFormatter;
  keyError?: string | KeyErrorFormatter;
  valueError?: string | ValueErrorFormatter;
};

export type RecordParams = Pick<RecordTypeOptions,
  | 'typeError'
  | 'requiredError'
  | 'missingKeyError'
  | 'keyError'
  | 'valueError'>;

export class RecordType<Obj, Result> extends TypeAlias<Obj, Result> {
  protected readonly options: RecordTypeOptions;
  protected readonly mapper: ResultMapper | undefined;

  protected constructor(
    options: RecordTypeOptions,
    mapper: ResultMapper | undefined
  ) {
    super();
    this.options = options;
    this.mapper = mapper;
  }

  static ErrorCodes = {
    type: 'RECORD_TYPE',
    required: 'RECORD_REQUIRED',
    invalidKey: 'RECORD_KEY_INVALID',
    invalidValue: 'RECORD_VALUE_INVALID',
    missingKey: 'RECORD_MISSING_KEY',
  };

  static create<
    Value extends TypeAlias<unknown>
  >(valueSchema: Value, params?: RecordParams): RecordType<
    Record<string, OutputType<Value>>,
    Record<string, OutputType<Value>>
  >;

  static create<
    Value extends TypeAlias<unknown>,
    Key extends TypeAlias<string>,
  >(valueSchema: Value, keySchema: Key, params?: RecordParams): RecordType<
    Record<OutputType<Key>, OutputType<Value>>,
    Record<OutputType<Key>, OutputType<Value>>
  >;

  static create(
    valueSchema: TypeAlias<unknown>,
    arg1: RecordParams | TypeAlias<string> | undefined,
    arg2?: RecordParams | undefined
  ): unknown {
    let keySchema: TypeAlias<string> | undefined;
    let params: RecordParams | undefined;
    if (arg1 instanceof TypeAlias) {
      keySchema = arg1;
      if (arg2) {
        params = arg2;
      }
    } else if (arg1) {
      params = arg1;
    }

    return new RecordType({
      ...params,
      keySchema,
      valueSchema,
      isOptional: false,
      isNullable: false,
    }, undefined);
  }

  optional(): RecordType<Obj, Result | undefined> {
    return new RecordType(
      { ...this.options, isOptional: true },
      this.mapper
    );
  }

  nullable(): RecordType<Obj, Result | null> {
    return new RecordType(
      { ...this.options, isNullable: true },
      this.mapper
    );
  }

  nullish(): RecordType<Obj, Result | null | undefined> {
    return new RecordType(
      { ...this.options, isOptional: true, isNullable: true },
      this.mapper
    );
  }

  required(params?: { message: string }): RecordType<
    Obj,
    Exclude<Result, null | undefined>
  > {
    return new RecordType({
      ...this.options,
      isOptional: false,
      isNullable: false,
      requiredError: params?.message || this.options.requiredError,
    }, this.mapper);
  }

  map<Mapped>(mapper: (value: Obj) => Mapped): RecordType<Obj, Mapped> {
    return new RecordType({ ...this.options }, mapper);
  }

  parse(value: unknown): Result;
  parse(value: unknown): unknown {
    const ErrorCodes = RecordType.ErrorCodes;
    const options = this.options;
    const mapper = this.mapper;

    if (value == null) {
      if (value === undefined && options.isOptional) {
        return value;
      }
      if (value === null && options.isNullable) {
        return value;
      }
      throw new ParseError(
        ErrorCodes.required,
        options.requiredError || `Expected object, but received ${value}.`
      );
    }

    if (!isObject(value) || Array.isArray(value)) {
      throw new ParseError(
        ErrorCodes.type,
        options.typeError || 'The value must be an object.'
      );
    }

    const res = { ...value };
    const keySchema = options.keySchema;
    const valueSchema = options.valueSchema;

    // noinspection SuspiciousTypeOfGuard
    if (keySchema && keySchema instanceof EnumType) {
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
