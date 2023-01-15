type ErrorPath = (string | number)[];
type ErrorParams = { [param: string]: unknown; };
type ErrorCause = unknown;

export class RapidCheckError extends Error {
  readonly name = 'RapidCheckError';
  code: string;
  message: string;
  path: ErrorPath;
  params: ErrorParams;
  cause: ErrorCause;

  constructor(code: string, message: string, params?: {
    path?: ErrorPath;
    params?: ErrorParams;
    cause?: ErrorCause;
  }) {
    super(message, { cause: params?.cause });
    this.code = code;
    this.message = message;
    this.path = params?.path ?? [];
    this.params = params?.params ?? {};
    this.cause = params?.cause ?? null;
  }

  static unknownErrorCode = 'unknown_error';
  static unknownErrorMessage = 'An unknown error occurred.';
  static of(err: unknown): RapidCheckError {
    if (err instanceof RapidCheckError) {
      return err;
    }

    let code = RapidCheckError.unknownErrorCode;
    let message = RapidCheckError.unknownErrorMessage;
    if (typeof err === 'string') {
      message = err;
    } else if (err instanceof Error) {
      message = err.message;
      if ('code' in err && typeof err.code === 'string') {
        code = err.code;
      }
    }

    return new RapidCheckError(code, message, { cause: err });
  }

  toString() {
    return `${this.name} [${this.code}]: ${this.message}`;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      path: this.path,
      params: this.params,
    };
  }
}
