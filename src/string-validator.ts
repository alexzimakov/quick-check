import { BaseValidator, CustomValidator } from './base-validator.js';
import { Result, invalid, valid } from './result.js';
import { ValidationError } from './errors.js';
import { freezeMap, pluralize } from './utils.js';
import { parseISODateString, parseISODateTimeString } from './date-utils.js';

export type StringRule =
  | { type: 'notEmpty'; ignoreWhitespace: boolean }
  | { type: 'minLength'; minLength: number }
  | { type: 'maxLength'; maxLength: number }
  | { type: 'length'; min: number; max: number }
  | { type: 'pattern'; pattern: RegExp }
  | { type: 'ISODate' }
  | { type: 'ISODateTime' };

export type StringRuleType = StringRule['type'];

export class StringValidator extends BaseValidator<string> {
  protected readonly _rules: Map<StringRuleType, StringRule>;
  constructor(rules?: Map<StringRuleType, StringRule>) {
    super();
    this._rules = freezeMap(rules || new Map());
  }

  notEmpty(options: { ignoreWhitespace?: boolean } = {}): StringValidator {
    return this._addRule({
      type: 'notEmpty',
      ignoreWhitespace: options.ignoreWhitespace || false,
    });
  }

  minLength(minLength: number): StringValidator {
    if (minLength < 0) {
      throw new RangeError('Argument `minLength` must be ≥ 0.');
    }
    return this._addRule({ type: 'minLength', minLength });
  }

  maxLength(maxLength: number): StringValidator {
    if (maxLength < 0) {
      throw new RangeError('Argument `maxLength` must be ≥ 0.');
    }
    return this._addRule({ type: 'maxLength', maxLength });
  }

  length(params: { min: number; max: number }): StringValidator {
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

  pattern(pattern: RegExp): StringValidator {
    return this._addRule({ type: 'pattern', pattern });
  }

  ISODate() {
    return this._addRule({ type: 'ISODate' });
  }

  ISODateTime() {
    return this._addRule({ type: 'ISODateTime' });
  }

  custom(validator: CustomValidator<string>): StringValidator {
    return new StringValidator(this._rules)._setCustomValidator(validator);
  }

  protected _addRule(rule: StringRule): StringValidator {
    return new StringValidator(new Map(this._rules).set(rule.type, rule));
  }

  protected _validate(value: unknown): Result<string> {
    if (typeof value !== 'string') {
      return invalid(new ValidationError({
        code: ValidationError.Code.STRING_EXPECTED,
        message: 'The value must be a string.',
      }));
    }

    for (const rule of this._rules.values()) {
      const ruleType = rule.type;
      if (ruleType === 'notEmpty') {
        const ignoreWhitespace = rule.ignoreWhitespace || false;
        const valueToCheck = ignoreWhitespace ? value.trim() : value;
        if (valueToCheck === '') {
          return invalid(new ValidationError({
            code: ValidationError.Code.VALUE_EMPTY,
            message: 'The value must be a non-empty string.',
            details: { ignoreWhitespace },
          }));
        }
      } else if (ruleType === 'minLength') {
        const minLength = rule.minLength;
        const actualLength = value.length;
        if (actualLength < minLength) {
          const minChars = pluralize(minLength, {
            singular: 'character',
            plural: 'characters',
          });
          return invalid(new ValidationError({
            code: ValidationError.Code.TOO_SHORT,
            message: `The value must be ${minChars} or more.`,
            details: { actualLength, minLength },
          }));
        }
      } else if (ruleType === 'maxLength') {
        const maxLength = rule.maxLength;
        const actualLength = value.length;
        if (actualLength > maxLength) {
          const maxChars = pluralize(maxLength, {
            singular: 'character',
            plural: 'characters',
          });
          return invalid(new ValidationError({
            code: ValidationError.Code.TOO_LONG,
            message: `The value must be ${maxChars} or less.`,
            details: { actualLength, maxLength },
          }));
        }
      } else if (ruleType === 'length') {
        const minLength = rule.min;
        const maxLength = rule.max;
        const actualLength = value.length;
        if (actualLength < minLength || actualLength > maxLength) {
          return invalid(new ValidationError({
            code: ValidationError.Code.OUT_OF_RANGE,
            message: `The value must be between ${minLength} and ${maxLength} characters.`,
            details: { actualLength, minLength, maxLength },
          }));
        }
      } else if (ruleType === 'pattern') {
        const pattern = rule.pattern;
        if (!value.match(pattern)) {
          return invalid(new ValidationError({
            code: ValidationError.Code.PATTERN_MISMATCH,
            message: `The value is in the wrong format.`,
            details: { pattern: String(pattern) },
          }));
        }
      } else if (ruleType === 'ISODate') {
        if (!parseISODateString(value)) {
          return invalid(new ValidationError({
            code: ValidationError.Code.INVALID_ISO_DATE,
            message: 'The value must be a string in ISO date format.',
          }));
        }
      } else if (ruleType === 'ISODateTime') {
        if (!parseISODateTimeString(value)) {
          return invalid(new ValidationError({
            code: ValidationError.Code.INVALID_ISO_DATE_TIME,
            message: 'The value must be a string in ISO date and time format.',
          }));
        }
      } else {
        const type: never = ruleType;
        console.warn(`StringValidator: unknown rule type '${type}'.`);
      }
    }

    return valid(value);
  }

  static create(): StringValidator {
    return new StringValidator();
  }
}
