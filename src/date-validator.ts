import { BaseValidator, CustomValidator } from './base-validator.js';
import { Result, invalid, valid } from './result.js';
import { ValidationError } from './errors.js';
import { isValidDate, parseISODateTimeString } from './date-utils.js';
import { freezeMap } from './utils.js';

export type DateRule =
  | { type: 'past' }
  | { type: 'future' }
  | { type: 'lessThan'; max: Date }
  | { type: 'lessThanOrEqualTo'; max: Date }
  | { type: 'greaterThan'; min: Date }
  | { type: 'greaterThanOrEqualTo'; min: Date }
  | { type: 'range'; min: Date; max: Date }
  | { type: 'sameDay'; date: Date };

export type DateRuleType = DateRule['type'];

export type DateValidatorOptions = {
  tryParseISO?: boolean;
};

export class DateValidator extends BaseValidator<Date> {
  protected readonly _rules: Map<DateRuleType, DateRule>;
  protected readonly _options: Readonly<DateValidatorOptions>;
  constructor(
    rules?: Map<DateRuleType, DateRule> | null,
    options: DateValidatorOptions = {},
  ) {
    super();
    this._rules = freezeMap(rules || new Map());
    this._options = Object.freeze({
      tryParseISO: options.tryParseISO || false,
    });
  }

  past(): DateValidator {
    return this._addRule({ type: 'past' });
  }

  future(): DateValidator {
    return this._addRule({ type: 'future' });
  }

  lessThan(max: Date): DateValidator {
    return this._addRule({ type: 'lessThan', max });
  }

  lessThanOrEqualTo(max: Date): DateValidator {
    return this._addRule({ type: 'lessThanOrEqualTo', max });
  }

  greaterThan(min: Date): DateValidator {
    return this._addRule({ type: 'greaterThan', min });
  }

  greaterThanOrEqualTo(min: Date): DateValidator {
    return this._addRule({ type: 'greaterThanOrEqualTo', min });
  }

  range(params: { min: Date; max: Date }): DateValidator {
    if (params.min >= params.max) {
      throw new RangeError('Parameter `min` must be < `max`.');
    }
    return this._addRule({ type: 'range', min: params.min, max: params.max });
  }

  sameDay(date: Date): DateValidator {
    return this._addRule({ type: 'sameDay', date });
  }

  custom(validator: CustomValidator<Date>): DateValidator {
    return new DateValidator()._setCustomValidator(validator);
  }

  protected _addRule(rule: DateRule): DateValidator {
    return new DateValidator(new Map(this._rules).set(
      rule.type,
      rule,
    ), this._options);
  }

  protected _validate(value: unknown): Result<Date> {
    if (this._options.tryParseISO && typeof value === 'string') {
      value = parseISODateTimeString(value);
    }
    if (!isValidDate(value)) {
      return invalid(new ValidationError({
        code: 'INVALID_DATE',
        message: 'The value must be a valid Date.',
      }));
    }

    for (const rule of this._rules.values()) {
      const ruleType = rule.type;
      if (ruleType === 'past') {
        if (value >= new Date()) {
          return invalid(new ValidationError({
            code: ValidationError.Code.TOO_LARGE,
            message: `The value must be a date in the past.`,
          }));
        }
      } else if (ruleType === 'future') {
        if (value <= new Date()) {
          return invalid(new ValidationError({
            code: ValidationError.Code.TOO_SMALL,
            message: `The value must be a date in the future.`,
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
      } else if (ruleType === 'sameDay') {
        const date = rule.date;
        if (
          value.getFullYear() !== date.getFullYear()
          || value.getMonth() !== date.getMonth()
          || value.getDate() !== date.getDate()
        ) {
          return invalid(new ValidationError({
            code: ValidationError.Code.DAYS_MISMATCH,
            message: `The value must be same day as ${date.toLocaleDateString()}.`,
            details: { date },
          }));
        }
      } else {
        const type: never = ruleType;
        console.warn(`DateValidator: unknown rule type '${type}'.`);
      }
    }

    return valid(value);
  }

  static create(options?: DateValidatorOptions): DateValidator {
    return new DateValidator(null, options);
  }
}
