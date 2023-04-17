import { AbstractTypeSchema, RequiredErrorMessage, Rule, TypeErrorMessage } from '../abstract-type-schema.js';

type BooleanRule = Rule<boolean>;

export class BooleanSchema extends AbstractTypeSchema<boolean> {
  readonly shouldCoerceType: boolean;

  constructor(
    shouldCoerceType?: boolean,
    rules?: BooleanRule[],
    typeError?: TypeErrorMessage,
    requiredError?: RequiredErrorMessage,
  ) {
    super(rules, typeError, requiredError);
    this.shouldCoerceType = shouldCoerceType || false;
  }

  protected override _prepareValue(value: unknown): unknown {
    if (this.shouldCoerceType) {
      if (
        value === 'true' ||
        value === 1
      ) {
        value = true;
      } else if (
        value === 'false' ||
        value === 0 ||
        value === null ||
        value === undefined
      ) {
        value = false;
      }
    }

    return value;
  }

  protected _validate(value: unknown): boolean {
    if (typeof value !== 'boolean') {
      this._throwTypeError(value, 'boolean');
    }
    return value;
  }
}

export type BooleanSchemaOptions = {
  coerceType?: boolean;
  rules?: BooleanRule[];
  typeError?: TypeErrorMessage;
  requiredError?: RequiredErrorMessage;
};

export function createBooleanSchema(options?: BooleanSchemaOptions) {
  return new BooleanSchema(
    options?.coerceType,
    options?.rules,
    options?.typeError,
    options?.requiredError,
  );
}
