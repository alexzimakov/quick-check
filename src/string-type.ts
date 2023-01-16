import { TypeAlias } from './type-alias.js';
import { RapidCheckError } from './errors.js';
import { FormatMessage, Mapper } from './types.js';

type StringTypeOptions = {
  isOptional: boolean;
  isNullable: boolean;
  shouldTrimValue: boolean;
  shouldCastValue: boolean;
  typeError?: string;
  requiredError?: string;
};

type StringValidator = (value: string) => string;
type StringValidators = { [name: string]: StringValidator };

type MinLengthParams = { limit: number };
type MaxLengthParams = { limit: number };
type PatternParams = { regex: RegExp };

export type StringTypeCreateParams = {
  cast?: boolean;
  trim?: boolean;
  typeError?: string;
  requiredError?: string;
};

export class StringType<
  Result,
  Cast extends boolean
> extends TypeAlias<Result> {
  protected readonly options: StringTypeOptions;
  protected readonly validators: StringValidators;
  protected readonly mapper: Mapper | undefined;

  protected constructor(
    options: StringTypeOptions,
    validators: StringValidators,
    mapper: Mapper | undefined
  ) {
    super();
    this.options = options;
    this.validators = validators;
    this.mapper = mapper;
  }

  static ErrorCodes = {
    type: 'string.type',
    required: 'string.required',
    notEmpty: 'string.notEmpty',
    minLength: 'string.minLength',
    maxLength: 'string.maxLength',
    pattern: 'string.pattern',
    custom: 'string.custom',
  } as const;

  static Patterns = {
    alphanumeric: /^[A-Z0-9]+$/i,
    positiveInteger: /^[0-9]+$/,
    integer: /^[+-]?[0-9]+$/,
    float: /^[-+]?([0-9]+(\.[0-9]+)?|\.[0-9]+)$/,
    email: /^[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i,
    dateISO: /^([0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])$/,
    timeISO: /^([01][0-9]|2[0-3]):([0-5][0-9])(:([0-5][0-9])(\.[0-9]{3})?)?(Z|[+-](?:2[0-3]|[01][0-9])(?::([0-5][0-9]))?)?$/,
    dateTimeISO: /^([0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])[T ]([01][0-9]|2[0-3]):([0-5][0-9])(:([0-5][0-9])(\.[0-9]{3})?)?(Z|[+-](?:2[0-3]|[01][0-9])(?::([0-5][0-9]))?)?$/,
  } as const;

  static create<T extends StringTypeCreateParams>(params?: T): StringType<
    string,
    T extends { cast: true } ? true : false> {
    return new StringType({
      isOptional: false,
      isNullable: false,
      shouldCastValue: params?.cast ?? false,
      shouldTrimValue: params?.trim ?? false,
      requiredError: params?.requiredError,
      typeError: params?.typeError,
    }, {}, undefined);
  }

  optional(): StringType<
    Cast extends true ? Result : Result | undefined,
    Cast> {
    return new StringType({
      ...this.options,
      isOptional: true,
    }, { ...this.validators }, this.mapper);
  }

  nullable(): StringType<
    Cast extends true ? Result : Result | null,
    Cast> {
    return new StringType({
      ...this.options,
      isNullable: true,
    }, { ...this.validators }, this.mapper);
  }

  nullish(): StringType<
    Cast extends true ? Result : Result | null | undefined,
    Cast> {
    return new StringType({
      ...this.options,
      isOptional: true,
      isNullable: true,
    }, { ...this.validators }, this.mapper);
  }

  required(): StringType<
    NonNullable<Result>,
    Cast> {
    return new StringType({
      ...this.options,
      isOptional: false,
      isNullable: false,
    }, { ...this.validators }, this.mapper);
  }

  map<U>(mapper: (value: Result) => U): StringType<U, Cast> {
    return new StringType(
      { ...this.options },
      { ...this.validators },
      mapper
    );
  }

  parse(value: unknown): Result;
  parse(value: unknown): unknown {
    const { ErrorCodes } = StringType;
    const { options, validators, mapper } = this;

    if (options.shouldCastValue) {
      value = value == null ? '' : String(value);
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
        options.requiredError || 'Value cannot be null or undefined.'
      );
    }

    if (typeof value !== 'string') {
      throw new RapidCheckError(
        ErrorCodes.type,
        options.typeError || 'Must be a string.'
      );
    }

    let res = value;
    if (options.shouldTrimValue) {
      res = value.trim();
    }
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

  notEmpty(params?: { message?: string }): StringType<Result, Cast> {
    let message: string;
    if (params?.message) {
      message = params.message;
    } else {
      message = 'The value cannot be an empty string.';
    }

    const code = StringType.ErrorCodes.notEmpty;
    const validator: StringValidator = (value) => {
      if (value === '') {
        throw new RapidCheckError(code, message);
      }
      return value;
    };

    return new StringType(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  minLength(limit: number, params?: {
    message?: string | FormatMessage<MinLengthParams>;
  }): StringType<Result, Cast> {
    let message: string;
    if (params?.message) {
      if (typeof params.message === 'function') {
        message = params.message({ limit });
      } else {
        message = params.message;
      }
    } else {
      message = `Must be at least ${limit} characters long.`;
    }

    const code = StringType.ErrorCodes.minLength;
    const validator: StringValidator = (value) => {
      if (value.length < limit) {
        throw new RapidCheckError(code, message, {
          params: { limit },
        });
      }
      return value;
    };

    return new StringType(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  maxLength(limit: number, params?: {
    message?: string | FormatMessage<MaxLengthParams>;
  }): StringType<Result, Cast> {
    let message: string;
    if (params?.message) {
      if (typeof params.message === 'function') {
        message = params.message({ limit });
      } else {
        message = params.message;
      }
    } else {
      message = `Must be at most ${limit} characters long.`;
    }

    const code = StringType.ErrorCodes.maxLength;
    const validator: StringValidator = (value) => {
      if (value.length > limit) {
        throw new RapidCheckError(code, message, {
          params: { limit },
        });
      }
      return value;
    };

    return new StringType(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  pattern(regex: RegExp, params?: {
    message?: string | FormatMessage<PatternParams>;
  }): StringType<Result, Cast> {
    let message: string;
    if (params?.message) {
      if (typeof params.message === 'function') {
        message = params.message({ regex });
      } else {
        message = params.message;
      }
    } else {
      message = `Value does not match to '${regex}' pattern.`;
    }

    const code = StringType.ErrorCodes.pattern;
    const validator: StringValidator = (value) => {
      if (!value.match(regex)) {
        throw new RapidCheckError(code, message, {
          params: { pattern: regex },
        });
      }
      return value;
    };

    return new StringType(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  custom(validator: StringValidator): StringType<Result, Cast> {
    const code = StringType.ErrorCodes.custom;
    return new StringType(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }
}
