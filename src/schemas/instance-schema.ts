import { AbstractTypeSchema, RequiredErrorMessage, Rule, TypeErrorMessage } from '../abstract-type-schema.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new(...args: any[]) => T;

export class InstanceSchema<T> extends AbstractTypeSchema<T> {
  protected readonly _constructor: Constructor<T>;

  constructor(
    constructor: Constructor<T>,
    rules?: Rule<T>[],
    typeError?: TypeErrorMessage,
    requiredError?: RequiredErrorMessage,
  ) {
    super(rules, typeError, requiredError);
    this._constructor = constructor;
  }

  protected _validate(value: unknown): T {
    const constructor = this._constructor;
    if (!(value instanceof constructor)) {
      const expectedType = constructor.name;
      this._throwTypeError(value, expectedType);
    }
    return value;
  }
}

export type InstanceSchemaOptions<T> = {
  rules?: Rule<T>[];
  typeError?: TypeErrorMessage;
  requiredError?: RequiredErrorMessage;
};

export function createInstanceSchema<T>(
  constructor: Constructor<T>,
  options?: InstanceSchemaOptions<T>,
) {
  return new InstanceSchema<T>(
    constructor,
    options?.rules,
    options?.typeError,
    options?.requiredError,
  );
}
