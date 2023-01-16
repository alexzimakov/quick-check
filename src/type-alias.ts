export const REQUIRED_ERROR = 'Value cannot be null or undefined.';

export abstract class TypeAlias<T> {
  abstract parse(value: unknown): T;

  abstract optional(): TypeAlias<T | undefined>;

  abstract nullable(): TypeAlias<T | null>;

  abstract required(params: {
    message: string;
  }): TypeAlias<Exclude<T, null | undefined>>;
}
