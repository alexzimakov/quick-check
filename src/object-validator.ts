import { BaseValidator, CustomValidator } from './base-validator.js';
import { Validator } from './validator.js';
import { Result, invalid, valid } from './result.js';
import { ValidationError } from './errors.js';
import { isObject } from './predicates.js';
import { freezeMap } from './utils.js';

export type ObjectRule = { type: 'notEmpty' };

export type ObjectRuleType = ObjectRule['type'];

export class ObjectValidator<
  K extends string | symbol,
  V = unknown,
> extends BaseValidator<Record<K, V>> {
  protected readonly _rules: Map<ObjectRuleType, ObjectRule>;
  protected readonly _keyValidator: Validator<K> | undefined;
  protected readonly _valueValidator: Validator<V> | undefined;
  constructor(
    rules?: Map<ObjectRuleType, ObjectRule> | null,
    keyValidator?: Validator<K>,
    valueValidator?: Validator<V>,
  ) {
    super();
    this._rules = freezeMap(rules || new Map());
    this._keyValidator = keyValidator;
    this._valueValidator = valueValidator;
  }

  notEmpty(): ObjectValidator<K, V> {
    return this._addRule({ type: 'notEmpty' });
  }

  custom(validator: CustomValidator<Record<K, V>>): ObjectValidator<K, V> {
    return new ObjectValidator(
      this._rules,
      this._keyValidator,
      this._valueValidator,
    )._setCustomValidator(validator);
  }

  protected _addRule(rule: ObjectRule): ObjectValidator<K, V> {
    return new ObjectValidator(new Map(this._rules).set(
      rule.type,
      rule,
    ), this._keyValidator, this._valueValidator);
  }

  protected _validate(obj: unknown): Result<Record<K, V>> {
    if (!isObject(obj)) {
      return invalid(new ValidationError({
        code: ValidationError.Code.OBJECT_EXPECTED,
        message: 'The value must be an object.',
      }));
    }

    const keyValidator = this._keyValidator;
    const valueValidator = this._valueValidator;
    for (const [key, value] of Object.entries(obj)) {
      if (keyValidator instanceof BaseValidator) {
        const result = keyValidator.validate(key);
        if (!result.ok) {
          return invalid(new ValidationError({
            code: ValidationError.Code.PROPERTY_INVALID,
            message: `The property '${key}' is invalid`,
            details: { error: result.error },
          }));
        }
      }

      if (valueValidator instanceof BaseValidator) {
        const result = valueValidator.validate(value);
        if (!result.ok) {
          return invalid(new ValidationError({
            code: ValidationError.Code.PROPERTY_VALUE_INVALID,
            message: `The value of property '${key}' is invalid`,
            details: { error: result.error },
          }));
        }
      }
    }

    for (const rule of this._rules.values()) {
      const ruleType = rule.type;
      if (ruleType === 'notEmpty') {
        const keys = Object.keys(obj);
        if (keys.length === 0) {
          return invalid(new ValidationError({
            code: ValidationError.Code.VALUE_EMPTY,
            message: 'The value must be a non-empty object.',
          }));
        }
      } else {
        const type: never = ruleType;
        console.warn(`ObjectValidator: unknown rule type '${type}'.`);
      }
    }

    return valid(obj as Record<K, V>);
  }

  static create<K extends string | symbol, V = unknown>(validators: {
    key?: Validator<K>;
    value?: Validator<V>;
  } = {}): ObjectValidator<K, V> {
    return new ObjectValidator(null, validators.key, validators.value);
  }
}
