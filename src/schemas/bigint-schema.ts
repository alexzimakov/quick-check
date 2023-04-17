import { RequiredErrorMessage, Rule, Schema, TypeErrorMessage } from './schema.js';

type BigIntRule = Rule<bigint>;

export class BigIntSchema extends Schema<bigint> {
  readonly shouldCoerceType: boolean;

  constructor(
    shouldCoerceType?: boolean,
    rules?: BigIntRule[],
    typeError?: TypeErrorMessage,
    requiredError?: RequiredErrorMessage,
  ) {
    super(rules, typeError, requiredError);
    this.shouldCoerceType = shouldCoerceType || false;
  }

  protected override _prepareValue(value: unknown): unknown {
    if (this.shouldCoerceType) {
      if (value === true) {
        value = 1n;
      } else if (
        value === false ||
        value === null ||
        value === undefined
      ) {
        value = 0n;
      } else if (typeof value === 'number' && Number.isInteger(value)) {
        value = BigInt(value);
      } else if (typeof value === 'string' && value.match(/^[+-]?\d+$/)) {
        value = BigInt(value);
      }
    }
    return value;
  }

  protected _validate(value: unknown): bigint {
    if (typeof value !== 'bigint') {
      this._throwTypeError(value, 'bigint');
    }
    return value;
  }
}

export type BigIntSchemaOptions = {
  coerceType?: boolean;
  rules?: BigIntRule[];
  typeError?: TypeErrorMessage;
  requiredError?: RequiredErrorMessage;
};

export function createBigIntSchema(options?: BigIntSchemaOptions) {
  return new BigIntSchema(
    options?.coerceType,
    options?.rules,
    options?.typeError,
    options?.requiredError,
  );
}
