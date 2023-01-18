import { type MapTypeFn } from '../types.js';
import { TypeAlias } from './type-alias.js';
import { RapidCheckError } from '../error.js';
import { requiredError } from './error-messages.js';

type EnumTypeOptions<T> = {
  values: readonly T[];
  isOptional: boolean;
  isNullable: boolean;
  typeError?: string;
  requiredError?: string;
};

export type EnumParams = {
  cast?: boolean;
  typeError?: string;
  requiredError?: string;
};

export class EnumType<
  Value,
  Result,
  Cast extends boolean
> extends TypeAlias<Result> {
  protected readonly options: EnumTypeOptions<Value>;
  protected readonly mapper: MapTypeFn | undefined;

  protected constructor(
    options: EnumTypeOptions<Value>,
    mapper: MapTypeFn | undefined
  ) {
    super();
    this.options = options;
    this.mapper = mapper;
  }

  static ErrorCodes = {
    type: 'enum.type',
    required: 'enum.required',
  } as const;

  static create<T, Params extends EnumParams>(
    values: readonly T[],
    params?: Params
  ): EnumType<
    T,
    T,
    Params extends { cast: true } ? true : false> {
    return new EnumType({
      values,
      isOptional: false,
      isNullable: false,
      typeError: params?.typeError,
      requiredError: params?.requiredError,
    }, undefined);
  }

  static formatValues(values: unknown[] | readonly unknown[]): string {
    const formatted: string[] = [];
    for (const value of values) {
      if (typeof value === 'string') {
        formatted.push(`'${value}'`);
      } else if (typeof value === 'bigint') {
        formatted.push(`${value}n`);
      } else if (Array.isArray(value) || typeof value === 'object') {
        formatted.push(JSON.stringify(value));
      } else {
        formatted.push(String(value));
      }
    }
    return `[${formatted.join(', ')}]`;
  }

  optional(): EnumType<
    Value,
    Cast extends true ? Result : Result | undefined,
    Cast> {
    return new EnumType({
      ...this.options,
      isOptional: true,
    }, this.mapper);
  }

  nullable(): EnumType<
    Value,
    Cast extends true ? Result : Result | null,
    Cast> {
    return new EnumType({
      ...this.options,
      isNullable: true,
    }, this.mapper);
  }

  nullish(): EnumType<
    Value,
    Cast extends true ? Result : Result | null | undefined,
    Cast> {
    return new EnumType({
      ...this.options,
      isOptional: true,
      isNullable: true,
    }, this.mapper);
  }

  required(): EnumType<
    Value,
    Exclude<Result, | null | undefined>,
    Cast> {
    return new EnumType({
      ...this.options,
      isOptional: false,
      isNullable: false,
    }, this.mapper);
  }

  map<U>(mapper: (value: Value) => U): EnumType<Value, U, Cast> {
    return new EnumType({ ...this.options }, mapper);
  }

  parse(value: unknown): Result;
  parse(value: unknown): unknown {
    const { ErrorCodes } = EnumType;
    const { options, mapper } = this;

    if (value == null) {
      if (value === undefined && options.isOptional) {
        return value;
      }
      if (value === null && options.isNullable) {
        return value;
      }
      throw new RapidCheckError(
        ErrorCodes.required,
        options.requiredError || requiredError
      );
    }

    const values = options.values;
    if (!options.values.includes(value as Value)) {
      throw new RapidCheckError(
        ErrorCodes.type,
        options.typeError || `Must be one of ${EnumType.formatValues(values)}`
      );
    }

    if (typeof mapper === 'function') {
      try {
        return mapper(value);
      } catch (err) {
        throw RapidCheckError.of(err);
      }
    }

    return value;
  }
}
