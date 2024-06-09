import { Validator } from './validator.js';
import { Result, invalid } from './result.js';
import { ValidationError } from './errors.js';
import { OptionalDecorator, NullableDecorator, NilDecorator } from './decorators.js';

export type CustomValidator<T> = (value: T) => Result<T>;

export abstract class BaseValidator<T> implements Validator<T> {
  protected _customValidator: CustomValidator<T> | null | undefined;
  constructor() {
    this._customValidator = undefined;
  }

  protected abstract _validate(value: unknown): Result<T>;

  protected _setCustomValidator(
    validator: CustomValidator<T> | null | undefined,
  ): this {
    this._customValidator = validator;
    return this;
  }

  validate(value: unknown): Result<T> {
    if (value === null || value === undefined) {
      return invalid(new ValidationError({
        code: ValidationError.Code.VALUE_MISSING,
        message: 'The value cannot be null or undefined.',
      }));
    }

    let result = this._validate(value);
    if (result.ok) {
      const customValidator = this._customValidator;
      if (typeof customValidator === 'function') {
        result = customValidator(result.value);
      }
    }

    return result;
  }

  parse(value: unknown): T {
    const result = this.validate(value);
    if (result.ok) {
      return result.value;
    }
    throw result.error;
  }

  optional(): OptionalDecorator<this> {
    return new OptionalDecorator(this);
  }

  nullable(): NullableDecorator<this> {
    return new NullableDecorator(this);
  }

  optionalOrNullable(): NilDecorator<this> {
    return new NilDecorator(this);
  }
}
