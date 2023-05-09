import { errorCodes } from '../error-codes.js';
import { ValidationError } from '../validation-error.js';
import { Message, formatMessage } from '../utils/format-message.js';
import { pluralize } from '../utils/pluralize.js';

export type MinLengthErrorDetails = {
  value: string;
  limit: number;
  characterCount: number;
};

export function minLength(options: {
  limit: number;
  message?: Message<MinLengthErrorDetails>;
}) {
  const limit = options.limit;
  const message = options.message || formatMinLengthError;
  return (value: string) => {
    const characterCount = value.length;
    if (characterCount < limit) {
      const details: MinLengthErrorDetails = { value, limit, characterCount };
      const errorMessage = formatMessage(message, details);
      throw new ValidationError(errorMessage, {
        details,
        code: errorCodes.stringTooShort,
      });
    }
  };
}

function formatMinLengthError({ limit }: MinLengthErrorDetails) {
  return `The string must contain at least ${pluralize(
    limit,
    'character',
    'characters',
  )}.`;
}
