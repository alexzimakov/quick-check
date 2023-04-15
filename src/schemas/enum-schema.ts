import { RequiredErrorMessage, Rule, Schema } from './schema.js';
import { ValidationError } from '../validation-error.js';
import { Message, formatMessage } from '../utils/format-message.js';
import { formatList } from '../utils/format-list.js';
import { errorCodes } from '../error-codes.js';

type Values = readonly unknown[];
type Enum<T extends Values> = T[number];
type EnumRule<T extends Values> = Rule<Enum<T>>;
type EnumRules<T extends Values> = EnumRule<T>[];

type EnumErrorMessage = Message<EnumErrorMessageDetails>;
type EnumErrorMessageDetails = {
  value: unknown;
  expectedValues: readonly unknown[];
};
const defaultEnumErrorMessage: EnumErrorMessage = ({
  value,
  expectedValues,
}) => {
  const values = formatList(expectedValues, {
    type: 'or',
    quoteItems: true,
  });
  return `The value must be one of ${values}, but received '${value}'.`;
};

export class EnumSchema<T extends Values> extends Schema<Enum<T>> {
  protected readonly _values: T;
  protected readonly _enumError: EnumErrorMessage;

  constructor(
    values: T,
    rules?: EnumRules<T>,
    enumError?: EnumErrorMessage,
    requiredError?: RequiredErrorMessage,
  ) {
    super(rules, undefined, requiredError);
    this._values = values;
    this._enumError = enumError || defaultEnumErrorMessage;
  }

  protected _validate(value: unknown): Enum<T> {
    const expectedValues = this._values;
    if (!expectedValues.includes(value)) {
      const details: EnumErrorMessageDetails = { value, expectedValues };
      const message = formatMessage(this._enumError, details);
      throw new ValidationError(message, {
        details,
        code: errorCodes.invalidEnum,
      });
    }
    return value;
  }
}

export type EnumSchemaOptions<T extends Values> = {
  rules?: EnumRules<T>;
  enumError?: EnumErrorMessage;
  requiredError?: RequiredErrorMessage;
};

export function createEnumSchema<T extends Values>(
  values: T,
  options?: EnumSchemaOptions<T>,
) {
  return new EnumSchema<T>(
    values,
    options?.rules,
    options?.enumError,
    options?.requiredError,
  );
}
