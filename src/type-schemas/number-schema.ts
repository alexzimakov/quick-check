import { type ResultMapper } from '../types.js';
import { AbstractSchema } from '../abstract-schema.js';
import { ParseError } from '../parse-error.js';

type NumberSchemaOptions = {
  isOptional: boolean;
  isNullable: boolean;
  cast?: boolean;
  typeError?: string;
  requiredError?: string;
};

type NumberValidator = (value: number) => number;
type NumberValidators = { [name: string]: NumberValidator };

export type NumberParams = Pick<NumberSchemaOptions,
  | 'cast'
  | 'typeError'
  | 'requiredError'>;

export class NumberSchema<
  Input,
  Output,
  Cast extends boolean
> extends AbstractSchema<Input, Output> {
  protected readonly options: NumberSchemaOptions;
  protected readonly validators: NumberValidators;
  protected readonly mapper: ResultMapper | undefined;

  protected constructor(
    options: NumberSchemaOptions,
    validators: NumberValidators,
    mapper: ResultMapper | undefined
  ) {
    super();
    this.options = options;
    this.validators = validators;
    this.mapper = mapper;
  }

  static ErrorCodes = {
    type: 'NUMBER_TYPE',
    required: 'NUMBER_REQUIRED',
    int: 'NUMBER_INT',
    positive: 'NUMBER_POSITIVE',
    min: 'NUMBER_MIN',
    max: 'NUMBER_MAX',
    greaterThan: 'NUMBER_GREATER_THAN',
    lessThan: 'NUMBER_LESS_THAN',
    custom: 'NUMBER_CUSTOM',
  } as const;

  static create<Params extends NumberParams>(params?: Params): NumberSchema<
    number,
    number,
    Params extends { cast: true } ? true : false> {
    return new NumberSchema({
      ...params,
      isOptional: false,
      isNullable: false,
    }, {}, undefined);
  }

  optional(): NumberSchema<
    Input | undefined,
    Cast extends true ? Output : Output | undefined,
    Cast> {
    return new NumberSchema(
      { ...this.options, isOptional: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullable(): NumberSchema<
    Input | null,
    Cast extends true ? Output : Output | null,
    Cast> {
    return new NumberSchema(
      { ...this.options, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullish(): NumberSchema<
    Input | null | undefined,
    Cast extends true ? Output : Output | null | undefined,
    Cast> {
    return new NumberSchema(
      { ...this.options, isOptional: true, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  required(): NumberSchema<
    Exclude<Input, null | undefined>,
    Exclude<Output, null | undefined>,
    Cast> {
    return new NumberSchema(
      { ...this.options, isOptional: false, isNullable: false },
      { ...this.validators },
      this.mapper
    );
  }

  map<Mapped>(mapper: (value: number) => Mapped): NumberSchema<
    Input,
    Mapped,
    Cast> {
    return new NumberSchema(
      { ...this.options },
      { ...this.validators },
      mapper
    );
  }

  int(params?: { message?: string }): NumberSchema<
    Input,
    Output,
    Cast> {
    let message: string;
    if (params?.message) {
      message = params.message;
    } else {
      message = 'Must be an integer.';
    }

    const code = NumberSchema.ErrorCodes.int;
    const validator: NumberValidator = (value) => {
      if (!Number.isInteger(value)) {
        throw new ParseError(code, message);
      }
      return value;
    };

    return new NumberSchema(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  positive(params?: { message?: string }): NumberSchema<
    Input,
    Output,
    Cast> {
    let message: string;
    if (params?.message) {
      message = params.message;
    } else {
      message = 'Must be a positive number.';
    }

    const code = NumberSchema.ErrorCodes.positive;
    const validator: NumberValidator = (value) => {
      if (value < 0) {
        throw new ParseError(code, message);
      }
      return value;
    };

    return new NumberSchema(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  min(min: number, params?: {
    message?: string | ((params: { min: number }) => string);
  }): NumberSchema<
    Input,
    Output,
    Cast> {
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

    const code = NumberSchema.ErrorCodes.min;
    const validator: NumberValidator = (value) => {
      if (value < min) {
        throw new ParseError(code, message, {
          params: { min },
        });
      }
      return value;
    };

    return new NumberSchema(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  max(max: number, params?: {
    message?: string | ((params: { max: number }) => string);
  }): NumberSchema<
    Input,
    Output,
    Cast> {
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

    const code = NumberSchema.ErrorCodes.max;
    const validator: NumberValidator = (value) => {
      if (value > max) {
        throw new ParseError(code, message, {
          params: { max },
        });
      }
      return value;
    };

    return new NumberSchema(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  greaterThan(min: number, params?: {
    message?: string | ((params: { min: number }) => string);
  }): NumberSchema<
    Input,
    Output,
    Cast> {
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

    const code = NumberSchema.ErrorCodes.lessThan;
    const validator: NumberValidator = (value) => {
      if (value <= min) {
        throw new ParseError(code, message, {
          params: { min },
        });
      }
      return value;
    };

    return new NumberSchema(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  lessThan(max: number, params?: {
    message?: string | ((params: { max: number }) => string);
  }): NumberSchema<
    Input,
    Output,
    Cast> {
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

    const code = NumberSchema.ErrorCodes.lessThan;
    const validator: NumberValidator = (value) => {
      if (value >= max) {
        throw new ParseError(code, message, {
          params: { max },
        });
      }
      return value;
    };

    return new NumberSchema(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  custom(validator: NumberValidator): NumberSchema<
    Input,
    Output,
    Cast> {
    const code = NumberSchema.ErrorCodes.custom;
    return new NumberSchema(
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  parse(value: unknown): Output;
  parse(value: unknown): unknown {
    const ErrorCodes = NumberSchema.ErrorCodes;
    const options = this.options;
    const validators = this.validators;
    const mapper = this.mapper;
    const typeError = 'The value must be a number.';

    if (options.cast) {
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
      throw new ParseError(
        ErrorCodes.required,
        options.requiredError || typeError
      );
    }

    if (typeof value !== 'number' || !Number.isFinite(value)) {
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
