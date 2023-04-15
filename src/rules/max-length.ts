import { errorCodes } from '../error-codes.js';
import { ValidationError } from '../validation-error.js';
import { Message, formatMessage } from '../utils/format-message.js';
import { pluralize } from '../utils/pluralize.js';

export type MaxLengthErrorDetails = {
  value: string;
  limit: number;
  characterCount: number;
};

export function maxLength(
  limit: number,
  message: Message<MaxLengthErrorDetails> = formatMaxLengthError,
) {
  return (value: string) => {
    const characterCount = value.length;
    if (characterCount > limit) {
      const details: MaxLengthErrorDetails = { value, limit, characterCount };
      const errorMessage = formatMessage(message, details);
      throw new ValidationError(errorMessage, {
        details,
        code: errorCodes.stringTooLong,
      });
    }
  };
}

function formatMaxLengthError({ limit }: MaxLengthErrorDetails) {
  return `The string must contain at most ${pluralize(
    limit,
    'character',
    'characters',
  )}.`;
}
