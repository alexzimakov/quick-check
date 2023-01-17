import { REQUIRED_ERROR, TypeAlias } from './type-alias.js';
import { Mapper } from './types.js';
import { RapidCheckError } from './error.js';
import { pluralize } from './util.js';

type ArrayTypeOptions = {
  isOptional: boolean;
  isNullable: boolean;
  shouldCastValue: boolean;
  typeError?: string;
  requiredError?: string;
};
type ArrayValidator<T> = (array: T[]) => T[];
type ArrayValidators<T> = { [name: string]: ArrayValidator<T> };

export type ArrayParams = {
  cast?: boolean;
  typeError?: string;
  requiredError?: string;
};

export class ArrayType<
  Item,
  Result,
  Cast extends boolean
> extends TypeAlias<Result> {
  protected readonly itemSchema: TypeAlias<unknown>;
  protected readonly options: ArrayTypeOptions;
  protected readonly validators: ArrayValidators<Item>;
  protected readonly mapper: Mapper | undefined;

  protected constructor(
    itemSchema: TypeAlias<unknown>,
    options: ArrayTypeOptions,
    validators: ArrayValidators<Item>,
    mapper: Mapper | undefined
  ) {
    super();
    this.itemSchema = itemSchema;
    this.options = options;
    this.validators = validators;
    this.mapper = mapper;
  }

  static ErrorCodes = {
    required: 'array.required',
    type: 'array.type',
    itemsInvalid: 'array.itemsInvalid',
    length: 'array.length',
    unique: 'array.unique',
    minItems: 'array.minItems',
    maxItems: 'array.maxItems',
    custom: 'array.custom',
  } as const;

  static create<
    Item,
    Params extends ArrayParams
  >(itemSchema: TypeAlias<Item>, params?: Params): ArrayType<
    Item,
    Item[],
    Params extends { cast: true } ? true : false> {
    return new ArrayType(
      itemSchema,
      {
        isOptional: false,
        isNullable: false,
        shouldCastValue: params?.cast ?? false,
        requiredError: params?.requiredError,
        typeError: params?.typeError,
      },
      {},
      undefined
    );
  }

  optional(): ArrayType<
    Item,
    Cast extends true ? Result : Result | undefined,
    Cast> {
    return new ArrayType(
      this.itemSchema,
      { ...this.options, isOptional: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullable(): ArrayType<
    Item,
    Cast extends true ? Result : Result | null,
    Cast> {
    return new ArrayType(
      this.itemSchema,
      { ...this.options, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullish(): ArrayType<
    Item,
    Cast extends true ? Result : Result | null | undefined,
    Cast> {
    return new ArrayType(
      this.itemSchema,
      { ...this.options, isOptional: true, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  required(): ArrayType<
    Item,
    Exclude<Result, null | undefined>,
    Cast> {
    return new ArrayType(
      this.itemSchema,
      { ...this.options, isOptional: false, isNullable: false },
      { ...this.validators },
      this.mapper
    );
  }

  map<U>(mapper: (value: Item[]) => U): ArrayType<Item, U, Cast> {
    return new ArrayType(
      this.itemSchema,
      { ...this.options },
      { ...this.validators },
      mapper
    );
  }

  parse(value: unknown): Result;
  parse(value: unknown): unknown {
    const { ErrorCodes } = ArrayType;
    const { options, validators, mapper } = this;

    if (options.shouldCastValue) {
      if (value == null) {
        value = [];
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
        options.requiredError || REQUIRED_ERROR
      );
    }

    if (!Array.isArray(value)) {
      throw new RapidCheckError(
        ErrorCodes.type,
        options.typeError || 'Must be an array.'
      );
    }

    let items: Item[] = [];
    const itemSchema = this.itemSchema;
    const itemsError = new RapidCheckError(
      ArrayType.ErrorCodes.itemsInvalid,
      'The array contains one or more invalid items. ' +
      'See details for more info.'
    );
    for (let i = 0; i < value.length; i += 1) {
      const item = value[i];
      try {
        items[i] = itemSchema.parse(item) as Item;
      } catch (err) {
        let errors: RapidCheckError[];
        if (err instanceof RapidCheckError && err.hasErrors()) {
          errors = err.getErrors().map(RapidCheckError.of);
        } else {
          errors = [RapidCheckError.of(err)];
        }

        for (const error of errors) {
          error.path.unshift(i);
          itemsError.addError(error);
        }
      }
    }
    if (itemsError.hasErrors()) {
      throw itemsError;
    }

    for (const validate of Object.values(validators)) {
      items = validate(items);
    }

    if (typeof mapper === 'function') {
      try {
        return mapper(items);
      } catch (err) {
        throw RapidCheckError.of(err);
      }
    }

    return items;
  }

  unique(params?: { message?: string }): ArrayType<Item, Result, Cast> {
    let message: string;
    if (params?.message) {
      message = params.message;
    } else {
      message = 'Must contain unique items.';
    }

    const code = ArrayType.ErrorCodes.unique;
    const validator: ArrayValidator<Item> = (items) => {
      const itemSet = new Set(items);
      if (items.length !== itemSet.size) {
        throw new RapidCheckError(code, message);
      }
      return items;
    };

    return new ArrayType(
      this.itemSchema,
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  length(limit: number, params?: {
    message?: string | ((params: { limit: number }) => string),
  }): ArrayType<Item, Result, Cast> {
    let message: string;
    if (params?.message) {
      if (typeof params.message === 'function') {
        message = params.message({ limit });
      } else {
        message = params.message;
      }
    } else {
      message = `The array must contain ${pluralize(limit, 'item', 'items')}.`;
    }

    const code = ArrayType.ErrorCodes.length;
    const validator: ArrayValidator<Item> = (items) => {
      if (items.length !== limit) {
        throw new RapidCheckError(code, message);
      }
      return items;
    };

    return new ArrayType(
      this.itemSchema,
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  minItems(limit: number, params?: {
    message?: string | ((params: { limit: number }) => string),
  }): ArrayType<Item, Result, Cast> {
    let message: string;
    if (params?.message) {
      if (typeof params.message === 'function') {
        message = params.message({ limit });
      } else {
        message = params.message;
      }
    } else {
      message = `The array must contain at least ${
        pluralize(limit, 'item', 'items')
      }.`;
    }

    const code = ArrayType.ErrorCodes.minItems;
    const validator: ArrayValidator<Item> = (items) => {
      if (items.length < limit) {
        throw new RapidCheckError(code, message);
      }
      return items;
    };

    return new ArrayType(
      this.itemSchema,
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  maxItems(limit: number, params?: {
    message?: string | ((params: { limit: number }) => string),
  }): ArrayType<Item, Result, Cast> {
    let message: string;
    if (params?.message) {
      if (typeof params.message === 'function') {
        message = params.message({ limit });
      } else {
        message = params.message;
      }
    } else {
      message = `The array must contain at most ${
        pluralize(limit, 'item', 'items')
      }.`;
    }

    const code = ArrayType.ErrorCodes.maxItems;
    const validator: ArrayValidator<Item> = (items) => {
      if (items.length > limit) {
        throw new RapidCheckError(code, message);
      }
      return items;
    };

    return new ArrayType(
      this.itemSchema,
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  custom(validator: ArrayValidator<Item>): ArrayType<Item, Result, Cast> {
    const code = ArrayType.ErrorCodes.custom;
    return new ArrayType(
      this.itemSchema,
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }
}
