import { BaseValidator, CustomValidator } from './base-validator.js';
import { Result, invalid, valid } from './result.js';
import { ValidationError } from './errors.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new(...args: any[]) => T;

export class ObjectTypeValidator<T> extends BaseValidator<T> {
  protected readonly _constructor: Constructor<T>;
  constructor(constructor: Constructor<T>) {
    super();
    this._constructor = constructor;
  }

  custom(validator: CustomValidator<T>): ObjectTypeValidator<T> {
    return new ObjectTypeValidator(
      this._constructor,
    )._setCustomValidator(validator);
  }

  protected _validate(value: unknown): Result<T> {
    if (!(value instanceof this._constructor)) {
      const actualType = getObjectType(value);
      const requiredType = this._constructor.name;
      return invalid(new ValidationError({
        code: ValidationError.Code.INVALID_INSTANCE_TYPE,
        message: `The value must be an instance of \`${requiredType}\`.`,
        details: { actualType, requiredType },
      }));
    }
    return valid(value);
  }

  static create<T>(constructor: Constructor<T>): ObjectTypeValidator<T> {
    return new ObjectTypeValidator(constructor);
  }
}

function getObjectType(value: unknown): string {
  if (
    typeof value === 'object'
    && value !== null
    && value.constructor
    && value.constructor.name
  ) {
    return value.constructor.name;
  }
  return typeof value;
}
