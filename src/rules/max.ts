import { errorCodes } from '../error-codes.js';
import { ValidationError } from '../validation-error.js';
import { Message, formatMessage } from '../utils/format-message.js';

export type MaxErrorDetails = {
  value: number | bigint;
  limit: number | bigint;
};

export function max(
  limit: number | bigint,
  message: Message<MaxErrorDetails> = formatMaxError,
) {
  return (value: number | bigint) => {
    const isValid = value <= limit;
    if (!isValid) {
      const details: MaxErrorDetails = { value, limit };
      const errorMessage = formatMessage(message, details);
      throw new ValidationError(errorMessage, {
        details,
        code: errorCodes.numberTooLarge,
      });
    }
  };
}

function formatMaxError({ limit }: MaxErrorDetails) {
  return `The number must be less than or equal to ${limit}.`;
}
