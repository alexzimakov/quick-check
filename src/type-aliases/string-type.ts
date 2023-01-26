import { type ResultMapper } from '../types.js';
import { TypeAlias } from './type-alias.js';
import { ParseError } from '../parse-error.js';
import { requiredError } from './error-messages.js';
import { pluralize } from '../util.js';

type StringTypeOptions = {
  isOptional: boolean;
  isNullable: boolean;
  cast?: boolean;
  trim?: boolean;
  typeError?: string;
  requiredError?: string;
};

type StringValidator = (value: string) => string;
type StringValidators = { [name: string]: StringValidator };

export type StringParams = Pick<StringTypeOptions,
  | 'cast'
  | 'trim'
  | 'typeError'
  | 'requiredError'>;

export class StringType<
  Result,
  Cast extends boolean
> extends TypeAlias<string, Result> {
  protected readonly options: StringTypeOptions;
  protected readonly validators: StringValidators;
  protected readonly mapper: ResultMapper | undefined;

  protected constructor(
    options: StringTypeOptions,
    validators: StringValidators,
    mapper: ResultMapper | undefined
  ) {
    super();
    this.options = options;
    this.validators = validators;
    this.mapper = mapper;
  }

  static ErrorCodes = {
    type: 'STRING_TYPE',
    required: 'STRING_REQUIRED',
    notEmpty: 'STRING_NOT_EMPTY',
    minLength: 'STRING_MIN_LENGTH',
    maxLength: 'STRING_MAX_LENGTH',
    pattern: 'STRING_PATTERN',
    custom: 'STRING_CUSTOM',
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

  static create<Params extends StringParams>(params?: Params): StringType<
    string,
    Params extends { cast: true } ? true : false> {
    return new StringType({
      isOptional: false,
      isNullable: false,
      cast: params?.cast ?? false,
      trim: params?.trim ?? false,
      requiredError: params?.requiredError,
      typeError: params?.typeError,
    }, {}, undefined);
  }

  optional(): StringType<
    Cast extends true ? Result : Result | undefined,
    Cast> {
    return new StringType(
      { ...this.options, isOptional: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullable(): StringType<
    Cast extends true ? Result : Result | null,
    Cast> {
    return new StringType(
      { ...this.options, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullish(): StringType<
    Cast extends true ? Result : Result | null | undefined,
    Cast> {
    return new StringType(
      { ...this.options, isOptional: true, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  required(): StringType<
    Exclude<Result, null | undefined>,
    Cast> {
    return new StringType(
      { ...this.options, isOptional: false, isNullable: false },
      { ...this.validators },
      this.mapper
    );
  }

  map<Mapped>(mapper: (value: string) => Mapped): StringType<Mapped, Cast> {
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

    if (options.cast) {
      value = value == null ? '' : String(value);
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
        options.requiredError || requiredError
      );
    }

    if (typeof value !== 'string') {
      throw new ParseError(
        ErrorCodes.type,
        options.typeError || 'Must be a string.'
      );
    }

    let res = value;
    if (options.trim) {
      res = value.trim();
    }
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
        throw new ParseError(code, message);
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
    message?: string | ((params: { limit: number }) => string);
  }): StringType<Result, Cast> {
    let message: string;
    if (params?.message) {
      if (typeof params.message === 'function') {
        message = params.message({ limit });
      } else {
        message = params.message;
      }
    } else {
      message = `The string must be at least ${
        pluralize(limit, 'character', 'characters')
      } long.`;
    }

    const code = StringType.ErrorCodes.minLength;
    const validator: StringValidator = (value) => {
      if (value.length < limit) {
        throw new ParseError(code, message, {
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
    message?: string | ((params: { limit: number }) => string);
  }): StringType<Result, Cast> {
    let message: string;
    if (params?.message) {
      if (typeof params.message === 'function') {
        message = params.message({ limit });
      } else {
        message = params.message;
      }
    } else {
      message = `The string must be at most ${
        pluralize(limit, 'character', 'characters')
      } long.`;
    }

    const code = StringType.ErrorCodes.maxLength;
    const validator: StringValidator = (value) => {
      if (value.length > limit) {
        throw new ParseError(code, message, {
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
    message?: string | ((params: { regex: RegExp }) => string);
  }): StringType<Result, Cast> {
    let message: string;
    if (params?.message) {
      if (typeof params.message === 'function') {
        message = params.message({ regex });
      } else {
        message = params.message;
      }
    } else {
      message = `The string does not match to \`${regex}\` pattern.`;
    }

    const code = StringType.ErrorCodes.pattern;
    const validator: StringValidator = (value) => {
      if (!value.match(regex)) {
        throw new ParseError(code, message, {
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
