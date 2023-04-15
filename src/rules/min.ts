import { errorCodes } from '../error-codes.js';
import { ValidationError } from '../validation-error.js';
import { Message, formatMessage } from '../utils/format-message.js';

export type MinErrorDetails = {
  value: number;
  limit: number;
};

export function min(
  limit: number,
  message: Message<MinErrorDetails> = formatMinError,
) {
  return (value: number) => {
    const isValid = value >= limit;
    if (!isValid) {
      const details: MinErrorDetails = { value, limit };
      const errorMessage = formatMessage(message, details);
      throw new ValidationError(errorMessage, {
        details,
        code: errorCodes.numberTooSmall,
      });
    }
  };
}

function formatMinError({ limit }: MinErrorDetails) {
  return `The number must be greater than or equal to ${limit}.`;
}
