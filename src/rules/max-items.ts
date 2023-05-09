import { errorCodes } from '../error-codes.js';
import { ValidationError } from '../validation-error.js';
import { Message, formatMessage } from '../utils/format-message.js';
import { pluralize } from '../utils/pluralize.js';

export type MaxItemsErrorDetails = {
  value: unknown[];
  limit: number;
  itemCount: number;
};

export function maxItems(options: {
  limit: number,
  message?: Message<MaxItemsErrorDetails>,
}) {
  const limit = options.limit;
  const message = options.message || formatMaxItemsError;
  return (value: unknown[]) => {
    const itemCount = value.length;
    if (itemCount > limit) {
      const details: MaxItemsErrorDetails = { value, limit, itemCount };
      const errorMessage = formatMessage(message, details);
      throw new ValidationError(errorMessage, {
        details,
        code: errorCodes.arrayTooLong,
      });
    }
  };
}

function formatMaxItemsError({ limit }: MaxItemsErrorDetails) {
  return `The array must contain at most ${pluralize(
    limit,
    'item',
    'items',
  )}.`;
}
