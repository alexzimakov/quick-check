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
