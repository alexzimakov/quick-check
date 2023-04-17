import { AbstractSchema, AnySchema, InferInput, InferOutput } from './abstract-schema.js';
import { ResultTransformer, TransformFunction } from './result-transformer.js';

class Modifier<
  Schema extends AnySchema,
  Input,
  Output,
> extends AbstractSchema<Output, Input> {
  protected readonly _schema: Schema;

  constructor(schema: Schema) {
    super();
    this._schema = schema;
  }

  unwrap(): Schema {
    return this._schema;
  }

  validate(value: unknown): InferOutput<Schema> {
    return this._schema.validate(value);
  }

  nullable() {
    return new NullableModifier<Schema>(this._schema);
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

export class NullableModifier<Schema extends AnySchema> extends Modifier<
  Schema,
  InferInput<Schema> | null,
  InferOutput<Schema> | null
> {
  validate(value: unknown): InferOutput<Schema> | null {
    if (value === null) {
      return value;
    }
    return super.validate(value);
  }
}

export class OptionalModifier<Schema extends AnySchema> extends Modifier<
  Schema,
  InferInput<Schema> | undefined,
  InferOutput<Schema> | undefined
> {
  validate(value: unknown): InferOutput<Schema> | undefined {
    if (value === undefined) {
      return value;
    }
    return super.validate(value);
  }
}

export class NullishModifier<Schema extends AnySchema> extends Modifier<
  Schema,
  InferInput<Schema> | null | undefined,
  InferOutput<Schema> | null | undefined
> {
  validate(value: unknown): InferOutput<Schema> | null | undefined {
    if (value === null || value === undefined) {
      return value;
    }
    return super.validate(value);
  }
}
