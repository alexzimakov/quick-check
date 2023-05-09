import { errorCodes } from '../error-codes.js';
import { ValidationError } from '../validation-error.js';
import { Message, formatMessage } from '../utils/format-message.js';

export type NumericStringErrorDetails = {
  value: string;
};

export function numericString(options: {
  message?: Message<NumericStringErrorDetails>;
} = {}) {
  const message = options.message || formatPatternError;
  return (value: string) => {
    if (!value.match(/^(0|[1-9][0-9]*)$/)) {
      const details: NumericStringErrorDetails = { value };
      const errorMessage = formatMessage(message, details);
      throw new ValidationError(errorMessage, {
        details,
        code: errorCodes.invalidNumericString,
      });
    }
  };
}

function formatPatternError() {
  return 'The string must match integer number without leading zeros.';
}
