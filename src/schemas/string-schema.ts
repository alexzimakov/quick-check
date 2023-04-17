import { AbstractTypeSchema, RequiredErrorMessage, Rule, TypeErrorMessage } from '../abstract-type-schema.js';

type StringRule = Rule<string>;

export class StringSchema extends AbstractTypeSchema<string> {
  readonly shouldCoerceType: boolean;
  readonly shouldTrimValue: boolean;

  constructor(
    shouldCoerceType?: boolean,
    shouldTrimValue?: boolean,
    rules?: StringRule[],
    typeError?: TypeErrorMessage,
    requiredError?: RequiredErrorMessage,
  ) {
    super(rules, typeError, requiredError);
    this.shouldCoerceType = shouldCoerceType || false;
    this.shouldTrimValue = shouldTrimValue || false;
  }

  protected override _prepareValue(value: unknown): unknown {
    if (this.shouldCoerceType) {
      if (
        value === null ||
        value === undefined
      ) {
        value = '';
      } else if (
        typeof value === 'number' ||
        typeof value === 'bigint' ||
        typeof value === 'boolean'
      ) {
        value = String(value);
      }
    }

    if (this.shouldTrimValue) {
      if (typeof value === 'string') {
        value = value.trim();
      }
    }

    return value;
  }

  protected _validate(value: unknown): string {
    if (typeof value !== 'string') {
      this._throwTypeError(value, 'string');
    }
    return value;
  }
}

export type StringSchemaOptions = {
  coerceType?: boolean;
  trimValue?: boolean;
  rules?: StringRule[];
  typeError?: TypeErrorMessage;
  requiredError?: RequiredErrorMessage;
};

export function createStringSchema(options?: StringSchemaOptions) {
  return new StringSchema(
    options?.coerceType,
    options?.trimValue,
    options?.rules,
    options?.typeError,
    options?.requiredError,
  );
}
