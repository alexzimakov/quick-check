import { AbstractSchema, AnySchema, InferOutput } from './abstract-schema.js';
import { ResultTransformer, TransformFunction } from './result-transformer.js';

class Modifier<T extends AnySchema, R> extends AbstractSchema<R> {
  protected readonly _schema: T;

  constructor(schema: T) {
    super();
    this._schema = schema;
  }

  unwrap(): T {
    return this._schema;
  }

  validate(value: unknown): R {
    return this._schema.validate(value);
  }

  nullable() {
    return new NullableModifier(this._schema);
  }

  optional() {
    return new OptionalModifier(this._schema);
  }

  nullish() {
    return new NullishModifier(this._schema);
  }

  transform<U>(transform: TransformFunction<this, U>) {
    return new ResultTransformer(this, transform);
  }
}

export class NullableModifier<
  T extends AnySchema,
  R = InferOutput<T>,
> extends Modifier<T, R | null> {
  validate(value: unknown): R | null {
    if (value === null) {
      return value;
    }
    return super.validate(value);
  }
}

export class OptionalModifier<
  T extends AnySchema,
  R = InferOutput<T>
> extends Modifier<T, R | undefined> {
  validate(value: unknown): R | undefined {
    if (value === undefined) {
      return value;
    }
    return super.validate(value);
  }
}

export class NullishModifier<
  T extends AnySchema,
  R = InferOutput<T>
> extends Modifier<T, R | null | undefined> {
  validate(value: unknown): R | null | undefined {
    if (value === null || value === undefined) {
      return value;
    }
    return super.validate(value);
  }
}
