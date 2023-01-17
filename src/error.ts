type ErrorPath = (string | number)[];
type ErrorParams = { [param: string]: unknown; };

export class RapidCheckError extends Error {
  /**
   * The short string that indicates the reason for the error. Use it for
   * programmatically error handling.
   */
  code: string;
  /**
   * The human-readable error explanation.
   */
  message: string;
  /**
   * The original cause of the error or other structured data.
   */
  cause: unknown;
  /**
   * The path of the object property or array item where error occurred.
   */
  path: ErrorPath;
  /**
   * The validation params.
   */
  params: ErrorParams;
  /**
   * The array of nested errors, e.g., may be used to store object
   * property-specific errors.
   */
  details: Error[] = [];

  constructor(code: string, message: string, params?: {
    cause?: unknown;
    path?: ErrorPath;
    params?: ErrorParams;
    details?: Error[];
  }) {
    super(message, { cause: params?.cause });
    this.name = 'RapidCheckError';
    this.code = code;
    this.message = message;
    this.cause = params?.cause ?? null;
    this.params = params?.params ?? {};
    this.path = params?.path ?? [];
    this.details = params?.details ?? [];
  }

  static Codes = {
    unknown: 'UNKNOWN_ERROR',
  };

  static of(err: unknown): RapidCheckError {
    if (err instanceof RapidCheckError) {
      return err;
    }

    let code = RapidCheckError.Codes.unknown;
    let message = '';
    if (typeof err === 'string') {
      message = err;
    } else {
      if (hasCode(err)) {
        code = err.code;
      }
      if (hasMessage(err)) {
        message = err.message;
      }
    }

    return new RapidCheckError(code, message, { cause: err });
  }

  hasErrors(): boolean {
    return this.details.length !== 0;
  }

  getErrors(): Error[] {
    return this.details;
  }

  addError(error: Error): this {
    this.details.push(error);
    return this;
  }

  toString() {
    return `${this.name} [${this.code}]: ${this.message}`;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      path: this.path,
      params: this.params,
      details: this.details,
    };
  }
}

function hasMessage(value: unknown): value is { message: string } {
  return (
    value != null &&
    typeof value === 'object' &&
    typeof (value as Record<string, unknown>).message === 'string'
  );
}

function hasCode(value: unknown): value is { code: string } {
  return (
    value != null &&
    typeof value === 'object' &&
    typeof (value as Record<string, unknown>).code === 'string'
  );
}
