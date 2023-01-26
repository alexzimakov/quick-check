import { type ResultMapper } from '../types.js';
import { TypeAlias } from './type-alias.js';
import { ParseError } from '../parse-error.js';
import { pluralize } from '../util.js';

type ArrayTypeOptions = {
  isOptional: boolean;
  isNullable: boolean;
  cast?: boolean;
  typeError?: string;
  requiredError?: string;
};
type ArrayValidator<T> = (array: T) => T;
type ArrayValidators<T> = { [name: string]: ArrayValidator<T> };

export type ArrayParams = Pick<ArrayTypeOptions,
  | 'cast'
  | 'typeError'
  | 'requiredError'>

export class ArrayType<
  Items extends unknown[],
  Result,
  Cast extends boolean
> extends TypeAlias<Items, Result> {
  protected readonly itemSchema: TypeAlias<unknown>;
  protected readonly options: ArrayTypeOptions;
  protected readonly validators: ArrayValidators<Items>;
  protected readonly mapper: ResultMapper | undefined;

  protected constructor(
    itemSchema: TypeAlias<unknown>,
    options: ArrayTypeOptions,
    validators: ArrayValidators<Items>,
    mapper: ResultMapper | undefined
  ) {
    super();
    this.itemSchema = itemSchema;
    this.options = options;
    this.validators = validators;
    this.mapper = mapper;
  }

  static ErrorCodes = {
    required: 'ARRAY_REQUIRED',
    type: 'ARRAY_TYPE',
    invalidItems: 'ARRAY_INVALID_ITEMS',
    length: 'ARRAY_LENGTH',
    unique: 'ARRAY_UNIQUE',
    minItems: 'ARRAY_MIN_ITEMS',
    maxItems: 'ARRAY_MAX_ITEMS',
    custom: 'ARRAY_CUSTOM',
  } as const;

  static create<Item, Params extends ArrayParams>(
    itemSchema: TypeAlias<Item>,
    params?: Params
  ): ArrayType<
    Item[],
    Item[],
    Params extends { cast: true } ? true : false> {
    return new ArrayType(
      itemSchema,
      { ...params, isOptional: false, isNullable: false },
      {},
      undefined
    );
  }

  optional(): ArrayType<
    Items,
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
    Items,
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
    Items,
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
    Items,
    Exclude<Result, null | undefined>,
    Cast> {
    return new ArrayType(
      this.itemSchema,
      { ...this.options, isOptional: false, isNullable: false },
      { ...this.validators },
      this.mapper
    );
  }

  map<Mapped>(mapper: (value: Items) => Mapped): ArrayType<
    Items,
    Mapped,
    Cast> {
    return new ArrayType(
      this.itemSchema,
      { ...this.options },
      { ...this.validators },
      mapper
    );
  }

  unique(params?: { message?: string }): ArrayType<Items, Result, Cast> {
    let message: string;
    if (params?.message) {
      message = params.message;
    } else {
      message = 'Must contain unique items.';
    }

    const code = ArrayType.ErrorCodes.unique;
    const validator: ArrayValidator<Items> = (items) => {
      const itemSet = new Set(items);
      if (items.length !== itemSet.size) {
        throw new ParseError(code, message);
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
  }): ArrayType<Items, Result, Cast> {
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
    const validator: ArrayValidator<Items> = (items) => {
      if (items.length !== limit) {
        throw new ParseError(code, message, {
          params: { limit },
        });
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
  }): ArrayType<Items, Result, Cast> {
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
    const validator: ArrayValidator<Items> = (items) => {
      if (items.length < limit) {
        throw new ParseError(code, message, {
          params: { limit },
        });
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
  }): ArrayType<Items, Result, Cast> {
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
    const validator: ArrayValidator<Items> = (items) => {
      if (items.length > limit) {
        throw new ParseError(code, message, {
          params: { limit },
        });
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

  custom(validator: ArrayValidator<Items>): ArrayType<Items, Result, Cast> {
    const code = ArrayType.ErrorCodes.custom;
    return new ArrayType(
      this.itemSchema,
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  parse(value: unknown): Result;
  parse(value: unknown): unknown {
    const ErrorCodes = ArrayType.ErrorCodes;
    const options = this.options;
    const validators = this.validators;
    const mapper = this.mapper;
    const typeError = 'The value must be an array.';

    if (options.cast) {
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
      throw new ParseError(
        ErrorCodes.required,
        options.requiredError || typeError
      );
    }

    if (!Array.isArray(value)) {
      throw new ParseError(
        ErrorCodes.type,
        options.typeError || typeError
      );
    }

    let items: unknown[] = [];
    const itemSchema = this.itemSchema;
    const itemsError = new ParseError(
      ArrayType.ErrorCodes.invalidItems,
      'The array contains one or more invalid items. ' +
      'See details for more info.'
    );
    for (let i = 0; i < value.length; i += 1) {
      const item = value[i];
      try {
        items[i] = itemSchema.parse(item);
      } catch (err) {
        let errors: ParseError[];
        if (err instanceof ParseError && err.details.length > 0) {
          errors = err.details.map(ParseError.of);
        } else {
          errors = [ParseError.of(err)];
        }

        for (const error of errors) {
          error.path.unshift(i);
          itemsError.details.push(error);
        }
      }
    }
    if (itemsError.details.length > 0) {
      throw itemsError;
    }

    for (const validate of Object.values(validators)) {
      items = validate(items as Items);
    }

    if (typeof mapper === 'function') {
      try {
        return mapper(items);
      } catch (err) {
        throw ParseError.of(err);
      }
    }

    return items;
  }
}
