import { type InputType, type OutputType, type ResultMapper } from '../types.js';
import { AbstractSchema } from '../abstract-schema.js';
import { ParseError } from '../parse-error.js';
import { pluralize } from '../util.js';

type ArraySchemaOptions = {
  isOptional: boolean;
  isNullable: boolean;
  cast?: boolean;
  typeError?: string;
  requiredError?: string;
};
type ArrayValidator<T> = (array: T) => T;
type ArrayValidators<T> = { [name: string]: ArrayValidator<T> };

export type ArrayParams = Pick<ArraySchemaOptions,
  | 'cast'
  | 'typeError'
  | 'requiredError'>

export class ArraySchema<
  Items extends unknown[],
  Input,
  Output,
  Cast extends boolean
> extends AbstractSchema<Input, Output> {
  protected readonly itemSchema: AbstractSchema<unknown>;
  protected readonly options: ArraySchemaOptions;
  protected readonly validators: ArrayValidators<Items>;
  protected readonly mapper: ResultMapper | undefined;

  protected constructor(
    itemSchema: AbstractSchema<unknown>,
    options: ArraySchemaOptions,
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

  static create<
    Item extends AbstractSchema<unknown>,
    Params extends ArrayParams
  >(
    itemSchema: Item,
    params?: Params
  ): ArraySchema<
    InputType<Item>[],
    InputType<Item>[],
    OutputType<Item>[],
    Params extends { cast: true } ? true : false> {
    return new ArraySchema(
      itemSchema,
      { ...params, isOptional: false, isNullable: false },
      {},
      undefined
    );
  }

  optional(): ArraySchema<
    Items,
    Input | undefined,
    Cast extends true ? Output : Output | undefined,
    Cast> {
    return new ArraySchema(
      this.itemSchema,
      { ...this.options, isOptional: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullable(): ArraySchema<
    Items,
    Input | null,
    Cast extends true ? Output : Output | null,
    Cast> {
    return new ArraySchema(
      this.itemSchema,
      { ...this.options, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  nullish(): ArraySchema<
    Items,
    Input | null | undefined,
    Cast extends true ? Output : Output | null | undefined,
    Cast> {
    return new ArraySchema(
      this.itemSchema,
      { ...this.options, isOptional: true, isNullable: true },
      { ...this.validators },
      this.mapper
    );
  }

  required(): ArraySchema<
    Items,
    Exclude<Input, null | undefined>,
    Exclude<Output, null | undefined>,
    Cast> {
    return new ArraySchema(
      this.itemSchema,
      { ...this.options, isOptional: false, isNullable: false },
      { ...this.validators },
      this.mapper
    );
  }

  map<Mapped>(mapper: (value: Items) => Mapped): ArraySchema<
    Items,
    Input,
    Mapped,
    Cast> {
    return new ArraySchema(
      this.itemSchema,
      { ...this.options },
      { ...this.validators },
      mapper
    );
  }

  unique(params?: { message?: string }): ArraySchema<
    Items,
    Input,
    Output,
    Cast> {
    let message: string;
    if (params?.message) {
      message = params.message;
    } else {
      message = 'Must contain unique items.';
    }

    const code = ArraySchema.ErrorCodes.unique;
    const validator: ArrayValidator<Items> = (items) => {
      const itemSet = new Set(items);
      if (items.length !== itemSet.size) {
        throw new ParseError(code, message);
      }
      return items;
    };

    return new ArraySchema(
      this.itemSchema,
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  length(limit: number, params?: {
    message?: string | ((params: { limit: number }) => string),
  }): ArraySchema<Items, Input, Output, Cast> {
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

    const code = ArraySchema.ErrorCodes.length;
    const validator: ArrayValidator<Items> = (items) => {
      if (items.length !== limit) {
        throw new ParseError(code, message, {
          params: { limit },
        });
      }
      return items;
    };

    return new ArraySchema(
      this.itemSchema,
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  minItems(limit: number, params?: {
    message?: string | ((params: { limit: number }) => string),
  }): ArraySchema<Items, Input, Output, Cast> {
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

    const code = ArraySchema.ErrorCodes.minItems;
    const validator: ArrayValidator<Items> = (items) => {
      if (items.length < limit) {
        throw new ParseError(code, message, {
          params: { limit },
        });
      }
      return items;
    };

    return new ArraySchema(
      this.itemSchema,
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  maxItems(limit: number, params?: {
    message?: string | ((params: { limit: number }) => string),
  }): ArraySchema<Items, Input, Output, Cast> {
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

    const code = ArraySchema.ErrorCodes.maxItems;
    const validator: ArrayValidator<Items> = (items) => {
      if (items.length > limit) {
        throw new ParseError(code, message, {
          params: { limit },
        });
      }
      return items;
    };

    return new ArraySchema(
      this.itemSchema,
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  custom(validator: ArrayValidator<Items>): ArraySchema<
    Items,
    Input,
    Output,
    Cast> {
    const code = ArraySchema.ErrorCodes.custom;
    return new ArraySchema(
      this.itemSchema,
      { ...this.options },
      { ...this.validators, [code]: validator },
      this.mapper
    );
  }

  parse(value: unknown): Output;
  parse(value: unknown): unknown {
    const ErrorCodes = ArraySchema.ErrorCodes;
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
      ArraySchema.ErrorCodes.invalidItems,
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
