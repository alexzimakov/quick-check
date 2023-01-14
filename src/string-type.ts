import { type TypeAlias, type TypeAliasOptions } from './type-alias.js';

type StringTypeOptions = TypeAliasOptions;

export class StringType<T> implements TypeAlias<T> {
  private readonly options: StringTypeOptions;

  private constructor(options: StringTypeOptions) {
    this.options = options;
  }

  static create(): StringType<string> {
    return new StringType({
      isOptional: false,
      isNullable: false,
    });
  }

  optional(): StringType<T | undefined> {
    return new StringType({
      ...this.options,
      isOptional: true,
    });
  }

  nullable(): StringType<T | null> {
    return new StringType({
      ...this.options,
      isNullable: true,
    });
  }

  required(): StringType<NonNullable<T>> {
    return new StringType({
      ...this.options,
      isOptional: false,
      isNullable: false,
    });
  }

  parse(value: unknown): T;
  parse(value: unknown): unknown {
    const options = this.options;
    if (value === undefined) {
      if (options.isOptional) {
        return value;
      }
      throw new RangeError('value can not be `undefined`');
    }

    if (value === null) {
      if (this.options.isNullable) {
        return value;
      }
      throw new RangeError('value can not be `null`');
    }

    if (typeof value !== 'string') {
      throw new RangeError('value must be a string');
    }
    return value;
  }
}
