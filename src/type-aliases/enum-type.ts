import { type ResultMapper } from '../types.js';
import { TypeAlias } from './type-alias.js';
import { ParseError } from '../parse-error.js';

type EnumTypeOptions = {
  isOptional: boolean;
  isNullable: boolean;
  typeError?: string;
  requiredError?: string;
};

export type EnumParams = Pick<EnumTypeOptions,
  | 'typeError'
  | 'requiredError'>;

export class EnumType<
  Value,
  Result,
> extends TypeAlias<Value, Result> {
  readonly values: readonly Value[];
  protected readonly options: EnumTypeOptions;
  protected readonly mapper: ResultMapper | undefined;

  protected constructor(
    values: readonly Value[],
    options: EnumTypeOptions,
    mapper: ResultMapper | undefined
  ) {
    super();
    this.values = values;
    this.options = options;
    this.mapper = mapper;
  }

  static ErrorCodes = {
    type: 'ENUM_TYPE',
    required: 'ENUM_REQUIRED',
  } as const;

  static create<Value, Params extends EnumParams>(
    values: readonly Value[],
    params?: Params
  ): EnumType<Value, Value> {
    return new EnumType(values, {
      ...params,
      isOptional: false,
      isNullable: false,
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

  optional(): EnumType<Value, Result | undefined> {
    return new EnumType(
      this.values,
      { ...this.options, isOptional: true },
      this.mapper
    );
  }

  nullable(): EnumType<Value, Result | null> {
    return new EnumType(
      this.values,
      { ...this.options, isNullable: true },
      this.mapper
    );
  }

  nullish(): EnumType<Value, Result | null | undefined> {
    return new EnumType(
      this.values,
      { ...this.options, isOptional: true, isNullable: true },
      this.mapper
    );
  }

  required(): EnumType<Value, Exclude<Result, null | undefined>> {
    return new EnumType(
      this.values,
      { ...this.options, isOptional: false, isNullable: false },
      this.mapper
    );
  }

  map<Mapped>(mapper: (value: Value) => Mapped): EnumType<Value, Mapped> {
    return new EnumType(this.values, { ...this.options }, mapper);
  }

  parse(value: unknown): Result;
  parse(value: unknown): unknown {
    const ErrorCodes = EnumType.ErrorCodes;
    const options = this.options;
    const mapper = this.mapper;
    const values = this.values;
    const typeError = `The value must be one of ${
      EnumType.formatValues(values)
    }`;

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

    if (!values.includes(value as Value)) {
      throw new ParseError(
        ErrorCodes.type,
        options.typeError || typeError,
        { params: { values } }
      );
    }

    if (typeof mapper === 'function') {
      try {
        return mapper(value);
      } catch (err) {
        throw ParseError.of(err);
      }
    }

    return value;
  }
}
