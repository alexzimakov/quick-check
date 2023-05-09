import { errorCodes } from '../error-codes.js';
import { ValidationError } from '../validation-error.js';
import { Message, formatMessage } from '../utils/format-message.js';

export type RangeErrorDetails = {
  value: number;
  min: number;
  max: number;
};

export function range(options: {
  min: number;
  max: number;
  message?: Message<RangeErrorDetails>;
}) {
  const min = options.min;
  const max = options.max;
  const message = options.message || formatRangeError;
  if (min >= max) {
    throw new RangeError('The `min` argument must be less than `max`.');
  }
  return (value: number) => {
    const isValid = value >= min && value <= max;
    if (!isValid) {
      const details: RangeErrorDetails = { value, min, max };
      const errorMessage = formatMessage(message, details);
      throw new ValidationError(errorMessage, {
        details,
        code: errorCodes.numberOutOfRange,
      });
    }
  };
}

function formatRangeError({ min, max }: RangeErrorDetails) {
  return `The number must be between ${min} and ${max}.`;
}
