import { type MapTypeFn } from '../types.js';
import { TypeAlias } from './type-alias.js';
import { RapidCheckError } from '../error.js';
import { requiredError } from './error-messages.js';

type NumberTypeOptions = {
  isOptional: boolean;
  isNullable: boolean;
  shouldCastValue: boolean;
  typeError?: string;
  requiredError?: string;
};

type NumberValidator = (value: number) => number;
type NumberValidators = { [name: string]: NumberValidator };

export type NumberParams = {
  cast?: boolean;
  typeError?: string;
  requiredError?: string;
};

export class NumberType<
  Result,
  Cast extends boolean
> extends TypeAlias<Result> {
  protected readonly options: NumberTypeOptions;
  protected readonly validators: NumberValidators;
  protected readonly mapper: MapTypeFn | undefined;

  protected constructor(
    options: NumberTypeOptions,
    validators: NumberValidators,
    mapper: MapTypeFn | undefined
  ) {
    super();
    this.options = options;
    this.validators = validators;
    this.mapper = mapper;
  }

  static ErrorCodes = {
    type: 'number.type',
    required: 'number.required',
    int: 'number.int',
    positive: 'number.positive',
    min: 'number.min',
    max: 'number.max',
    greaterThan: 'number.greaterThan',
    lessThan: 'number.lessThan',
    custom: 'number.custom',
  } as const;

  static create<T extends NumberParams>(params?: T): NumberType<
    number,
    T extends { cast: true } ? true : false> {
    return new NumberType({
      isOptional: false,
      isNullable: false,
      shouldCastValue: params?.cast ?? false,
      requiredError: params?.requiredError,
      typeError: params?.typeError,
    }, {}, undefined);
  }

  optional(): NumberType<
    Cast extends true ? Result : Result | undefined,
    Cast> {
    return new NumberType({
      ...this.options,
      isOptional: true,
    }, { ...this.validators }, this.mapper);
  }

  nullable(): NumberType<
    Cast extends true ? Result : Result | null,
    Cast> {
    return new NumberType({
      ...this.options,
      isNullable: true,
    }, { ...this.validators }, this.mapper);
  }

  nullish(): NumberType<
    Cast extends true ? Result : Result | null | undefined,
    Cast> {
    return new NumberType({
      ...this.options,
      isOptional: true,
      isNullable: true,
    }, { ...this.validators }, this.mapper);
  }

  required(): NumberType<
    Exclude<Result, null | undefined>,
    Cast> {
    return new NumberType({
      ...this.options,
      isOptional: false,
      isNullable: false,
    }, { ...this.validators }, this.mapper);
  }

  map<U>(mapper: (value: number) => U): NumberType<U, Cast> {
    return new NumberType(
      { ...this.options },
      { ...this.validators },
      mapper
    );
  }

  parse(value: unknown): Result;
  parse(value: unknown): unknown {
    const { ErrorCodes } = NumberType;
    const { options, validators, mapper } = this;

    if (options.shouldCastValue) {
      if (value == null) {
        value = 0;
      } else if (
        typeof value === 'bigint' ||
        typeof value === 'string' ||
        typeof value === 'boolean'
      ) {
        value = Number(value);
      } else if (value instanceof Date) {
        value = value.getTime();
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

    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new RapidCheckError(
        ErrorCodes.type,
        options.typeError || 'Must be a number.'
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

  int(params?: { message?: string }): NumberType<Result, Cast> {
    let message: string;
    if (params?.message) {
      message = params.message;
    } else {
      message = 'Must be an integer.';
    }

    const code = NumberType.ErrorCodes.int;
    const validator: NumberValidator = (value) => {
      if (!Number.isInteger(value)) {
        throw new RapidCheckError(code, message);
      }
      return value;
    };

    return new NumberType(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  positive(params?: { message?: string }): NumberType<Result, Cast> {
    let message: string;
    if (params?.message) {
      message = params.message;
    } else {
      message = 'Must be a positive number.';
    }

    const code = NumberType.ErrorCodes.positive;
    const validator: NumberValidator = (value) => {
      if (value < 0) {
        throw new RapidCheckError(code, message);
      }
      return value;
    };

    return new NumberType(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  min(min: number, params?: {
    message?: string | ((params: { min: number }) => string);
  }): NumberType<Result, Cast> {
    let message: string;
    if (params?.message) {
      if (typeof params.message === 'function') {
        message = params.message({ min });
      } else {
        message = params.message;
      }
    } else {
      message = `The number must be greater than or equal to ${min}.`;
    }

    const code = NumberType.ErrorCodes.min;
    const validator: NumberValidator = (value) => {
      if (value < min) {
        throw new RapidCheckError(code, message);
      }
      return value;
    };

    return new NumberType(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  max(max: number, params?: {
    message?: string | ((params: { max: number }) => string);
  }): NumberType<Result, Cast> {
    let message: string;
    if (params?.message) {
      if (typeof params.message === 'function') {
        message = params.message({ max });
      } else {
        message = params.message;
      }
    } else {
      message = `The number must be less than or equal to ${max}.`;
    }

    const code = NumberType.ErrorCodes.max;
    const validator: NumberValidator = (value) => {
      if (value > max) {
        throw new RapidCheckError(code, message);
      }
      return value;
    };

    return new NumberType(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  greaterThan(min: number, params?: {
    message?: string | ((params: { min: number }) => string);
  }): NumberType<Result, Cast> {
    let message: string;
    if (params?.message) {
      if (typeof params.message === 'function') {
        message = params.message({ min });
      } else {
        message = params.message;
      }
    } else {
      message = `The value must be greater than ${min}.`;
    }

    const code = NumberType.ErrorCodes.lessThan;
    const validator: NumberValidator = (value) => {
      if (value <= min) {
        throw new RapidCheckError(code, message);
      }
      return value;
    };

    return new NumberType(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  lessThan(max: number, params?: {
    message?: string | ((params: { max: number }) => string);
  }): NumberType<Result, Cast> {
    let message: string;
    if (params?.message) {
      if (typeof params.message === 'function') {
        message = params.message({ max });
      } else {
        message = params.message;
      }
    } else {
      message = `The value must be less than ${max}.`;
    }

    const code = NumberType.ErrorCodes.lessThan;
    const validator: NumberValidator = (value) => {
      if (value >= max) {
        throw new RapidCheckError(code, message);
      }
      return value;
    };

    return new NumberType(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  custom(validator: NumberValidator): NumberType<Result, Cast> {
    const code = NumberType.ErrorCodes.custom;
    return new NumberType(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }
}
