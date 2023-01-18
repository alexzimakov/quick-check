import { type MapTypeFn } from '../types.js';
import { TypeAlias } from './type-alias.js';
import { RapidCheckError } from '../error.js';
import { requiredError } from './error-messages.js';

type ObjectTypeOptions = {
  isOptional: boolean;
  isNullable: boolean;
  shouldCastValue: boolean;
  shouldOmitUnknownProps: boolean;
  typeError?: string;
  requiredError?: string;
};
type PropsSchema = { [prop: string]: TypeAlias<unknown> };
type ObjectValidator<T> = (props: T) => T;
type ObjectValidators<T> = { [name: string]: ObjectValidator<T> };

export type ObjectParams = {
  cast?: boolean;
  omitUnknownProps?: boolean;
  typeError?: string;
  requiredError?: string;
  unknownPropsError?: string;
};

export class ObjectType<
  Result,
  Props extends object,
  Cast extends boolean
> extends TypeAlias<Result> {
  protected readonly propsSchema: PropsSchema;
  protected readonly options: ObjectTypeOptions;
  protected readonly validators: ObjectValidators<Props>;
  protected readonly mapper: MapTypeFn | undefined;

  protected constructor(
    itemSchema: PropsSchema,
    options: ObjectTypeOptions,
    validators: ObjectValidators<Props>,
    mapper: MapTypeFn | undefined
  ) {
    super();
    this.propsSchema = itemSchema;
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
    { [Prop in keyof Schema]: ReturnType<Schema[Prop]['parse']> },
    { [Prop in keyof Schema]: ReturnType<Schema[Prop]['parse']> },
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
    Cast extends true ? Result : Result | undefined,
    Props,
    Cast> {
    return new ObjectType(
      this.propsSchema,
      { ...this.options, isOptional: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullable(): ObjectType<
    Cast extends true ? Result : Result | null,
    Props,
    Cast> {
    return new ObjectType(
      this.propsSchema,
      { ...this.options, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullish(): ObjectType<
    Cast extends true ? Result : Result | null | undefined,
    Props,
    Cast> {
    return new ObjectType(
      this.propsSchema,
      { ...this.options, isOptional: true, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  required(): ObjectType<
    Exclude<Result, null | undefined>,
    Props,
    Cast> {
    return new ObjectType(
      this.propsSchema,
      { ...this.options, isOptional: false, isNullable: false },
      { ...this.validators },
      this.mapper
    );
  }

  map<U>(mapper: (value: Props) => U): ObjectType<U, Props, Cast> {
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
      throw new RapidCheckError(
        ErrorCodes.required,
        options.requiredError || requiredError
      );
    }

    if (!ObjectType.isObject(value)) {
      throw new RapidCheckError(
        ErrorCodes.type,
        options.typeError || 'Must be an object.'
      );
    }

    const result = options.shouldOmitUnknownProps ? {} : { ...value };
    const propsSchema = this.propsSchema;
    const propsError = new RapidCheckError(
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
        let errors: RapidCheckError[];
        if (err instanceof RapidCheckError && err.hasErrors()) {
          errors = err.getErrors().map(RapidCheckError.of);
        } else {
          errors = [RapidCheckError.of(err)];
        }

        for (const error of errors) {
          error.path.unshift(key);
          propsError.addError(error);
        }
      }
    }
    if (propsError.hasErrors()) {
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
        throw RapidCheckError.of(err);
      }
    }

    return props;
  }

  onlyKnownProps(params?: {
    message?: string | ((params: { unknownProps: string[] }) => string)
  }): ObjectType<Result, Props, Cast> {
    const code = ObjectType.ErrorCodes.unknownProps;
    const validator: ObjectValidator<Props> = (props) => {
      const allowedKeys: Record<string, true> = {};
      for (const key of Object.keys(this.propsSchema)) {
        allowedKeys[key] = true;
      }

      const unknownProps: string[] = [];
      for (const key of Object.keys(props)) {
        if (!allowedKeys[key]) {
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
        throw new RapidCheckError(code, message, {
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

  custom(validator: ObjectValidator<Props>): ObjectType<Result, Props, Cast> {
    const code = ObjectType.ErrorCodes.custom;
    return new ObjectType(
      this.propsSchema,
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }
}
