import { Validator } from './validator.js';
import { BaseValidator, CustomValidator } from './base-validator.js';
import { Result, invalid, valid } from './result.js';
import { ValidationError } from './errors.js';
import { formatList, pluralize } from './utils.js';

type Validators = Validator<unknown>[];

type Infer<T extends Validators> = T extends Validator<infer R>[]
  ? R
  : unknown;

export class UnionValidator<T extends Validators> extends BaseValidator<Infer<T>> {
  protected readonly _validators: T;
  constructor(validators: T) {
    if (validators.length === 0) {
      throw new RangeError('UnionValidator: requires at least one validator.');
    }
    super();
    this._validators = Object.freeze(validators);
  }

  custom(validator: CustomValidator<Infer<T>>): UnionValidator<T> {
    return new UnionValidator(this._validators)._setCustomValidator(validator);
  }

  protected _validate(value: unknown): Result<Infer<T>> {
    const errors = [];
    for (const validator of this._validators) {
      const result = validator.validate(value);
      if (result.ok) {
        return valid(result.value as Infer<T>);
      } else {
        errors.push(result.error);
      }
    }

    const validators = formatList(
      this._validators.map((validator) => validator.constructor.name),
      {
        type: 'conjunction',
        quoteStyle: '`',
        quoteValues: true,
      },
    );
    const checks = pluralize(this._validators.length, {
      singular: 'check',
      plural: 'checks',
    });
    return invalid(new ValidationError({
      code: ValidationError.Code.UNION_ERROR,
      message: `The value does not pass the ${validators} ${checks}.`,
      details: { errors },
    }));
  }

  static create<T extends Validators>(validators: T): UnionValidator<T> {
    return new UnionValidator(validators);
  }
}
