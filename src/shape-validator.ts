import { BaseValidator, CustomValidator } from './base-validator.js';
import { Validator } from './validator.js';
import { Result, invalid, valid } from './result.js';
import { ValidationError } from './errors.js';
import { NilDecorator, OptionalDecorator } from './decorators.js';
import { formatList } from './utils.js';
import { isObject } from './predicates.js';

export type PropertyValidator<T = unknown> = Validator<T>;

export type ShapeValidatorSchema<T extends object> = {
  [K in keyof T]: PropertyValidator<T[K]>;
};

export type ShapeValidatorOptions = {
  omitUnknownProps?: boolean;
};

export class ShapeValidator<T extends object> extends BaseValidator<T> {
  protected readonly _schema: Readonly<ShapeValidatorSchema<T>>;
  protected readonly _options: Readonly<ShapeValidatorOptions>;
  constructor(
    schema: ShapeValidatorSchema<T>,
    options: ShapeValidatorOptions = {},
  ) {
    super();
    this._schema = Object.freeze({ ...schema });
    this._options = Object.freeze({ ...options });
  }

  get<K extends keyof T>(key: K): ShapeValidatorSchema<T>[K] {
    return this._schema[key];
  }

  custom(validator: CustomValidator<T>): ShapeValidator<T> {
    return new ShapeValidator(
      this._schema,
      this._options,
    )._setCustomValidator(validator);
  }

  allowUnknownProps(): ShapeValidator<T> {
    return new ShapeValidator(this._schema, {
      ...this._options,
      omitUnknownProps: false,
    });
  }

  omitUnknownProps(): ShapeValidator<T> {
    return new ShapeValidator(this._schema, {
      ...this._options,
      omitUnknownProps: true,
    });
  }

  protected _validate(obj: unknown): Result<T> {
    if (!isObject(obj)) {
      return invalid(new ValidationError({
        code: ValidationError.Code.OBJECT_EXPECTED,
        message: 'The value must be an object.',
      }));
    }

    const shape = { ...obj };
    const schema = this._schema as Record<string, PropertyValidator>;
    const expectedKeys = new Set(Object.keys(schema));
    const errors: Record<string, ValidationError> = {};
    for (const key of expectedKeys) {
      const value = shape[key];
      const validator = schema[key];
      if (
        value === undefined
        && !(validator instanceof OptionalDecorator)
        && !(validator instanceof NilDecorator)
      ) {
        return invalid(new ValidationError({
          code: ValidationError.Code.PROPERTY_MISSING,
          message: `Property '${key}' is missing.`,
          details: { property: key },
        }));
      }

      const result = validator.validate(value);
      if (!result.ok) {
        errors[key] = result.error;
      }
    }

    const keysWithError = Object.keys(errors);
    if (keysWithError.length > 0) {
      const formattedKeys = formatList(keysWithError, {
        type: 'conjunction',
        quoteStyle: '\'',
        quoteValues: true,
      });
      return invalid(new ValidationError({
        code: ValidationError.Code.INVALID_OBJECT_SHAPE,
        message: keysWithError.length === 1
          ? `The property ${formattedKeys} is invalid.`
          : `The properties ${formattedKeys} are invalid.`,
        details: errors,
      }));
    }

    if (this._options.omitUnknownProps) {
      const actualKeys = new Set(Object.keys(obj));
      for (const key of actualKeys) {
        if (!expectedKeys.has(key)) {
          delete shape[key];
        }
      }
    }

    return valid(shape as T);
  }

  static create<T extends object>(
    schema: ShapeValidatorSchema<T>,
    options?: ShapeValidatorOptions,
  ): ShapeValidator<T> {
    return new ShapeValidator(schema, options);
  }
}
