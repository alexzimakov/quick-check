import { type MapTypeFn } from '../types.js';
import { TypeAlias } from './type-alias.js';
import { RapidCheckError } from '../error.js';
import { requiredError } from './error-messages.js';

type BooleanTypeOptions = {
  isOptional: boolean;
  isNullable: boolean;
  shouldCastValue: boolean;
  typeError?: string;
  requiredError?: string;
};

type BooleanValidator = (value: boolean) => boolean;
type BooleanValidators = { [name: string]: BooleanValidator };

export type BooleanParams = {
  cast?: boolean;
  typeError?: string;
  requiredError?: string;
};

export class BooleanType<
  Result,
  Cast extends boolean
> extends TypeAlias<Result> {
  protected readonly options: BooleanTypeOptions;
  protected readonly validators: BooleanValidators;
  protected readonly mapper: MapTypeFn | undefined;

  protected constructor(
    options: BooleanTypeOptions,
    validators: BooleanValidators,
    mapper: MapTypeFn | undefined
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

  static create<T extends BooleanParams>(params?: T): BooleanType<
    boolean,
    T extends { cast: true } ? true : false> {
    return new BooleanType({
      isOptional: false,
      isNullable: false,
      shouldCastValue: params?.cast ?? false,
      requiredError: params?.requiredError,
      typeError: params?.typeError,
    }, {}, undefined);
  }

  optional(): BooleanType<
    Cast extends true ? Result : Result | undefined,
    Cast> {
    return new BooleanType({
      ...this.options,
      isOptional: true,
    }, { ...this.validators }, this.mapper);
  }

  nullable(): BooleanType<
    Cast extends true ? Result : Result | null,
    Cast> {
    return new BooleanType({
      ...this.options,
      isNullable: true,
    }, { ...this.validators }, this.mapper);
  }

  nullish(): BooleanType<
    Cast extends true ? Result : Result | null | undefined,
    Cast> {
    return new BooleanType({
      ...this.options,
      isOptional: true,
      isNullable: true,
    }, { ...this.validators }, this.mapper);
  }

  required(): BooleanType<
    Exclude<Result, null | undefined>,
    Cast> {
    return new BooleanType({
      ...this.options,
      isOptional: false,
      isNullable: false,
    }, { ...this.validators }, this.mapper);
  }

  map<U>(mapper: (value: boolean) => U): BooleanType<U, Cast> {
    return new BooleanType(
      { ...this.options },
      { ...this.validators },
      mapper
    );
  }

  parse(value: unknown): Result;
  parse(value: unknown): unknown {
    const { ErrorCodes } = BooleanType;
    const { options, validators, mapper } = this;

    if (options.shouldCastValue) {
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
      throw new RapidCheckError(
        ErrorCodes.required,
        options.requiredError || requiredError
      );
    }

    if (typeof value !== 'boolean') {
      throw new RapidCheckError(
        ErrorCodes.type,
        options.typeError || 'Must be a boolean.'
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
        throw RapidCheckError.of(err);
      }
    }

    return res;
  }

  truthy(params?: { message?: string }): BooleanType<Result, Cast> {
    let message: string;
    if (params?.message) {
      message = params.message;
    } else {
      message = 'Must be truthy value.';
    }

    const code = BooleanType.ErrorCodes.truthy;
    const validator: BooleanValidator = (value) => {
      if (!value) {
        throw new RapidCheckError(code, message);
      }
      return value;
    };

    return new BooleanType(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  falsy(params?: { message?: string }): BooleanType<Result, Cast> {
    let message: string;
    if (params?.message) {
      message = params.message;
    } else {
      message = 'Must be falsy value.';
    }

    const code = BooleanType.ErrorCodes.falsy;
    const validator: BooleanValidator = (value) => {
      if (value) {
        throw new RapidCheckError(code, message);
      }
      return value;
    };

    return new BooleanType(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  custom(validator: BooleanValidator): BooleanType<Result, Cast> {
    const code = BooleanType.ErrorCodes.custom;
    return new BooleanType(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }
}
