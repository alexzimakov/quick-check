export abstract class AbstractSchema<Result, Mapped = Result> {
  readonly __result!: Result;
  readonly __mapped!: Mapped;

  abstract parse(value: unknown): Mapped;

  abstract optional(): AbstractSchema<Result, Mapped | undefined>;

  abstract nullable(): AbstractSchema<Result, Mapped | null>;

  abstract nullish(): AbstractSchema<Result, Mapped | null | undefined>;

  abstract required(params?: { message: string }): AbstractSchema<
    Result,
    Exclude<Mapped, null | undefined>
  >;
}
