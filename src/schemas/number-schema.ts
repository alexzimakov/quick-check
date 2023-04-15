import { RequiredErrorMessage, Rule, Schema, TypeErrorMessage } from './schema.js';

type NumberRule = Rule<number>;

export class NumberSchema extends Schema<number> {
  readonly shouldCoerceType: boolean;

  constructor(
    shouldCoerceType?: boolean,
    rules?: NumberRule[],
    typeError?: TypeErrorMessage,
    requiredError?: RequiredErrorMessage,
  ) {
    super(rules, typeError, requiredError);
    this.shouldCoerceType = shouldCoerceType || false;
  }

  protected override _prepareValue(value: unknown): unknown {
    if (this.shouldCoerceType) {
      if (value === true) {
        value = 1;
      } else if (
        value === false ||
        value === null ||
        value === undefined
      ) {
        value = 0;
      } else if (typeof value === 'string') {
        value = Number(value);
      }
    }
    return value;
  }

  protected _validate(value: unknown): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      this._throwTypeError(value, 'number');
    }
    return value;
  }
}

export type NumberSchemaOptions = {
  coerceType?: boolean;
  rules?: NumberRule[];
  typeError?: TypeErrorMessage;
  requiredError?: RequiredErrorMessage;
};

export function createNumberSchema(options?: NumberSchemaOptions) {
  return new NumberSchema(
    options?.coerceType,
    options?.rules,
    options?.typeError,
    options?.requiredError,
  );
}
