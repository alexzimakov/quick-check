type ErrorPath = (string | number)[];
type ErrorParams = { [param: string]: unknown; };

export class ParseError extends Error {
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
  details: ParseError[] = []; // eslint-disable-line no-use-before-define

  constructor(code: string, message: string, params?: {
    cause?: unknown;
    path?: ErrorPath;
    params?: ErrorParams;
    details?: ParseError[];
  }) {
    super(message);
    this.name = 'ParseError';
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

  static of(err: unknown): ParseError {
    if (err instanceof ParseError) {
      return err;
    }

    let code = ParseError.Codes.unknown;
    let message = '';
    let params: ErrorParams = {};
    if (typeof err === 'string') {
      message = err;
    } else {
      if (hasCode(err)) {
        code = err.code;
      }
      if (hasMessage(err)) {
        message = err.message;
      }
      if (hasParams(err)) {
        params = err.params || {};
      }
    }

    return new ParseError(code, message, { cause: err, params });
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

function hasParams(value: unknown): value is { params: ErrorParams } {
  return (
    value != null &&
    typeof value === 'object' &&
    typeof (value as Record<string, unknown>).params === 'object'
  );
}
