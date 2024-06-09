import { BaseValidator, CustomValidator } from './base-validator.js';
import { Result, invalid, valid } from './result.js';
import { ValidationError } from './errors.js';
import { freezeMap } from './utils.js';

export type NumberRule =
  | { type: 'int' }
  | { type: 'positive' }
  | { type: 'negative' }
  | { type: 'lessThan'; max: number }
  | { type: 'lessThanOrEqualTo'; max: number }
  | { type: 'greaterThan'; min: number }
  | { type: 'greaterThanOrEqualTo'; min: number }
  | { type: 'range'; min: number; max: number }
  | { type: 'divisibleBy'; step: number };

export type NumberRuleType = NumberRule['type'];

export class NumberValidator extends BaseValidator<number> {
  protected readonly _rules: Map<NumberRuleType, NumberRule>;
  constructor(rules?: Map<NumberRuleType, NumberRule>) {
    super();
    this._rules = freezeMap(rules || new Map());
  }

  int(): NumberValidator {
    return this._addRule({ type: 'int' });
  }

  positive(): NumberValidator {
    return this._addRule({ type: 'positive' });
  }

  negative(): NumberValidator {
    return this._addRule({ type: 'negative' });
  }

  lessThan(max: number): NumberValidator {
    return this._addRule({ type: 'lessThan', max });
  }

  lessThanOrEqualTo(max: number): NumberValidator {
    return this._addRule({ type: 'lessThanOrEqualTo', max });
  }

  greaterThan(min: number): NumberValidator {
    return this._addRule({ type: 'greaterThan', min });
  }

  greaterThanOrEqualTo(min: number): NumberValidator {
    return this._addRule({ type: 'greaterThanOrEqualTo', min });
  }

  range(params: { min: number; max: number }): NumberValidator {
    if (params.min >= params.max) {
      throw new RangeError('Parameter `min` must be < `max`.');
    }
    return this._addRule({ type: 'range', min: params.min, max: params.max });
  }

  divisibleBy(step: number): NumberValidator {
    return this._addRule({ type: 'divisibleBy', step });
  }

  custom(validator: CustomValidator<number>): NumberValidator {
    return new NumberValidator(this._rules)._setCustomValidator(validator);
  }

  protected _addRule(rule: NumberRule): NumberValidator {
    return new NumberValidator(new Map(this._rules).set(
      rule.type,
      rule,
    ));
  }

  protected _validate(value: unknown): Result<number> {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return invalid(new ValidationError({
        code: ValidationError.Code.NUMBER_EXPECTED,
        message: 'The value must be a number.',
      }));
    }

    for (const rule of this._rules.values()) {
      const ruleType = rule.type;
      if (ruleType === 'int') {
        if (!Number.isInteger(value)) {
          return invalid(new ValidationError({
            code: ValidationError.Code.INT_EXPECTED,
            message: 'The value must be a whole number.',
          }));
        }
      } else if (ruleType === 'positive') {
        if (value <= 0) {
          return invalid(new ValidationError({
            code: ValidationError.Code.TOO_SMALL,
            message: `The value must be positive number (greater than 0).`,
          }));
        }
      } else if (ruleType === 'negative') {
        if (value >= 0) {
          return invalid(new ValidationError({
            code: ValidationError.Code.TOO_SMALL,
            message: `The value must be negative number (less than 0).`,
          }));
        }
      } else if (ruleType === 'lessThan') {
        const max = rule.max;
        if (value >= max) {
          return invalid(new ValidationError({
            code: ValidationError.Code.TOO_LARGE,
            message: `The value must be less than ${max}.`,
            details: { max },
          }));
        }
      } else if (ruleType === 'lessThanOrEqualTo') {
        const max = rule.max;
        if (value > max) {
          return invalid(new ValidationError({
            code: ValidationError.Code.TOO_LARGE,
            message: `The value must be ${max} or less.`,
            details: { max },
          }));
        }
      } else if (ruleType === 'greaterThan') {
        const min = rule.min;
        if (value <= min) {
          return invalid(new ValidationError({
            code: ValidationError.Code.TOO_SMALL,
            message: `The value must be greater than ${min}.`,
            details: { min },
          }));
        }
      } else if (ruleType === 'greaterThanOrEqualTo') {
        const min = rule.min;
        if (value < min) {
          return invalid(new ValidationError({
            code: ValidationError.Code.TOO_SMALL,
            message: `The value must be ${min} or more.`,
            details: { min },
          }));
        }
      } else if (ruleType === 'range') {
        const min = rule.min;
        const max = rule.max;
        if (value < min || value > max) {
          return invalid(new ValidationError({
            code: ValidationError.Code.OUT_OF_RANGE,
            message: `The value must be between ${min} and ${max}.`,
            details: { min, max },
          }));
        }
      } else if (ruleType === 'divisibleBy') {
        const step = rule.step;
        if (value % step !== 0) {
          return invalid(new ValidationError({
            code: ValidationError.Code.STEP_MISMATCH,
            message: `The value must be divisible by ${step}.`,
            details: { step },
          }));
        }
      } else {
        const type: never = ruleType;
        console.warn(`NumberValidator: unknown rule type '${type}'.`);
      }
    }

    return valid(value);
  }

  static create(): NumberValidator {
    return new NumberValidator();
  }
}
