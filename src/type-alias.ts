export abstract class TypeAlias<T> {
  static errorCodes = {
    required: 'required',
  } as const;

  static errorMessages = {
    required: 'Value is required.',
  } as const;

  abstract parse(value: unknown): T;

  abstract optional(): TypeAlias<T | undefined>;

  abstract nullable(): TypeAlias<T | null>;

  abstract required(params: { message: string }): TypeAlias<NonNullable<T>>;
}
