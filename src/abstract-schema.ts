export abstract class AbstractSchema<Output, Input = Output> {
  declare input: Input;
  declare output: Output;

  abstract validate(value: unknown): Output;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySchema = AbstractSchema<any>;

export type InferInput<T extends AnySchema> = T['input'];

export type InferOutput<T extends AnySchema> = T['output'];
