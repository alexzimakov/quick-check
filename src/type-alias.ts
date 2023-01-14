export type TypeAliasOptions = {
  isOptional: boolean;
  isNullable: boolean;
  requiredError?: string;
  invalidTypeError?: string;
};

export interface TypeAlias<T> {
  parse(value: unknown): T;

  optional(): TypeAlias<T | undefined>;

  nullable(): TypeAlias<T | null>;

  required(): TypeAlias<NonNullable<T>>;
}
