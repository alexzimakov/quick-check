import { Validator } from './validator.js';
import { BaseValidator, CustomValidator } from './base-validator.js';
import { Result, invalid, valid } from './result.js';
import { ValidationError } from './errors.js';
import { formatList, freezeMap, pluralize } from './utils.js';

type CompareFn<T> = (a: T, b: T) => boolean;

export type ArrayRule<T> =
  | { type: 'unique'; comparator?: CompareFn<T> }
  | { type: 'notEmpty' }
  | { type: 'minLength'; minLength: number }
  | { type: 'maxLength'; maxLength: number }
  | { type: 'length'; min: number; max: number };

export type ArrayRuleType = ArrayRule<unknown>['type'];

export class ArrayValidator<T = unknown> extends BaseValidator<T[]> {
  protected readonly _itemValidator: Validator<T> | null | undefined;
  protected readonly _rules: Map<ArrayRuleType, ArrayRule<T>>;
  constructor(
    itemValidator?: Validator<T> | null,
    rules?: Map<ArrayRuleType, ArrayRule<T>>,
  ) {
    super();
    this._itemValidator = itemValidator;
    this._rules = freezeMap(rules || new Map());
  }

  unique(options: { comparator?: CompareFn<T> } = {}): ArrayValidator<T> {
    return this._addRule({ type: 'unique', comparator: options.comparator });
  }

  notEmpty(): ArrayValidator<T> {
    return this._addRule({ type: 'notEmpty' });
  }

  minLength(minLength: number): ArrayValidator<T> {
    if (minLength < 0) {
      throw new RangeError('Argument `minLength` must be ≥ 0.');
    }
    return this._addRule({ type: 'minLength', minLength });
  }

  maxLength(maxLength: number): ArrayValidator<T> {
    if (maxLength < 0) {
      throw new RangeError('Argument `maxLength` must be ≥ 0.');
    }
    return this._addRule({ type: 'maxLength', maxLength });
  }

  length(params: { min: number; max: number }): ArrayValidator<T> {
    if (params.min < 0) {
      throw new RangeError('Parameter `min` must be ≥ 0.');
    }
    if (params.min >= params.max) {
      throw new RangeError('Parameter `min` must be < `max`.');
    }
    return this._addRule({
      type: 'length',
      min: params.min,
      max: params.max,
    });
  }

  custom(validator: CustomValidator<T[]>): ArrayValidator<T> {
    return new ArrayValidator(
      this._itemValidator,
      this._rules,
    )._setCustomValidator(validator);
  }

  protected _addRule(rule: ArrayRule<T>): ArrayValidator<T> {
    return new ArrayValidator(this._itemValidator, new Map(this._rules).set(
      rule.type,
      rule,
    ));
  }

  protected _validate(array: unknown): Result<T[]> {
    if (!Array.isArray(array)) {
      return invalid(new ValidationError({
        code: ValidationError.Code.ARRAY_EXPECTED,
        message: 'The value must be an array.',
      }));
    }
    const errors: Record<number, ValidationError> = {};
    const itemValidator = this._itemValidator;
    if (itemValidator != null) {
      for (let index = 0; index < array.length; index += 1) {
        const item = array[index];
        const result = itemValidator.validate(item);
        if (!result.ok) {
          errors[index] = result.error;
        }
      }
    }

    const indexesWithError = Object.keys(errors);
    if (indexesWithError.length > 0) {
      const formattedIndexes = formatList(indexesWithError, {
        type: 'conjunction',
      });
      return invalid(new ValidationError({
        code: ValidationError.Code.INVALID_ARRAY_ITEMS,
        message: indexesWithError.length === 1
          ? `The value at index ${formattedIndexes} is invalid.`
          : `The values at indexes ${formattedIndexes} are invalid.`,
        details: errors,
      }));
    }

    for (const rule of this._rules.values()) {
      const ruleType = rule.type;
      if (ruleType === 'unique') {
        const comparator: CompareFn<T> = typeof rule.comparator === 'function'
          ? rule.comparator
          : defaultComparator;
        for (let i = 0; i < array.length; i += 1) {
          const a = array[i];
          for (let j = i + 1; j < array.length; j += 1) {
            const b = array[j];
            if (comparator(a, b)) {
              return invalid(new ValidationError({
                code: ValidationError.Code.ARRAY_UNIQUE,
                message: 'The array must not have duplicates.',
                details: {
                  duplicate: a,
                  duplicateIndexes: [i, j],
                },
              }));
            }
          }
        }
      } else if (ruleType === 'notEmpty') {
        if (array.length === 0) {
          return invalid(new ValidationError({
            code: ValidationError.Code.VALUE_EMPTY,
            message: 'The value must be a non-empty array.',
          }));
        }
      } else if (ruleType === 'minLength') {
        const minLength = rule.minLength;
        const actualLength = array.length;
        if (actualLength < minLength) {
          const minItems = pluralize(minLength, {
            singular: 'item',
            plural: 'items',
          });
          return invalid(new ValidationError({
            code: ValidationError.Code.TOO_SHORT,
            message: `The array must contain at least ${minItems}.`,
            details: { actualLength, minLength },
          }));
        }
      } else if (ruleType === 'maxLength') {
        const maxLength = rule.maxLength;
        const actualLength = array.length;
        if (actualLength > maxLength) {
          const maxItems = pluralize(maxLength, {
            singular: 'item',
            plural: 'items',
          });
          return invalid(new ValidationError({
            code: ValidationError.Code.TOO_LONG,
            message: `The array must contain at most ${maxItems}.`,
            details: { actualLength, maxLength },
          }));
        }
      } else if (ruleType === 'length') {
        const minLength = rule.min;
        const maxLength = rule.max;
        const actualLength = array.length;
        if (actualLength < minLength || actualLength > maxLength) {
          return invalid(new ValidationError({
            code: ValidationError.Code.OUT_OF_RANGE,
            message: `The array must contain between ${minLength} and ${maxLength} items.`,
            details: { actualLength, minLength, maxLength },
          }));
        }
      } else {
        const type: never = ruleType;
        console.warn(`ArrayValidator: unknown rule type '${type}'.`);
      }
    }

    return valid(array as T[]);
  }

  static create<T = unknown>(
    itemValidator?: Validator<T> | null,
  ): ArrayValidator<T> {
    return new ArrayValidator(itemValidator);
  }
}

function defaultComparator(a: unknown, b: unknown): boolean {
  return Object.is(a, b);
}
