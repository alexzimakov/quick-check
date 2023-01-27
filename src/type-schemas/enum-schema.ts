import { type ResultMapper } from '../types.js';
import { AbstractSchema } from '../abstract-schema.js';
import { ParseError } from '../parse-error.js';
import { formatList } from '../util.js';

type EnumSchemaOptions = {
  isOptional: boolean;
  isNullable: boolean;
  typeError?: string;
  requiredError?: string;
};

export type EnumParams = Pick<EnumSchemaOptions,
  | 'typeError'
  | 'requiredError'>;

export class EnumSchema<
  Value,
  Input,
  Output,
> extends AbstractSchema<Input, Output> {
  readonly values: readonly Value[];
  protected readonly options: EnumSchemaOptions;
  protected readonly mapper: ResultMapper | undefined;

  protected constructor(
    values: readonly Value[],
    options: EnumSchemaOptions,
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
  ): EnumSchema<Value, Value, Value> {
    return new EnumSchema(values, {
      ...params,
      isOptional: false,
      isNullable: false,
    }, undefined);
  }

  optional(): EnumSchema<
    Value,
    Input | undefined,
    Output | undefined> {
    return new EnumSchema(
      this.values,
      { ...this.options, isOptional: true },
      this.mapper
    );
  }

  nullable(): EnumSchema<
    Value,
    Input | null,
    Output | null> {
    return new EnumSchema(
      this.values,
      { ...this.options, isNullable: true },
      this.mapper
    );
  }

  nullish(): EnumSchema<
    Value,
    Input | null | undefined,
    Output | null | undefined> {
    return new EnumSchema(
      this.values,
      { ...this.options, isOptional: true, isNullable: true },
      this.mapper
    );
  }

  required(): EnumSchema<
    Value,
    Exclude<Input, null | undefined>,
    Exclude<Output, null | undefined>> {
    return new EnumSchema(
      this.values,
      { ...this.options, isOptional: false, isNullable: false },
      this.mapper
    );
  }

  map<Mapped>(mapper: (value: Value) => Mapped): EnumSchema<
    Value,
    Input,
    Mapped> {
    return new EnumSchema(this.values, { ...this.options }, mapper);
  }

  parse(value: unknown): Output;
  parse(value: unknown): unknown {
    const ErrorCodes = EnumSchema.ErrorCodes;
    const options = this.options;
    const mapper = this.mapper;
    const values = this.values;
    const typeError = `The value must be one of ${
      formatList(values, { type: 'or' })
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
