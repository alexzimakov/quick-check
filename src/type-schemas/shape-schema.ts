import { type InputType, type OutputType, type ResultMapper } from '../types.js';
import { AbstractSchema } from '../abstract-schema.js';
import { ParseError } from '../parse-error.js';
import { isObject } from '../guards.js';
import { formatList } from '../util.js';

type ShapeSchemaOptions = {
  isOptional: boolean;
  isNullable: boolean;
  cast?: boolean;
  omitUnknownProps?: boolean;
  typeError?: string;
  requiredError?: string;
};
type PropsSchema = { [property: string]: AbstractSchema<unknown> };
type ObjectValidator<T> = (props: T) => T;
type ObjectValidators<T> = { [validator: string]: ObjectValidator<T> };

export type ShapeParams = Pick<ShapeSchemaOptions,
  | 'cast'
  | 'omitUnknownProps'
  | 'typeError'
  | 'requiredError'>;

export class ShapeSchema<
  Input extends { [key: string]: unknown },
  Props extends { [key: string]: unknown },
  Result,
  Cast extends boolean
> extends AbstractSchema<Input, Result> {
  readonly propsSchema: PropsSchema;
  protected readonly options: ShapeSchemaOptions;
  protected readonly validators: ObjectValidators<Props>;
  protected readonly mapper: ResultMapper | undefined;

  protected constructor(
    propsSchema: PropsSchema,
    options: ShapeSchemaOptions,
    validators: ObjectValidators<Props>,
    mapper: ResultMapper | undefined
  ) {
    super();
    this.propsSchema = propsSchema;
    this.options = options;
    this.validators = validators;
    this.mapper = mapper;
  }

  static ErrorCodes = {
    required: 'SHAPE_REQUIRED',
    type: 'SHAPE_TYPE',
    invalidProps: 'SHAPE_INVALID_PROPS',
    unknownProps: 'SHAPE_UNKNOWN_PROPS',
    custom: 'SHAPE_CUSTOM',
  } as const;

  static create<
    Schema extends PropsSchema,
    Params extends ShapeParams
  >(propsSchema: Schema, params?: Params): ShapeSchema<
    { [P in keyof Schema]: InputType<Schema[P]> },
    { [P in keyof Schema]: OutputType<Schema[P]> },
    { [P in keyof Schema]: OutputType<Schema[P]> },
    Params extends { cast: true } ? true : false> {
    return new ShapeSchema(
      propsSchema,
      {
        ...params,
        isOptional: false,
        isNullable: false,
        omitUnknownProps: params?.omitUnknownProps ?? true,
      },
      {},
      undefined
    );
  }

  optional(): ShapeSchema<
    Input,
    Props,
    Cast extends true ? Result : Result | undefined,
    Cast> {
    return new ShapeSchema(
      this.propsSchema,
      { ...this.options, isOptional: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullable(): ShapeSchema<
    Input,
    Props,
    Cast extends true ? Result : Result | null,
    Cast> {
    return new ShapeSchema(
      this.propsSchema,
      { ...this.options, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullish(): ShapeSchema<
    Input,
    Props,
    Cast extends true ? Result : Result | null | undefined,
    Cast> {
    return new ShapeSchema(
      this.propsSchema,
      { ...this.options, isOptional: true, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  required(): ShapeSchema<
    Input,
    Props,
    Exclude<Result, null | undefined>,
    Cast> {
    return new ShapeSchema(
      this.propsSchema,
      { ...this.options, isOptional: false, isNullable: false },
      { ...this.validators },
      this.mapper
    );
  }

  map<Mapped>(mapper: (value: Props) => Mapped): ShapeSchema<
    Input,
    Props,
    Mapped,
    Cast> {
    return new ShapeSchema(
      this.propsSchema,
      { ...this.options },
      { ...this.validators },
      mapper
    );
  }

  onlyKnownProps(params?: {
    message?: string | ((params: { unknownProps: string[] }) => string)
  }): ShapeSchema<Input, Props, Result, Cast> {
    const code = ShapeSchema.ErrorCodes.unknownProps;
    const validator: ObjectValidator<Props> = (props) => {
      const allowedProps: Record<string, true> = {};
      for (const key of Object.keys(this.propsSchema)) {
        allowedProps[key] = true;
      }

      const unknownProps: string[] = [];
      for (const key of Object.keys(props)) {
        if (!allowedProps[key]) {
          unknownProps.push(key);
        }
      }

      if (unknownProps.length > 0) {
        let message: string;
        if (params?.message) {
          if (typeof params.message === 'function') {
            message = params.message({ unknownProps });
          } else {
            message = params.message;
          }
        } else {
          message = 'The object must have only known properties. ' +
            'Unknown properties: ' +
            formatList(unknownProps, { type: 'and' });
        }
        throw new ParseError(code, message, {
          params: { unknownProps },
        });
      }

      return props;
    };

    return new ShapeSchema(
      this.propsSchema,
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  custom(validator: ObjectValidator<Props>): ShapeSchema<
    Input,
    Props,
    Result,
    Cast> {
    const code = ShapeSchema.ErrorCodes.custom;
    return new ShapeSchema(
      this.propsSchema,
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  parse(value: unknown): Result;
  parse(value: unknown): unknown {
    const ErrorCodes = ShapeSchema.ErrorCodes;
    const options = this.options;
    const validators = this.validators;
    const mapper = this.mapper;
    const typeError = 'The value must be an object.';

    if (options.cast) {
      if (value == null) {
        value = {};
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

    if (!isObject(value) || Array.isArray(value)) {
      throw new ParseError(
        ErrorCodes.type,
        options.typeError || typeError
      );
    }

    const result = options.omitUnknownProps ? {} : { ...value };
    const propsSchema = this.propsSchema;
    const propsError = new ParseError(
      ShapeSchema.ErrorCodes.invalidProps,
      'The object has one or more invalid properties. ' +
      'See details for more info.'
    );
    for (const key of Object.keys(propsSchema)) {
      const schema = propsSchema[key];
      const property = value[key];
      try {
        result[key] = schema.parse(property);
      } catch (err) {
        let errors: ParseError[];
        if (err instanceof ParseError && err.details.length > 0) {
          errors = err.details.map(ParseError.of);
        } else {
          errors = [ParseError.of(err)];
        }

        for (const error of errors) {
          error.path.unshift(key);
          propsError.details.push(error);
        }
      }
    }
    if (propsError.details.length > 0) {
      throw propsError;
    }

    let props = result as Props;
    for (const validate of Object.values(validators)) {
      props = validate(props);
    }

    if (typeof mapper === 'function') {
      try {
        return mapper(props);
      } catch (err) {
        throw ParseError.of(err);
      }
    }

    return props;
  }
}
