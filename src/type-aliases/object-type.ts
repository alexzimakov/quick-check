import { type InputType, type OutputType, type ResultMapper } from '../types.js';
import { TypeAlias } from './type-alias.js';
import { ParseError } from '../parse-error.js';
import { requiredError } from './error-messages.js';

type ObjectTypeOptions = {
  isOptional: boolean;
  isNullable: boolean;
  shouldCastValue: boolean;
  shouldOmitUnknownProps: boolean;
  typeError?: string;
  requiredError?: string;
};
type PropsSchema = { [property: string]: TypeAlias<unknown> };
type ObjectValidator<T> = (props: T) => T;
type ObjectValidators<T> = { [validator: string]: ObjectValidator<T> };

export type ObjectParams = {
  cast?: boolean;
  omitUnknownProps?: boolean;
  typeError?: string;
  requiredError?: string;
  unknownPropsError?: string;
};

export class ObjectType<
  Input extends { [key: string]: unknown },
  Props extends { [key: string]: unknown },
  Result,
  Cast extends boolean
> extends TypeAlias<Input, Result> {
  readonly propsSchema: PropsSchema;
  protected readonly options: ObjectTypeOptions;
  protected readonly validators: ObjectValidators<Props>;
  protected readonly mapper: ResultMapper | undefined;

  protected constructor(
    propsSchema: PropsSchema,
    options: ObjectTypeOptions,
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
    required: 'OBJECT_REQUIRED',
    type: 'OBJECT_TYPE',
    invalidProps: 'OBJECT_INVALID_PROPS',
    unknownProps: 'OBJECT_UNKNOWN_PROPS',
    custom: 'ARRAY_CUSTOM',
  } as const;

  static create<
    Schema extends PropsSchema,
    Params extends ObjectParams
  >(propsSchema: Schema, params?: Params): ObjectType<
    { [P in keyof Schema]: InputType<Schema[P]> },
    { [P in keyof Schema]: OutputType<Schema[P]> },
    { [P in keyof Schema]: OutputType<Schema[P]> },
    Params extends { cast: true } ? true : false> {
    return new ObjectType(
      propsSchema,
      {
        isOptional: false,
        isNullable: false,
        shouldCastValue: params?.cast ?? false,
        shouldOmitUnknownProps: params?.omitUnknownProps ?? true,
        requiredError: params?.requiredError,
        typeError: params?.typeError,
      },
      {},
      undefined
    );
  }

  static isObject(value: unknown): value is Record<string, unknown> {
    return value != null && typeof value === 'object' && !Array.isArray(value);
  }

  static formatProps(props: string[]): string {
    if (props.length <= 2) {
      return props.join(' and ');
    }
    return [...props.slice(0, -2), props.slice(-2).join(', and ')].join(', ');
  }

  optional(): ObjectType<
    Input,
    Props,
    Cast extends true ? Result : Result | undefined,
    Cast> {
    return new ObjectType(
      this.propsSchema,
      { ...this.options, isOptional: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullable(): ObjectType<
    Input,
    Props,
    Cast extends true ? Result : Result | null,
    Cast> {
    return new ObjectType(
      this.propsSchema,
      { ...this.options, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullish(): ObjectType<
    Input,
    Props,
    Cast extends true ? Result : Result | null | undefined,
    Cast> {
    return new ObjectType(
      this.propsSchema,
      { ...this.options, isOptional: true, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  required(): ObjectType<
    Input,
    Props,
    Exclude<Result, null | undefined>,
    Cast> {
    return new ObjectType(
      this.propsSchema,
      { ...this.options, isOptional: false, isNullable: false },
      { ...this.validators },
      this.mapper
    );
  }

  map<Mapped>(mapper: (value: Props) => Mapped): ObjectType<
    Input,
    Props,
    Mapped,
    Cast> {
    return new ObjectType(
      this.propsSchema,
      { ...this.options },
      { ...this.validators },
      mapper
    );
  }

  parse(value: unknown): Result;
  parse(value: unknown): unknown {
    const { ErrorCodes } = ObjectType;
    const { options, validators, mapper } = this;

    if (options.shouldCastValue) {
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
        options.requiredError || requiredError
      );
    }

    if (!ObjectType.isObject(value)) {
      throw new ParseError(
        ErrorCodes.type,
        options.typeError || 'Must be an object.'
      );
    }

    const result = options.shouldOmitUnknownProps ? {} : { ...value };
    const propsSchema = this.propsSchema;
    const propsError = new ParseError(
      ObjectType.ErrorCodes.invalidProps,
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

  onlyKnownProps(params?: {
    message?: string | ((params: { unknownProps: string[] }) => string)
  }): ObjectType<Input, Props, Result, Cast> {
    const code = ObjectType.ErrorCodes.unknownProps;
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
            ObjectType.formatProps(unknownProps);
        }
        throw new ParseError(code, message, {
          params: { unknownProps },
        });
      }

      return props;
    };

    return new ObjectType(
      this.propsSchema,
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  custom(validator: ObjectValidator<Props>): ObjectType<
    Input,
    Props,
    Result,
    Cast> {
    const code = ObjectType.ErrorCodes.custom;
    return new ObjectType(
      this.propsSchema,
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }
}
