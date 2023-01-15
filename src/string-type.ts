import { TypeAlias } from './type-alias.js';
import { RapidCheckError } from './errors.js';
import { Mapper } from './types.js';

type StringTypeOptions = {
  isOptional: boolean;
  isNullable: boolean;
  shouldTrimValue: boolean;
  shouldCastValue: boolean;
  requiredError?: string;
  invalidTypeError?: string;
};
type StringValidator = (value: string) => string;
type StringValidatorMap = Map<string, StringValidator>;

export type StringTypeCreateParams = {
  cast?: boolean;
  trim?: boolean;
  requiredError?: string;
  invalidTypeError?: string;
};

export class StringType<
  Result,
  Cast extends boolean
> extends TypeAlias<Result> {
  protected readonly options: StringTypeOptions;
  protected readonly validatorMap: StringValidatorMap;
  protected readonly mapper?: Mapper;

  protected constructor(
    options: StringTypeOptions,
    validatorMap: StringValidatorMap,
    mapper?: Mapper
  ) {
    super();
    this.options = options;
    this.validatorMap = validatorMap;
    this.mapper = mapper;
  }

  static errorCodes = {
    ...TypeAlias.errorCodes,
    invalidType: 'string_invalid_type',
  } as const;

  static errorMessages = {
    ...TypeAlias.errorMessages,
    invalidType: 'Must be a string.',
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
      invalidTypeError: params?.invalidTypeError,
    }, new Map());
  }

  optional(): StringType<
    Cast extends true ? Result : Result | undefined,
    Cast> {
    return new StringType({
      ...this.options,
      isOptional: true,
    }, new Map(this.validatorMap), this.mapper);
  }

  nullable(): StringType<
    Cast extends true ? Result : Result | null,
    Cast> {
    return new StringType({
      ...this.options,
      isNullable: true,
    }, new Map(this.validatorMap), this.mapper);
  }

  nullish(): StringType<
    Cast extends true ? Result : Result | null | undefined,
    Cast> {
    return new StringType({
      ...this.options,
      isOptional: true,
      isNullable: true,
    }, new Map(this.validatorMap), this.mapper);
  }

  required(): StringType<
    NonNullable<Result>,
    Cast> {
    return new StringType({
      ...this.options,
      isOptional: false,
      isNullable: false,
    }, new Map(this.validatorMap), this.mapper);
  }

  map<U>(mapper: (value: Result) => U): StringType<U, Cast> {
    return new StringType(
      { ...this.options },
      new Map(this.validatorMap),
      mapper
    );
  }

  parse(value: unknown): Result;
  parse(value: unknown): unknown {
    const { errorCodes, errorMessages } = StringType;
    const { options, validatorMap, mapper } = this;

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
        errorCodes.required,
        options.requiredError || errorMessages.required
      );
    }

    if (typeof value !== 'string') {
      throw new RapidCheckError(
        errorCodes.invalidType,
        options.invalidTypeError || errorMessages.invalidType
      );
    }

    let res = value;
    if (options.shouldTrimValue) {
      res = value.trim();
    }
    for (const validate of validatorMap.values()) {
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
}
