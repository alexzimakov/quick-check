import { type ResultMapper } from '../types.js';
import { AbstractSchema } from '../abstract-schema.js';
import { ParseError } from '../parse-error.js';

type BooleanSchemaOptions = {
  isOptional: boolean;
  isNullable: boolean;
  cast?: boolean;
  typeError?: string;
  requiredError?: string;
};

type BooleanValidator = (value: boolean) => boolean;
type BooleanValidators = { [name: string]: BooleanValidator };

export type BooleanParams = Pick<BooleanSchemaOptions,
  | 'cast'
  | 'typeError'
  | 'requiredError'>;

export class BooleanSchema<
  Result,
  Cast extends boolean
> extends AbstractSchema<boolean, Result> {
  protected readonly options: BooleanSchemaOptions;
  protected readonly validators: BooleanValidators;
  protected readonly mapper: ResultMapper | undefined;

  protected constructor(
    options: BooleanSchemaOptions,
    validators: BooleanValidators,
    mapper: ResultMapper | undefined
  ) {
    super();
    this.options = options;
    this.validators = validators;
    this.mapper = mapper;
  }

  static ErrorCodes = {
    type: 'BOOLEAN_TYPE',
    required: 'BOOLEAN_REQUIRED',
    truthy: 'BOOLEAN_TRUTHY',
    falsy: 'BOOLEAN_FALSY',
    custom: 'BOOLEAN_CUSTOM',
  } as const;

  static create<Params extends BooleanParams>(params?: Params): BooleanSchema<
    boolean,
    Params extends { cast: true } ? true : false> {
    return new BooleanSchema({
      ...params,
      isOptional: false,
      isNullable: false,
    }, {}, undefined);
  }

  optional(): BooleanSchema<
    Cast extends true ? Result : Result | undefined,
    Cast> {
    return new BooleanSchema(
      { ...this.options, isOptional: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullable(): BooleanSchema<
    Cast extends true ? Result : Result | null,
    Cast> {
    return new BooleanSchema(
      { ...this.options, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullish(): BooleanSchema<
    Cast extends true ? Result : Result | null | undefined,
    Cast> {
    return new BooleanSchema(
      { ...this.options, isOptional: true, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  required(): BooleanSchema<
    Exclude<Result, null | undefined>,
    Cast> {
    return new BooleanSchema(
      { ...this.options, isOptional: false, isNullable: false },
      { ...this.validators },
      this.mapper
    );
  }

  map<Mapped>(mapper: (value: boolean) => Mapped): BooleanSchema<Mapped, Cast> {
    return new BooleanSchema(
      { ...this.options },
      { ...this.validators },
      mapper
    );
  }

  truthy(params?: { message?: string }): BooleanSchema<Result, Cast> {
    let message: string;
    if (params?.message) {
      message = params.message;
    } else {
      message = 'Must be truthy value.';
    }

    const code = BooleanSchema.ErrorCodes.truthy;
    const validator: BooleanValidator = (value) => {
      if (!value) {
        throw new ParseError(code, message);
      }
      return value;
    };

    return new BooleanSchema(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  falsy(params?: { message?: string }): BooleanSchema<Result, Cast> {
    let message: string;
    if (params?.message) {
      message = params.message;
    } else {
      message = 'Must be falsy value.';
    }

    const code = BooleanSchema.ErrorCodes.falsy;
    const validator: BooleanValidator = (value) => {
      if (value) {
        throw new ParseError(code, message);
      }
      return value;
    };

    return new BooleanSchema(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  custom(validator: BooleanValidator): BooleanSchema<Result, Cast> {
    const code = BooleanSchema.ErrorCodes.custom;
    return new BooleanSchema(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  parse(value: unknown): Result;
  parse(value: unknown): unknown {
    const ErrorCodes = BooleanSchema.ErrorCodes;
    const options = this.options;
    const validators = this.validators;
    const mapper = this.mapper;
    const typeError = 'The value must be a boolean.';

    if (options.cast) {
      if (
        value === 'true' ||
        value === 'yes' ||
        value === '1' ||
        value === 1n ||
        value === 1
      ) {
        value = true;
      } else if (
        value === 'false' ||
        value === 'no' ||
        value === '0' ||
        value === 0n ||
        value === 0 ||
        value == null
      ) {
        value = false;
      }
    }

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

    if (typeof value !== 'boolean') {
      throw new ParseError(
        ErrorCodes.type,
        options.typeError || typeError
      );
    }

    let res = value;
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
