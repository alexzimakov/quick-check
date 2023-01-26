export abstract class TypeAlias<Result, Mapped = Result> {
  readonly __result!: Result;
  readonly __mapped!: Mapped;

  abstract parse(value: unknown): Mapped;

  abstract optional(): TypeAlias<Result, Mapped | undefined>;

  abstract nullable(): TypeAlias<Result, Mapped | null>;

  abstract required(params: { message: string }): TypeAlias<
    Result,
    Exclude<Mapped, null | undefined>
  >;
}
