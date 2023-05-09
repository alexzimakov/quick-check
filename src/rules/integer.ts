import { errorCodes } from '../error-codes.js';
import { ValidationError } from '../validation-error.js';
import { Message, formatMessage } from '../utils/format-message.js';

export type IntegerErrorDetails = {
  value: number;
};

export function integer(options: {
  message?: Message<IntegerErrorDetails>;
} = {}) {
  const message = options.message || formatIntegerError;
  return (value: number) => {
    if (!Number.isInteger(value)) {
      const details: IntegerErrorDetails = { value };
      const errorMessage = formatMessage(message, details);
      throw new ValidationError(errorMessage, {
        details,
        code: errorCodes.invalidInteger,
      });
    }
  };
}

function formatIntegerError() {
  return 'The value must be an integer number.';
}
