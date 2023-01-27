import { type ResultMapper } from '../types.js';
import { AbstractSchema } from '../abstract-schema.js';
import { ParseError } from '../parse-error.js';
import { pluralize } from '../util.js';

type StringSchemaOptions = {
  isOptional: boolean;
  isNullable: boolean;
  cast?: boolean;
  trim?: boolean;
  typeError?: string;
  requiredError?: string;
};

type StringValidator = (value: string) => string;
type StringValidators = { [name: string]: StringValidator };

export type StringParams = Pick<StringSchemaOptions,
  | 'cast'
  | 'trim'
  | 'typeError'
  | 'requiredError'>;

export class StringSchema<
  Input,
  Output,
  Cast extends boolean
> extends AbstractSchema<Input, Output> {
  protected readonly options: StringSchemaOptions;
  protected readonly validators: StringValidators;
  protected readonly mapper: ResultMapper | undefined;

  protected constructor(
    options: StringSchemaOptions,
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

  static create<Params extends StringParams>(params?: Params): StringSchema<
    string,
    string,
    Params extends { cast: true } ? true : false> {
    return new StringSchema({
      isOptional: false,
      isNullable: false,
      cast: params?.cast ?? false,
      trim: params?.trim ?? false,
      requiredError: params?.requiredError,
      typeError: params?.typeError,
    }, {}, undefined);
  }

  optional(): StringSchema<
    Input | undefined,
    Cast extends true ? Output : Output | undefined,
    Cast> {
    return new StringSchema(
      { ...this.options, isOptional: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullable(): StringSchema<
    Input | null,
    Cast extends true ? Output : Output | null,
    Cast> {
    return new StringSchema(
      { ...this.options, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullish(): StringSchema<
    Input | null | undefined,
    Cast extends true ? Output : Output | null | undefined,
    Cast> {
    return new StringSchema(
      { ...this.options, isOptional: true, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  required(): StringSchema<
    Exclude<Input, null | undefined>,
    Exclude<Output, null | undefined>,
    Cast> {
    return new StringSchema(
      { ...this.options, isOptional: false, isNullable: false },
      { ...this.validators },
      this.mapper
    );
  }

  map<Mapped>(mapper: (value: string) => Mapped): StringSchema<
    Input,
    Mapped,
    Cast> {
    return new StringSchema(
      { ...this.options },
      { ...this.validators },
      mapper
    );
  }

  notEmpty(params?: { message?: string }): StringSchema<
    Input,
    Output,
    Cast> {
    let message: string;
    if (params?.message) {
      message = params.message;
    } else {
      message = 'The value cannot be an empty string.';
    }

    const code = StringSchema.ErrorCodes.notEmpty;
    const validator: StringValidator = (value) => {
      if (value === '') {
        throw new ParseError(code, message);
      }
      return value;
    };

    return new StringSchema(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  minLength(limit: number, params?: {
    message?: string | ((params: { limit: number }) => string);
  }): StringSchema<Input, Output, Cast> {
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

    const code = StringSchema.ErrorCodes.minLength;
    const validator: StringValidator = (value) => {
      if (value.length < limit) {
        throw new ParseError(code, message, {
          params: { limit },
        });
      }
      return value;
    };

    return new StringSchema(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  maxLength(limit: number, params?: {
    message?: string | ((params: { limit: number }) => string);
  }): StringSchema<Input, Output, Cast> {
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

    const code = StringSchema.ErrorCodes.maxLength;
    const validator: StringValidator = (value) => {
      if (value.length > limit) {
        throw new ParseError(code, message, {
          params: { limit },
        });
      }
      return value;
    };

    return new StringSchema(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  pattern(regex: RegExp, params?: {
    message?: string | ((params: { regex: RegExp }) => string);
  }): StringSchema<Input, Output, Cast> {
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

    const code = StringSchema.ErrorCodes.pattern;
    const validator: StringValidator = (value) => {
      if (!value.match(regex)) {
        throw new ParseError(code, message, {
          params: { pattern: regex },
        });
      }
      return value;
    };

    return new StringSchema(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  custom(validator: StringValidator): StringSchema<Input, Output, Cast> {
    const code = StringSchema.ErrorCodes.custom;
    return new StringSchema(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  parse(value: unknown): Output;
  parse(value: unknown): unknown {
    const ErrorCodes = StringSchema.ErrorCodes;
    const options = this.options;
    const validators = this.validators;
    const mapper = this.mapper;
    const typeError = 'The value must be a string.';

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
        options.requiredError || typeError
      );
    }

    if (typeof value !== 'string') {
      throw new ParseError(
        ErrorCodes.type,
        options.typeError || typeError
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
}
