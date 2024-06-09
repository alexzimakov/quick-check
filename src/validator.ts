import { Result } from './result.js';

export interface Validator<T> {
  validate(value: unknown): Result<T>;

  parse(value: unknown): T;
}

export type ValidateFunction<T> = (value: unknown) => Result<T>;
