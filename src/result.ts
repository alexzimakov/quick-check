import { ValidationError } from './errors.js';

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: ValidationError };

export function valid<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function invalid<T>(error: ValidationError): Result<T> {
  return { ok: false, error };
}
