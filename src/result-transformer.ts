import { NullableModifier, NullishModifier, OptionalModifier } from './result-modifier.js';
import { AbstractSchema, AnySchema, InferOutput } from './abstract-schema.js';

export type TransformFunction<T extends AnySchema, R> = (
  value: InferOutput<T>,
) => R;

export class ResultTransformer<
  T extends AnySchema,
  R
> extends AbstractSchema<R, T['input']> {
  protected readonly _schema: T;
  protected readonly _transform: TransformFunction<T, R>;

  constructor(schema: T, transformer: TransformFunction<T, R>) {
    super();
    this._schema = schema;
    this._transform = transformer;
  }

  get sourceSchema(): T {
    return this._schema;
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

  validate(value: unknown): R {
    const validatedValue = this._schema.validate(value);
    return this._transform(validatedValue);
  }
}
