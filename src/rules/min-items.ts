import { errorCodes } from '../error-codes.js';
import { ValidationError } from '../validation-error.js';
import { Message, formatMessage } from '../utils/format-message.js';
import { pluralize } from '../utils/pluralize.js';

export type MinItemsErrorDetails = {
  value: unknown[];
  limit: number;
  itemCount: number;
};

export function minItems(
  limit: number,
  message: Message<MinItemsErrorDetails> = formatMinItemsError,
) {
  return (value: unknown[]) => {
    const itemCount = value.length;
    if (itemCount < limit) {
      const details: MinItemsErrorDetails = { value, limit, itemCount };
      const errorMessage = formatMessage(message, details);
      throw new ValidationError(errorMessage, {
        details,
        code: errorCodes.arrayTooShort,
      });
    }
  };
}

function formatMinItemsError({ limit }: MinItemsErrorDetails) {
  return `The array must contain at least ${pluralize(
    limit,
    'item',
    'items',
  )}.`;
}
