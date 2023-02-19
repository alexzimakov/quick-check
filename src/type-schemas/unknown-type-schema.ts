import { type ResultMapper } from '../types.js';
import { AbstractSchema } from '../abstract-schema.js';
import { ParseError } from '../parse-error.js';

type UnknownTypeSchemaOptions = {
  isOptional: boolean;
  isNullable: boolean;
  requiredError?: string;
};

type UnknownTypeValidator = (value: unknown) => unknown;
type UnknownTypeValidators = { [name: string]: UnknownTypeValidator };

export type UnknownTypeParams = Pick<UnknownTypeSchemaOptions,
  | 'requiredError'>;

export class UnknownTypeSchema<
  Input,
  Output,
> extends AbstractSchema<Input, Output> {
  protected readonly options: UnknownTypeSchemaOptions;
  protected readonly validators: UnknownTypeValidators;
  protected readonly mapper: ResultMapper | undefined;

  protected constructor(
    options: UnknownTypeSchemaOptions,
    validators: UnknownTypeValidators,
    mapper: ResultMapper | undefined
  ) {
    super();
    this.options = options;
    this.validators = validators;
    this.mapper = mapper;
  }

  static ErrorCodes = {
    required: 'UNKNOWN_REQUIRED',
    custom: 'UNKNOWN_CUSTOM',
  } as const;

  static create<
    Params extends UnknownTypeParams
  >(params?: Params): UnknownTypeSchema<unknown, unknown> {
    return new UnknownTypeSchema({
      ...params,
      isOptional: false,
      isNullable: false,
    }, {}, undefined);
  }

  optional(): UnknownTypeSchema<
    Input | undefined,
    Output | undefined> {
    return new UnknownTypeSchema(
      { ...this.options, isOptional: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullable(): UnknownTypeSchema<
    Input | null,
    Output | null> {
    return new UnknownTypeSchema(
      { ...this.options, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullish(): UnknownTypeSchema<
    Input | null | undefined,
    Output | null | undefined> {
    return new UnknownTypeSchema(
      { ...this.options, isOptional: true, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  required(): UnknownTypeSchema<
    Exclude<Input, null | undefined>,
    Exclude<Output, null | undefined>> {
    return new UnknownTypeSchema(
      { ...this.options, isOptional: false, isNullable: false },
      { ...this.validators },
      this.mapper
    );
  }

  map<Mapped>(mapper: (value: boolean) => Mapped): UnknownTypeSchema<
    Input,
    Mapped> {
    return new UnknownTypeSchema(
      { ...this.options },
      { ...this.validators },
      mapper
    );
  }

  custom(validator: UnknownTypeValidator): UnknownTypeSchema<Input, Output> {
    const code = UnknownTypeSchema.ErrorCodes.custom;
    return new UnknownTypeSchema(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  parse(value: unknown): Output;
  parse(value: unknown): unknown {
    const ErrorCodes = UnknownTypeSchema.ErrorCodes;
    const options = this.options;
    const mapper = this.mapper;
    const validators = this.validators;
    const requiredError = 'The value cannot be null or undefined.';

    if (value == null) {
      if (value === undefined && options.isOptional) {
        return value;
      }
      if (value === null && options.isNullable) {
        return value;
      }
      throw new ParseError(
        ErrorCodes.required,
        options.requiredError || requiredError
      );
    }

    let res: unknown = value;
    for (const validate of Object.values(validators)) {
      res = validate(res);
    }

    if (typeof mapper === 'function') {
      try {
        return mapper(res);
      } catch (err) {
        throw ParseError.of(err);
      }
    }

    return res;
  }
}
