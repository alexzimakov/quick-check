import { BaseValidator, CustomValidator } from './base-validator.js';
import { Result, invalid, valid } from './result.js';
import { ValidationError } from './errors.js';

export class BooleanValidator extends BaseValidator<boolean> {
  custom(validator: CustomValidator<boolean>): BooleanValidator {
    return new BooleanValidator()._setCustomValidator(validator);
  }

  protected _validate(value: unknown): Result<boolean> {
    if (typeof value !== 'boolean') {
      return invalid(new ValidationError({
        code: ValidationError.Code.BOOLEAN_EXPECTED,
        message: 'The value must be a boolean.',
      }));
    }

    return valid(value);
  }

  static create(): BooleanValidator {
    return new BooleanValidator();
  }
}
