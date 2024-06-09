import { BaseValidator, CustomValidator } from './base-validator.js';
import { ValidationError } from './errors.js';
import { Result, invalid, valid } from './result.js';

type Enum = {
  [key: string]: string | number;
  [value: number]: string;
};

type Values = readonly (string | number)[];

type Infer<T extends Enum | Values> = T extends Enum
  ? T[keyof T]
  : T[number];

export class EnumValidator<T extends Enum | Values> extends BaseValidator<Infer<T>> {
  protected readonly _values: T;
  protected readonly _valueSet: Set<unknown>;
  constructor(values: T) {
    super();
    this._values = values;
    this._valueSet = new Set(Array.isArray(this._values)
      ? this._values
      : Object.values(this._values));
  }

  custom(validator: CustomValidator<Infer<T>>): EnumValidator<T> {
    return new EnumValidator(this._values)._setCustomValidator(validator);
  }

  protected _validate(value: unknown): Result<Infer<T>> {
    const values = this._valueSet;
    if (!values.has(value)) {
      return invalid(new ValidationError({
        code: ValidationError.Code.INVALID_ENUM_VALUE,
        message: `Invalid enum value: ${String(value)}. See details`,
        details: { expectedValues: this._values },
      }));
    }
    return valid(value as Infer<T>);
  }

  static create<T extends Enum | Values>(values: T): EnumValidator<T> {
    return new EnumValidator(values);
  }
}
