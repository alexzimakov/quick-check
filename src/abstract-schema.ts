export abstract class AbstractSchema<Input, Output = Input> {
  readonly __input!: Input;
  readonly __output!: Output;

  abstract parse(value: unknown): Output;

  abstract optional(): AbstractSchema<
    Input | undefined,
    Output | undefined
  >;

  abstract nullable(): AbstractSchema<
    Input | null,
    Output | null
  >;

  abstract nullish(): AbstractSchema<
    Input | null | undefined,
    Output | null | undefined
  >;

  abstract required(params?: { message: string }): AbstractSchema<
    Exclude<Input, null | undefined>,
    Exclude<Output, null | undefined>
  >;
}
