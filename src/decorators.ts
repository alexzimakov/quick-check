import { Validator } from './validator.js';
import { Result, valid } from './result.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyValidator = Validator<any>;

type Infer<T> = T extends Validator<infer R> ? R : unknown;

export class OptionalDecorator<T extends AnyValidator> implements Validator<
  | Infer<T>
  | undefined
> {
  protected readonly _validator: T;
  constructor(validator: T) {
    this._validator = validator;
  }

  get wrapped(): T {
    return this._validator;
  }

  validate(value: unknown): Result<Infer<T> | undefined> {
    if (value === undefined) {
      return valid(value);
    }
    return this._validator.validate(value);
  }

  parse(value: unknown): Infer<T> | undefined {
    return this._validator.parse(value);
  }

  revoke(): T {
    return this._validator;
  }
}

export class NullableDecorator<T extends AnyValidator> implements Validator<
  | Infer<T>
  | null
> {
  private readonly _validator: T;
  constructor(validator: T) {
    this._validator = validator;
  }

  get wrapped(): T {
    return this._validator;
  }

  validate(value: unknown): Result<Infer<T> | null> {
    if (value === null) {
      return valid(value);
    }
    return this._validator.validate(value);
  }

  parse(value: unknown): Infer<T> | null {
    return this._validator.parse(value);
  }

  revoke(): T {
    return this.wrapped;
  }
}

export class NilDecorator<T extends AnyValidator> implements Validator<
  | Infer<T>
  | null
  | undefined
> {
  private readonly _validator: T;
  constructor(validator: T) {
    this._validator = validator;
  }

  get wrapped(): T {
    return this._validator;
  }

  validate(value: unknown): Result<Infer<T> | null | undefined> {
    if (value === null || value === undefined) {
      return valid(value);
    }
    return this._validator.validate(value);
  }

  parse(value: unknown): Infer<T> | null | undefined {
    return this._validator.parse(value);
  }

  revoke(): T {
    return this.wrapped;
  }
}
