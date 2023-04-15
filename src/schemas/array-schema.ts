import { AnySchema, InferOutput } from '../types.js';
import { RequiredErrorMessage, Rule, Schema, TypeErrorMessage } from './schema.js';
import { ValidationError } from '../validation-error.js';
import { errorCodes } from '../error-codes.js';

type Item = AnySchema | undefined;
type ArrayOf<T extends Item> = T extends AnySchema
  ? InferOutput<T>[]
  : unknown[];
type ArrayRule<T extends unknown[]> = Rule<T>;
type ArrayRules<T extends Item> = ArrayRule<ArrayOf<T>>[];

export class ArraySchema<T extends Item> extends Schema<ArrayOf<T>> {
  protected readonly _item: Item;

  constructor(
    item?: T,
    rules?: ArrayRules<T>,
    typeError?: TypeErrorMessage,
    requiredError?: RequiredErrorMessage,
  ) {
    super(rules, typeError, requiredError);
    this._item = item;
  }

  protected _validate(value: unknown): ArrayOf<T> {
    if (!Array.isArray(value)) {
      this._throwTypeError(value, 'array');
    }

    const items: unknown[] = [];
    const errors: ValidationError[] = [];
    const itemSchema = this._item;
    for (let index = 0; index < value.length; index += 1) {
      const item = value[index];
      if (itemSchema) {
        try {
          items[index] = itemSchema.validate(item);
        } catch (e) {
          const error = ValidationError.from(e);
          error.path.unshift(index);
          errors.push(error);
        }
      } else {
        items[index] = item;
      }
    }

    if (errors.length > 0) {
      const message = errors.length > 1
        ? 'The array contains invalid items.'
        : `The array contains an invalid item at index ${errors[0].path}.`;
      throw new ValidationError(message, {
        code: errorCodes.invalidArrayItems,
        subErrors: errors,
      });
    }

    return items as ArrayOf<T>;
  }
}

export type ArraySchemaOptions<T extends Item> = {
  item?: T;
  rules?: ArrayRules<T>;
  typeError?: TypeErrorMessage;
  requiredError?: RequiredErrorMessage;
};

export function createArraySchema<T extends Item = undefined>(
  options?: ArraySchemaOptions<T>,
) {
  return new ArraySchema<T>(
    options?.item,
    options?.rules,
    options?.typeError,
    options?.requiredError,
  );
}
