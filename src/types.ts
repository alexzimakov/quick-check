import { ResultTransformer } from './result-transformer.js';
import { NullishModifier, OptionalModifier } from './result-modifier.js';

export interface TypeSchema<Type> {
  validate(value: unknown): Type;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySchema = TypeSchema<any>;

// `& unknown` in the end is required to show the full type
// instead of wrapped generics.
export type PrettyType<T extends object> = {
  [K in keyof T]: T[K];
} & unknown;

export type RequiredKeys<T extends object> = {
  [K in keyof T]: T[K] extends Exclude<T[K], undefined> ? K : never;
}[keyof T];

export type OptionalKeys<T extends object> = {
  [K in keyof T]: T[K] extends Exclude<T[K], undefined> ? never : K;
}[keyof T];

export type WithOptionalAttrs<T extends object> = PrettyType<{
  [K in RequiredKeys<T>]: T[K];
} & {
  [K in OptionalKeys<T>]?: T[K];
}>;

export type InferOutput<T> = T extends TypeSchema<infer R>
  ? R
  : never;

export type InferInput<T> = T extends NullishModifier<infer R>
  ? InferInput<R> | null | undefined
  : T extends NullishModifier<infer R>
    ? InferInput<R> | null
    : T extends OptionalModifier<infer R>
      ? InferInput<R> | undefined
      : T extends ResultTransformer<infer R, unknown>
        ? InferInput<R>
        : T extends TypeSchema<infer R>
          ? R
          : never;
