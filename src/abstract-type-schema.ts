import { AbstractSchema } from './abstract-schema.js';
import { ResultTransformer, TransformFunction } from './result-transformer.js';
import { NullableModifier, NullishModifier, OptionalModifier } from './result-modifier.js';
import { ValidationError } from './validation-error.js';
import { Message, formatMessage } from './utils/format-message.js';
import { determineType } from './utils/determine-type.js';
import { errorCodes } from './error-codes.js';

export type Rule<T> = (value: T) => void;

export type TypeErrorMessage = Message<TypeErrorDetails>;
export type TypeErrorDetails = {
  value: unknown;
  expectedType: string;
  receivedType: string;
};
const defaultTypeErrorMessage: TypeErrorMessage = ({
  expectedType,
  receivedType,
}) => `The value must be '${expectedType}', but received '${receivedType}'.`;

export type RequiredErrorMessage = Message<RequiredErrorDetails>;
export type RequiredErrorDetails = {
  value: unknown;
};
const defaultRequiredErrorMessage: RequiredErrorMessage = ({
  value,
}) => `The value cannot be ${value}.`;

export abstract class AbstractTypeSchema<
  Output,
  Input = Output,
> extends AbstractSchema<Output, Input> {
  protected readonly _rules: Rule<Output>[];
  protected readonly _typeError: TypeErrorMessage;
  protected readonly _requiredError: RequiredErrorMessage;

  protected constructor(
    rules?: Rule<Output>[],
    typeError?: TypeErrorMessage,
    requiredError?: RequiredErrorMessage,
  ) {
    super();
    this._rules = rules || [];
    this._typeError = typeError || defaultTypeErrorMessage;
    this._requiredError = requiredError || defaultRequiredErrorMessage;
  }

  protected _throwTypeError(value: unknown, expectedType: string): never {
    const details: TypeErrorDetails = {
      value,
      expectedType,
      receivedType: determineType(value),
    };
    const formatted = formatMessage(this._typeError, details);
    throw new ValidationError(formatted, {
      details,
      code: errorCodes.invalidType,
    });
  }

  protected _throwRequiredError(value: unknown): never {
    const details: RequiredErrorDetails = { value };
    const formatted = formatMessage(this._requiredError, details);
    throw new ValidationError(formatted, {
      details,
      code: errorCodes.required,
    });
  }

  protected _prepareValue(value: unknown): unknown {
    return value;
  }

  protected abstract _validate(value: unknown): Output;

  validate(value: unknown): Output {
    value = this._prepareValue(value);

    if (value === null || value === undefined) {
      this._throwRequiredError(value);
    }

    const checkedValue = this._validate(value);
    for (const rule of this._rules) {
      rule(checkedValue);
    }

    return checkedValue;
  }

  nullable() {
    return new NullableModifier(this);
  }

  optional() {
    return new OptionalModifier(this);
  }

  nullish() {
    return new NullishModifier(this);
  }

  transform<U>(transform: TransformFunction<this, U>) {
    return new ResultTransformer(this, transform);
  }
}
