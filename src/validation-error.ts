export type ValidationErrorOptions = {
  cause?: unknown;
  code?: string;
  path?: (string | number)[];
  details?: unknown;
  subErrors?: ValidationError[];
};

export class ValidationError extends Error {
  cause: unknown;
  code: string;
  path: (string | number)[];
  details: unknown;
  subErrors: ValidationError[];

  constructor(message: string, options: ValidationErrorOptions = {}) {
    super(message);
    this.name = 'ValidationError';
    this.cause = options.cause;
    this.code = options.code || '';
    this.path = options.path || [];
    this.details = options.details;
    this.subErrors = options.subErrors || [];
  }

  static from(error: unknown): ValidationError {
    if (error instanceof ValidationError) {
      return error.clone();
    }

    let message = 'An unknown error occurred.';
    let code = '';
    if (typeof error === 'string') {
      message = error;
    } else if (error instanceof Error) {
      message = error.message;
      if ('code' in error && error.code != null) {
        code = String(error.code);
      }
    }
    return new ValidationError(message, {
      code,
      cause: error,
    });
  }

  clone() {
    const error = new ValidationError(this.message, {
      cause: this.cause,
      code: this.code,
      path: this.path && [...this.path],
      details: this.details && { ...this.details },
      subErrors: this.subErrors && [...this.subErrors],
    });
    error.stack = this.stack;
    return error;
  }

  toArray() {
    const topError = this.clone();
    const errors: ValidationError[] = [topError];
    for (const subError of topError.subErrors) {
      for (const error of subError.toArray()) {
        error.path.unshift(...topError.path);
        errors.push(error);
      }
    }
    topError.subErrors = [];
    return errors;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      path: this.path,
      details: this.details,
      subErrors: this.subErrors,
    };
  }
}
