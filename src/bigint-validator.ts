import { BaseValidator, CustomValidator } from './base-validator.js';
import { Result, invalid, valid } from './result.js';
import { ValidationError } from './errors.js';
import { freezeMap } from './utils.js';

export type BigintRule =
  | { type: 'positive' }
  | { type: 'negative' }
  | { type: 'lessThan'; max: bigint }
  | { type: 'lessThanOrEqualTo'; max: bigint }
  | { type: 'greaterThan'; min: bigint }
  | { type: 'greaterThanOrEqualTo'; min: bigint }
  | { type: 'range'; min: bigint; max: bigint };

export type BigintRuleType = BigintRule['type'];

export class BigintValidator extends BaseValidator<bigint> {
  protected readonly _rules: Map<BigintRuleType, BigintRule>;
  constructor(rules?: Map<BigintRuleType, BigintRule>) {
    super();
    this._rules = freezeMap(rules || new Map());
  }

  positive(): BigintValidator {
    return this._addRule({ type: 'positive' });
  }

  negative(): BigintValidator {
    return this._addRule({ type: 'negative' });
  }

  lessThan(max: bigint): BigintValidator {
    return this._addRule({ type: 'lessThan', max });
  }

  lessThanOrEqualTo(max: bigint): BigintValidator {
    return this._addRule({ type: 'lessThanOrEqualTo', max });
  }

  greaterThan(min: bigint): BigintValidator {
    return this._addRule({ type: 'greaterThan', min });
  }

  greaterThanOrEqualTo(min: bigint): BigintValidator {
    return this._addRule({ type: 'greaterThanOrEqualTo', min });
  }

  range(params: { min: bigint; max: bigint }): BigintValidator {
    if (params.min >= params.max) {
      throw new RangeError('Parameter `min` must be < `max`.');
    }
    return this._addRule({ type: 'range', min: params.min, max: params.max });
  }

  custom(validator: CustomValidator<bigint>): BigintValidator {
    return new BigintValidator(this._rules)._setCustomValidator(validator);
  }

  protected _addRule(rule: BigintRule): BigintValidator {
    return new BigintValidator(new Map(this._rules).set(
      rule.type,
      rule,
    ));
  }

  protected _validate(value: unknown): Result<bigint> {
    if (typeof value !== 'bigint') {
      return invalid(new ValidationError({
        code: ValidationError.Code.NUMBER_EXPECTED,
        message: 'The value must be a bigint.',
      }));
    }

    for (const rule of this._rules.values()) {
      const ruleType = rule.type;
      if (ruleType === 'positive') {
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
            code: ValidationError.Code.TOO_SMALL,
            message: `The value must be less than ${max}.`,
            details: { max: String(max) },
          }));
        }
      } else if (ruleType === 'lessThanOrEqualTo') {
        const max = rule.max;
        if (value > max) {
          return invalid(new ValidationError({
            code: ValidationError.Code.TOO_SMALL,
            message: `The value must be ${max} or less.`,
            details: { max: String(max) },
          }));
        }
      } else if (ruleType === 'greaterThan') {
        const min = rule.min;
        if (value <= min) {
          return invalid(new ValidationError({
            code: ValidationError.Code.TOO_LARGE,
            message: `The value must be greater than ${min}.`,
            details: { min: String(min) },
          }));
        }
      } else if (ruleType === 'greaterThanOrEqualTo') {
        const min = rule.min;
        if (value < min) {
          return invalid(new ValidationError({
            code: ValidationError.Code.TOO_LARGE,
            message: `The value must be ${min} or more.`,
            details: { min: String(min) },
          }));
        }
      } else if (ruleType === 'range') {
        const min = rule.min;
        const max = rule.max;
        if (value < min || value > max) {
          return invalid(new ValidationError({
            code: ValidationError.Code.STEP_MISMATCH,
            message: `The value must be between ${min} and ${max}.`,
            details: { min: String(min), max: String(max) },
          }));
        }
      } else {
        const type: never = ruleType;
        console.warn(`BigintValidator: unknown rule type '${type}'.`);
      }
    }

    return valid(value);
  }

  static create(): BigintValidator {
    return new BigintValidator();
  }
}
