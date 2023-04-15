export interface TypeSchema<Type> {
  validate(value: unknown): Type;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySchema = TypeSchema<any>;

export type InferOutput<T> = T extends TypeSchema<infer R>
  ? R
  : never;
